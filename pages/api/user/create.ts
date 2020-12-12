import { NextApiHandler } from "next";
import { query } from "../../../lib/db";

const handler: NextApiHandler = async (req, res) => {
  const { id, password, isInvestor = 0 } = req.body;
  const isInvestorValue = isInvestor ? 1 : 0;

  try {
    if (!id || !password) {
      return res
        .status(400)
        .json({ message: "`id` and `password` are both required" });
    }

    const results = await query(
      `
      INSERT INTO users (userId, password, isInvestor)
      VALUES (?, hex(aes_encrypt(?, '${process.env.MYSQL_HEX_KEY}')), ?)
      `,
      [id, password, isInvestorValue]
    );

    return res.json(results);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
