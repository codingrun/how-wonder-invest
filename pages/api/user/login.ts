import { NextApiHandler } from "next";
import { query } from "../../../lib/db";

const handler: NextApiHandler = async (req, res) => {
  const { id, password } = req.body;
  try {
    if (!id || !password) {
      return res
        .status(400)
        .json({ message: "`id` and `password` are both required" });
    }

    const results = await query(
      `
        SELECT userId
        FROM users
        WHERE userId = ? AND ? = (SELECT cast(AES_DECRYPT(UNHEX(password), '${process.env.MYSQL_HEX_KEY}') as char(100)) FROM users where userId=?)
      `,
      [id, password, id]
    );

    // @ts-ignore
    const resultMessage = results && results.length > 0 ? "success!" : "fail";
    // @ts-ignore
    const resultStatus = results && results.length > 0 ? 200 : 404;
    return res.status(resultStatus).json({ message: resultMessage });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
