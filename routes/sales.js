const express = require("express");
const router = express.Router();
const sales = require("../services/sales");

router.post("/uploadmor", async function (req, res, next) {
  try {
    res.json(await sales.uploadMor(req, res, next));
  } catch (er) {
    console.log(`Error while uploading mor: ${er}`);
    next(er);
  }
});

router.post("/addinvoice", async function (req, res, next) {
  try {
    res.json(await sales.addInvoice(req, res, next));
  } catch (er) {
    console.log(`Error while adding the invoice: ${er}`);
    next(er);
  }
});

router.post("/addcustominvoice", async function (req, res, next) {
  try {
    res.json(await sales.addCustomInvoice(req, res, next));
  } catch (er) {
    console.log(`Error while adding the custom invoice: ${er}`);
    next(er);
  }
});

router.post("/uploadcustreq", async function (req, res, next) {
  try {
    res.json(await sales.uploadCustomerReq(req, res, next));
  } catch (er) {
    console.log(
      `Error while uploading Uploading the customer requirement: ${er}`
    );
    next(er);
  }
});

router.post("/uploadquotation", async function (req, res, next) {
  try {
    res.json(await sales.uploadQuotatation(req, res, next));
  } catch (er) {
    console.log(`Error while uploading Uploading the quotation: ${er}`);
    next(er);
  }
});

router.post("/uploaddeliverychallan", async function (req, res, next) {
  try {
    res.json(await sales.uploadDeliveryChallan(req, res, next));
  } catch (er) {
    console.log(`Error while uploading Uploading the Delivery Challan: ${er}`);
    next(er);
  }
});

router.post("/uploadrfq", async function (req, res, next) {
  try {
    res.json(await sales.uploadRFQ(req, res, next));
  } catch (er) {
    console.log(
      `Error while uploading Uploading the Request for Quotation: ${er}`
    );
    next(er);
  }
});

router.post("/add", async function (req, res, next) {
  try {
    res.json(await sales.addsale(req, res, next));
  } catch (er) {
    console.log(`Error while adding the sales : ${er}`);
    next(er);
  }
});

router.post("/Updateenqcus", async function (req, res, next) {
  try {
    res.json(await sales.UpdateenqCustomer(req, res, next));
  } catch (er) {
    console.log(`Error while updating the customer Enquiry: ${er}`);
    next(er);
  }
});

router.post("/getprocesslist", async function (req, res, next) {
  try {
    res.json(await sales.getProcesslist(req.body));
  } catch (er) {
    console.log(`Error while Fetching the Process list : ${er}`);
    next(er);
  }
});

router.post("/addsalesprocess", async function (req, res, next) {
  try {
    res.json(await sales.AddSalesProcess(req.body));
  } catch (er) {
    console.log(`Error while adding the sales process: ${er}`);
    next(er);
  }
});

router.post("/addprocesslist", async function (req, res, next) {
  try {
    res.json(await sales.AddProcessList(req.body));
  } catch (er) {
    console.log(`Error while adding the process list: ${er}`);
    next(er);
  }
});

router.post("/updateprocesslist", async function (req, res, next) {
  try {
    res.json(await sales.UpdateProcessList(req.body));
  } catch (er) {
    console.log(`Error while updating the sales process: ${er}`);
    next(er);
  }
});

router.post("/updatesalesprocess", async function (req, res, next) {
  try {
    res.json(await sales.UpdateSalesProcess(req.body));
  } catch (er) {
    console.log(`Error while Updating the process list: ${er}`);
    next(er);
  }
});

router.post("/detailspreloader", async function (req, res, next) {
  try {
    res.json(await sales.detailsPreLoader(req.body));
  } catch (er) {
    console.log(
      `Error while fetching the auto generated id for the events: ${er}`
    );
    next(er);
  }
});

router.post("/getprocessshow", async function (req, res, next) {
  try {
    res.json(await sales.GetProcessShow(req.body));
  } catch (er) {
    console.log(`Error while fetching the process show: ${er}`);
    next(er);
  }
});

router.post("/getprocesscustomer", async function (req, res, next) {
  try {
    res.json(await sales.GetProcessCustomer(req.body));
  } catch (er) {
    console.log(`Error while fetching the process customer: ${er}`);
    next(er);
  }
});

router.post("/getcustomerlist", async function (req, res, next) {
  try {
    res.json(await sales.GetCustomerList(req.body));
  } catch (er) {
    console.log(`Error while fetching the customer list: ${er}`);
    next(er);
  }
});

router.post("/getcustomerdetails", async function (req, res, next) {
  try {
    res.json(await sales.GetCustomerDetails(req.body));
  } catch (er) {
    console.log(`Error while fetching the customer details: ${er}`);
    next(er);
  }
});

router.post("/getcusreq", async function (req, res, next) {
  try {
    res.json(await sales.getCusReq(req.body));
  } catch (er) {
    console.log(`Error while fetching the quotation: ${er}`);
    next(er);
  }
});

router.post("/getquotationid", async function (req, res, next) {
  try {
    res.json(await sales.getQuotationId(req.body));
  } catch (er) {
    console.log(`Error while adding the Quotation : ${er}`);
    next(er);
  }
});

router.post("/getinvoiceid", async function (req, res, next) {
  try {
    res.json(await sales.getInvoiceId(req.body));
  } catch (er) {
    console.log(`Error while adding the Invoice : ${er}`);
    next(er);
  }
});

router.post("/getdeliveryclnid", async function (req, res, next) {
  try {
    res.json(await sales.getDeliveryChalnId(req.body));
  } catch (er) {
    console.log(`Error while adding the Delivery Challan : ${er}`);
    next(er);
  }
});

router.post("/getrfqid", async function (req, res, next) {
  try {
    res.json(await sales.getRequestforQuotationId(req.body));
  } catch (er) {
    console.log(`Error while adding the request for quotation id : ${er}`);
    next(er);
  }
});

router.post("/addquotation", async function (req, res, next) {
  try {
    res.json(await sales.addQuotation(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Quotation : ${er}`);
    next(er);
  }
});

router.post("/addcustomquotation", async function (req, res, next) {
  try {
    res.json(await sales.addCustomQuotation(req, res, next));
  } catch (er) {
    console.log(`Error while adding the custom Quotation : ${er}`);
    next(er);
  }
});

router.post("/sendpdf", async function (req, res, next) {
  try {
    res.json(await sales.SendPdf(req, res, next));
  } catch (er) {
    console.log(`Error while sending the pdf : ${er}`);
    next(er);
  }
});

router.post("/adddeliverychallan", async function (req, res, next) {
  try {
    res.json(await sales.addDeliveryChallan(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Delivery Challan : ${er}`);
    next(er);
  }
});

router.post("/addcustomdc", async function (req, res, next) {
  try {
    res.json(await sales.addCustomDeliveryChallan(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Custom Delivery Challan : ${er}`);
    next(er);
  }
});

router.post("/addfeedback", async function (req, res, next) {
  try {
    res.json(await sales.addFeedback(req.body));
  } catch (er) {
    console.log(`Error while adding the feedback : ${er}`);
    next(er);
  }
});

router.post("/getbinaryfile", async function (req, res, next) {
  try {
    res.json(await sales.getBinaryFile(req.body));
  } catch (er) {
    console.log(`Error while getting the binary file : ${er}`);
    next(er);
  }
});

router.post("/getcustombinaryfile", async function (req, res, next) {
  try {
    res.json(await sales.getCustomBinaryfile(req.body));
  } catch (er) {
    console.log(`Error while getting the binary file : ${er}`);
    next(er);
  }
});

router.post("/deleteprocess", async function (req, res, next) {
  try {
    res.json(await sales.DeleteProcess(req.body));
  } catch (er) {
    console.log(`Error while deleting the process : ${er}`);
    next(er);
  }
});

router.post("/archiveprocess", async function (req, res, next) {
  try {
    res.json(await sales.ArchiveProcess(req.body));
  } catch (er) {
    console.log(`Error while Archiving the process : ${er}`);
    next(er);
  }
});

router.post("/addrfq", async function (req, res, next) {
  try {
    res.json(await sales.addRFQ(req, res, next));
  } catch (er) {
    console.log(`Error while adding the RFQ : ${er}`);
    next(er);
  }
});

router.post("/addrevisedquotation", async function (req, res, next) {
  try {
    res.json(await sales.addRevisedQuotation(req, res, next));
  } catch (er) {
    console.log(`Error while adding the revised quotation : ${er}`);
    next(er);
  }
});

router.post("/addcreditnote", async function (req, res, next) {
  try {
    res.json(await sales.addCreditNote(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Credit note : ${er}`);
    next(er);
  }
});

router.post("/adddebitnote", async function (req, res, next) {
  try {
    res.json(await sales.addDebitNote(req, res, next));
  } catch (er) {
    console.log(`Error while adding the Debit note : ${er}`);
    next(er);
  }
});

router.post("/getproducts", async function (req, res, next) {
  try {
    res.json(await sales.getProducts(req.body));
  } catch (er) {
    console.log(`Error while getting the products : ${er}`);
    next(er);
  }
});

router.post("/getnotes", async function (req, res, next) {
  try {
    res.json(await sales.getNotes(req.body));
  } catch (er) {
    console.log(`Error while`);
    next(er);
  }
});

router.post("/salesdata", async function (req, res, next) {
  try {
    res.json(await sales.salesData(req.body));
  } catch (er) {
    console.log(`Error while getting the sales data : ${er}`);
    next(er);
  }
});

router.post("/clientprofile", async function (req, res, next) {
  try {
    res.json(await sales.clientProfile(req.body));
  } catch (er) {
    console.log(`Error while getting the client profile : ${er}`);
    next(er);
  }
});

router.post("/approvequotation", async function (req, res, next) {
  try {
    res.json(await sales.approveQuotation(req.body));
  } catch (er) {
    console.log(`Error while getting the approved quotation : ${er}`);
    next(er);
  }
});

router.post("/rejectquotation", async function (req, res, next) {
  try {
    res.json(await sales.rejectQuotation(req.body));
  } catch (er) {
    console.log(`Error while getting the reject quotation : ${er}`);
    next(er);
  }
});

router.get("/quoteapprove", async function (req, res, next) {
  try {
    await sales.QuotationApproval(req, res, next);
  } catch (er) {
    console.log(`Error while approving the quotation : ${er}`);
    next(er);
  }
});

router.get("/intquoteapprove", async function (req, res, next) {
  try {
    await sales.IntQuotationApproval(req, res, next);
  } catch (er) {
    console.log(`Error while approving the quotation internally: ${er}`);
    next(er);
  }
});

router.post("/rejectsuggest", async function (req, res, next) {
  try {
    res.json(await sales.RejectSuggestion(req.body));
  } catch (er) {
    console.log(`Error while rejecting the quotation : ${er}`);
    next(er);
  }
});

router.post("/getcustompdf", async function (req, res, next) {
  try {
    res.json(await sales.GetCustomPDF(req.body));
  } catch (er) {
    console.log(`Error while fetching the custom pdf : ${er}`);
    next(er);
  }
});

router.post("/getquotationdetail", async function (req, res, next) {
  try {
    res.json(await sales.getQuotationDetails(req.body));
  } catch (er) {
    console.log(`Error while fetching the quotation detail : ${er}`);
    next(er);
  }
});

router.post("/sendclientpdf", async function (req, res, next) {
  try {
    res.json(await sales.ClientSendPdf(req.body));
  } catch (er) {
    console.log(`Error while sending the pdf : ${er}`);
    next(er);
  }
});

router.post("/getenquirycustomer", async function (req, res, next) {
  try {
    res.json(await sales.getEnquiryCustomer(req.body));
  } catch (er) {
    console.log(`Error while fetching the customer : ${er}`);
    next(er);
  }
});
module.exports = router;
