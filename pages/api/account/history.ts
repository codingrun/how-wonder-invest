import { NextApiHandler } from "next";
import axios from "axios";
import dayjs from "dayjs";

const handler: NextApiHandler = async (req, res) => {
  const { account } = req.query;
  try {
    const IsTuno = dayjs().valueOf();
    const today = dayjs().format("YYYYMMDD");

    const accountNumberData = {
      Header: {
        ApiNm: "InquireTransactionHistory",
        Tsymd: today,
        Trtm: "141720",
        Iscd: "000734",
        FintechApsno: "001",
        ApiSvcCd: "ReceivedTransferA",
        IsTuno,
        AccessToken: process.env.NH_ACCESSTOKEN,
      },
      Bncd: "011",
      Acno: account,
      Insymd: dayjs().subtract(1, "month").format("YYYYMMDD"),
      Ineymd: today,
      TrnsDsnc: "A",
      Lnsq: "DESC",
      PageNo: "1",
      Dmcnt: "100",
    };

    const historyResult = await axios.post(
      "https://developers.nonghyup.com/InquireTransactionHistory.nh",
      accountNumberData
    );

    return res.json({ history: historyResult.data.REC || [] });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export default handler;
