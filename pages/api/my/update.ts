import { NextApiHandler } from "next";
import { query } from "../../../lib/db";

const handler: NextApiHandler = async (req, res) => {
  const { id, appealText, content } = req.body;
  try {
    if (!id || !appealText || !content) {
      return res
        .status(400)
        .json({ message: "`id`,`appealText`, and `content` are all required" });
    }

    const results = await query(
      `
      UPDATE beInvested
      SET appealText = ?, content = ?
      WHERE user_id = (SELECT id FROM users WHERE userId = ?)
      `,
      [appealText, content, id]
    );

    return res.json(results);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
