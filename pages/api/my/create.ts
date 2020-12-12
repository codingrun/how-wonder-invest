import { NextApiHandler } from "next";
import { query } from "../../../lib/db";

const handler: NextApiHandler = async (req, res) => {
  const { id, appealText, content } = req.body;

  try {
    if (!id) {
      return res.status(400).json({ message: "`id` is required" });
    }

    const results = await query(
      `
      INSERT INTO beInvested (user_id, appealText, content)
      VALUES ((SELECT id FROM users WHERE userId = ?), ?, ?)
      `,
      [id, appealText, content]
    );

    return res.json(results);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
