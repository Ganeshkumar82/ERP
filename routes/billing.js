const express = require("express");
const router = express.Router();
const billing = require("../services/billing");

router.post("/getsubscriptioninvoice", async function (req, res, next) {
  try {
    res.json(await billing.getSubscriptionInvoice(req.body));
  } catch (er) {
    console.log(`Error while Fetching the Recurring invoice : ${er}`);
    next(er);
  }
});

router.post("/getsalesinvoice", async function (req, res, next) {
  try {
    res.json(await billing.getSalesInvoice(req.body));
  } catch (er) {
    console.log(`Error while Fetching the recurring invocie: ${er}`);
    next(er);
  }
});

router.post("/getvoucher", async function (req, res, next) {
  try {
    res.json(await billing.getVouchers(req.body));
  } catch (er) {
    console.log(`Error while Fetching the created vouchers: ${er}`);
    next(er);
  }
});

router.post("/clearvoucher", async function (req, res, next) {
  try {
    // await billing.ClearVouchers(req, res, next);
    res.json(await billing.ClearVouchers(req, res, next));
  } catch (er) {
    console.log(`Error while clearing the vouchers: ${er}`);
    next(er);
  }
});

router.post("/clearconsolidatevoucher", async function (req, res, next) {
  try {
    res.json(await billing.ClearConsolidateVouchers(req, res, next));
  } catch (er) {
    console.log(`Error while clearing the consolidate vouchers: ${er}`);
    next(er);
  }
});

router.post("/accountledger", async function (req, res, next) {
  try {
    res.json(await billing.accountLedger(req.body));
  } catch (er) {
    console.log(`Error while Fetching the consolidate ledger: ${er}`);
    next(er);
  }
});

router.post("/consolidateledger", async function (req, res, next) {
  try {
    res.json(await billing.consolidateLedger(req.body));
  } catch (er) {
    console.log(`Error while Fetching the consolidate ledger: ${er}`);
    next(er);
  }
});

router.post("/tdsledger", async function (req, res, next) {
  try {
    res.json(await billing.TDSLedger(req.body));
  } catch (er) {
    console.log(`Error while Fetching the tds ledger: ${er}`);
    next(er);
  }
});

router.post("/gstledger", async function (req, res, next) {
  try {
    res.json(await billing.GSTLedger(req.body));
  } catch (er) {
    console.log(`Error while Fetching the gst ledger: ${er}`);
    next(er);
  }
});

router.post("/getbinaryfile", async function (req, res, next) {
  try {
    res.json(await billing.getBinaryFile(req.body));
  } catch (er) {
    console.log(`Error while getting the binary file : ${er}`);
    next(er);
  }
});

router.post("/gettransactionfile", async function (req, res, next) {
  try {
    res.json(await billing.getTransactionFile(req.body));
  } catch (er) {
    console.log(`Error while getting the transactions file : ${er}`);
    next(er);
  }
});

router.post("/getsubscriptioncustomer", async function (req, res, next) {
  try {
    res.json(await billing.getSubscriptionCustomer(req.body));
  } catch (er) {
    console.log(`Error while fetching the subscription customer list : ${er}`);
    next(er);
  }
});

router.post("/getsalescustomer", async function (req, res, next) {
  try {
    res.json(await billing.getSalesCustomer(req.body));
  } catch (er) {
    console.log(`Error while fetching the sales customer list : ${er}`);
    next(er);
  }
});

router.post("/addoverduedetails", async function (req, res, next) {
  try {
    res.json(await billing.addOverdueDetails(req.body));
  } catch (er) {
    console.log(`Error while fetching the overdue details: ${er}`);
    next(er);
  }
});

router.post("/getdashboard", async function (req, res, next) {
  try {
    res.json(await billing.getDashboardDetails(req.body));
  } catch (er) {
    console.log(`Error while fetching the dashboard details: ${er}`);
    next(er);
  }
});

router.post("/updatepaymentdetails", async function (req, res, next) {
  try {
    res.json(await billing.updatePaymentDetails(req, res, next));
  } catch (er) {
    console.log(`Error while updating the payment details -> ${er}`);
    next(er);
  }
});

router.post("/getreceiptfile", async function (req, res, next) {
  try {
    res.json(await billing.getReceiptFile(req.body));
  } catch (er) {
    console.log(`Error while fetching the receipt file: ${er}`);
    next(er);
  }
});

module.exports = router;
