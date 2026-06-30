const express = require("express");
const router = express.Router();
const subscription = require("../services/subscription");

router.post("/addrecurringinvoice", async function (req, res, next) {
  try {
    res.json(await subscription.addRecurringInvoice(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Recurring invoice : ${er}`);
    next(er);
  }
});

router.post("/getrecurredinvoice", async function (req, res, next) {
  try {
    res.json(await subscription.GetRecurredInvoice(req.body));
  } catch (er) {
    console.log(`Error while Fetching the Recurred invoice : ${er}`);
    next(er);
  }
});

router.post("/getprocesslist", async function (req, res, next) {
  try {
    res.json(await subscription.GetProcessList(req.body));
  } catch (er) {
    console.error(
      `Error while Fetching the subscription process list: ${er.message}`
    );
    next(er);
  }
});

router.post("/addfeedback", async function (req, res, next) {
  try {
    res.json(await subscription.addFeedback(req.body));
  } catch (er) {
    console.error(`Error while Fetching the feedback : ${er.message}`);
    next(er);
  }
});

router.post("/getprocesscustomer", async function (req, res, next) {
  try {
    res.json(await subscription.GetProcessCustomer(req.body));
  } catch (er) {
    console.log(`Error while fetching the process customer: ${er}`);
    next(er);
  }
});

router.post("/getrecurredcustomer", async function (req, res, next) {
  try {
    res.json(await subscription.GetRecurredCustomer(req.body));
  } catch (er) {
    console.log(`Error while fetching the recurred customer: ${er}`);
    next(er);
  }
});

router.post("/getbinaryfile", async function (req, res, next) {
  try {
    res.json(await subscription.getBinaryFile(req.body));
  } catch (er) {
    console.log(`Error while getting the binary file : ${er}`);
    next(er);
  }
});

router.post("/deleteprocess", async function (req, res, next) {
  try {
    res.json(await subscription.DeleteProcess(req.body));
  } catch (er) {
    console.log(`Error while deleting the process : ${er}`);
    next(er);
  }
});

router.post("/archiveprocess", async function (req, res, next) {
  try {
    res.json(await subscription.ArchiveProcess(req.body));
  } catch (er) {
    console.log(`Error while Archiving the process : ${er}`);
    next(er);
  }
});

router.post("/clientprofile", async function (req, res, next) {
  try {
    res.json(await subscription.clientProfile(req.body));
  } catch (er) {
    console.log(`Error while getting the client profile : ${er}`);
    next(er);
  }
});

router.post("/approvedquotation", async function (req, res, next) {
  try {
    res.json(await subscription.approvedQuotation(req.body));
  } catch (er) {
    console.log(`Error while getting the approved quotation : ${er}`);
    next(er);
  }
});

router.post("/uploadmor", async function (req, res, next) {
  try {
    res.json(await subscription.uploadMor(req, res, next));
  } catch (er) {
    console.log(`Error while uploading mor: ${er}`);
    next(er);
  }
});

router.post("/addsubscus", async function (req, res, next) {
  try {
    res.json(await subscription.addSubscriptionCustomerreq(req, res, next));
  } catch (er) {
    console.log(
      `Error while adding the Subscription Customer requirement: ${er}`
    );
    next(er);
  }
});

router.post("/subscriptiondata", async function (req, res, next) {
  try {
    res.json(await subscription.Subscriptiondata(req.body));
  } catch (er) {
    console.log(`Error while getting the subscription data : ${er}`);
    next(er);
  }
});

router.post("/detailspreloader", async function (req, res, next) {
  try {
    res.json(await subscription.detailsPreLoader(req.body));
  } catch (er) {
    console.log(
      `Error while fetching the auto generated id for the events: ${er}`
    );
    next(er);
  }
});

router.post("/addquotation", async function (req, res, next) {
  try {
    res.json(await subscription.AddQuotation(req, res));
  } catch (er) {
    console.log(`Error while adding the quotation : ${er}`);
    next(er);
  }
});

router.post("/addrevisedquotation", async function (req, res, next) {
  try {
    res.json(await subscription.AddRevisedQuotation(req, res));
  } catch (er) {
    console.log(`Error while adding the revised quotation : ${er}`);
    next(er);
  }
});

router.post("/addcustominvoice", async function (req, res, next) {
  try {
    res.json(await subscription.addCustomInvoice(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Custom Recurring invoice : ${er}`);
    next(er);
  }
});

router.post("/getcustompdf", async function (req, res, next) {
  try {
    res.json(await subscription.GetCustomPDF(req.body));
  } catch (er) {
    console.log(`Error while fetching the custom pdf : ${er}`);
    next(er);
  }
});

router.post("/getcustombinaryfile", async function (req, res, next) {
  try {
    res.json(await subscription.getCustomBinaryfile(req.body));
  } catch (er) {
    console.log(`Error while fetching the custom pdf : ${er}`);
    next(er);
  }
});

router.post("/getrecurredbinaryfile", async function (req, res, next) {
  try {
    res.json(await subscription.getRecurredBinaryfile(req.body));
  } catch (er) {
    console.log(`Error while fetching the Recurred invoice pdf : ${er}`);
    next(er);
  }
});

router.post("/getsubscripioncustomer", async function (req, res, next) {
  try {
    res.json(await subscription.getSubscriptionCustomer(req.body));
  } catch (er) {
    console.log(`Error while fetching the subscription customer : ${er}`);
    next(er);
  }
});

router.post("/getglobalsubscription", async function (req, res, next) {
  try {
    res.json(await subscription.getGlobalSubscription(req.body));
  } catch (er) {
    console.log(`Error while fetching the global subscription : ${er}`);
    next(er);
  }
});

router.post("/getclientdetails", async function (req, res, next) {
  try {
    res.json(await subscription.getClientDetails(req.body));
  } catch (er) {
    console.log(`Error while fetching the client details : ${er}`);
    next(er);
  }
});

router.post("/uploadsubscription", async function (req, res, next) {
  try {
    res.json(await subscription.UploadSubscription(req.body));
  } catch (er) {
    console.log(`Error while Uploading the Subscription Details : ${er}`);
    next(er);
  }
});

router.get("/intquoteapprove", async function (req, res, next) {
  try {
    await subscription.IntQuotationApproval(req, res, next);
  } catch (er) {
    console.log(`Error while approving the quotation internally: ${er}`);
    next(er);
  }
});

module.exports = router;
