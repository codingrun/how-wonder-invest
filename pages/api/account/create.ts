import { NextApiHandler } from "next";
import { query } from "../../../lib/db";
import axios from "axios";
import dayjs from "dayjs";

const handler: NextApiHandler = async (req, res) => {
  const { id, accountNumber } = req.body;

  try {
    if (!accountNumber) {
      return res.status(400).json({ message: "`accountNumber` is required" });
    }

    const results = await query(
      `
        SELECT id, birth
        FROM users
        WHERE userId = ?
      `,
      [id]
    );

    const birth = results[0].birth || "";
    const user_id = results[0].id || "";
    if (!birth || birth.length === 0 || !user_id || user_id.length === 0) {
      return res.status(400).json({ message: "`birth` or `user_id` is empty" });
    }

    const IsTuno = dayjs().valueOf();
    const today = dayjs().format("YYYYMMDD");

    const accountNumberData = {
      Header: {
        ApiNm: "OpenFinAccountDirect",
        Tsymd: today,
        Trtm: "141720",
        Iscd: "000734",
        FintechApsno: "001",
        ApiSvcCd: "DrawingTransferA",
        IsTuno,
        AccessToken: process.env.NH_ACCESSTOKEN,
      },
      DrtrRgyn: "Y",
      BrdtBrno: birth,
      Bncd: "011",
      Acno: accountNumber,
    };

    const createResult = await axios.post(
      "https://developers.nonghyup.com/OpenFinAccountDirect.nh",
      accountNumberData
    );

    const RegisterNumber = createResult.data.Rgno || "";
    if (!RegisterNumber || RegisterNumber.length === 0) {
      return res.status(400).json({ message: "registerNumber is empty" });
    }

    const AcnoIsTuno = dayjs().valueOf();
    const directAcnoData = {
      Header: {
        ApiNm: "CheckOpenFinAccountDirect",
        Tsymd: today,
        Trtm: "141720",
        Iscd: "000734",
        FintechApsno: "001",
        ApiSvcCd: "DrawingTransferA",
        IsTuno: AcnoIsTuno,
        AccessToken: process.env.NH_ACCESSTOKEN,
      },
      Rgno: RegisterNumber,
      BrdtBrno: birth,
    };

    const AcnoResult = await axios.post(
      "https://developers.nonghyup.com/CheckOpenFinAccountDirect.nh",
      directAcnoData
    );

    const FinAcno = AcnoResult.data.FinAcno || "";
    if (!FinAcno || FinAcno.length === 0) {
      return res.status(400).json({ message: "FinAcno is empty" });
    }

    const createAccount = await query(
      `
        INSERT INTO account (users_id, registerNo, bank, account)
        VALUES (?, ?,'011', ?)
        `,
      [user_id, FinAcno, accountNumber]
    );

    const resultMessage =
      // @ts-ignore
      createAccount.affectedRows === 1 ? "success!" : "fail";

    return res.json({ message: resultMessage });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
