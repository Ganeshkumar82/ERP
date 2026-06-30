const db = require("../db");
const helper = require("../helper");
const config = require("../config");
const multer = require("multer");
const uploadFile = require("../middleware");
const fs = require("fs-extra");
const mailer = require("../mailer");
const moment = require("moment");
const axios = require("axios");
const path = require("path");
const mqttclient = require("../mqttclient");
const { Console } = require("console");
// const { OrganizationList, CompanyList } = require("./admin");
// const { addFeedback } = require("./subscription");
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//##################################################################################################################################################################################################

// async function addRecurringInvoice(req, res) {
//   try {
//     var secret, querydata, subscription;
//     try {
//       await uploadFile.uploadrecurringinvoicepdf(req, res);
//       const subscription = req.body;
//       // Check if the session token exists
//       if (!subscription.STOKEN) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Login session token missing. Please provide the Login session token",
//           "ADD RECURRING INVOICE",
//           ""
//         );
//       }
//       secret = subscription.STOKEN.substring(0, 16);
//       var querydata;

//       // Validate session token length
//       if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 10) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Login session token size invalid. Please provide the valid Session token",
//           "ADD RECURRING INVOICE",
//           secret
//         );
//       }
//       if (!req.files) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Please upload a file!",
//           "ADD RECURRING INVOICE",
//           secret
//         );
//       }
//     } catch (er) {
//       console.log(JSON.stringify(er));
//       return helper.getErrorResponse(
//         false,
//         "error",
//         `Could not upload the file. ${er.message}`,
//         er.message,
//         secret
//       );
//     }

//     // Validate session token
//     const result = await db.query(`select secret from apikey where secret =?`, [
//       subscription.STOKEN,
//     ]);

//     if (result.length == 0) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }

//     // Check if querystring is provided
//     if (!subscription.querystring) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring missing. Please provide the querystring",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }

//     // Decrypt querystring
//     try {
//       querydata = await helper.decrypt(subscription.querystring, secret);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring Invalid error. Please provide the valid querystring.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }

//     // Parse the decrypted querystring
//     try {
//       querydata = JSON.parse(querydata);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring JSON error. Please provide valid JSON",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }

//     // Validate required fields
//     if (!querydata.hasOwnProperty("siteids") || querydata.siteids == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Site id missing. Please provide the Site id.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("subscriptionbillid") ||
//       querydata.subscriptionbillid == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Subscription bill id missing. Please provide the Subscription bill id",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("clientaddressname") ||
//       querydata.clientaddressname == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Client address name missing. Please provide the Client address name missing",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("clientaddress") ||
//       querydata.clientaddress == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Client address missing. Please provide the Client address",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }

//     if (
//       !querydata.hasOwnProperty("billingaddressname") ||
//       querydata.billingaddressname == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Billing address name missing. Please provide the Billing Address name",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("billingaddress") ||
//       querydata.billingaddress == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Billing address missing. Please provide the Billing address.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }

//     if (!querydata.hasOwnProperty("planname") || querydata.product == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Product Details missing. Please provide the Product Details.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Email id missing. Please provide the Email id",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("ccemail")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "CC Email id missing. Please provide the CC Email id",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }

//     if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Contact number missing. Please provide the contact number.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("totalamount") ||
//       querydata.totalamount == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Total amount missing. Please provide the total amount.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("invoicegenid") ||
//       querydata.invoicegenid == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Invoice Generated id missing. Please provide the invoice generated id.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("date") || querydata.date == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Invoice date missing. Please provide the invoice date.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("messagetype") ||
//       querydata.messagetype == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Message type missing. Please provide the message type.",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("feedback")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Feedback missing. Please provide the feedback",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("customerid")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Customer id missing. Please provide the Customer id",
//         "ADD RECURRING INVOICE",
//         secret
//       );
//     }
//     var WhatsappSent, EmailSent;
//     const [sql1] = await db.spcall(
//       `CALL SP_ADD_RECURRING_INVOICE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@sprocessid); select @sprocessid;`,
//       [
//         querydata.subscriptionbillid,
//         JSON.stringify(querydata.siteids),
//         querydata.clientaddressname,
//         querydata.clientaddress,
//         querydata.billingaddress,
//         querydata.billingaddressname,
//         req.files[0]?.path || "",
//         req.files[1]?.path || "",
//         querydata.invoicegenid,
//         querydata.totalamount,
//         2,
//         querydata.emailid,
//         querydata.phoneno,
//         querydata.ccemail,
//         querydata.customerid,
//       ]
//     );
//     const objectvalue2 = sql1[1][0];
//     const invoiceid = objectvalue2["@sprocessid"];
//     var Quoteid;
//     const filePaths = req.files?.map((file) => file.path) || [];
//     const formattedDate = new Date(querydata.date).toISOString().split("T")[0];

//     const sql = await db.query(
//       `Update Generatesubinvoiceid set status = 0 where subinvoice_id IN('${querydata.invoicegenid}')`
//     );
//     if (querydata.messagetype == 1) {
//       EmailSent = await mailer.sendInvoice(
//         querydata.clientaddressname,
//         querydata.emailid,
//         "Your invoice from Sporada Secure India Private Limited",
//         "invoicepdf.html",
//         ``,
//         "INVOICE_PDF_SEND",
//         filePaths,
//         querydata.invoicegenid,
//         formattedDate,
//         querydata.totalamount,
//         querydata.ccemail,
//         querydata.feedback
//       );
//     } else if (querydata.messagetype == 2) {
//       WhatsappSent = await axios.post(`${config.whatsappip}/billing/sendpdf`, {
//         phoneno: querydata.phoneno,
//         feedback: querydata.feedback,
//         pdfpath: filePaths,
//       });
//       if (WhatsappSent.data.code == true) {
//         WhatsappSent = WhatsappSent.data.code;
//       } else {
//         WhatsappSent = WhatsappSent.data.code;
//       }
//     }
//     const promises = [];
//     const phoneNumbers = querydata.phoneno
//       ? querydata.phoneno
//           .split(",")
//           .map((num) => num.trim())
//           .filter((num) => num !== "") // Removes empty values
//       : [];
//     // Send Email or WhatsApp Message
//     if (querydata.messagetype === 1) {
//       // Send only email
//       EmailSent = await mailer.sendInvoice(
//         querydata.clientaddressname,
//         querydata.emailid,
//         "Your invoice from Sporada Secure India Private Limited",
//         "invoicepdf.html",
//         ``,
//         "INVOICE_PDF_SEND",
//         filePaths,
//         querydata.invoicegenid,
//         formattedDate,
//         querydata.totalamount,
//         querydata.ccemail,
//         querydata.feedback
//       );
//     } else if (querydata.messagetype === 2) {
//       WhatsappSent = await Promise.all(
//         phoneNumbers.map(async (number) => {
//           try {
//             const response = await axios.post(
//               `${config.whatsappip}/billing/sendpdf`,
//               {
//                 phoneno: number,
//                 feedback: querydata.feedback,
//                 pdfpath: filePaths,
//               }
//             );
//             return response.data.code;
//           } catch (error) {
//             console.error(`WhatsApp Error for ${number}:`, error.message);
//             return false;
//           }
//         })
//       );
//     } else if (querydata.messagetype === 3) {
//       // Send both email & WhatsApp in parallel
//       promises.push(
//         mailer.sendInvoice(
//           querydata.clientaddressname,
//           querydata.emailid,
//           "Your invoice from Sporada Secure India Private Limited",
//           "invoicepdf.html",
//           ``,
//           "INVOICE_PDF_SEND",
//           filePaths,
//           querydata.invoicegenid,
//           formattedDate,
//           querydata.totalamount,
//           querydata.ccemail,
//           querydata.feedback
//         )
//       );

//       promises.push(
//         Promise.all(
//           phoneNumbers.map(async (number) => {
//             try {
//               const response = await axios.post(
//                 `${config.whatsappip}/billing/sendpdf`,
//                 {
//                   phoneno: number,
//                   feedback: querydata.feedback,
//                   pdfpath: filePaths,
//                 }
//               );
//               return response.data.code;
//             } catch (error) {
//               console.error(`WhatsApp Error for ${number}:`, error.message);
//               return false;
//             }
//           })
//         ).then((results) => (WhatsappSent = results))
//       );

//       // Run both requests in parallel and wait for completion
//       [EmailSent] = await Promise.all(promises);
//       await mqttclient.publishMqttMessage("refresh", "Invoice created");
//       await mqttclient.publishMqttMessage(
//         "Notification",
//         "Recurring invoice created for ." + querydata.clientaddressname
//       );
//       return helper.getSuccessResponse(
//         true,
//         "success",
//         "Subscription Invoice added Successfully",
//         { EmailSent: EmailSent, WhatsappSent: WhatsappSent },
//         secret
//       );
//     }
//   } catch (er) {
//     return helper.getErrorResponse(
//       false,
//       "error",
//       "Internal error. Please contact Administration",
//       er.message,
//       secret
//     );
//   }
// }

async function addRecurringInvoice(req, res) {
  let secret = "";
  try {
    let subscription, querydata1;

    try {
      await uploadFile.uploadrecurringinvoicepdf(req, res);
      subscription = req.body;

      if (!subscription.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token missing.",
          "ADD RECURRING INVOICE",
          ""
        );
      }

      secret = subscription.STOKEN.substring(0, 16);

      if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 10) {
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid session token size.",
          "ADD RECURRING INVOICE",
          secret
        );
      }

      if (!req.files || req.files.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload at least one PDF file!",
          "ADD RECURRING INVOICE",
          secret
        );
      }
    } catch (er) {
      console.log("Upload error:", er);
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        "ADD RECURRING INVOICE",
        secret
      );
    }

    const result = await db.query(
      `select secret from apikey where secret = ?`,
      [subscription.STOKEN]
    );
    if (result.length === 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid session token.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (!subscription.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Missing querystring.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    try {
      querydata1 = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring decryption failed.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    try {
      querydata1 = JSON.parse(querydata1);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON parsing error.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    const querydataArray = Array.isArray(querydata1)
      ? querydata1
      : [querydata1];
    const fileList = req.files || [];
    const firstEntry = querydataArray[0];
    const allSitenames = []; // to collect all sitenames

    for (let i = 0; i < querydataArray.length; i++) {
      const querydata = querydataArray[i];

      const requiredFields = [
        "siteids",
        "sitenames",
        "subscriptionbillid",
        "clientaddressname",
        "clientaddress",
        "billingaddressname",
        "billingaddress",
        "planname",
        "emailid",
        "ccemail",
        "phoneno",
        "totalamount",
        "invoicegenid",
        "date",
        "messagetype",
        "feedback",
        "customerid",
        "billmode",
        "plantype",
        "duedate",
        "billperiod",
        "billdetails",
        "gstnumber",
      ];
      if (Array.isArray(querydata.sitenames)) {
        allSitenames.push(...querydata.sitenames);
      }

      for (let field of requiredFields) {
        if (!querydata.hasOwnProperty(field)) {
          return helper.getErrorResponse(
            false,
            "error",
            `${field} missing in entry ${i + 1}`,
            "ADD RECURRING INVOICE",
            secret
          );
        }
      }
      var SiteName, cleanSiteName;
      if (
        Array.isArray(querydata.sitenames) &&
        querydata.sitenames.length === 1
      ) {
        SiteName = querydata.sitenames[0] || "UnknownCompany";
        cleanSiteName = SiteName.replace(/[^a-z0-9]/gi, "_").toLowerCase();
      }

      const year = await helper.getFinancialYear();
      const sql3 = await db.query1(
        `select o.organization_name,c.customer_name from customermaster c LEFT JOIN organizations o ON o.organization_id = c.organization_id  where customer_id = ${querydata.customerid}`
      );
      var companyName = querydata.clientaddressname || "UnknownCompany";
      var cleanCompanyName = companyName
        .replace(/[^a-z0-9]/gi, "_")
        .toLowerCase();

      var targetFolder;
      if (cleanSiteName == cleanCompanyName) {
        if (sql3.length > 0) {
          companyName = sql3[0].customer_name || "UnknownCompany";
          const organizationname = sql3[0].organization_name || null;
          cleanCompanyName = companyName
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
          if (organizationname == null) {
            targetFolder = `${config.filestorage}/invoices/${cleanCompanyName}/SurvillenceInvoice/${year}`;
          } else {
            targetFolder = `${config.filestorage}/invoices/${organizationname}/${cleanCompanyName}/SurvillenceInvoice/${year}`;
          }
        } else {
          targetFolder = `${config.filestorage}/invoices/${cleanCompanyName}/SurvillenceInvoice/${year}`;
        }
      } else {
        if (sql3.length > 0) {
          companyName = sql3[0].customer_name || "UnknownCompany";
          const organizationname = sql3[0].organization_name || null;
          cleanCompanyName = companyName
            .replace(/[^a-z0-9]/gi, "_")
            .toLowerCase();
          if (organizationname == null) {
            targetFolder = `${config.filestorage}/invoices/${cleanCompanyName}/SurvillenceInvoice/${cleanSiteName}/${year}`;
          } else {
            targetFolder = `${config.filestorage}/invoices/${organizationname}/${cleanCompanyName}/SurvillenceInvoice/${cleanSiteName}/${year}`;
          }
        } else {
          targetFolder = `${config.filestorage}/invoices/${cleanCompanyName}/SurvillenceInvoice/${cleanSiteName}/${year}`;
        }
      }
      await fs.ensureDir(targetFolder);

      // Move each uploaded file
      await Promise.all(
        req.files.map(async (file) => {
          const newFilePath = path.join(targetFolder, file.filename);
          if (querydata.billmode == "Printed") {
            const newFilePath1 = path.join(config.printpath, file.filename);
            await fs.copy(file.path, newFilePath1, { overwrite: true });
          }
          if (file.path !== newFilePath) {
            await fs.copy(file.path, newFilePath, { overwrite: true });
            file.path = newFilePath; // Update file path if moved
          } else {
            console.log(
              `Skipping move for ${file.filename}: source and destination are the same.`
            );
          }
        })
      );

      // Call DB stored procedure
      const [sql1] = await db.spcall(
        `CALL SP_ADD_RECURRING_INVOICE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@sprocessid); select @sprocessid;`,
        [
          querydata.subscriptionbillid,
          JSON.stringify(querydata.siteids),
          querydata.clientaddressname,
          querydata.clientaddress,
          querydata.billingaddress,
          querydata.billingaddressname,
          fileList[i]?.path || "",
          fileList[i + 1]?.path || "", // optional second file
          querydata.invoicegenid,
          querydata.totalamount,
          2,
          querydata.emailid,
          querydata.phoneno,
          querydata.ccemail,
          querydata.customerid,
          JSON.stringify(querydata.billdetails),
        ]
      );

      await db.query(
        `Update Generatesubinvoiceid set status = 0 where subinvoice_id IN('${querydata.invoicegenid}')`
      );

      try {
        let billDetails;
        if (typeof querydata.billdetails === "string") {
          billDetails = JSON.parse(querydata.billdetails);
        } else {
          billDetails = querydata.billdetails;
        }
        const { gst, subtotal, total } = billDetails;
        const { CGST, IGST, SGST } = gst;
        const convertToISO = (dateStr) => {
          const [day, month, year] = dateStr.split("-");
          return `${year}-${month}-${day}`;
        };

        const isoDate = convertToISO(querydata.duedate);

        const [sql2] = await db.spcall(
          `CALL InsertClientVoucher(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@voucher_id,@voucher_number); select @voucher_id,@voucher_number`,
          [
            querydata.invoicegenid,
            "receipt voucher",
            querydata.clientaddressname,
            querydata.emailid,
            querydata.phoneno,
            querydata.clientaddressname,
            querydata.clientaddress,
            JSON.stringify(querydata.billdetails),
            querydata.gstnumber,
            total,
            subtotal,
            IGST,
            CGST,
            SGST,
            "subscription",
            `SB-${querydata.customerid}`,
            `Subscription Invoice created for ${querydata.clientaddressname}`,
            isoDate,
          ]
        );
        const objectvalue = sql2[1][0];
        const voucherid = objectvalue["@voucher_id"];
        const vouchernumber = objectvalue["@voucher_number"];
        const [sql3] = await db.spcall(
          `CALL SP_DEBIT_CLIENT_LEDGER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ledgerid); select @ledgerid;`,
          [
            querydata.invoicegenid,
            querydata.clientaddressname,
            JSON.stringify(querydata.billdetails),
            JSON.stringify({
              amount: 0,
              transactiondetails: null,
              date: null,
              feedback: null,
            }),
            querydata.gstnumber,
            total,
            subtotal,
            IGST,
            CGST,
            SGST,
            0,
            "subscription",
            voucherid,
            vouchernumber,
            "receivable",
            `Subscription Invoice created for ${querydata.clientaddressname}`,
          ]
        );
      } catch (er) {
        console.log(`Invoice number not exits ${er.message}`);
      }
    }

    // Extract details from the first entry
    const {
      clientaddressname,
      billingaddressname,
      emailid,
      ccemail,
      phoneno,
      feedback,
      invoicegenid,
      date,
      totalamount,
      messagetype,
      plantype,
      duedate,
      billperiod,
    } = firstEntry;

    const formattedDate = new Date(date).toISOString().split("T")[0];
    const phoneNumbers = phoneno
      .split(",")
      .map((num) => num.trim())
      .filter((n) => n !== "");
    console.log("billmode:", plantype);
    let invoiceMonth;
    if (plantype === "Prepaid") {
      invoiceMonth = moment(); // current month
    } else if (plantype === "Postpaid") {
      invoiceMonth = moment(); // next month
    }

    const subject = `Sporada Secure - Invoice for the Month of ${invoiceMonth.format(
      "MMMM"
    )} ${invoiceMonth.format("YYYY")} - ${billingaddressname}`;

    const pdfPaths = fileList
      .map((file) => (typeof file === "string" ? file : file.path))
      .filter((p) => p) // removes empty/undefined/null paths
      .join(",");
    let EmailSent = null;
    let WhatsappSent = [];

    if (messagetype === 1 || messagetype === 3) {
      // Email or Both
      EmailSent = await mailer.sendRecurredInvoice(
        clientaddressname,
        emailid,
        subject,
        "recurredinvoicepdf.html",
        "",
        "RECURRED_INVOICE_PDF_SEND",
        pdfPaths,
        invoicegenid,
        formattedDate,
        totalamount,
        ccemail,
        feedback,
        billperiod,
        duedate
      );
    }

    if (messagetype === 2 || messagetype === 3) {
      // WhatsApp or Both
      WhatsappSent = await Promise.all(
        phoneNumbers.map(async (number) => {
          try {
            const response = await axios.post(
              `${config.whatsappip}/billing/sendpdf`,
              {
                phoneno: "8248650039",
                feedback,
                pdfpath: pdfPaths,
              }
            );
            return response.data.code;
          } catch (error) {
            console.error("WhatsApp error:", error.message);
            return false;
          }
        })
      );
    }

    // await mqttclient.publishMqttMessage("refresh", "Invoice created");
    await mqttclient.publishMqttMessage(
      "Notification",
      `Recurring invoice created for ${clientaddressname}`
    );

    return helper.getSuccessResponse(
      true,
      "success",
      "Recurring Invoices added and sent successfully",
      { EmailSent, WhatsappSent },
      secret
    );
  } catch (er) {
    console.error("Final error:", er);
    return helper.getErrorResponse(
      false,
      "error",
      "Something went wrong: " + er.message,
      "ADD RECURRING INVOICE",
      secret
    );
  }
}

//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################

async function GetRecurredInvoice(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "FETCH RECURRED INVOICE",
        ""
      );
    }
    secret = subscription.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH RECURRED INVOICE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH RECURRED INVOICE",
        secret
      );
    }
    var sql = [];
    // Check if querystring is provided
    if (!subscription.querystring) {
      sql = await db.query(
        `select sbg.subscription_generatedid recurredbillid,sbg.subscription_billid,sbg.site_Ids,sbg.client_addressname,sbg.client_address,sbg.billing_addressname,sbg.billing_address,sbg.pdf_path pdf_data,sbg.pdf_path pdfpath,sbg.Invoice_no,sbg.TotalAmount,sbg.email_id,sbg.phone_no,sbg.ccemail,sbg.Row_updated_date date,cvm.voucher_id voucher_id,cvm.voucher_number voucher_number from subscriptionbillgenerated sbg JOIN clientvouchermaster cvm ON cvm.Invoice_number = sbg.Invoice_no where sbg.status = 1`
      );
    } else {
      // Decrypt querystring
      try {
        querydata = await helper.decrypt(subscription.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "ADD RECURRING INVOICE",
          secret
        );
      }

      // Parse the decrypted querystring
      try {
        querydata = JSON.parse(querydata);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring JSON error. Please provide valid JSON",
          "ADD RECURRING INVOICE",
          secret
        );
      }
      if (querydata.hasOwnProperty("customerid") == false) {
        return helper.getErrorResponse(
          false,
          "error",
          "Customer id missing. Please provide the customer id",
          "ADD RECURRING INVOICE",
          secret
        );
      }
      sql = await db.query(
        `select sbg.subscription_generatedid recurredbillid,sbg.subscription_billid,sbg.site_Ids,sbg.client_addressname,sbg.client_address,sbg.billing_addressname,sbg.billing_address,sbg.pdf_path pdf_data,sbg.pdf_path pdfpath,sbg.Invoice_no,sbg.TotalAmount,sbg.email_id,sbg.phone_no,sbg.ccemail,sbg.Row_updated_date date,cvm.voucher_id voucher_id,cvm.voucher_number voucher_number from subscriptionbillgenerated sbg JOIN clientvouchermaster cvm ON cvm.Invoice_number = sbg.Invoice_no where sbg.status = 1 and sbg.customer_id = ?`,
        [querydata.customerid]
      );
    }

    if (sql.length > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "The generated Recurring Invoice is successfully fetched.",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "The generated Recurring Invoice is successfully fetched.",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################

async function GetProcessList(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "GET THE SUBSCRIPTION PROCESS",
        ""
      );
    }
    secret = subscription.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET THE SUBSCRIPTION PROCESS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET THE SUBSCRIPTION PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET THE SUBSCRIPTION PROCESS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET THE SUBSCRIPTION PROCESS",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "GET THE SUBSCRIPTION PROCESS",
        secret
      );
    }
    const requiredFields = [
      { field: "customerid", message: "Customer id missing." },
      {
        field: "listtype",
        message: "List Type missing",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "GET THE SUBSCRIPTION PROCESS",
          secret
        );
      }
    }
    var sql;
    if (querydata.listtype == 1) {
      if (querydata.customerid == 0) {
        sql = await db.query(
          `SELECT 
          sp.sub_processid processid,
          (SELECT s1.process_name 
            FROM subscriptionprocesslist s1 
            WHERE s1.processid = sp.sub_processid 
            ORDER BY s1.sprocess_id ASC 
            LIMIT 1) AS title,
          cr.scustomer_name customer_name,
          DATE_FORMAT(sp.Sub_processdate, '%Y%m%d') AS Process_date,
          DATEDIFF(CURDATE(), sp.Sub_processdate) AS age_in_days,
          COUNT(sp.sub_processid) OVER(PARTITION BY sp.customer_id) AS process_count, 
          (
            SELECT JSON_ARRAYAGG(t.TimelineEvent)
            FROM (
              SELECT JSON_OBJECT(
                       'Eventid', s2.sprocess_id,
                       'Eventname', psl2.Processname,
                       'feedback', s2.feedback,
                       'Allowed_process', CAST(
                        '{"quotation": false, "get_approval": false, "revised_quatation": false}' 
                        AS JSON),
                       'pdfpath', s2.subsprocess_path,
                       'apporvedstatus', s2.Approved_status,
                       'internalstatus',s2.Internal_approval
                     ) AS TimelineEvent
              FROM subscriptionprocesslist s2
              LEFT JOIN subprocessshowlist psl2 
                ON psl2.sublist_id = s2.process_type
              WHERE s2.processid = sp.sub_processid
              ORDER BY s2.sprocess_id ASC
            ) t
          ) AS TimelineEvents  
      FROM subscriptionprocessmaster sp 
      JOIN enquirysubscriptionmaster cr ON sp.customer_id = cr.scustomer_id 
      LEFT JOIN subscriptionprocesslist s ON s.processid = sp.sub_processid 
      LEFT JOIN subprocessshowlist psl ON psl.sublist_id = s.process_type 
      WHERE sp.status = 1 
      AND sp.active_status = 1 AND sp.archive_status = 1 AND sp.deleted_flag = 0
      GROUP BY sp.sub_processid, sp.customer_id, sp.Sub_processdate, cr.scustomer_name
      ORDER BY sp.Row_updated_date DESC;
    `
        );
      } else {
        sql = await db.query(
          `SELECT 
          sp.sub_processid processid,
          (SELECT s1.process_name 
            FROM subscriptionprocesslist s1 
            WHERE s1.processid = sp.sub_processid 
            ORDER BY s1.sprocess_id ASC 
            LIMIT 1) AS title,
          cr.scustomer_name customer_name,
          DATE_FORMAT(sp.Sub_processdate, '%Y%m%d') AS Process_date,
          DATEDIFF(CURDATE(), sp.Sub_processdate) AS age_in_days,
          COUNT(sp.sub_processid) OVER(PARTITION BY sp.customer_id) AS process_count, 
          (
            SELECT JSON_ARRAYAGG(t.TimelineEvent)
            FROM (
              SELECT JSON_OBJECT(
                       'Eventid', s2.sprocess_id,
                       'Eventname', psl2.Processname,
                       'feedback', s2.feedback,
                       'Allowed_process', CAST(
                        '{"quotation": false, "get_approval": false, "revised_quatation": false}' 
                        AS JSON),
                       'pdfpath', s2.subsprocess_path,
                       'apporvedstatus', s2.Approved_status,
                       'internalstatus',s2.Internal_approval
                     ) AS TimelineEvent
              FROM subscriptionprocesslist s2
              LEFT JOIN subprocessshowlist psl2 
                ON psl2.sublist_id = s2.process_type
              WHERE s2.processid = sp.sub_processid
              ORDER BY s2.sprocess_id ASC
            ) t
          ) AS TimelineEvents  
      FROM subscriptionprocessmaster sp 
      JOIN enquirysubscriptionmaster cr ON sp.customer_id = cr.scustomer_id 
      LEFT JOIN subscriptionprocesslist s ON s.processid = sp.sub_processid 
      LEFT JOIN subprocessshowlist psl ON psl.sublist_id = s.process_type 
      WHERE sp.status = 1 
      AND sp.active_status = 1 AND sp.archive_status = 1 AND sp.deleted_flag = 0
  AND sp.customer_id = ?
  GROUP BY sp.sub_processid, sp.customer_id, sp.Sub_processdate, cr.scustomer_name ORDER BY sp.Row_updated_date DESC;
  `,
          [querydata.customerid]
        );
      }
    } else {
      if (querydata.customerid == 0) {
        sql = await db.query(
          `SELECT 
          sp.sub_processid processid,
          (SELECT s1.process_name 
            FROM subscriptionprocesslist s1 
            WHERE s1.processid = sp.sub_processid 
            ORDER BY s1.sprocess_id ASC 
            LIMIT 1) AS title,
          cr.scustomer_name customer_name,
          DATE_FORMAT(sp.Sub_processdate, '%Y%m%d') AS Process_date,
          DATEDIFF(CURDATE(), sp.Sub_processdate) AS age_in_days,
          COUNT(sp.sub_processid) OVER(PARTITION BY sp.customer_id) AS process_count, 
          (
            SELECT JSON_ARRAYAGG(t.TimelineEvent)
            FROM (
              SELECT JSON_OBJECT(
                       'Eventid', s2.sprocess_id,
                       'Eventname', psl2.Processname,
                       'feedback', s2.feedback,
                       'Allowed_process',  psl2.Allowed_process,
                       'pdfpath', s2.subsprocess_path,
                       'apporvedstatus', s2.Approved_status,
                       'internalstatus',s2.Internal_approval
                     ) AS TimelineEvent
              FROM subscriptionprocesslist s2
              LEFT JOIN subprocessshowlist psl2 
                ON psl2.sublist_id = s2.process_type
              WHERE s2.processid = sp.sub_processid
              ORDER BY s2.sprocess_id ASC
            ) t
          ) AS TimelineEvents  
      FROM subscriptionprocessmaster sp 
      JOIN enquirysubscriptionmaster cr ON sp.customer_id = cr.scustomer_id 
      LEFT JOIN subscriptionprocesslist s ON s.processid = sp.sub_processid 
      LEFT JOIN subprocessshowlist psl ON psl.sublist_id = s.process_type 
      WHERE sp.status = 1 
      AND sp.active_status = 1 AND sp.archive_status = 0 AND sp.deleted_flag = 0
      GROUP BY sp.sub_processid, sp.customer_id, sp.Sub_processdate, cr.scustomer_name
      ORDER BY sp.Row_updated_date DESC;
    `
        );
      } else {
        sql = await db.query(
          `SELECT 
          sp.sub_processid processid,
          (SELECT s1.process_name 
            FROM subscriptionprocesslist s1 
            WHERE s1.processid = sp.sub_processid 
            ORDER BY s1.sprocess_id ASC 
            LIMIT 1) AS title,
          cr.scustomer_name customer_name,
          DATE_FORMAT(sp.Sub_processdate, '%Y%m%d') AS Process_date,
          DATEDIFF(CURDATE(), sp.Sub_processdate) AS age_in_days,
          COUNT(sp.sub_processid) OVER(PARTITION BY sp.customer_id) AS process_count, 
          (
            SELECT JSON_ARRAYAGG(t.TimelineEvent)
            FROM (
              SELECT JSON_OBJECT(
                       'Eventid', s2.sprocess_id,
                       'Eventname', psl2.Processname,
                       'feedback', s2.feedback,
                       'Allowed_process', psl2.Allowed_process,
                       'pdfpath', s2.subsprocess_path,
                       'apporvedstatus', s2.Approved_status,
                       'internalstatus',s2.Internal_approval
                     ) AS TimelineEvent
              FROM subscriptionprocesslist s2
              LEFT JOIN subprocessshowlist psl2 
                ON psl2.sublist_id = s2.process_type
              WHERE s2.processid = sp.sub_processid
              ORDER BY s2.sprocess_id ASC
            ) t
          ) AS TimelineEvents  
      FROM subscriptionprocessmaster sp 
      JOIN enquirysubscriptionmaster cr ON sp.customer_id = cr.scustomer_id 
      LEFT JOIN subscriptionprocesslist s ON s.processid = sp.sub_processid 
      LEFT JOIN subprocessshowlist psl ON psl.sublist_id = s.process_type 
      WHERE sp.status = 1 
      AND sp.active_status = 1 AND sp.archive_status = 0 AND sp.deleted_flag = 0
  AND sp.customer_id = ?
  GROUP BY sp.sub_processid, sp.customer_id, sp.Sub_processdate, cr.scustomer_name ORDER BY sp.Row_updated_date DESC;
  `,
          [querydata.customerid]
        );
      }
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription process Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription process Fetched successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addFeedback(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ADD FEEDBACK FOR EVENTS",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback") || querydata.feedback == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD FEEDBACK FOR EVENTS",
        secret
      );
    }
    const sql = await db.query(
      `Update subscriptionprocesslist set feedback = ? where sprocess_id = ?`,
      [querydata.feedback, querydata.eventid]
    );
    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Feedback added successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Failed to add feedback",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function GetProcessCustomer(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET PROCESS CUSTOMER",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET PROCESS CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET PROCESS CUSTOMER",
        secret
      );
    }

    const sql =
      await db.query(`select scustomer_id customer_id, scustomer_name customer_name,scustomer_phoneno customer_phoneno,scustomer_gstno customer_gstno from enquirysubscriptionmaster where 
         scustomer_id In (select customer_id from subscriptionprocessmaster where status = 1 and active_status = 1 and deleted_flag = 0);`);
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Process customer Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Process customer Fetched Successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//#########################################################################################################################################################################################
//#########################################################################################################################################################################################
//#########################################################################################################################################################################################
//#########################################################################################################################################################################################

async function GetRecurredCustomer(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET PROCESS CUSTOMER",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET PROCESS CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET PROCESS CUSTOMER",
        secret
      );
    }

    const sql = await db.query(
      `select sbg.customer_id,sbg.billing_addressname customer_name,sbg.phone_no customer_phoneno,sbm.customer_GST customer_gstno from subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.customer_id = sbm.customer_id where sbg.status =1 Group by customer_id`
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Recurred customer Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Recurred customer Fetched Successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getBinaryFile(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select subsprocess_path from subscriptionprocesslist where sprocess_id = ?`,
      [querydata.eventid]
    );
    var data;
    if (sql[0]) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].subsprocess_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].subsprocess_path);
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        binarydata,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        { binarydata: data },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function DeleteProcess(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "DELETE PROCESS OF THE CUSTOMER",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the process id",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }
    const processIdsString = querydata.processid
      .map((id) => `'${id}'`)
      .join(",");
    const sql = await db.query(
      `UPDATE subscriptionprocessmaster SET status = 0, deleted_flag = 0, active_status = 0 WHERE sub_processid IN (${processIdsString})`
    );
    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription Process Deleted Successfully",
        "",
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No matching Subscription Process found to delete",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function ArchiveProcess(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the process id",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }
    if (!querydata.hasOwnProperty("type")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Archive type missing. Please provide the archive type",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        secret
      );
    }
    const processIdsString = querydata.processid
      .map((id) => `'${id}'`)
      .join(",");
    const sql = await db.query(
      `UPDATE subscriptionprocessmaster SET archive_status = ${querydata.type} WHERE sub_processid IN (${processIdsString})`
    );
    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription Process Archived Successfully",
        "",
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No matching Subscription Process found to archive",
        "DELETE PROCESS OF THE CUSTOMER",
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function clientProfile(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH CLIENT PROFILE DATE",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("customerid") || querydata.customerid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing. Please provide the customer id",
        "FETCH CLIENT PROFILE DATE",
        secret
      );
    }
    var sql;
    let startDate;
    sql = await db.query(
      `SELECT scustomer_name customer_name, scustomer_mailid customer_mailid, scustomer_phoneno customer_phoneno, scustomer_gstno customer_gstno, 
      Address, Billing_address, billingadddress_name, Customer_type,Exist_customerid
      (SELECT COUNT(*) FROM subscriptionprocessmaster WHERE customer_id = c.scustomer_id AND status = 1) AS total_process,
      (SELECT COUNT(*) FROM subscriptionprocessmaster WHERE customer_id = c.scustomer_id AND active_status = 1 AND status = 1) AS active_process,
      (SELECT COUNT(*) FROM subscriptionprocessmaster WHERE customer_id = c.scustomer_id AND active_status = 0 AND status = 1) AS inactive_process
FROM enquirysubscriptionmaster c
WHERE scustomer_id = ? and status =1`,
      [querydata.customerid]
    );
    var customertype, companycount, sitecount;
    if (sql.length > 0) {
      if (sql[0].Customer_type == 1) {
        customertype = "Enquiry";
        companycount = 0;
        sitecount = 0;
      } else {
        var sql1;
        if (sql[0].Exist_customerid != 0) {
          sql1 = await db.query1(
            `SELECT COUNT(*) AS companycount, Customer_type,(SELECT COUNT(*) FROM branchmaster WHERE customer_id = c.customer_id) AS branch_count
             FROM customermaster c WHERE customer_id = ?`,
            [sql[0].Exist_customerid]
          );
        }
        // else if (sql[0].exist_branchid != 0) {
        //   sql1 = await db.query1(
        //     `SELECT COUNT(*) AS branch_count, c.Customer_type,(SELECT COUNT(*) FROM customermaster WHERE customer_id IN  (SELECT customer_id FROM branchmaster WHERE branch_id = b.branch_id))   AS companycount FROM branchmaster b JOIN customermaster c ON b.customer_id = c.customer_id WHERE b.branch_id = ?`,
        //     [sql[0].exist_branchid]
        //   );
        // }
        if (sql1.length > 0) {
          if (sql1[0].Customer_type == 1) {
            customertype = "Company";
          } else {
            customertype = "Organization";
          }
          companycount = sql1[0].companycount;
          sitecount = sql1[0].branch_count;
        }
      }
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Client Profile Data fetched successfully",
        {
          customername: sql[0].customer_name,
          mailid: sql[0].customer_mailid,
          Phonenumber: sql[0].customer_phoneno,
          gstnumber: sql[0].customer_gstno,
          clientaddress: sql[0].Address,
          clientaddressname: sql[0].customer_name,
          billingaddress: sql[0].Billing_address,
          billingaddressname: sql[0].billingadddress_name,
          totalprocess: sql[0].total_process,
          inactive_process: sql[0].inactive_process,
          activeprocess: sql[0].active_process,
          clienttype: customertype,
          companycount: companycount,
          sitecount: sitecount,
        },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Client Profile Data fetched successfully",
        {
          customername: "",
          mailid: "",
          Phonenumber: "",
          gstnumber: "",
          clientaddress: "",
          clientaddressname: "",
          billingaddress: "",
          billingaddressname: "",
          clienttype: "",
          totalprocess: 0,
          inactive_process: 0,
          activeprocess: 0,
          companycount: 0,
          sitecount: 0,
        },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################

async function approvedQuotation(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "APPROVE THE QUOTATION",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "APPROVE THE QUOTATION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "APPROVE THE QUOTATION",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "APPROVE THE QUOTATION",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "APPROVE THE QUOTATION",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "APPROVE THE QUOTATION",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "APPROVE THE QUOTATION",
        secret
      );
    }

    const sql = await db.query(
      `select Email_id from usermaster where user_design = 'Administrator' and status = 1`
    );
    const sql1 = await db.query(
      `select custsubs_name,subsprocess_path from subscriptionprocesslist where sprocess_id in (?);`,
      [querydata.eventid]
    );
    const sql2 = await db.query(
      `Update subscriptionprocesslist set Approved_status =2 where sprocess_id = ?`,
      [querydata.eventid]
    );
    var name = "",
      pdfpath = "";
    if (sql1[0]) {
      name = sql1[0].custsubs_name;
      pdfpath = sql1[0].subsprocess_path;
    }
    var emailid = "";
    if (sql.length > 0) {
      emailid =
        sql.length > 0 ? sql.map((item) => item.Email_id).join(",") : "";
    } else {
      emailid = `support@sporadasecure.com,ceo@sporadasecure.com,subscription@sporadasecure.com`;
    }
    EmailSent = await mailer.sendapprovequotation(
      "Administrator",
      emailid,
      // ,ceo@sporadasecure.com.ramachadran.m@sporadasecure.com',
      `Action Required!!! Received Quotation Approve Request for ${name}`,
      "apporvequotation.html",
      `http://192.168.0.200:8081/subscription/quoteapprove?quoteid=${querydata.eventid}&STOKEN=${subscription.STOKEN}&s=1&feedback='Apporved'`,
      "APPROVEQUOTATION_SEND",
      name,
      "QUOTATION APPROVAL",
      `http://192.168.0.200:8081/subscription/quoteapprove?quoteid=${querydata.eventid}&STOKEN=${subscription.STOKEN}&s=3`,
      pdfpath
    );
    if (EmailSent == true) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Email sent successfully to the Administrator. Please contact Administrator for further action.",
        { EmailSent: EmailSent },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error sending the Email. Please try again",
        { EmailSent: EmailSent },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################

async function uploadMor(req, res) {
  var secret;
  try {
    await uploadFile.uploadFileMOR(req, res);
    var subscription = req.body;
    if (!subscription.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD SALES",
        ""
      );
    }
    secret = subscription.STOKEN.substring(0, 16);
    // Validate the file
    if (!req.file) {
      return helper.getErrorResponse(
        false,
        "error",
        "Please upload a file!",
        "ADD SALES",
        secret
      );
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    return helper.getSuccessResponse(
      true,
      "success",
      `Uploaded the file successfully: ${req.file.originalname}`,
      { path: req.file.path },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      `Could not upload the file. ${er.message}`,
      er.message,
      secret
    );
  }
}

//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################

async function addSubscriptionCustomerreq(req, res) {
  var subscriptionid, processid;
  try {
    var secret, subscription;
    // Upload file handling
    try {
      await uploadFile.uploadSubCustomerrequ(req, res);
      subscription = req.body;

      // Validate Login Session Token
      if (!subscription.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token missing. Please provide the Login session token",
          "ADD SUBSCRIPTION CUSTOMER REQUIREMENT",
          ""
        );
      }

      secret = subscription.STOKEN.substring(0, 16);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD SUBSCRIPTION CUSTOMER REQUIREMENT",
          secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        secret
      );
    }

    let querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD SUBSCRIPTION CUSTOMER REQUIREMENT",
        secret
      );
    }

    // Validate session token with stored procedure
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ADD SUBSCRIPTION CUSTOMER REQUIREMENT",
        secret
      );
    }

    // Validate the querystring
    if (!subscription.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD SUBSCRIPTION CUSTOMER REQUIREMENT",
        secret
      );
    }

    // Decrypt and parse querystring

    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring error. Please provide a valid querystring or valid JSON.",
        ex.message,
        secret
      );
    }
    var requirementid = 0;
    // Validate required fields in the query data
    const requiredFields = [
      {
        field: "name",
        message: "Client name missing. Please provide the Client name",
      },
      {
        field: "phoneno",
        message: "Phone number missing. Please provide the Phone number",
      },
      {
        field: "emailid",
        message: "Email id missing. Please provide the Email id",
      },
      {
        field: "address",
        message: "Client address missing. Please provide the Client address",
      },
      {
        field: "gst",
        message:
          "Client GST Number missing. Please provide the Client GST number",
      },
      {
        field: "billingaddressname",
        message:
          "Billing address name missing. Please provide the Billing Address name",
      },
      {
        field: "billingaddress",
        message: "Billing address missing. Please provide the Billing address",
      },
      {
        field: "modeofrequest",
        message: "Mode of Request missing. Please provide the Mode of request",
      },
      {
        field: "MORreference",
        message:
          "MOR reference missing. Please provide the Mode of request reference",
      },
      { field: "date", message: "Date missing. Please provide the Date" },
      {
        field: "site",
        message: "Site Details missing. Please provide the Site Details",
      },
      {
        field: "notes",
        message: "Product Notes missing. Please provide the Product Notes",
      },
      {
        field: "title",
        message: "Title missing. Please provide the Title",
      },
      {
        field: "companyid",
        message: "Company id missing. Please provide the Company id",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD SUBSCRIPTION CUSTOMER REQUIREMENT",
          secret
        );
      }
    }

    const [result1] = await db.spcall(
      `CALL GenerateSubscriptionReqId(?,@p_customerreq_id); select @p_customerreq_id`,
      [userid]
    );
    const objectValue = result1[1][0];
    requirementid = objectValue["@p_customerreq_id"];
    // Insert subscription data into the database
    var sql;
    if (querydata.customerid == null) {
      [sql] = await db.spcall(
        `CALL SP_ADD_SUBSCRIPTION(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@subscriptionid); select @subscriptionid;`,
        [
          querydata.name,
          querydata.emailid,
          querydata.phoneno,
          querydata.gst,
          querydata.address,
          querydata.billingaddressname,
          querydata.billingaddress,
          querydata.modeofrequest,
          querydata.MORreference,
          userid,
          req.file.path,
          querydata.title,
          1,
          querydata.customerid,
        ]
      );
    } else {
      [sql] = await db.spcall(
        `CALL SP_ADD_SUBSCRIPTION(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@subscriptionid); select @subscriptionid;`,
        [
          querydata.name,
          querydata.emailid,
          querydata.phoneno,
          querydata.gst,
          querydata.address,
          querydata.billingaddressname,
          querydata.billingaddress,
          querydata.modeofrequest,
          querydata.MORreference,
          userid,
          req.file.path,
          querydata.title,
          2,
          querydata.customerid,
        ]
      );
    }
    const objectvalue1 = sql[1][0];
    subscriptionid = objectvalue1["@subscriptionid"];

    if (subscriptionid) {
      const [processSql] = await db.spcall(
        `CALL SP_ADD_SUBSCRIPTION_PROCESS(?,?,?,@processid); select @processid;`,
        [subscriptionid, userid, querydata.name]
      );
      const objectvalue2 = processSql[1][0];
      processid = objectvalue2["@processid"];

      if (processid) {
        const [proListSql] = await db.spcall(
          `CALL SP_ADD_SUBSCRIPTION_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
          [
            querydata.name,
            userid,
            processid,
            requirementid,
            1,
            req.file.path,
            querydata.address,
            querydata.billingaddress,
            querydata.billingaddressname,
            querydata.title,
          ]
        );
        const objectvalue3 = proListSql[1][0];
        const prolistid = objectvalue3["@prolistid"];

        if (prolistid) {
          // Insert Products in Parallel
          const productQueries = querydata.site.map((site) => {
            if (!site.sitename || !site.cameraquantity || !site.address) {
              return helper.getErrorResponse(
                false,
                "error",
                "Product details are incomplete.",
                "ADD SUBSCRIPTION CUSTOMER REQUIREMENT",
                secret
              );
            }
            return db.spcall(
              `CALL SP_SUBSCRIPTION_REQ_ADD(?,?,?,?,?,@productid); SELECT @productid;`,
              [
                site.sitename,
                site.cameraquantity,
                site.address,
                prolistid,
                JSON.stringify(querydata.notes),
              ]
            );
          });

          await Promise.all(productQueries);

          // Update generateecid status
          await db.query(
            `UPDATE generatesubreqid SET status = 0 WHERE customerreq_id = ?`,
            [requirementid]
          );

          // Log in morupload table
          await db.query(
            `INSERT INTO morupload(MOR_path, Created_by) VALUES(?,?)`,
            [req.file.path, userid]
          );
          // await mqttclient.publishMqttMessage(
          //   "Notification",
          //   "Request for quotation sent Successfully for " + querydata.vendorname
          // );
          await mqttclient.publishMqttMessage(
            "refresh",
            "Client Requirement has been added for the Subscription Customer " +
              querydata.name
          );
          return helper.getSuccessResponse(
            true,
            "success",
            "Client requirement created successfully",
            {
              clientrequirementid: subscriptionid,
            },
            secret
          );
        }
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error adding the Customer requirements",
        "ADD SUBSCRIPTION CUSTOMER REQUIREMENT",
        secret
      );
    }
  } catch (er) {
    if (subscriptionid != null && subscriptionid != undefined) {
      const sql = await db.query(
        `delete from enquirysubscriptionmaster where scustmer_id =?`,
        [subscriptionid]
      );
    }
    if (processid != null && processid != undefined) {
      const sql = await db.query(
        `delete from subscriptionprocesslist where sprocess_id =?`,
        [processid]
      );
    }
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function Subscriptiondata(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH SUBSCRIPTION DATA",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH SUBSCRIPTION DATA",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH SUBSCRIPTION DATA",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "FETCH SUBSCRIPTION DATA",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "FETCH SUBSCRIPTION DATA",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "FETCH SUBSCRIPTION DATA",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("subscriptionperiod") ||
      querydata.subscriptionperiod == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Subscription period missing. Please provide the subscription period",
        "FETCH SUBSCRIPTION DATA",
        secret
      );
    }
    var sql;
    let startDate;

    if (querydata.subscriptionperiod === "monthly") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (querydata.subscriptionperiod === "yearly") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    sql = await db.query(
      `SELECT 
          SUM(TotalAmount) AS Total_amount,
          COUNT(Invoice_no) AS Total_invoices,
          SUM(CASE WHEN payment_status = 1 THEN TotalAmount ELSE 0 END) AS Paid_total,
          COUNT(CASE WHEN payment_status = 1 THEN Invoice_no ELSE NULL END) AS Paid_invoices,
          SUM(CASE WHEN payment_status = 0 THEN TotalAmount ELSE 0 END) AS Pending_total,
          COUNT(CASE WHEN payment_status = 0 THEN Invoice_no ELSE NULL END) AS Pending_invoices
       FROM subscriptionbillgenerated 
       WHERE status = 1 AND DATE(Row_updated_date) >= ?`,
      [startDate.toISOString().split("T")[0]]
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription data fetched successfully",
        {
          totalamount: sql[0].Total_amount,
          paidamount: sql[0].Paid_total,
          unpaidamount: sql[0].Pending_total,
          totalinvoices: sql[0].Total_invoices,
          paidinvoices: sql[0].Paid_invoices,
          unpaidinvoices: sql[0].Pending_invoices,
        },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription data fetched successfully",
        {
          totalamount: 0,
          paidamount: 0,
          unpaidamount: 0,
          totalinvoices: 0,
          paidinvoices: 0,
          unpaidinvoices: 0,
        },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function detailsPreLoader(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }
    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("eventtype") || querydata.eventtype == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Event type missing. Please provide the event type",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }

    const sql = await db.query(
      `select scustomer_id customer_id,scustomer_name customer_name,scustomer_phoneno customer_phoneno,scustomer_mailid customer_mailid,scustomer_gstno customer_gstno,billing_address,address,billingadddress_name billingaddress_name,Process_titile,Exist_customerid companyid from enquirysubscriptionmaster where scustomer_id IN(select customer_id from subscriptionprocessmaster where sub_processid In(select processid from subscriptionprocesslist where sprocess_id in(?)))`,
      [querydata.eventid]
    );
    var eventnumber,
      title,
      customerid,
      companyid,
      gstno,
      emailid,
      contact_number,
      customer_name,
      billing_address,
      billingaddress_name,
      client_address,
      client_addressname,
      customercode = "",
      packagedetails;
    if (sql.length > 0) {
      customerid = sql[0].customer_id || 0;
      companyid = sql[0].companyid || 0;
      title = sql[0].Process_titile || "";
      gstno = sql[0].customer_gstno || "";
      contact_number = sql[0].customer_phoneno || "";
      customer_name = sql[0].customer_name || "";
      billing_address = sql[0].billing_address || "";
      billingaddress_name = sql[0].billingaddress_name || "";
      client_address = sql[0].address || "";
      client_addressname = sql[0].customer_name || "";
      emailid = sql[0].customer_mailid || "";
    }

    if (querydata.eventtype == "quotation") {
      customercode = "SSIPL-QUOTE";
      const [result1] = await db.spcall(
        `CALL GenerateSub_quotationid(?,?,@p_quotation_id); select @p_quotation_id`,
        [userid, customercode]
      );
      const objectValue = result1[1][0];
      eventnumber = objectValue["@p_quotation_id"];
      subscription = await db.query(
        `select requirement_id,sitename,camera_quantity,Address,Notes from subscriptioncustomerrequirements where sprocess_id IN(?)`,
        [querydata.eventid]
      );
    } else if (querydata.eventtype == "revisedquotation") {
      const sql = await db.query(
        `select sprocess_gene_id,package_details from subscriptionprocesslist where processid IN ( SELECT processid FROM subscriptionprocesslist WHERE sprocess_id = ?) 
        AND process_type IN(2,3) ORDER BY sprocess_id DESC LIMIT 1`,
        [querydata.eventid]
      );
      if (sql.length > 0) {
        const ccode = sql[0].sprocess_gene_id;
        const [result] = await db.spcall(
          `CALL Generate_revisedquotation(?,?,@p_quotation_id); select @p_quotation_id`,
          [userid, ccode]
        );
        const objectValue = result[1][0];
        eventnumber = objectValue["@p_quotation_id"];
        packagedetails = sql[0].package_details;
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Event id not found",
          "GET THE EVENT NUMBER",
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Quotation not found",
        "GET THE EVENT NUMBER",
        secret
      );
    }
    if (eventnumber != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Event number fetched successfully",
        {
          eventnumber: eventnumber,
          title: title,
          gstnumber: gstno,
          companyid: companyid,
          emailid: emailid,
          contact_number: contact_number,
          billing_address: billing_address,
          billingaddress_name: billingaddress_name,
          client_address: client_address,
          client_addressname: client_addressname,
          packagedetails: packagedetails,
        },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching Event number",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        secret
      );
    }
  } catch (er) {
    console.log(er);
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

// async function AddQuotation(req, res) {
//   try {
//     var secret;
//     try {
//       await uploadFile.uploadSubQuotationp(req, res);
//       if (!req.file) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Please upload a file!",
//           "ADD QUOTATION"
//         );
//       }
//     } catch (er) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         `Could not upload the file. ${er.message}`,
//         er.message,
//         ""
//       );
//     }

//     const subscription = req.body;
//     // Check if the session token exists
//     if (!subscription.hasOwnProperty("STOKEN")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken missing. Please provide the Login sessiontoken",
//         "ADD QUOTATION",
//         ""
//       );
//     }
//     var secret = subscription.STOKEN.substring(0, 16);
//     var querydata;
//     // Validate session token length
//     if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 15) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
//         "ADD QUOTATION",
//         secret
//       );
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
//       [subscription.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "ADD QUOTATION",
//         secret
//       );
//     }
//     // Check if querystring is provided
//     if (!subscription.hasOwnProperty("querystring")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring missing. Please provide the querystring",
//         "ADD QUOTATION",
//         secret
//       );
//     }

//     // Decrypt querystring
//     try {
//       querydata = await helper.decrypt(subscription.querystring, secret);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring Invalid error. Please provide the valid querystring.",
//         "ADD QUOTATION",
//         secret
//       );
//     }

//     // Parse the decrypted querystring
//     try {
//       querydata = JSON.parse(querydata);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring JSON error. Please provide valid JSON",
//         "ADD QUOTATION",
//         secret
//       );
//     }
//     const requiredFields = [
//       { field: "processid", message: "Process id missing" },
//       { field: "clientaddressname", message: "Client address name missing" },
//       { field: "clientaddress", message: "Client address missing." },
//       { field: "billingaddress", message: "billing address missing." },
//       { field: "billingaddressname", message: "Billing address name missing." },
//       { field: "sitelist", message: "Subscription details missing." },
//       { field: "packagedetails", message: "Package details missing." },
//       { field: "addressdetails", message: "Address details missing." },
//       { field: "notes", message: "Noted missing" },
//       { field: "emailid", message: "Email id missing." },
//       { field: "phoneno", message: "Phone number missing." },
//       { field: "ccemail", message: "CC email missing." },
//       { field: "date", message: "Date missing" },
//       { field: "quotationgenid", message: "Quotation id missing." },
//       { field: "messagetype", message: "Message type missing." },
//       { field: "gstpercent", message: "GST Percentage missing." },
//       { field: "gst_number", message: "Gst number missing." },
//       {
//         field: "feedback",
//         message: "Feedback missing. Please provide the feedback.",
//       },
//     ];
//     for (const { field, message } of requiredFields) {
//       if (!querydata.hasOwnProperty(field)) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           message,
//           "ADD QUOTATION",
//           secret
//         );
//       }
//     }
//     var WhatsappSent, EmailSent;
//     const [sql1] = await db.spcall(
//       `CALL SP_ADD_SUB_QUOTATION_PROCESS(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
//       [
//         querydata.clientaddressname,
//         userid,
//         querydata.processid,
//         querydata.quotationgenid,
//         2,
//         req.file.path,
//         querydata.clientaddress,
//         querydata.billingaddress,
//         querydata.billingaddressname,
//         querydata.clientaddressname,
//       ]
//     );
//     const objectvalue2 = sql1[1][0];
//     const quatationid = objectvalue2["@prolistid"];
//     var Quoteid;
//     if (quatationid != null && quatationid != 0) {
//       for (const subscription of querydata.packagedetails) {
//         if (
//           !subscription.hasOwnProperty("sitename") ||
//           !subscription.hasOwnProperty("cameraquantity") ||
//           !subscription.hasOwnProperty("siteaddress") ||
//           !subscription.hasOwnProperty("packageprice") ||
//           !subscription.hasOwnProperty("specialprice") ||
//           !subscription.hasOwnProperty("")
//         ) {
//           return helper.getErrorResponse(
//             false,
//             "error",
//             "Product details are incomplete. Please provide sitename ,cameraquantity, siteaddress, packageprice and specialprice.",
//             "ADD QUATATION",
//             secret
//           );
//         } else {
//           const [sql2] = await db.spcall(
//             `CALL SP_SUB_QUOTATION_ADD(?,?,?,?,?,?,?,?,?,@quoteid); SELECT @quoteid;`,
//             [
//               subscription.sitename,
//               subscription.cameraquantity,
//               subscription.siteaddress,
//               querydata.quotationgenid,
//               JSON.stringify(querydata.notes),
//               req.file.path,
//               quatationid,
//               subscription.packageprice,
//               subscription.specialprice,
//             ]
//           );
//           const objectvalue3 = sql2[1][0];
//           Quoteid = objectvalue3["@quoteid"];
//         }
//       }
//       const sql = await db.query(
//         `Update generatesubquotationid set status = 0 where quotation_id IN('${querydata.quotationgenid}')`
//       );
//       const sql2 = await db.query(
//         `select u.Email_id,a.secret from usermaster u CROSS JOIN apikey a where u.user_design = 'Administrator' and u.status = 1 and a.status = 1`
//       );
//       var emailid = "",
//         secret = "15b97956-b296-11";
//       if (sql2.length > 0) {
//         emailid =
//           sql2.length > 0 ? sql2.map((item) => item.Email_id).join(",") : "";
//         secret = sql2[0].secret;
//       } else {
//         emailid = `support@sporadasecure.com,ceo@sporadasecure.com,subscription@sporadasecure.com`;
//       }
//       EmailSent = await mailer.sendapprovequotation(
//         "Administrator",
//         emailid,
//         `Action Required!!! Received Quotation Approve Request for ${querydata.clientaddressname}`,
//         "apporvequotation.html",
//         `http://192.168.0.200:8081/subscription/intquoteapprove?quoteid=${quatationid}&STOKEN=${secret}&s=1&feedback='Apporved'`,
//         "APPROVEQUOTATION_SEND",
//         querydata.clientaddressname,
//         "QUOTATION APPROVAL",
//         `http://192.168.0.200:8081/subscription/intquoteapprove?quoteid=${quatationid}&STOKEN=${secret}&s=3`,
//         req.file.path
//       );
//       if (EmailSent == true) {
//         const sql = await db.query(
//           `INSERT INTO quotation_mailbox(process_id,emailid,ccemail,phoneno,feedback,clientname,message_type,pdf_path)
//         VALUES(?,?,?,?,?,?,?,?)`,
//           [
//             quatationid,
//             querydata.emailid,
//             querydata.ccemail,
//             querydata.phoneno,
//             querydata.feedback,
//             querydata.clientaddressname,
//             querydata.messagetype,
//             req.file.path,
//           ]
//         );
//         await mqttclient.publishMqttMessage(
//           "Notification",
//           "Email sent successfully to the Administrator for eventid" +
//             quatationid +
//             ". Please contact Administrator for further action."
//         );
//         return helper.getSuccessResponse(
//           true,
//           "success",
//           "Email sent successfully to the Administrator. Please contact Administrator for further action.",
//           { EmailSent: EmailSent },
//           secret
//         );
//       } else {
//         const sql = await db.query(
//           `delete from subscriptionprocesslist where sprocess_id =?`,
//           [quatationid]
//         );
//         await mqttclient.publishMqttMessage(
//           "Notification",
//           "Error sending the Email for eventid" +
//             quatationid +
//             ". Please try again"
//         );
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Error sending the Email. Please try again",
//           { EmailSent: EmailSent },
//           secret
//         );
//       }
//     } else {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Error while adding the Quotation.",
//         "ADD QUOTATION",
//         secret
//       );
//     }
//   } catch (er) {
//     return helper.getErrorResponse(
//       false,
//       "error",
//       "Internal Error. Please contact Administration",
//       er.message,
//       secret
//     );
//   }
// }

async function AddRevisedQuotation(req, res) {
  var quotationid, subscription;
  try {
    var secret;
    try {
      await uploadFile.uploadSubQuotationp(req, res);
      subscription = req.body;

      // Check if the session token exists
      if (!subscription.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken missing. Please provide the Login sessiontoken",
          "ADD QUOTATION",
          ""
        );
      }
      var secret = subscription.STOKEN.substring(0, 16);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD QUOTATION",
          secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        secret
      );
    }

    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 15) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD QUOTATION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD QUOTATION",
        secret
      );
    }
    // Check if querystring is provided
    if (!subscription.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD QUOTATION",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD QUOTATION",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD QUOTATION",
        secret
      );
    }
    const requiredFields = [
      { field: "processid", message: "Process id missing" },
      { field: "clientaddressname", message: "Client address name missing" },
      { field: "clientaddress", message: "Client address missing." },
      { field: "billingaddress", message: "billing address missing." },
      { field: "billingaddressname", message: "Billing address name missing." },
      { field: "packagedetails", message: "Package details missing." },
      { field: "companyid", message: "Company id missing." },
      { field: "notes", message: "Noted missing" },
      { field: "emailid", message: "Email id missing." },
      { field: "phoneno", message: "Phone number missing." },
      { field: "ccemail", message: "CC email missing." },
      { field: "date", message: "Date missing" },
      { field: "quotationgenid", message: "Quotation id missing." },
      { field: "messagetype", message: "Message type missing." },
      { field: "gstpercent", message: "GST Percentage missing." },
      { field: "gst_number", message: "Gst number missing." },
      {
        field: "feedback",
        message: "Feedback missing. Please provide the feedback.",
      },
    ];
    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD QUOTATION",
          secret
        );
      }
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SUB_QUOTATION_PROCESS(?,?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.clientaddressname,
        userid,
        querydata.processid,
        querydata.quotationgenid,
        3,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.clientaddressname,
        JSON.stringify(querydata.packagedetails),
      ]
    );
    const objectvalue2 = sql1[1][0];
    quotationid = objectvalue2["@prolistid"];
    console.log(quotationid);
    for (const subscription1 of querydata.packagedetails) {
      if (
        !subscription1.name ||
        !subscription1.description ||
        !subscription1.cameracount ||
        !subscription1.amount ||
        !subscription1.subscriptiontype ||
        !subscription1.sites ||
        !subscription1.subscriptionid
      ) {
        return helper.getErrorResponse(
          false,
          "error",
          "Subscription details are incomplete. Please provide name,description,cameracount,amount,subscriptiontype,sites and Subscription id",
          "ADD QUATATION",
          secret
        );
      } else {
        var subscriptiontype = 0,
          subscriptionid = 0;
        if (subscription1.subscriptionid == 0) {
          if (subscription1.subscriptiontype == "global") {
            subscriptiontype = 1;
          } else if (subscription1.subscriptionttype == "company") {
            const [rows] = await db.spcall1(
              ` CALL InsertSubscription(?, ?, ?, ?, ?, ?, ?,?,?,@subscriptionid);SELECT @subscriptionid;`,
              [
                subscriptiontype,
                subscription1.name,
                1,
                subscription1.cameracount,
                0,
                subscription1.amount,
                subscription1.description,
                querydata.companyid,
              ]
            );
            const objectvalue1 = rows[1][0];
            subscriptionid = objectvalue1["@subscriptionid"];
          } else if (subscription1.subscriptiontype == "current") {
            const [rows] = await db.spcall1(
              ` CALL InsertSubscription(?, ?, ?, ?, ?, ?, ?,?, @subscriptionid);SELECT @subscriptionid;`,
              [
                subscriptiontype,
                subscription1.name,
                1,
                subscription1.cameracount,
                0,
                subscription1.amount,
                subscription1.description,
                0,
              ]
            );
            const objectvalue1 = rows[1][0];
            subscriptionid = objectvalue1["@subscriptionid"];
          }
        } else {
          subscriptionid = subscription1.subscriptionid;
        }
        for (const sites of subscription1.sites) {
          if (
            !sites.sitename ||
            !sites.cameraquantity ||
            !sites.siteaddress ||
            !sites.billType ||
            !sites.mailType
          ) {
            return helper.getErrorResponse(
              false,
              "error",
              "Product details are incomplete. Please provide sitename ,cameraquantity, siteaddress, billtype and consolidateemail.",
              "ADD QUATATION",
              secret
            );
          } else {
            const [rows] = await db.spcall(
              `CALL SP_SUB_QUOTATION_ADD(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, @quoteid); SELECT @quoteid as quoteid;`,
              [
                sites.sitename,
                sites.cameraquantity,
                sites.siteaddress,
                subscriptionid,
                quotationid,
                sites.billType,
                sites.mailType,
                querydata.notes,
                userid,
                querydata.gstpercent,
                querydata.gst_number,
              ]
            );
          }
        }
      }
    }
    const sql = await db.query(
      `Update generatesubquotationid set status = 0 where quotation_id IN('${querydata.quotationgenid}')`
    );
    const sql2 = await db.query(
      `select u.Email_id,a.secret from usermaster u CROSS JOIN apikey a where u.user_design = 'Administrator' and u.status = 1 and a.status = 1`
    );
    var emailid = "",
      secret1 = "15b97956-b296-11";
    if (sql2.length > 0) {
      emailid =
        sql2.length > 0 ? sql2.map((item) => item.Email_id).join(",") : "";
      secret1 = sql2[0].secret;
    } else {
      emailid = `support@sporadasecure.com,ceo@sporadasecure.com,subscription@sporadasecure.com`;
    }
    EmailSent = await mailer.sendapprovequotation(
      "Administrator",
      emailid,
      `Action Required!!! Received Quotation Approve Request for ${querydata.clientaddressname}`,
      "apporvequotation.html",
      `http://192.168.0.200:8081/subscription/intquoteapprove?quoteid=${quotationid}&STOKEN=${secret1}&s=1&feedback='Apporved'`,
      "APPROVEQUOTATION_SEND",
      querydata.clientaddressname,
      "QUOTATION APPROVAL",
      `http://192.168.0.200:8081/subscription/intquoteapprove?quoteid=${quotationid}&STOKEN=${secret1}&s=3`,
      req.file.path
    );
    if (EmailSent == true) {
      const sql = await db.query(
        `INSERT INTO quotation_mailbox(process_id,emailid,ccemail,phoneno,feedback,clientname,message_type,pdf_path)
              VALUES(?,?,?,?,?,?,?,?)`,
        [
          quotationid,
          querydata.emailid,
          querydata.ccemail,
          querydata.phoneno,
          querydata.feedback,
          querydata.clientaddressname,
          querydata.messagetype,
          req.file.path,
        ]
      );
      await mqttclient.publishMqttMessage(
        "Notification",
        "Revised Quotation sent successfully to the Administrator for " +
          querydata.clientaddressname +
          ". Please contact Administrator for further action."
      );
      await mqttclient.publishMqttMessage(
        "refresh",
        "Revised Quotation sent successfully to the Administrator for " +
          querydata.clientaddressname +
          ". Please contact Administrator for further action."
      );
      return helper.getSuccessResponse(
        true,
        "success",
        "Revised Quotation sent successfully to the Administrator. Please contact Administrator for further action.",
        { EmailSent: EmailSent },
        secret
      );
    } else {
      const sql = await db.query(
        `delete from subscriptionprocesslist where sprocess_id =?`,
        [quotationid]
      );
      await mqttclient.publishMqttMessage(
        "Notification",
        "Error sending the Revised Quotation for " +
          querydata.clientaddressname +
          ". Please try again"
      );
      await mqttclient.publishMqttMessage(
        "refresh",
        "Error sending the Revised Quotation for " +
          querydata.clientaddressname +
          ". Please try again"
      );
      return helper.getErrorResponse(
        false,
        "error",
        "Error sending the Quotation. Please try again",
        { EmailSent: EmailSent },
        secret
      );
    }
  } catch (er) {
    if (quotationid != 0 && quotationid != null) {
      const sql = await db.query(
        `DELETE FROM subscriptionprocesslist where sprocess_id = ?`,
        [quotationid]
      );
    }
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//########################################################################################################################################################################################
//########################################################################################################################################################################################
//########################################################################################################################################################################################
//########################################################################################################################################################################################

async function AddQuotation(req, res) {
  var quotationid, subscription;
  try {
    var secret;
    try {
      await uploadFile.uploadSubQuotationp(req, res);
      subscription = req.body;

      // Check if the session token exists
      if (!subscription.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken missing. Please provide the Login sessiontoken",
          "ADD QUOTATION",
          ""
        );
      }
      var secret = subscription.STOKEN.substring(0, 16);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD QUOTATION",
          secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        secret
      );
    }

    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 15) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD QUOTATION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD QUOTATION",
        secret
      );
    }
    // Check if querystring is provided
    if (!subscription.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD QUOTATION",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD QUOTATION",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD QUOTATION",
        secret
      );
    }
    const requiredFields = [
      { field: "processid", message: "Process id missing" },
      { field: "clientaddressname", message: "Client address name missing" },
      { field: "clientaddress", message: "Client address missing." },
      { field: "billingaddress", message: "billing address missing." },
      { field: "billingaddressname", message: "Billing address name missing." },
      { field: "packagedetails", message: "Package details missing." },
      { field: "companyid", message: "Company id missing." },
      { field: "notes", message: "Noted missing" },
      { field: "emailid", message: "Email id missing." },
      { field: "phoneno", message: "Phone number missing." },
      { field: "ccemail", message: "CC email missing." },
      { field: "date", message: "Date missing" },
      { field: "quotationgenid", message: "Quotation id missing." },
      { field: "messagetype", message: "Message type missing." },
      { field: "gstpercent", message: "GST Percentage missing." },
      { field: "gst_number", message: "Gst number missing." },
      {
        field: "feedback",
        message: "Feedback missing. Please provide the feedback.",
      },
    ];
    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD QUOTATION",
          secret
        );
      }
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SUB_QUOTATION_PROCESS(?,?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.clientaddressname,
        userid,
        querydata.processid,
        querydata.quotationgenid,
        2,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.clientaddressname,
        JSON.stringify(querydata.packagedetails),
      ]
    );
    const objectvalue2 = sql1[1][0];
    quotationid = objectvalue2["@prolistid"];
    console.log(quotationid);
    for (const subscription1 of querydata.packagedetails) {
      if (
        !subscription1.name ||
        !subscription1.description ||
        !subscription1.cameracount ||
        !subscription1.amount ||
        !subscription1.subscriptiontype ||
        !subscription1.sites
        // !subscription1.subscriptionid
      ) {
        return helper.getErrorResponse(
          false,
          "error",
          "Subscription details are incomplete. Please provide name,description,cameracount,amount,subscriptiontype,sites and Subscription id",
          "ADD QUATATION",
          secret
        );
      } else {
        var subscriptiontype = 0,
          subscriptionid = 0;
        if (subscription1.subscriptionid == 0) {
          if (subscription1.subscriptiontype == `global`) {
            subscriptiontype = 1;
          } else if (subscription1.subscriptiontype == `company`) {
            const [rows] = await db.spcall1(
              ` CALL InsertSubscription(?, ?, ?, ?, ?, ?, ?,?,?,?, @subscriptionid);SELECT @subscriptionid;`,
              [
                subscriptiontype,
                subscription1.name,
                1,
                subscription1.cameracount,
                0,
                subscription1.amount,
                subscription1.description,
                querydata.companyid,
                userid,
                querydata.processid,
              ]
            );
            const objectvalue1 = rows[1][0];
            subscriptionid = objectvalue1["@subscriptionid"];
          } else if (subscription1.subscriptiontype == `current`) {
            const [rows] = await db.spcall1(
              ` CALL InsertSubscription(?, ?, ?, ?, ?, ?, ?,?,?,?,  @subscriptionid);SELECT @subscriptionid;`,
              [
                subscriptiontype,
                subscription1.name,
                1,
                subscription1.cameracount,
                0,
                subscription1.amount,
                subscription1.description,
                0,
                userid,
                querydata.processid,
              ]
            );
            const objectvalue1 = rows[1][0];
            subscriptionid = objectvalue1["@subscriptionid"];
          }
        } else {
          subscriptionid = subscription1.subscriptionid;
        }
        for (const sites of subscription1.sites) {
          if (
            !sites.sitename ||
            !sites.cameraquantity ||
            !sites.siteaddress ||
            !sites.billType ||
            !sites.mailType
          ) {
            return helper.getErrorResponse(
              false,
              "error",
              "Product details are incomplete. Please provide sitename ,cameraquantity, siteaddress, billtype and consolidateemail.",
              "ADD QUATATION",
              secret
            );
          } else {
            const [rows] = await db.spcall(
              `CALL SP_SUB_QUOTATION_ADD(?,?,?,?,?,?,?,?,?,?,?, @quoteid); SELECT @quoteid as quoteid;`,
              [
                sites.sitename,
                sites.cameraquantity,
                sites.siteaddress,
                subscriptionid,
                quotationid,
                sites.billType,
                sites.mailType,
                JSON.stringify(querydata.notes),
                userid,
                querydata.gstpercent,
                querydata.gst_number,
              ]
            );
          }
        }
      }
    }
    const sql = await db.query(
      `Update generatesubquotationid set status = 0 where quotation_id IN('${querydata.quotationgenid}')`
    );
    const sql2 = await db.query(
      `select u.Email_id,a.secret from usermaster u CROSS JOIN apikey a where u.user_design = 'Administrator' and u.status = 1 and a.status = 1`
    );
    var emailid = "",
      secret1 = "15b97956-b296-11";
    if (sql2.length > 0) {
      emailid =
        sql2.length > 0 ? sql2.map((item) => item.Email_id).join(",") : "";
      secret1 = sql2[0].secret;
    } else {
      emailid = `support@sporadasecure.com,ceo@sporadasecure.com,subscription@sporadasecure.com`;
    }
    EmailSent = await mailer.sendapprovequotation(
      "Administrator",
      emailid,
      `Action Required!!! Received Quotation Approve Request for ${querydata.clientaddressname}`,
      "apporvequotation.html",
      `http://192.168.0.200:8081/subscription/intquoteapprove?quoteid=${quotationid}&STOKEN=${secret1}&s=1&feedback='Apporved'`,
      "APPROVEQUOTATION_SEND",
      querydata.clientaddressname,
      "QUOTATION APPROVAL",
      `http://192.168.0.200:8081/subscription/intquoteapprove?quoteid=${quotationid}&STOKEN=${secret1}&s=3`,
      req.file.path
    );
    if (EmailSent == true) {
      const sql = await db.query(
        `INSERT INTO subquotation_mailbox(process_id,emailid,ccemail,phoneno,feedback,clientname,message_type,pdf_path)
              VALUES(?,?,?,?,?,?,?,?)`,
        [
          quotationid,
          querydata.emailid,
          querydata.ccemail,
          querydata.phoneno,
          querydata.feedback,
          querydata.clientaddressname,
          querydata.messagetype,
          req.file.path,
        ]
      );
      await mqttclient.publishMqttMessage(
        "Notification",
        "Quotation sent successfully to the Administrator for eventid " +
          querydata.clientaddressname +
          ". Please contact Administrator for further action."
      );
      await mqttclient.publishMqttMessage(
        "refresh",
        "Quotation sent successfully to the Administrator for eventid " +
          querydata.clientaddressname +
          ". Please contact Administrator for further action."
      );
      return helper.getSuccessResponse(
        true,
        "success",
        "Quotation sent successfully to the Administrator. Please contact Administrator for further action.",
        { EmailSent: EmailSent },
        secret
      );
    } else {
      const sql = await db.query(
        `delete from subscriptionprocesslist where sprocess_id =?`,
        [quotationid]
      );
      await mqttclient.publishMqttMessage(
        "Notification",
        "Error sending the Quotation for eventid " +
          querydata.clientaddressname +
          ". Please try again"
      );
      await mqttclient.publishMqttMessage(
        "refresh",
        "Error sending the Quotation for eventid " +
          querydata.clientaddressname +
          ". Please try again"
      );
      return helper.getErrorResponse(
        false,
        "error",
        "Error sending the Quotation. Please try again",
        { EmailSent: EmailSent },
        secret
      );
    }
  } catch (er) {
    if (quotationid != 0 && quotationid != null) {
      const sql = await db.query(
        `DELETE FROM subscriptionprocesslist where sprocess_id = ?`,
        [quotationid]
      );
    }
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//########################################################################################################################################################################################
//########################################################################################################################################################################################
//########################################################################################################################################################################################
//########################################################################################################################################################################################

async function addCustomInvoice(req, res) {
  try {
    var secret, subscription, querydata, userid;
    try {
      await uploadFile.uploadcustominvoicepdf(req, res);
      subscription = req.body;
      // Check if the session token exists
      if (!subscription.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token missing. Please provide the Login session token",
          "ADD RECURRING INVOICE",
          ""
        );
      }
      secret = subscription.STOKEN.substring(0, 16);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD QUOTATION",
          secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        secret
      );
    }

    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("siteids")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Site id missing. Please provide the Site id.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("subscriptionbillid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Subscription bill id missing. Please provide the Subscription bill id",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("clientaddressname") ||
      querydata.clientaddressname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client address name missing. Please provide the Client address name missing",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("clientaddress") ||
      querydata.clientaddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client address missing. Please provide the Client address",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("billingaddressname") ||
      querydata.billingaddressname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Billing address name missing. Please provide the Billing Address name",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("billingaddress") ||
      querydata.billingaddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Billing address missing. Please provide the Billing address.",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (!querydata.hasOwnProperty("planname") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD RECURRING INVOICE",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("totalamount") ||
      querydata.totalamount == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Total amount missing. Please provide the total amount.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("invoicegenid") ||
      querydata.invoicegenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invoice Generated id missing. Please provide the invoice generated id.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("date") || querydata.date == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Invoice date missing. Please provide the invoice date.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("messagetype") ||
      querydata.messagetype == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Message type missing. Please provide the message type.",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    if (!querydata.hasOwnProperty("gstnumber")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Gst Number missing. Please provide the gst Number",
        "ADD RECURRING INVOICE",
        secret
      );
    }
    const siteIdsJson = JSON.stringify(querydata.siteids || []);
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_CUSTOM_ADD_RECURRING_INVOICE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@sprocessid); select @sprocessid;`,
      [
        querydata.subscriptionbillid,
        siteIdsJson,
        querydata.clientaddressname,
        querydata.clientaddress,
        querydata.billingaddressname,
        querydata.billingaddress,
        req.file.path,
        querydata.invoicegenid,
        querydata.totalamount,
        userid,
        querydata.emailid,
        querydata.phoneno,
        querydata.ccemail,
        querydata.gstnumber,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const invoiceid = objectvalue2["@sprocessid"];
    var Quoteid;

    // if (querydata.messagetype == 1) {
    //   EmailSent = await mailer.sendInvoice(
    //     querydata.clientaddressname,
    //     querydata.emailid,
    //     "Your invoice from Sporada Secure India Private Limited",
    //     "invoicepdf.html",
    //     ``,
    //     "INVOICE_PDF_SEND",
    //     req.file.path,
    //     querydata.invoicegenid,
    //     querydata.date,
    //     querydata.totalamount,
    //     querydata.ccemail,
    //     querydata.feedback
    //   );
    // } else if (querydata.messagetype == 2 ) {
    //   WhatsappSent = await axios.post(`${config.whatsappip}/billing/sendpdf`, {
    //     phoneno: querydata.phoneno,
    //     feedback: querydata.feedback,
    //     pdfpath: req.file.path,
    //   });
    //   if (WhatsappSent.data.code == true) {
    //     WhatsappSent = WhatsappSent.data.code;
    //   } else {
    //     WhatsappSent = WhatsappSent.data.code;
    //   }
    // }
    const promises = [];
    const phoneNumbers = querydata.phoneno
      ? querydata.phoneno
          .split(",")
          .map((num) => num.trim())

          .filter((num) => num !== "") // Removes empty values
      : [];
    // Send Email or WhatsApp Message
    if (querydata.messagetype === 1) {
      // Send only email
      EmailSent = await mailer.sendInvoice(
        querydata.clientaddressname,
        querydata.emailid,
        "Your invoice from Sporada Secure India Private Limited",
        "invoicepdf.html",
        ``,
        "INVOICE_PDF_SEND",
        req.file.path,
        querydata.invoicegenid,
        querydata.date,
        querydata.totalamount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype === 2) {
      WhatsappSent = await Promise.all(
        phoneNumbers.map(async (number) => {
          try {
            const response = await axios.post(
              `${config.whatsappip}/billing/sendpdf`,
              {
                phoneno: number,
                feedback: querydata.feedback,
                pdfpath: req.file.path,
              }
            );
            return response.data.code;
          } catch (error) {
            console.error(`WhatsApp Error for ${number}:`, error.message);
            return false;
          }
        })
      );
    } else if (querydata.messagetype === 3) {
      // Send both email & WhatsApp in parallel
      promises.push(
        mailer.sendInvoice(
          querydata.clientaddressname,
          querydata.emailid,
          "Your invoice from Sporada Secure India Private Limited",

          "invoicepdf.html",
          ``,
          "INVOICE_PDF_SEND",
          req.file.path,
          querydata.invoicegenid,
          querydata.date,
          querydata.totalamount,
          querydata.ccemail,
          querydata.feedback
        )
      );

      promises.push(
        Promise.all(
          phoneNumbers.map(async (number) => {
            try {
              const response = await axios.post(
                `${config.whatsappip}/billing/sendpdf`,
                {
                  phoneno: number,
                  feedback: querydata.feedback,
                  pdfpath: req.file.path,
                }
              );
              return response.data.code;
            } catch (error) {
              console.error(`WhatsApp Error for ${number}:`, error.message);
              return false;
            }
          })
        ).then((results) => (WhatsappSent = results))
      );

      // Run both requests in parallel and wait for completion
      [EmailSent] = await Promise.all(promises);
    }
    await mqttclient.publishMqttMessage(
      "refresh",
      "Custom Invoice has been Created "
    );
    // await mqttclient.publishMqttMessage(
    //   "Notification",
    //   "Quotation approved Internally for the process id " +
    //     subscription.quoteid
    // );
    return helper.getSuccessResponse(
      true,
      "success",
      "Subscription Invoice added Successfully",
      { EmailSent: EmailSent, WhatsappSent: WhatsappSent },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}
//###########################################################################################################################################################################################
//############################################################################################################################################################################################
//#############################################################################################################################################################################################
//############################################################################################################################################################################################

async function GetCustomPDF(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select Subscription_generatedid custompdfid,Client_addressname,client_address,Billing_addressname,Billing_address,Email_id customer_mailid,Phone_no customer_phoneno,Row_updated_date date,gstnumber,subscription_billid,TotalAmount,pdf_path pdf_data,pdf_path pdfpath from customsubscriptionbillgenerated where status = 1 Order By Row_updated_date DESC`
    );
    var data;
    if (sql.length >= 0) {
      // for (let i = 0; i < sql.length; i++) {
      //   // Ensure file exists
      //   if (!fs.existsSync(sql[i].pdf_data)) {
      //     return helper.getErrorResponse(
      //       false,
      //       "error",
      //       "File does not exist",
      //       "GET BINARY DATA FOR PDF",
      //       secret
      //     );
      //   }
      //   // for (let i = 0; i < sql.length; i++) {
      //   binarydata = await helper.convertFileToBinary(sql[i].pdf_data);
      //   sql[i].pdf_data = binarydata;
      // }

      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        { binarydata: data },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//#########################################################################################################################################################################################
//############################################################################################################################################################################################
//#############################################################################################################################################################################################
//############################################################################################################################################################################################

async function getCustomBinaryfile(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("custompdfid") ||
      querydata.custompdfid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer bill id missing. Please provide the custom bill id",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select pdf_path from customsubscriptionbillgenerated where subscription_generatedid = ?`,
      [querydata.custompdfid]
    );
    var data;
    if (sql[0]) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].pdf_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].pdf_path);
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        binarydata,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//#########################################################################################################################################################################################
//############################################################################################################################################################################################
//#############################################################################################################################################################################################
//############################################################################################################################################################################################

async function getRecurredBinaryfile(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    var sql = [];
    // Validate required fields
    if (querydata.hasOwnProperty("recurredbillid")) {
      sql = await db.query(
        `select pdf_path from subscriptionbillgenerated where subscription_generatedid = ?`,
        [querydata.recurredbillid]
      );
    }
    if (querydata.hasOwnProperty("invoicenumber")) {
      sql = await db.query(
        `select pdf_path from subscriptionbillgenerated where Invoice_no = ?`,
        [querydata.invoicenumber]
      );
    }

    var data;
    if (sql.length > 0) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].pdf_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].pdf_path);
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        binarydata,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function IntQuotationApproval(req, res) {
  try {
    let subscription = req.query;

    // Path to HTML files
    const htmlPath = path.resolve(__dirname, "..", "htmlresponse");

    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return res.sendFile(path.join(htmlPath, "error.html"));
    }

    // var secret = subscription.STOKEN.substring(0, 16);

    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 10) {
      return res.sendFile(path.join(htmlPath, "invalid_token.html"));
    }

    // Validate session token
    const result = await db.query(`select secret from apikey where secret =?`, [
      subscription.STOKEN,
    ]);

    if (result.length == 0) {
      return res.sendFile(path.join(htmlPath, "invalid_token.html"));
    }
    // Validate required fields
    if (!subscription.hasOwnProperty("quoteid") || !subscription.quoteid) {
      return res.sendFile(path.join(htmlPath, "missing_quoteid.html"));
    }

    if (
      !subscription.hasOwnProperty("s") ||
      subscription.s == 0 ||
      subscription.s == undefined
    ) {
      return res.sendFile(path.join(htmlPath, "internal_error.html"));
    }

    var sql1;
    const sql3 = await db.query(
      `select sprocess_id from subscriptionprocesslist where status = 1 and sprocess_id = ? and sprocess_id  = (select sprocess_id from subscriptionprocesslist where process_type IN(2,3) and
      processid = (select processid from subscriptionprocesslist where sprocess_id = ? Order by processid) Order by sprocess_id DESC LIMIT 1)`,
      [subscription.quoteid, subscription.quoteid]
    );
    if (sql3.length == 0) {
      return res.sendFile(path.join(htmlPath, "quotation_invalid.html"));
    }
    // Update the database
    if (subscription.s == 1) {
      sql1 = await db.query(
        `UPDATE subscriptionprocesslist SET Internal_approval = ?,Approved_status = ? WHERE sprocess_id = ? and internal_approval = 2`,
        [subscription.s, 2, subscription.quoteid]
      );
    } else {
      sql1 = await db.query(
        `UPDATE subscriptionprocesslist SET Internal_approval = ? WHERE sprocess_id = ? and internal_approval = 2`,
        [subscription.s, subscription.quoteid]
      );
    }

    // Send the correct HTML file
    if (sql1.affectedRows) {
      if (subscription.s == 1) {
        const sql = await db.query(
          `SELECT q.emailid, q.ccemail, q.clientname, q.phoneno, q.feedback,q.message_type, q.pdf_path, a.secret FROM subquotation_mailbox q CROSS JOIN apikey a
          WHERE q.status = 1 AND q.process_id = ? AND a.status = 1;`,
          [subscription.quoteid]
        );

        // const sql = await db.query(
        //   `select emailid,ccemail,clientname,phoneno,feedback,message_type,pdf_path from quotation_mailbox where status = 1 and process_id = ${subscription.quoteid} LIMIT 1 `
        // );

        if (sql[0]) {
          const promises = [];
          const phoneNumbers = sql[0].phoneno
            ? sql[0].phoneno
                .split(",")
                .map((num) => num.trim())
                .filter((num) => num !== "") // Removes empty values
            : [];
          const link = `http://192.168.0.200:8081?eventid=${subscription.quoteid}&STOKEN=${sql[0].secret}&module=subscription`;
          const feedbackMessage =
            "If you want to proceed with the quotation, please click the following link: " +
            link;
          // Send Email or WhatsApp Message
          if (sql[0].message_type === 1) {
            // Send only email
            EmailSent = await mailer.sendQuotation(
              sql[0].clientname,
              sql[0].emailid,
              "Your Quotation from Sporada Secure India Private Limited",
              "quotationpdf.html",
              ``,
              "QUOTATION_PDF_SEND",
              sql[0].pdf_path,
              sql[0].feedback,
              sql[0].ccemail,
              `http://192.168.0.200:8081?eventid=${subscription.quoteid}&STOKEN=${sql[0].secret}&module=subscription`,
              `http://192.168.0.200:8081?eventid=${subscription.quoteid}&STOKEN=${sql[0].secret}&module=subscription`
            );
          } else if (sql[0].message_type === 2) {
            // Send only WhatsApp
            WhatsappSent = await Promise.all(
              phoneNumbers.map(async (number) => {
                try {
                  const response = await axios.post(
                    `${config.whatsappip}/billing/sendpdf`,
                    {
                      phoneno: number,
                      feedback: feedbackMessage,
                      pdfpath: sql[0].pdf_path,
                    }
                  );
                  return response.data.code;
                } catch (error) {
                  console.error(`WhatsApp Error for ${number}:`, error.message);
                  return false;
                }
              })
            );
          } else if (sql[0].message_type === 3) {
            // Send both email & WhatsApp in parallel
            promises.push(
              mailer.sendQuotation(
                sql[0].clientname,
                sql[0].emailid,
                "Your Quotation from Sporada Secure India Private Limited",
                "quotationpdf.html",
                ``,
                "QUOTATION_PDF_SEND",
                sql[0].pdf_path,
                sql[0].feedback,
                sql[0].ccemail,
                `http://192.168.0.200:8081?eventid=${subscription.quoteid}&STOKEN=${sql[0].secret}&module=subscription`,
                `http://192.168.0.200:8081?eventid=${subscription.quoteid}&STOKEN=${sql[0].secret}&module=subscription`
              )
            );

            promises.push(
              Promise.all(
                phoneNumbers.map(async (number) => {
                  try {
                    const response = await axios.post(
                      `${config.whatsappip}/billing/sendpdf`,
                      {
                        phoneno: number,
                        feedback: feedbackMessage,
                        pdfpath: sql[0].pdf_path,
                      }
                    );
                    return response.data.code;
                  } catch (error) {
                    console.error(
                      `WhatsApp Error for ${number}:`,
                      error.message
                    );
                    return false;
                  }
                })
              ).then((results) => (WhatsappSent = results))
            );

            // Run both requests in parallel and wait for completion
            [EmailSent] = await Promise.all(promises);
          }
        }
        await mqttclient.publishMqttMessage(
          "refresh",
          "Quotation approved Internally for the process id " +
            subscription.quoteid
        );
        await mqttclient.publishMqttMessage(
          "Notification",
          "Quotation approved Internally for the process id " +
            subscription.quoteid
        );
        return res.sendFile(path.join(htmlPath, "approved.html"));
      } else {
        await mqttclient.publishMqttMessage(
          "Notification",
          "Quotation Rejected Internally for the process id " +
            subscription.quoteid
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "Quotation Rejected Internally for the process id " +
            subscription.quoteid
        );
        return res.sendFile(path.join(htmlPath, "rejected.html"));
      }
    } else {
      return res.sendFile(path.join(htmlPath, "already.html"));
    }
  } catch (er) {
    return res.sendFile(
      path.join(__dirname, "..", "htmlresponse", "internal_error.html")
    );
  }
}

//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################

async function getSubscriptionCustomer(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET SUBSCRIPTION CUSTOMER",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET SUBSCRIPTION CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET SUBSCRIPTION CUSTOMER",
        secret
      );
    }
    const sql = await db.query1(
      `select customer_id , customer_name from customermaster where status =1 and site_type = 0`
    );
    var data;
    if (sql.length >= 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription customer Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription customer Fetched Successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################

async function getGlobalSubscription(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET GLOBAL SUBSCRIPTION CUSTOMER",
        ""
      );
    }
    var secret = subscription.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET GLOBAL SUBSCRIPTION CUSTOMER",
        secret
      );
    }
    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET GLOBAL SUBSCRIPTION CUSTOMER",
        secret
      );
    }
    const sql = await db.query1(
      `SELECT 
      sm.Subscription_id, 
      sm.Subscription_name,
      sm.No_of_devices, 
      sm.No_of_cameras, 
      sm.Addl_cameras, 
      sm.Amount, 
      sm.product_desc, 
      CASE
        WHEN COUNT(bm.branch_id) = 0 THEN '[]'
        ELSE JSON_ARRAYAGG(
            JSON_OBJECT(
                'siteid', bm.branch_id,
                'sitename', bm.Branch_name
            )
        )
      END AS sitedetails
  FROM 
      subscriptionmaster sm
  LEFT JOIN 
      subscriptioncustomertrans sct ON sct.Subscription_id = sm.Subscription_id
  LEFT JOIN 
      branchmaster bm ON bm.branch_id = sct.branch_id
  WHERE 
      sm.subscription_type = 1 and sm.status =1 and sm.deleted_flag = 0
  GROUP BY 
      sm.Subscription_id;
  `
    );
    var data;
    if (sql.length >= 0) {
      sql.forEach((row) => {
        row.sitedetails = JSON.parse(row.sitedetails);
      });
    }
    return helper.getSuccessResponse(
      true,
      "success",
      "Global subscription customer Fetched Successfully",
      sql,
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getClientDetails(subscription) {
  try {
    var secret;
    // Check if the session token exists
    if (!subscription.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        ""
      );
    }
    secret = subscription.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("processid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the process id.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (!querydata.hasOwnProperty("clientname")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client name missing. Please provide the Client name.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("clientaddress_name") ||
      querydata.clientaddressname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client address name missing. Please provide the Client address name missing",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("clientaddress") ||
      querydata.clientaddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Client address missing. Please provide the Client address",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("billingaddress_name") ||
      querydata.billingaddressname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Billing address name missing. Please provide the Billing Address name",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("billingaddress") ||
      querydata.billingaddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Billing address missing. Please provide the Billing address.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }

    if (!querydata.hasOwnProperty("gst_number") || querydata.gst_number == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Gst number missing. Please provide the Gst number.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (!querydata.hasOwnProperty("cin_number")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Cin number missing. Please provide the cin number",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }

    if (!querydata.hasOwnProperty("pan_number") || querydata.pan_number == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Pan number missing. Please provide the pan number.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("contactpersonname") ||
      querydata.contactpersonname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact person name missing. Please provide the contact person name.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("invoicegenid") ||
      querydata.invoicegenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invoice Generated id missing. Please provide the invoice generated id.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (!querydata.hasOwnProperty("date") || querydata.date == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Invoice date missing. Please provide the invoice date.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("messagetype") ||
      querydata.messagetype == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Message type missing. Please provide the message type.",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    if (!querydata.hasOwnProperty("gstnumber")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Gst Number missing. Please provide the gst Number",
        "GET THE CLIENT DETAILS FROM THE CUSTOMER",
        secret
      );
    }
    const siteIdsJson = JSON.stringify(querydata.siteids || []);
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_CUSTOM_ADD_RECURRING_INVOICE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@sprocessid); select @sprocessid;`,
      [
        querydata.subscriptionbillid,
        siteIdsJson,
        querydata.clientaddressname,
        querydata.clientaddress,
        querydata.billingaddressname,
        querydata.billingaddress,
        req.file.path,
        querydata.invoicegenid,
        querydata.totalamount,
        userid,
        querydata.emailid,
        querydata.phoneno,
        querydata.ccemail,
        querydata.gstnumber,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const invoiceid = objectvalue2["@sprocessid"];
    var Quoteid;

    if (querydata.messagetype == 1 || querydata.messagetype == 3) {
      EmailSent = await mailer.sendInvoice(
        querydata.clientaddressname,
        querydata.emailid,
        "Your invoice from Sporada Secure India Private Limited",
        "invoicepdf.html",
        ``,
        "INVOICE_PDF_SEND",
        req.file.path,
        querydata.invoicegenid,
        querydata.date,
        querydata.totalamount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype == 2 || querydata.messagetype == 3) {
      WhatsappSent = await axios.post(`${config.whatsappip}/billing/sendpdf`, {
        phoneno: querydata.phoneno,
        feedback: querydata.feedback,
        pdfpath: req.file.path,
      });
      if (WhatsappSent.data.code == true) {
        WhatsappSent = WhatsappSent.data.code;
      } else {
        WhatsappSent = WhatsappSent.data.code;
      }
    }
    const promises = [];
    const phoneNumbers = querydata.phoneno
      ? querydata.phoneno
          .split(",")
          .map((num) => num.trim())
          .filter((num) => num !== "") // Removes empty values
      : [];
    // Send Email or WhatsApp Message
    if (querydata.messagetype === 1) {
      // Send only email
      EmailSent = await mailer.sendInvoice(
        querydata.clientaddressname,
        querydata.emailid,
        "Your invoice from Sporada Secure India Private Limited",
        "invoicepdf.html",
        ``,
        "INVOICE_PDF_SEND",
        req.file.path,
        querydata.invoicegenid,
        querydata.date,
        querydata.totalamount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype === 2) {
      WhatsappSent = await Promise.all(
        phoneNumbers.map(async (number) => {
          try {
            const response = await axios.post(
              `${config.whatsappip}/billing/sendpdf`,
              {
                phoneno: number,
                feedback: querydata.feedback,
                pdfpath: req.file.path,
              }
            );
            return response.data.code;
          } catch (error) {
            console.error(`WhatsApp Error for ${number}:`, error.message);
            return false;
          }
        })
      );
    } else if (querydata.messagetype === 3) {
      // Send both email & WhatsApp in parallel
      promises.push(
        mailer.sendInvoice(
          querydata.clientaddressname,
          querydata.emailid,
          "Your invoice from Sporada Secure India Private Limited",
          "invoicepdf.html",
          ``,
          "INVOICE_PDF_SEND",
          req.file.path,
          querydata.invoicegenid,
          querydata.date,
          querydata.totalamount,
          querydata.ccemail,
          querydata.feedback
        )
      );

      promises.push(
        Promise.all(
          phoneNumbers.map(async (number) => {
            try {
              const response = await axios.post(
                `${config.whatsappip}/billing/sendpdf`,
                {
                  phoneno: number,
                  feedback: querydata.feedback,
                  pdfpath: req.file.path,
                }
              );
              return response.data.code;
            } catch (error) {
              console.error(`WhatsApp Error for ${number}:`, error.message);
              return false;
            }
          })
        ).then((results) => (WhatsappSent = results))
      );

      // Run both requests in parallel and wait for completion
      [EmailSent] = await Promise.all(promises);

      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription Invoice added Successfully",
        { EmailSent: EmailSent, WhatsappSent: WhatsappSent },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

// async function UploadSubscription(subscription) {
//   try {
//     var secret;
//     // Check if the session token exists
//     if (!subscription.STOKEN) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token missing. Please provide the Login session token",
//         "UPLOAD THE SUBSCRIPTION DETAILS",
//         ""
//       );
//     }
//     secret = subscription.STOKEN.substring(0, 16);
//     var querydata;

//     // Validate session token length
//     if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token size invalid. Please provide the valid Session token",
//         "UPLOAD THE SUBSCRIPTION DETAILS",
//         secret
//       );
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
//       [subscription.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "UPLOAD THE SUBSCRIPTION DETAILS",
//         secret
//       );
//     }

//     // Check if querystring is provided
//     if (!subscription.querystring) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring missing. Please provide the querystring",
//         "UPLOAD THE SUBSCRIPTION DETAILS",
//         secret
//       );
//     }

//     // Decrypt querystring
//     try {
//       querydata = await helper.decrypt(subscription.querystring, secret);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring Invalid error. Please provide the valid querystring.",
//         "UPLOAD THE SUBSCRIPTION DETAILS",
//         secret
//       );
//     }

//     // Parse the decrypted querystring
//     try {
//       querydata = JSON.parse(querydata);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring JSON error. Please provide valid JSON",
//         "UPLOAD THE SUBSCRIPTION DETAILS",
//         secret
//       );
//     }
//     if (!Array.isArray(querydata)) {
//       querydata = [querydata];
//     }
//     const requiredFields = [
//       { field: "organizationname", message: "Organization missing." },
//       { field: "companyname", message: "Company name missing." },
//       { field: "billtype", message: "Bill Type missing." },
//       {
//         field: "sitename",
//         message: "Site name missing.",
//       },
//       { field: "subscriptionplan", message: "Subscription plan missing" },
//       { field: "subscriptionamount", message: "Subscription amount missing." },
//       { field: "billmode", message: "Billing mode missing" },
//       { field: "contactpersonname", message: "Contact person name missing" },
//       {
//         field: "emailid",
//         message: "Emailid missing.",
//       },
//       { field: "branchcode", message: "Branch code missing." },
//       { field: "customertype", message: "Customer type missing." },
//       { field: "plantype", message: "Plan Type missing." },
//       { field: "phoneno", message: "Phone number missing." },
//       { field: "hsncode", message: "Hsn Code missing." },
//       { field: "relationshipid", message: "Relationship id missing." },
//       { field: "clientaddress", message: "Client address misssing." },
//       { field: "billingaddress", message: "Billing address missing." },
//       { field: "billinggst", message: "Billing GST number missing." },
//       { field: "cameraquantity", message: "Camera quantity missing." },
//       {
//         field: "emergencycontactname1",
//         message: "Emergency contact person name one missing.",
//       },
//       {
//         field: "emergencycontactnumber1",
//         message: "Emergency contact number one missing.",
//       },
//       {
//         field: "emergencycontactname2",
//         message: "Emergency contact person name two missing.",
//       },
//       {
//         field: "emergencycontactnumber2",
//         message: "Emergency contact number two missing.",
//       },
//     ];
//     const results = [];
//     for (const [index, item] of querydata.entries()) {
//       for (const { field, message } of requiredFields) {
//         if (!querydata.hasOwnProperty(field)) {
//           results.push(
//             helper.getErrorResponse(
//               false,
//               "error",
//               message,
//               "UPLOAD THE SUBSCRIPTION DETAILS",
//               secret
//             )
//           );
//         }
//       }

//       if (results.length == 0) {
//         const sql1 = await db.query1(
//           `select customer_id,branch_id from branchmaster where branch_name = '${querydata.sitename}'`
//         );
//         const sql2 = await db.query1(
//           `select subscription_id from subscriptionmaster where Subscription_name = '${querydata.subscriptionname}'`
//         );
//         if (sql1.length > 0 && sql2.length > 0) {
//           const branchid = sql1[0].branch_id;
//           const customerid = sql1[0].customer_id;
//           const subscriptionid = sql1[0].subscription_id;
//           const sql = await db.query1(
//             `insert into subscriptioncustomertrans(Subscription_ID,Customer_ID,Relationship_id,branch_id,No_of_Analytics,billingperiod,billing_plan,Bill_mode
//         ,bill_type,Amount,hsncode,customer_address,billing_address,billing_gst,branchcode,customer_type,emailid,Phoneno,Contactperson_name) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
//             [
//               subscriptionid,
//               customerid,
//               querydata.relationshipid,
//               branchid,
//               querydata.cameraquantity,
//               1,
//               querydata.billtype,
//               querydata.billmode,
//               querydata.plantype,querydata.subscriptionamount,querydata.hsncode,querydata.clientaddress,querydata.billingaddress,querydata.billinggst,
//               querydata.branchcode,querydata.customertype,querydata.emailid,querydata.phoneno,querydata.contactpersonname
//             ]
//           );
//           if(sql.affectedRows > 0 ){
//             results.push(helper.getSuccessResponse(true, "success", `Subscription customer transaction inserted successfully for ${querydata.sitename}`, branchid,secret));
//           }else{
//             results.push(helper.getErrorResponse(false,"error",`Failed to Update subscription for ${querydata.sitename}`,branchid,secret));
//           }
//         }
//       }
//     }
//     return results;
//   } catch (er) {
//     return helper.getErrorResponse(
//       false,
//       "error",
//       "Internal error. Please contact Administration",
//       er.message,
//       secret
//     );
//   }
// }

async function UploadSubscription(subscription) {
  let secret = "";
  try {
    // Validate session token
    if (!subscription.STOKEN) {
      return [
        helper.getErrorResponse(
          false,
          "error",
          "Login session token missing. Please provide the Login session token",
          "UPLOAD THE SUBSCRIPTION DETAILS",
          ""
        ),
      ];
    }

    secret = subscription.STOKEN.substring(0, 16);
    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return [
        helper.getErrorResponse(
          false,
          "error",
          "Login session token size invalid. Please provide the valid Session token",
          "UPLOAD THE SUBSCRIPTION DETAILS",
          secret
        ),
      ];
    }

    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [subscription.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return [
        helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken Invalid. Please provide the valid sessiontoken",
          "UPLOAD THE SUBSCRIPTION DETAILS",
          secret
        ),
      ];
    }

    if (!subscription.querystring) {
      return [
        helper.getErrorResponse(
          false,
          "error",
          "Querystring missing. Please provide the querystring",
          "UPLOAD THE SUBSCRIPTION DETAILS",
          secret
        ),
      ];
    }

    let querydata;
    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return [
        helper.getErrorResponse(
          false,
          "error",
          "Querystring decryption or JSON parse error. Please provide valid querystring JSON.",
          "UPLOAD THE SUBSCRIPTION DETAILS",
          secret
        ),
      ];
    }

    // Convert single object to array
    if (!Array.isArray(querydata)) querydata = [querydata];

    const requiredFields = [
      { field: "organizationid", message: "Organization id missing." },
      { field: "companyid", message: "Company id missing." },
      { field: "billtype", message: "Bill Type missing." },
      { field: "siteid", message: "Site id missing." },
      { field: "subscriptionid", message: "Subscription id missing" },
      { field: "subscriptionamount", message: "Subscription amount missing." },
      { field: "billmode", message: "Billing mode missing" },
      { field: "contactpersonname", message: "Contact person name missing" },
      { field: "emailid", message: "Emailid missing." },
      { field: "ccmail", message: "CC Emailid missing." },
      { field: "branchcode", message: "Branch code missing." },
      { field: "customertype", message: "Customer type missing." },
      { field: "plantype", message: "Plan Type missing." },
      { field: "phoneno", message: "Phone number missing." },
      { field: "hsncode", message: "Hsn Code missing." },
      { field: "relationshipid", message: "Relationship id missing." },
      { field: "clientaddressname", message: "Client address name misssing." },
      { field: "billingaddressname", message: "Billing address name missing." },
      { field: "clientaddress", message: "Client address misssing." },
      { field: "billingaddress", message: "Billing address missing." },
      { field: "billinggst", message: "Billing GST number missing." },
      { field: "cameraquantity", message: "Camera quantity missing." },
      {
        field: "emergencycontactname1",
        message: "Emergency contact person name one missing.",
      },
      {
        field: "emergencycontactnumber1",
        message: "Emergency contact number one missing.",
      },
      {
        field: "emergencycontactname2",
        message: "Emergency contact person name two missing.",
      },
      {
        field: "emergencycontactnumber2",
        message: "Emergency contact number two missing.",
      },
      {
        field: "consolidate_email",
        message: "Consolidate email missing.",
      },
      {
        field: "pendingpayments",
        message: "Pending Payments missing",
      },
      {
        field: "amountpaid",
        message: "Amount paid missing",
      },
      {
        field: "showpending",
        message: "show pending missing",
      },
      {
        field: "tdsdeductions",
        message: "TDS Detection missing",
      },
    ];

    const results = [];

    for (const item of querydata) {
      let hasError = false;
      for (const { field, message } of requiredFields) {
        if (!item.hasOwnProperty(field) || item[field] === "") {
          results.push({
            code: false,
            status: "error",
            message: message,
            error: "UPLOAD THE SUBSCRIPTION DETAILS",
          });
          hasError = true;
          break;
        }
      }

      if (hasError) continue;

      try {
        const [result] = await db.spcall1(
          `CALL SP_SUBSCRIPTION_UPSERT(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@subscription_trans_id); SELECT @subscription_trans_id`,
          [
            item.subscriptionid,
            item.companyid,
            item.relationshipid,
            item.siteid,
            item.cameraquantity,
            1,
            1,
            item.plantype,
            item.billmode,
            item.billtype,
            item.subscriptionamount,
            item.hsncode,
            item.clientaddress,
            item.billingaddress,
            item.billinggst,
            item.branchcode,
            item.customertype,
            item.emailid,
            item.phoneno,
            item.contactpersonname,
            item.consolidate_email,
            item.ccmail,
            item.clientaddressname,
            item.billingaddressname,
            item.pendingpayments,
            item.amountpaid,
            item.showpending,
            item.tdsdeductions,
          ]
        );

        const objectvalue = result[1][0];
        const usubscriptionid = objectvalue["@subscription_trans_id"];
        if (usubscriptionid != 0) {
          results.push({
            code: true,
            status: "success",
            message: `Subscription uploaded successfully for ${item.siteid}`,
            subscriptionid: usubscriptionid,
          });
        } else {
          results.push({
            code: false,
            status: "error",
            message: `Insert failed for ${item.siteid}`,
            error: "UPLOAD THE SUBSCRIPTION DETAILS",
          });
        }
      } catch (e) {
        results.push({
          code: false,
          status: "error",
          message: `DB error for ${item.siteid}`,
          error: e.message,
        });
      }
    }

    return await helper.getSuccessResponse(
      true,
      "success",
      "Uploaded Successfully",
      results,
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}

module.exports = {
  addRecurringInvoice,
  GetRecurredInvoice,
  GetProcessList,
  addFeedback,
  GetProcessCustomer,
  GetRecurredCustomer,
  getBinaryFile,
  DeleteProcess,
  ArchiveProcess,
  clientProfile,
  approvedQuotation,
  uploadMor,
  addSubscriptionCustomerreq,
  Subscriptiondata,
  detailsPreLoader,
  AddRevisedQuotation,
  AddQuotation,
  addCustomInvoice,
  GetCustomPDF,
  IntQuotationApproval,
  getSubscriptionCustomer,
  getGlobalSubscription,
  getClientDetails,
  UploadSubscription,
  getCustomBinaryfile,
  getRecurredBinaryfile,
};
