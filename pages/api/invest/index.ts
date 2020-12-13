import { NextApiHandler } from "next";
import axios from "axios";
import dayjs from "dayjs";
import { query } from "../../../lib/db";

const handler: NextApiHandler = async (req, res) => {
  const { id, amount, recieveUserName } = req.body;
  try {
    const IsTuno = dayjs().valueOf();
    const today = dayjs().format("YYYYMMDD");

    const results = await query(
      `
      SELECT 
        account.registerNo
      FROM
          users
              JOIN
          account ON account.users_id = users.id
      WHERE
          users.userId = ?
      `,
      id
    );

    const FinAcno = results[0].registerNo || null;

    if (!FinAcno) {
      return res.status(400).json({ message: "`FinAcno` is not found!" });
    }

    const accountNumberData = {
      Header: {
        ApiNm: "DrawingTransfer",
        Tsymd: today,
        Trtm: "112428",
        Iscd: "000734",
        FintechApsno: "001",
        ApiSvcCd: "DrawingTransferA",
        IsTuno,
        AccessToken: process.env.NH_ACCESSTOKEN,
      },
      FinAcno,
      Tram: amount,
      DractOtlt: `${recieveUserName}에게 투자`,
    };

    const transferResult = await axios.post(
      "https://developers.nonghyup.com/DrawingTransfer.nh",
      accountNumberData
    );

    return res.json(transferResult.data);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
