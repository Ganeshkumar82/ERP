const express = require("express");
const router = express.Router();
const admin = require("../services/admin");
var requestIp = require("request-ip");

router.post("/getcustomer", async function (req, res, next) {
  try {
    res.json(await admin.GetCustomerDetails(req.body));
  } catch (er) {
    console.log(`Error fetching the Customer Details -> ${er.message}`);
    next(er);
  }
});

router.post("/login", async function (req, res, next) {
  try {
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    var clientIp = requestIp.getClientIp(req);
    res.json(await admin.Login(req.body, clientIp));
  } catch (er) {
    console.log(`Error while Fetching the Login Details -> ${er.message}`);
    next(er);
  }
});

router.post("/forgotpassword", async function (req, res, next) {
  try {
    var ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || null;
    var clientIp = requestIp.getClientIp(req);
    res.json(await admin.ForgotPassword(req.body, clientIp));
  } catch (er) {
    console.log(`Error while changing the Password -> ${er.message}`);
    next(er);
  }
});

//verify otp
router.post("/verifyotp", async function (req, res, next) {
  try {
    res.json(await admin.verifyOTP(req.body));
  } catch (err) {
    console.error(`Error while Verifying the otp`, err.message);
    next(err);
  }
});

//Update password
router.post("/newpassword", async function (req, res, next) {
  try {
    res.json(await admin.changepassword(req.body));
  } catch (err) {
    console.error(`Error while Verifying the otp`, err.message);
    next(err);
  }
});

router.post("/sendmailwhatsapp", async function (req, res, next) {
  try {
    res.json(await admin.SendEmailWhatsapp(req.body));
  } catch (er) {
    console.log(`Error while sending the whatsapp server -> ${er.message}`);
    next(er);
  }
});

router.post("/register", async function (req, res, next) {
  try {
    res.json(await admin.Register(req.body));
  } catch (er) {
    console.error(`Error while Registering the user -> ${er.message}`);
    next(er);
  }
});

router.post("/organization", async function (req, res, next) {
  try {
    res.json(await admin.OrganizationList(req.body));
  } catch (er) {
    console.error(`Error while Getting the Organization list -> ${er.message}`);
    next(er);
  }
});

router.post("/organizationlist", async function (req, res, next) {
  try {
    res.json(await admin.OrgList(req.body));
  } catch (er) {
    console.error(`Error while Getting the Organization list -> ${er.message}`);
    next(er);
  }
});

router.post("/companylist", async function (req, res, next) {
  try {
    res.json(await admin.CompanyList(req.body));
  } catch (er) {
    console.error(`Error while Getting the Company list -> ${er.message}`);
    next(er);
  }
});

router.post("/company", async function (req, res, next) {
  try {
    res.json(await admin.GetCompany(req.body));
  } catch (er) {
    console.error(`Error while Getting the Company list -> ${er.message}`);
    next(er);
  }
});

router.post("/sitelist", async function (req, res, next) {
  try {
    res.json(await admin.BranchList(req.body));
  } catch (er) {
    console.error(`Error while Getting the Branch list -> ${er.message}`);
    next(er);
  }
});

router.post("/branchlist", async function (req, res, next) {
  try {
    res.json(await admin.GetBranchList(req.body));
  } catch (er) {
    console.error(`Error while Getting the Branch list -> ${er.message}`);
    next(er);
  }
});

//API to fetch the list of customers
router.post("/sendpdf", async function (req, res, next) {
  try {
    res.json(await admin.CustomSendPdf(req, res, next));
  } catch (er) {
    console.log(`Error while sending the pdf : ${er}`);
    next(er);
  }
});

//Upload the Image for the Company
router.post("/uploadlogo", async function (req, res, next) {
  try {
    res.json(await admin.UploadLogo(req.body));
  } catch (er) {
    console.error(`Error while Uploading the Company Logo -> ${er.message}`);
    next(er);
  }
});

//Create the Subscription Packages
router.post("/createsubscription", async function (req, res, next) {
  try {
    res.json(await admin.CreateSubscription(req.body));
  } catch (er) {
    console.error(
      `Error while Creating the Subscription Package -> ${er.message}`
    );
    next(er);
  }
});

router.post("/updatesubscription", async function (req, res, next) {
  try {
    res.json(await admin.UpdateSubscription(req.body));
  } catch (er) {
    console.error(
      `Error while Updating the Subscription Package -> ${er.message}`
    );
    next(er);
  }
});

router.post("/deletesubscription", async function (req, res, next) {
  try {
    res.json(await admin.DeleteSubscription(req.body));
  } catch (er) {
    console.error(
      `Error while Deleting the Subscription Package -> ${er.message}`
    );
    next(er);
  }
});

//Get the Subscription Packages
router.post("/getsubscription", async function (req, res, next) {
  try {
    res.json(await admin.GetSubscription(req.body));
  } catch (er) {
    console.error(
      `Error while Fetching the Subscription Package -> ${er.message}`
    );
    next(er);
  }
});

router.post("/updatecompany", async function (req, res, next) {
  try {
    res.json(await admin.AddUpdateCompany(req.body));
  } catch (er) {
    console.error(`Error while Updating the company ${er.message}`);
    next(er);
  }
});

router.post("/updateorganization", async function (req, res, next) {
  try {
    res.json(await admin.UpdateOrganization(req.body));
  } catch (er) {
    console.error(`Error while Updating the organization ${er.message}`);
    next(er);
  }
});

router.post("/updatebranch", async function (req, res, next) {
  try {
    res.json(await admin.UpdateBranch(req.body));
  } catch (er) {
    console.error(`Error while Updating the branch ${er.message}`);
    next(er);
  }
});

router.post("/site", async function (req, res, next) {
  try {
    res.json(await admin.Site(req.body));
  } catch (er) {
    console.error(`Error while Fetching the site list -> ${er.message}`);
    next(er);
  }
});

module.exports = router;
