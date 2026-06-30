const db = require("../db");
const helper = require("../helper");
const multer = require("multer");
const path = require("path");
// const fs = require("fs-extra");
const config = require("../config");
const uploadFile = require("../middleware");
const fs = require("fs");
const mailer = require("../mailer");
const axios = require("axios");
const mqttclient = require("../mqttclient");
const apiserver = config.apiserver;
const apiserver1 = config.apiserver1;

// const db = new database();
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #########################################################################################################
// {
//   "vendorname":"JK constructiond",
//   "vendormailid":"jk@gmail.com",
//   "vendorphoneno":"8393923242",
//   "vendoraddress":"chinnverampatti,udumallai",
//   "vendorgst":"33ABCD43wsd123"
//   }
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Vendor Added Successfully","Value":13}
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

// async function addsale(req, res) {
//   try {
//     try {
//       await uploadFile.uploadCustomerrequ(req, res);

//       if (!req.file) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Please upload a file!",
//           "ADD SALES"
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
//     let sales = req.body;
//     if (!sales.hasOwnProperty("STOKEN")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token missing. Please provide the Login session token",
//         "ADD SALES",
//         ""
//       );
//     }
//     var secret = sales.STOKEN.substring(0, 16);
//     var querydata;
//     // Validate session token length
//     if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token size invalid. Please provide the valid Session token",
//         "ADD SALES",
//         secret
//       );
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT   @result;",
//       [sales.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "ADD SALES",
//         secret
//       );
//     }

//     // Check if querystring is provided
//     if (!sales.hasOwnProperty("querystring")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring missing. Please provide the querystring",
//         "ADD SALES",
//         secret
//       );
//     }

//     // Decrypt querystring
//     try {
//       querydata = await helper.decrypt(sales.querystring, secret);
//     } catch (ex) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Querystring Invalid error. Please provide the valid querystring.",
//         ex.message,
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
//         "ADD SALES",
//         secret
//       );
//     }

//     // Validate required fields
//     if (!querydata.hasOwnProperty("name") || querydata.name == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Client name missing. Please provide the Client name",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Phone number missing. Please provide the Phone number missing",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Email id missing. Please provide the Email id",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("address") || querydata.address == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Client address missing. Please provide the Client address",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("gst") || querydata.gst == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Client GST Number missing. Please provide the Client GST number",
//         "ADD SALES",
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
//         "ADD SALES",
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
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("modeofrequest") ||
//       querydata.modeofrequest == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Mode of Request missing. Please provide the Mode of request.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("MORreference") ||
//       querydata.MORreference == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Mode of Request missing. Please provide the Mode of request.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("date") || querydata.date == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Date missing. Please provide the Date.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("invoiceamount") ||
//       querydata.invoiceamount == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Invoice amount missing. Please provide the Invoice amount.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("customerrequirementid") ||
//       querydata.customerrequirementid == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Customer requirement id missing. Please provide the Customer requirement id.",
//         "ADD SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("product") || querydata.product == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Product Details missing. Please provide the Product Details.",
//         "ADD PROCESS OF SALES",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Product Notes missing. Please provide the Product Notes.",
//         "ADD SALES",
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
//         "Message Type missing. Please provide the Message Type.",
//         "ADD SALES",
//         secret
//       );
//     }

//     const [sql] = await db.spcall(
//       `CALL SP_ADD_SALES(?,?,?,?,?,?,?,?,?,?,?,?,@salesid); select @salesid;`,
//       [
//         querydata.name,
//         querydata.emailid,
//         querydata.phoneno,
//         querydata.gst,
//         querydata.address,
//         querydata.billingaddressname,
//         querydata.billingaddress,
//         querydata.modeofrequest,
//         querydata.MORreference,
//         userid,
//         req.file.path,
//         1,
//       ]
//     );

//     const objectvalue1 = sql[1][0];
//     const salesid = objectvalue1["@salesid"];
//     if (salesid != null && salesid != "") {
//       const [sql] = await db.spcall(
//         `CALL SP_ADD_SALES_PROCESS(?,?,@processid); select @processid;`,
//         [salesid, userid]
//       );
//       const objectvalue1 = sql[1][0];
//       const processid = objectvalue1["@processid"];
//       if (processid != null && processid != "") {
//         const [sql1] = await db.spcall(
//           `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
//           [
//             querydata.name,
//             userid,
//             processid,
//             querydata.customerrequirementid,
//             1,
//             req.file.path,
//             querydata.address,
//             querydata.billingaddress,
//             querydata.billingaddressname,
//           ]
//         );
//         const objectvalue2 = sql1[1][0];
//         const prolistid = objectvalue2["@prolistid"];
//         if (!prolistid) {
//           return helper.getErrorResponse(
//             false,
//             "error",
//             "Error adding Customer Requirements.",
//             "ADD PROCESS OF SALES",
//             secret
//           );
//         }

//         // Insert Products in Parallel
//         const productQueries = querydata.product.map((product) => {
//           if (!product.productname || !product.productquantity) {
//             return helper.getErrorResponse(
//               false,
//               "error",
//               "Product details are incomplete.",
//               "ADD PROCESS OF SALES",
//               secret
//             );
//           }
//           return db.spcall(
//             `CALL SP_CUSTOMER_REQ_ADD(?,?,?,?,?,@productid); SELECT @productid;`,
//             [
//               product.productname,
//               product.productquantity,
//               prolistid,
//               querydata.notes,
//               filePath,
//             ]
//           );
//         });

//         await Promise.all(productQueries);

//         // Update generateecid
//         await db.query(
//           `UPDATE generateecid SET status = 0 WHERE customerreq_id = ?`,
//           [querydata.customerrequirementid]
//         );

//         var EmailSent = 0;
//         var WhatsappSent = 0;

//         if (querydata.messagetype == 1 || querydata.messagetype == 3) {
//           EmailSent = await mailer.sendInvoice(
//             querydata.name,
//             querydata.emailid,
//             "Invoice",
//             "invoicepdf.html",
//             ``,
//             "INVOICE_PDF_SEND",
//             querydata.customerrequirementid,
//             querydata.date,
//             querydata.invoiceamount
//           );
//         } else if (querydata.messagetype == 2 || querydata.messagetype == 3) {
//           WhatsappSent = await axios.post(
//             `${config.whatsappip}/billing/sendpdf`,
//             {
//               phoneno: querydata.phoneno,
//               feedback: `We hope you're doing well. Please find attached your invoice
//                   with Sporada Secure.`,
//               pdfpath: req.file.path,
//             }
//           );
//           if (WhatsappSent.data.code == true) {
//             WhatsappSent = 1;
//           } else {
//             WhatsappSent = 0;
//           }
//         }
//         const sql4 = await db.query(
//           `Insert into morupload(MOR_path,Created_by,Email_sent,Whatsapp_sent) VALUES(?,?,?,?)`,
//           [req.file.path, userid, EmailSent, WhatsappSent]
//         );
//         return helper.getSuccessResponse(
//           true,
//           "success",
//           "Sales Product Added Successfully",
//           salesid,
//           secret
//         );
//       }
//     } else {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Error adding the Cusotmer requirements",
//         "ADD PROCESS OF SALES",
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

async function addsale(req, res) {
  try {
    var secret;
    // Upload file handling
    try {
      await uploadFile.uploadCustomerrequ(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD SALES"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;

    // Validate Login Session Token
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD SALES",
        ""
      );
    }

    secret = sales.STOKEN.substring(0, 16);
    let querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD SALES",
        secret
      );
    }

    // Validate session token with stored procedure
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ADD SALES",
        secret
      );
    }

    // Validate the querystring
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD SALES",
        secret
      );
    }

    // Decrypt and parse querystring

    try {
      querydata = await helper.decrypt(sales.querystring, secret);
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
        field: "customer_type",
        message: "Customer type missing. Please provide the Customer type",
      },
      {
        field: "product",
        message: "Product Details missing. Please provide the Product Details",
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
      {
        field: "branchid",
        message: "Branch id missing. Please provide the Branch id.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "CLIENT REQUIREMENT ADD",
          secret
        );
      }
    }
    // Insert sales data into the database
    const [sql] = await db.spcall(
      `CALL SP_ADD_SALES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@salesid); select @salesid;`,
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
        querydata.customer_type,
        req.file.path,
        querydata.companyid,
        JSON.stringify(querydata.branchid),
        querydata.title,
      ]
    );

    const objectvalue1 = sql[1][0];
    const salesid = objectvalue1["@salesid"];

    if (salesid) {
      const [processSql] = await db.spcall(
        `CALL SP_ADD_SALES_PROCESS(?,?,?,@processid); select @processid;`,
        [salesid, userid, salesid]
      );
      const objectvalue2 = processSql[1][0];
      const processid = objectvalue2["@processid"];

      if (processid) {
        const [proListSql] = await db.spcall(
          `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
          [
            querydata.name,
            userid,
            processid,
            salesid,
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
          const productQueries = querydata.product.map((product) => {
            if (!product.productname || !product.productquantity) {
              return helper.getErrorResponse(
                false,
                "error",
                "Product details are incomplete.",
                "CLIENT REQUIREMENT ADD",
                secret
              );
            }
            return db.spcall(
              `CALL SP_CUSTOMER_REQ_ADD(?,?,?,?,@productid); SELECT @productid;`,
              [
                product.productname,
                product.productquantity,
                prolistid,
                querydata.notes,
              ]
            );
          });

          await Promise.all(productQueries);

          // Send Email or WhatsApp
          let EmailSent = 0;
          let WhatsappSent = 0;

          // if (querydata.messagetype == 1 || querydata.messagetype == 3) {
          //   EmailSent = await mailer.sendInvoice(
          //     querydata.name,
          //     querydata.emailid,
          //     "Invoice",
          //     "invoicepdf.html",
          //     "",
          //     "INVOICE_PDF_SEND",
          //     req.file.path,
          //     querydata.customerrequirementid,
          //     querydata.date,
          //     querydata.invoiceamount
          //   );
          // }
          // if (querydata.messagetype == 2 || querydata.messagetype == 3) {
          //   WhatsappSent = await axios.post(
          //     `${config.whatsappip}/billing/sendpdf`,
          //     {
          //       phoneno: querydata.phoneno,
          //       feedback: `We hope you're doing well. Please find your invoice with Sporada Secure attached.`,
          //       pdfpath: req.file.path,
          //     }
          //   );
          //   if (WhatsappSent.data.code == true) {
          //     WhatsappSent = WhatsappSent.data.code;
          //   } else {
          //     WhatsappSent = WhatsappSent.data.code;
          //   }
          // }

          // Log in morupload table
          await db.query(
            `INSERT INTO morupload(MOR_path, Created_by, Email_sent, Whatsapp_sent) VALUES(?,?,?,?)`,
            [req.file.path, userid, EmailSent, WhatsappSent]
          );
          await mqttclient.publishMqttMessage(
            "Notification",
            "Client Requirement Created Successfully for " + querydata.name
          );
          await mqttclient.publishMqttMessage(
            "refresh",
            "Client Requirement Created Successfully"
          );
          return helper.getSuccessResponse(
            true,
            "success",
            "Client requirement created successfully",
            {
              clientrequirementid: salesid,
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
        "CLIENT REQUIREMENT ADD",
        secret
      );
    }
  } catch (er) {
    if (er.code === "ER_DUP_ENTRY") {
      return helper.getErrorResponse(
        false,
        "error",
        "Requirement already exists",
        er.message,
        secret
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
//####################################################################### REQUEST BODY  #########################################################################################################

async function UpdateenqCustomer(req, res) {
  try {
    var secret;
    // Upload file handling
    try {
      await uploadFile.uploadCustomerrequ(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "UPDATE SALES"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        +""
      );
    }

    const sales = req.body;

    // Validate Login Session Token
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "UPDATE SALES",
        ""
      );
    }

    secret = sales.STOKEN.substring(0, 16);
    let querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE SALES",
        secret
      );
    }

    // Validate session token with stored procedure
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "UPDATE SALES",
        secret
      );
    }

    // Validate the querystring
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE SALES",
        secret
      );
    }

    // Decrypt and parse querystring

    try {
      querydata = await helper.decrypt(sales.querystring, secret);
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
        field: "customerrequirementid",
        message:
          "Customer requirement id missing. Please provide the Customer requirement id",
      },
      {
        field: "product",
        message: "Product Details missing. Please provide the Product Details",
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
      {
        field: "branchid",
        message: "Branch id missing. Please provide the Branch id.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "UPDATE SALES",
          secret
        );
      }
    }

    // Insert sales data into the database
    const [sql] = await db.spcall(
      `CALL SP_ADD_SALES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@salesid); select @salesid;`,
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
        1,
        req.file.path,
        ,
        querydata.customerid,
        querydata.branchid,
      ]
    );

    const objectvalue1 = sql[1][0];
    const salesid = objectvalue1["@salesid"];

    if (salesid) {
      const [processSql] = await db.spcall(
        `CALL SP_ADD_SALES_PROCESS(?,?,?,@processid); select @processid;`,
        [salesid, userid, querydata.customerrequirementid]
      );
      const objectvalue2 = processSql[1][0];
      const processid = objectvalue2["@processid"];

      if (processid) {
        const [proListSql] = await db.spcall(
          `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
          [
            querydata.name,
            userid,
            processid,
            querydata.customerrequirementid,
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
          const productQueries = querydata.product.map((product) => {
            if (!product.productname || !product.productquantity) {
              return helper.getErrorResponse(
                false,
                "error",
                "Product details are incomplete.",
                "UPDATE SALES",
                secret
              );
            }
            return db.spcall(
              `CALL SP_CUSTOMER_REQ_ADD(?,?,?,?,@productid); SELECT @productid;`,
              [
                product.productname,
                product.productquantity,
                prolistid,
                querydata.notes,
              ]
            );
          });

          await Promise.all(productQueries);

          // Update generateecid status
          await db.query(
            `UPDATE generateecid SET status = 0 WHERE customerreq_id = ?`,
            [querydata.customerrequirementid]
          );

          // Send Email or WhatsApp
          let EmailSent = 0;
          let WhatsappSent = 0;

          // Log in morupload table
          await db.query(
            `INSERT INTO morupload(MOR_path, Created_by, Email_sent, Whatsapp_sent) VALUES(?,?,?,?)`,
            [req.file.path, userid, EmailSent, WhatsappSent]
          );

          return helper.getSuccessResponse(
            true,
            "success",
            "Client requirement created successfully",
            {
              clientrequirementid: salesid,
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
        "UPDATE SALES",
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

// Image or pdf data
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

// async function uploadMor(req, res, next) {
//   try {
//     console.log("Before preParse.any:", req.body);

//     // Use the preParse middleware with the correct callback pattern
//     preParse.any()(req, res, (err) => {
//       if (err) {
//         return res.status(500).send({ message: `Error in preParse middleware: ${err.message}` });
//       }

//       console.log("After preParse.any:", req.body); // req.body will now be populated

//       // Proceed with the file upload using multer
//       uploadFile.uploadFileMiddleware(req, res, (err) => {
//         if (err) {
//           return res.status(500).send({ message: `Error uploading file. ${err.message}` });
//         }

//         // Validate the file
//         if (!req.file) {
//           return res.status(400).send({ message: "Please upload a file!" });
//         }

//         // Validate category
//         if (!req.body.category) {
//           return res.status(400).send({ message: "Category is required!" });
//         }

//         // File uploaded successfully
//         res.status(200).send({
//           message: `Uploaded the file successfully: ${req.file.originalname}`,
//           category: req.body.category,
//           path: req.file.path,
//         });
//       });
//     });

//   } catch (err) {
//     res.status(500).send({
//       message: `Could not upload the file. ${err.message}`,
//     });
//   }
// }

async function uploadMor(req, res) {
  var secret;
  try {
    await uploadFile.uploadFileMOR(req, res);
    var sales = req.body;
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD SALES",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
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

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #########################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addInvoice(req, res) {
  let secret, querydata, sales;
  try {
    // Upload File Handling
    try {
      await uploadFile.uploadFileInvoice(req, res);
      sales = req.body;

      // Validate STOKEN
      if (!sales.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token missing. Please provide the login session token.",
          "Upload Invoice"
        );
      }
      secret = sales.STOKEN.substring(0, 16);

      if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token size invalid. Please provide a valid session token.",
          "Upload Invoice",
          secret
        );
      }

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD INVOICE",
          secret
        );
      }
    } catch (err) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${err.message}`,
        err.message,
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const userid = result[1][0]["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid session token. Please provide a valid session token.",
        "Upload Invoice"
      );
    }

    // Validate QueryString
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring.",
        "Upload Invoice",
        secret
      );
    }

    let querydata;
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid querystring. Please provide a valid JSON querystring.",
        "Upload Invoice",
        secret
      );
    }

    // Validate Required Fields
    const requiredFields = [
      { field: "title", message: "Title missing." },
      { field: "processid", message: "Process ID missing." },
      { field: "phoneno", message: "Contact number missing." },
      { field: "emailid", message: "Email ID missing." },
      { field: "ccemail", message: "CC Email ID missing." },
      { field: "clientaddress", message: "Client address missing." },
      { field: "gst_number", message: "Client GST number missing." },
      {
        field: "billingaddressname",
        message: "Billing address name missing.",
      },
      { field: "billingaddress", message: "Billing address missing." },
      { field: "clientaddressname", message: "Client address name missing." },
      { field: "product", message: "Product details missing." },
      { field: "notes", message: "Product notes missing." },
      { field: "invoicegenid", message: "Generated Invoice ID missing." },
      { field: "date", message: "Invoice date missing." },
      { field: "invoice_amount", message: "Invoice amount missing." },
      { field: "messagetype", message: "Message type missing." },
      { field: "feedback", message: "Feedback type missing." },
      { field: "billdetails", message: "Bill Details missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD INVOICE",
          secret
        );
      }
    }
    var EmailSent;
    var WhatsappSent;
    // Insert Invoice
    const [sql1] = await db.spcall(
      `CALL SP_ADD_INVOICE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@prolistid); SELECT @prolistid;`,
      [
        querydata.clientaddressname,
        querydata.gst_number,
        userid,
        querydata.processid,
        querydata.invoicegenid,
        4,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
        querydata.emailid,
        querydata.ccemail,
        querydata.phoneno,
        querydata.invoice_amount,
        JSON.stringify(querydata.billdetails),
      ]
    );

    const invoiceid = sql1[1][0]["@prolistid"];
    if (!invoiceid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the invoice.",
        "ADD INVOICE",
        secret
      );
    }

    let Quoteid;

    // Insert Products
    for (const product of querydata.product) {
      if (
        !product.productname ||
        !product.productquantity ||
        !product.productgst ||
        !product.productprice ||
        !product.producthsn ||
        !product.productsno ||
        !product.producttotal
      ) {
        return helper.getErrorResponse(
          false,
          "error",
          "Incomplete product details. Provide productname, productquantity, producthsn, productgst, and productprice.",
          "ADD INVOICE",
          secret
        );
      } else {
        const [sql2] = await db.spcall(
          `CALL SP_INVOICE_ADD(?,?,?,?,?,?,?,?,?,?,?,@invid); SELECT @invid;`,
          [
            product.productname,
            product.productquantity,
            product.productgst,
            product.productprice,
            product.producthsn,
            querydata.invoicegenid,
            JSON.stringify(querydata.notes),
            req.file.path,
            invoiceid,
            product.productsno,
            product.producttotal,
          ]
        );

        Quoteid = sql2[1][0]["@invid"];
      }
    }
    // Update Invoice Status
    await db.query(
      `UPDATE generateinvoiceid SET status = 0 WHERE invoice_id in(?)`,
      [querydata.invoicegenid]
    );
    try {
      let billDetails;
      if (typeof querydata.billdetails === "string") {
        billDetails = JSON.parse(querydata.billdetails);
      } else {
        billDetails = querydata.billdetails;
      }
      const { gst, subtotal, total, tdsamount } = billDetails;
      const { CGST, IGST, SGST } = gst;
      const sq1 = await db.query(
        `select customer_id from salesprocessmaster where cprocess_id = ?`,
        [querydata.processid]
      );
      if (sq1.length > 0) {
        const customerid = sq1[0].customer_id;
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
            querydata.gst_number,
            total,
            subtotal,
            IGST,
            CGST,
            SGST,
            "sales",
            `SA-${customerid}`,
            `Sales Invoice created for ${querydata.clientaddressname}`,
            null,
          ]
        );
        const objectvalue = sql2[1][0];
        const voucherid = objectvalue["@voucher_id"];
        const vouchernumber = objectvalue["@voucher_number"];
        var paymentdetails = [];
        const [sql5] = await db.spcall(
          `CALL upsert_gstledger(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          [
            voucherid,
            vouchernumber,
            querydata.clientaddressname,
            IGST,
            CGST,
            SGST,
            total,
            subtotal,
            querydata.gst_number,
            "output",
            `Sales Invoice created for ${querydata.clientaddressname}`,
            JSON.stringify(paymentdetails),
            JSON.stringify({
              gst: { IGST: IGST, SGST: SGST, CGST: CGST },
              tds: tdsamount || 0,
              total: total || 0,
              subtotal: subtotal || 0,
            }),
            querydata.invoicegenid,
          ]
        );
        const [sql3] = await db.spcall(
          `CALL SP_DEBIT_CLIENT_LEDGER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ledgerid); select @ledgerid`,
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
            "sales",
            voucherid,
            vouchernumber,
            "receivable",
            `Sales Invoice created for ${querydata.clientaddressname}`,
            0,
          ]
        );
      }
    } catch (er) {
      console.log(`Invoice number not exits ${er.message}`);
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
        querydata.invoice_amount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
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
          querydata.invoice_amount,
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
    // Insert MOR Upload Entry
    // await db.query(
    //   `INSERT INTO morupload (MOR_path, Created_by, Email_sent) VALUES (?, ?, ?)`,
    //   [req.file.path, userid, WhatsappSent]
    // );
    await mqttclient.publishMqttMessage(
      "Notification",
      "Invoice sent Successfully for " + querydata.clientaddressname
    );
    await mqttclient.publishMqttMessage(
      "refresh",
      "Invoice sent Successfully for " + querydata.clientaddressname
    );
    return helper.getSuccessResponse(
      true,
      "success",
      "Invoice added successfully",
      {
        invoiceid: Quoteid,
        EmailSent: EmailSent,
        WhatsappSent: WhatsappSent,
        filepath: req.file.path,
      },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      `Could not add the invoice. ${er.message}`,
      er.message,
      secret
    );
  }
}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #########################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  ########################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addProformaInvoice(req, res) {
  let secret, querydata, sales;
  try {
    // Upload File Handling
    try {
      await uploadFile.uploadFileProformaInvoice(req, res);
      sales = req.body;

      // Validate STOKEN
      if (!sales.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token missing. Please provide the login session token.",
          "Upload Invoice"
        );
      }
      secret = sales.STOKEN.substring(0, 16);

      if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token size invalid. Please provide a valid session token.",
          "Upload Invoice",
          secret
        );
      }

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD INVOICE",
          secret
        );
      }
    } catch (err) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${err.message}`,
        err.message,
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const userid = result[1][0]["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid session token. Please provide a valid session token.",
        "Upload Invoice"
      );
    }

    // Validate QueryString
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring.",
        "Upload Invoice",
        secret
      );
    }

    let querydata;
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid querystring. Please provide a valid JSON querystring.",
        "Upload Invoice",
        secret
      );
    }

    // Validate Required Fields
    const requiredFields = [
      { field: "title", message: "Title missing." },
      { field: "processid", message: "Process ID missing." },
      { field: "phoneno", message: "Contact number missing." },
      { field: "emailid", message: "Email ID missing." },
      { field: "ccemail", message: "CC Email ID missing." },
      { field: "clientaddress", message: "Client address missing." },
      { field: "gst_number", message: "Client GST number missing." },
      {
        field: "billingaddressname",
        message: "Billing address name missing.",
      },
      { field: "billingaddress", message: "Billing address missing." },
      { field: "clientaddressname", message: "Client address name missing." },
      { field: "product", message: "Product details missing." },
      { field: "notes", message: "Product notes missing." },
      { field: "invoicegenid", message: "Generated Invoice ID missing." },
      { field: "date", message: "Invoice date missing." },
      { field: "invoice_amount", message: "Invoice amount missing." },
      { field: "messagetype", message: "Message type missing." },
      { field: "feedback", message: "Feedback type missing." },
      { field: "billdetails", message: "Bill Details missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD INVOICE",
          secret
        );
      }
    }
    var EmailSent;
    var WhatsappSent;
    // Insert Invoice
    const [sql1] = await db.spcall(
      `CALL SP_ADD_INVOICE(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@prolistid); SELECT @prolistid;`,
      [
        querydata.clientaddressname,
        querydata.gst_number,
        userid,
        querydata.processid,
        querydata.invoicegenid,
        10,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
        querydata.emailid,
        querydata.ccemail,
        querydata.phoneno,
        querydata.invoice_amount,
        JSON.stringify(querydata.billdetails),
      ]
    );

    const invoiceid = sql1[1][0]["@prolistid"];
    if (!invoiceid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the invoice.",
        "ADD INVOICE",
        secret
      );
    }

    let Quoteid;

    // Insert Products
    for (const product of querydata.product) {
      if (
        !product.productname ||
        !product.productquantity ||
        !product.productgst ||
        !product.productprice ||
        !product.producthsn ||
        !product.productsno ||
        !product.producttotal
      ) {
        return helper.getErrorResponse(
          false,
          "error",
          "Incomplete product details. Provide productname, productquantity, producthsn, productgst, and productprice.",
          "ADD INVOICE",
          secret
        );
      } else {
        const [sql2] = await db.spcall(
          `CALL SP_INVOICE_ADD(?,?,?,?,?,?,?,?,?,?,?,@invid); SELECT @invid;`,
          [
            product.productname,
            product.productquantity,
            product.productgst,
            product.productprice,
            product.producthsn,
            querydata.invoicegenid,
            JSON.stringify(querydata.notes),
            req.file.path,
            invoiceid,
            product.productsno,
            product.producttotal,
          ]
        );

        Quoteid = sql2[1][0]["@invid"];
      }
    }
    // Update Invoice Status
    await db.query(
      `UPDATE generateproformainvoiceid SET status = 0 WHERE pinvoice_id in(?)`,
      [querydata.invoicegenid]
    );
    try {
      let billDetails;
      if (typeof querydata.billdetails === "string") {
        billDetails = JSON.parse(querydata.billdetails);
      } else {
        billDetails = querydata.billdetails;
      }
      const { gst, subtotal, total, tdsamount } = billDetails;
      const { CGST, IGST, SGST } = gst;
      const sq1 = await db.query(
        `select customer_id from salesprocessmaster where cprocess_id = ?`,
        [querydata.processid]
      );
      if (sq1.length > 0) {
        const customerid = sq1[0].customer_id;
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
            querydata.gst_number,
            total,
            subtotal,
            IGST,
            CGST,
            SGST,
            "sales",
            `SA-${customerid}`,
            `Sales Invoice created for ${querydata.clientaddressname}`,
            null,
          ]
        );
        const objectvalue = sql2[1][0];
        const voucherid = objectvalue["@voucher_id"];
        const vouchernumber = objectvalue["@voucher_number"];
        var paymentdetails = [];
      }
    } catch (er) {
      console.log(`Invoice number not exits ${er.message}`);
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
        querydata.invoice_amount,
        querydata.ccemail,
        querydata.feedback
      );
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
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
          querydata.invoice_amount,
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
    // Insert MOR Upload Entry
    // await db.query(
    //   `INSERT INTO morupload (MOR_path, Created_by, Email_sent) VALUES (?, ?, ?)`,
    //   [req.file.path, userid, WhatsappSent]
    // );
    await mqttclient.publishMqttMessage(
      "Notification",
      "Proforma invoice sent Successfully for " + querydata.clientaddressname
    );
    await mqttclient.publishMqttMessage(
      "refresh",
      "Proforma invoice sent Successfully for " + querydata.clientaddressname
    );
    return helper.getSuccessResponse(
      true,
      "success",
      "Proforma invoice added successfully",
      {
        invoiceid: Quoteid,
        EmailSent: EmailSent,
        WhatsappSent: WhatsappSent,
        filepath: req.file.path,
      },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      `Could not add the proforma invoice. ${er.message}`,
      er.message,
      secret
    );
  }
}

//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//####################################################################### REQUEST BODY  ########################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  #######################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function addCustomInvoice(req, res) {
  let secret;
  try {
    // Upload File Handling
    try {
      await uploadFile.uploadFileInvoice(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD CUSTOM INVOICE"
        );
      }
    } catch (err) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${err.message}`,
        err.message
      );
    }

    const sales = req.body;

    // Validate STOKEN
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the login session token.",
        "Upload Custom Invoice"
      );
    }
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide a valid session token.",
        "Upload Custom Invoice"
      );
    }

    secret = sales.STOKEN.substring(0, 16);

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const userid = result[1][0]["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid session token. Please provide a valid session token.",
        "Upload Custom Invoice"
      );
    }

    // Validate QueryString
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring.",
        "Upload Custom Invoice",
        secret
      );
    }

    let querydata;
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid querystring. Please provide a valid JSON querystring.",
        "Upload Custom Invoice",
        secret
      );
    }

    // Validate Required Fields
    const requiredFields = [
      { field: "phoneno", message: "Contact number missing." },
      { field: "emailid", message: "Email ID missing." },
      { field: "ccemail", message: "CC Email ID missing." },
      { field: "clientaddress", message: "Client address missing." },
      { field: "gst_number", message: "Client GST number missing." },
      {
        field: "billingaddressname",
        message: "Billing address name missing.",
      },
      { field: "billingaddress", message: "Billing address missing." },
      { field: "clientaddressname", message: "Client address name missing." },
      { field: "invoicegenid", message: "Generated Invoice ID missing." },
      { field: "date", message: "Invoice date missing." },
      { field: "invoice_amount", message: "Invoice amount missing." },
      { field: "messagetype", message: "Message type missing." },
      { field: "feedback", message: "Feedback type missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD CUSTOM INVOICE",
          secret
        );
      }
    }
    var EmailSent;
    var WhatsappSent;
    // Insert Invoice
    const [sql1] = await db.spcall(
      `CALL SP_ADD_CUSTOM_PDF(?,?,?,?,?,?,?,?,?,?,?,?,?,@customid); SELECT @customid;`,
      [
        querydata.clientaddressname,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.emailid,
        querydata.phoneno,
        querydata.gst_number,
        querydata.date,
        2,
        querydata.invoicegenid,
        querydata.feedback,
        req.file.path,
        userid,
      ]
    );

    const invoiceid = sql1[1][0]["@customid"];
    if (!invoiceid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the custom invoice.",
        "ADD CUSTOM INVOICE",
        secret
      );
    }

    let Quoteid;

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
        querydata.invoice_amount,
        querydata.ccemail
      );
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
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
          querydata.invoice_amount,
          querydata.ccemail
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
      "Notification",
      "Custom Invoice sent Successfully for " + querydata.clientaddressname
    );
    await mqttclient.publishMqttMessage(
      "refresh",
      "Custom Invoice sent Successfully for " + querydata.clientaddressname
    );
    return helper.getSuccessResponse(
      true,
      "success",
      "Custom Invoice added successfully",
      {
        invoiceid: Quoteid,
        EmailSent: EmailSent,
        WhatsappSent: WhatsappSent,
        filepath: req.file.path,
      },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      `Could not add the custom invoice. ${er.message}`,
      er.message,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//##############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #######################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  ######################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function uploadCustomerReq(req, res) {
  try {
    await uploadFile.uploadCustomerrequ(req, res);

    if (!req.file) {
      return res.status(400).send({
        code: false,
        status: "error",
        message: "Please upload a file!",
      });
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    res.status(200).send({
      code: true,
      status: "success",
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      data: req.file.path,
    });
  } catch (err) {
    res.status(500).send({
      code: false,
      status: "error",
      message: `Could not upload the file. ${err.message}`,
      error: err.message,
    });
  }
}

//############################################################################################################################################################################################
//#############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #######################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  ######################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function uploadQuotatation(req, res) {
  try {
    await uploadFile.uploadQuotationp(req, res);

    if (!req.file) {
      return res.status(400).send({
        code: false,
        status: "error",
        message: "Please upload a file!",
      });
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    res.status(200).send({
      code: true,
      status: "success",
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      data: req.file.path,
    });
  } catch (err) {
    res.status(500).send({
      code: false,
      status: "error",
      message: `Could not upload the file. ${err.message}`,
      error: err.message,
    });
  }
}

//#############################################################################################################################################################################################
//##############################################################################################################################################################################################
//####################################################################### REQUEST BODY  #######################################################################################################
// Image or pdf data for uploading the invoice
//####################################################################### RESPONSE BODY  #######################################################################################################
// {"code":true,"message":"Image Upload Successfully","Value":13}
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function uploadDeliveryChallan(req, res) {
  try {
    await uploadFile.uploadDeliverychln(req, res);

    // Validate the file
    if (!req.file) {
      return res.status(400).send({
        code: false,
        status: "error",
        message: "Please upload a file!",
      });
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    res.status(200).send({
      code: true,
      status: "success",
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      data: req.file.path,
    });
  } catch (err) {
    res.status(500).send({
      code: false,
      status: "error",
      message: `Could not upload the file. ${err.message}`,
      error: err.message,
    });
  }
}
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function uploadRFQ(req, res) {
  try {
    await uploadFile.uploadRFQuotation(req, res);

    // Validate the file
    if (!req.file) {
      return res.status(400).send({
        code: false,
        status: "error",
        message: "Please upload a file!",
      });
    }
    const sql = await db.query(`insert into morupload(MOR_path) VALUES(?)`, [
      req.file.path,
    ]);
    res.status(200).send({
      code: true,
      status: "success",
      message: `Uploaded the file successfully: ${req.file.originalname}`,
      data: req.file.path,
    });
  } catch (err) {
    res.status(500).send({
      code: false,
      status: "error",
      message: `Could not upload the file. ${err.message}`,
      error: err.message,
    });
  }
}

//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function getProcesslist(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET THE AVAILBLE SALES",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET THE AVAILBLE SALES",
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
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("customerid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing. Please provide the Customer id",
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("listtype")) {
      return helper.getErrorResponse(
        false,
        "error",
        "List type missing. Please provide the list type",
        "GET THE AVAILBLE SALES",
        secret
      );
    }

    var sql;
    if (querydata.listtype == 1) {
      if (querydata.customerid == 0) {
        sql = await db.query(
          `SELECT 
        sp.cprocess_id processid,
        (SELECT s1.process_name 
          FROM salesprocesslist s1 
          WHERE s1.processid = sp.cprocess_id 
          ORDER BY s1.cprocess_id ASC 
          LIMIT 1) AS title,
        cr.customer_name,
        DATE_FORMAT(sp.Process_date, '%Y%m%d') AS Process_date,
        DATEDIFF(CURDATE(), sp.Process_date) AS age_in_days,
        COUNT(sp.cprocess_id) OVER(PARTITION BY sp.customer_id) AS process_count, 
        (
          SELECT JSON_ARRAYAGG(t.TimelineEvent)
          FROM (
            SELECT JSON_OBJECT(
                     'Eventid', s2.cprocess_id,
                     'Eventname', psl2.Processname,
                     'feedback', s2.feedback,
                     'Allowed_process', CAST(
                      '{"rfq": false, "invoice": false, "quotation": false, "debit_note": false, "credit_note": false, "get_approval": false, "delivery_challan": false, "revised_quatation": false}' 
                      AS JSON),
                     'pdfpath', s2.salesprocess_path,
                     'apporvedstatus', s2.Approved_status,
                     'internalstatus',s2.Internal_approval
                   ) AS TimelineEvent
            FROM salesprocesslist s2
            LEFT JOIN processshowlist psl2 
              ON psl2.processshowlist_id = s2.process_type
            WHERE s2.processid = sp.cprocess_id
            ORDER BY s2.cprocess_id ASC
          ) t
        ) AS TimelineEvents  
    FROM salesprocessmaster sp 
    JOIN enquirycustomermaster cr ON sp.customer_id = cr.customer_id 
    LEFT JOIN salesprocesslist s ON s.processid = sp.cprocess_id 
    LEFT JOIN processshowlist psl ON psl.processshowlist_id = s.process_type 
    WHERE sp.status = 1 
    AND sp.active_status = 1 AND sp.archive_status = 1 AND sp.deleted_flag = 0
    GROUP BY sp.cprocess_id, sp.customer_id, sp.Process_date, cr.customer_name
    ORDER BY sp.Row_updated_date DESC;
    `
        );
      } else {
        sql = await db.query(
          `SELECT 
      sp.cprocess_id processid,
      (SELECT s1.process_name 
        FROM salesprocesslist s1 
        WHERE s1.processid = sp.cprocess_id 
        ORDER BY s1.cprocess_id ASC 
        LIMIT 1) AS title,
      cr.customer_name,
      DATE_FORMAT(sp.Process_date, '%Y%m%d') AS Process_date,
      DATEDIFF(CURDATE(), sp.Process_date) AS age_in_days,
      COUNT(sp.cprocess_id) OVER(PARTITION BY sp.customer_id) AS process_count, 
      (
        SELECT JSON_ARRAYAGG(t.TimelineEvent)
        FROM (
          SELECT JSON_OBJECT(
                   'Eventid', s2.cprocess_id,
                   'Eventname', psl2.Processname,
                   'feedback', s2.feedback,
                   'Allowed_process', CAST(
                    '{"rfq": false, "invoice": false, "quotation": false, "debit_note": false, "credit_note": false, "get_approval": false, "delivery_challan": false, "revised_quatation": false}' 
                    AS JSON),
                   'pdfpath', s2.salesprocess_path,
                   'apporvedstatus', s2.Approved_status,
                   'internalstatus',s2.Internal_approval
                 ) AS TimelineEvent
          FROM salesprocesslist s2
          LEFT JOIN processshowlist psl2 
            ON psl2.processshowlist_id = s2.process_type
          WHERE s2.processid = sp.cprocess_id
          ORDER BY s2.cprocess_id ASC
        ) t
      ) AS TimelineEvents  
  FROM salesprocessmaster sp 
  JOIN enquirycustomermaster cr ON sp.customer_id = cr.customer_id 
  LEFT JOIN salesprocesslist s ON s.processid = sp.cprocess_id 
  LEFT JOIN processshowlist psl ON psl.processshowlist_id = s.process_type 
  WHERE sp.status = 1 AND sp.archive_status = 1 AND sp.deleted_flag = 0
  AND sp.active_status = 1 
  AND sp.customer_id = ?
  GROUP BY sp.cprocess_id, sp.customer_id, sp.Process_date, cr.customer_name;
  `,
          [querydata.customerid]
        );
      }
    } else {
      if (querydata.customerid == 0) {
        sql = await db.query(
          `SELECT 
          sp.cprocess_id processid,
          (SELECT s1.process_name 
            FROM salesprocesslist s1 
            WHERE s1.processid = sp.cprocess_id 
            ORDER BY s1.cprocess_id ASC 
            LIMIT 1) AS title,
          cr.customer_name,
          DATE_FORMAT(sp.Process_date, '%Y%m%d') AS Process_date,
          DATEDIFF(CURDATE(), sp.Process_date) AS age_in_days,
          COUNT(sp.cprocess_id) OVER(PARTITION BY sp.customer_id) AS process_count, 
          (
            SELECT JSON_ARRAYAGG(t.TimelineEvent)
            FROM (
              SELECT JSON_OBJECT(
                       'Eventid', s2.cprocess_id,
                       'Eventname', psl2.Processname,
                       'feedback', s2.feedback,
                       'Allowed_process',
                       CASE WHEN s2.process_type = 2 AND s2.Approved_status = 1 THEN 
                       (select Allowed_process from
                       processshowlist where fetch_status = 3 and process_name = 2 LIMIT 1)
                        
                       WHEN s2.process_type = 2 AND (s2.Approved_status = 3 OR s2.Approved_status =2 OR s2.Approved_status = 0) AND 
                       EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 6 AND s.processid = s2.processid) THEN
                       (select Allowed_process from
                        processshowlist where fetch_status = 1 and process_name = 2 LIMIT 1) 

                       WHEN s2.process_type = 2 AND (s2.Approved_status = 3 OR s2.Approved_status =2 OR s2.Approved_status = 0) AND 
                       NOT EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 6 AND s.processid = s2.processid) THEN
                       (select Allowed_process from processshowlist where fetch_status = 2 and process_name = 2 LIMIT 1)

                       WHEN s2.process_type = 1 THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 1 LIMIT 1)

                       WHEN s2.process_type = 3 AND s2.Approved_status = 1 THEN
                       (select Allowed_process from processshowlist where fetch_status = 2 and process_name = 3 LIMIT 1)

                       WHEN s2.process_type = 3 AND (s2.Approved_status = 3 OR s2.Approved_status =2 OR s2.Approved_status = 0) AND 
                       EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 6 AND s.processid = s2.processid) THEN
                       (select Allowed_process from processshowlist where fetch_status = 3 and process_name = 3 LIMIT 1)

                       WHEN s2.process_type = 3 AND (s2.Approved_status = 3 OR s2.Approved_status =2 OR s2.Approved_status = 0) AND 
                       NOT EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 6 AND s.processid = s2.processid) THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 3 LIMIT 1)

                       WHEN s2.process_type = 4 THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 4 LIMIT 1)
                       WHEN s2.process_type = 5 THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 5 LIMIT 1)

                       WHEN s2.process_type = 6 AND EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 2 AND s.processid = s2.processid) THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 6 LIMIT 1)

                       WHEN s2.process_type = 6 AND not EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 2 AND s.processid = s2.processid) THEN
                       (select Allowed_process from processshowlist where fetch_status = 2 and process_name = 6 LIMIT 1)

                       WHEN s2.process_type = 7 THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 7 LIMIT 1)
                       WHEN s2.process_type = 8 THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 8 LIMIT 1)
                       WHEN s2.process_type = 9 AND EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 2 AND s.processid = s2.processid) THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 9 LIMIT 1)
                       WHEN s2.process_type = 9 AND NOT EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 2 AND s.processid = s2.processid) THEN
                       (select Allowed_process from processshowlist where fetch_status = 2 and process_name = 9 LIMIT 1)
                       WHEN s2.process_type = 10 THEN
                       (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 10 LIMIT 1)
                       ELSE (select Allowed_process from
                          processshowlist where fetch_status = 1 AND process_name = 1 LIMIT 1) END,
                       'pdfpath', s2.salesprocess_path,
                       'apporvedstatus', s2.Approved_status,
                       'internalstatus',s2.Internal_approval
                     ) AS TimelineEvent
              FROM salesprocesslist s2
              LEFT JOIN processshowlist psl2 
                ON psl2.processshowlist_id = s2.process_type
              WHERE s2.processid = sp.cprocess_id
              ORDER BY s2.cprocess_id ASC
            ) t
          ) AS TimelineEvents 
      FROM salesprocessmaster sp 
      JOIN enquirycustomermaster cr ON sp.customer_id = cr.customer_id 
      LEFT JOIN salesprocesslist s ON s.processid = sp.cprocess_id 
      LEFT JOIN processshowlist psl ON psl.processshowlist_id = s.process_type 
      WHERE sp.status = 1 
      AND sp.active_status = 1 AND sp.archive_status = 0 AND sp.deleted_flag = 0
      GROUP BY sp.cprocess_id, sp.customer_id, sp.Process_date, cr.customer_name
      ORDER BY sp.Row_updated_date DESC;
    `
        );
      } else {
        sql = await db.query(
          `SELECT 
      sp.cprocess_id processid,
      (SELECT s1.process_name 
        FROM salesprocesslist s1 
        WHERE s1.processid = sp.cprocess_id 
        ORDER BY s1.cprocess_id ASC 
        LIMIT 1) AS title,
      cr.customer_name,
      DATE_FORMAT(sp.Process_date, '%Y%m%d') AS Process_date,
      DATEDIFF(CURDATE(), sp.Process_date) AS age_in_days,
      COUNT(sp.cprocess_id) OVER(PARTITION BY sp.customer_id) AS process_count, 
      (
        SELECT JSON_ARRAYAGG(t.TimelineEvent)
        FROM (
          SELECT JSON_OBJECT(
                   'Eventid', s2.cprocess_id,
                   'Eventname', psl2.Processname,
                   'feedback', s2.feedback,
                   'Allowed_process',
                   CASE WHEN s2.process_type = 2 AND s2.Approved_status = 1 THEN 
                   (select Allowed_process from
                   processshowlist where fetch_status = 3 and process_name = 2 LIMIT 1)
                    
                   WHEN s2.process_type = 2 AND (s2.Approved_status = 3 OR s2.Approved_status =2 OR s2.Approved_status = 0) AND 
                   EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 6 AND s.processid = s2.processid) THEN
                   (select Allowed_process from
                    processshowlist where fetch_status = 1 and process_name = 2 LIMIT 1) 

                   WHEN s2.process_type = 2 AND (s2.Approved_status = 3 OR s2.Approved_status =2 OR s2.Approved_status = 0) AND 
                   NOT EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 6 AND s.processid = s2.processid) THEN
                   (select Allowed_process from processshowlist where fetch_status = 2 and process_name = 2 LIMIT 1)

                   WHEN s2.process_type = 1 THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 1 LIMIT 1)

                   WHEN s2.process_type = 3 AND s2.Approved_status = 1 THEN
                   (select Allowed_process from processshowlist where fetch_status = 2 and process_name = 3 LIMIT 1)

                   WHEN s2.process_type = 3 AND (s2.Approved_status = 3 OR s2.Approved_status =2 OR s2.Approved_status = 0) AND 
                   EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 6 AND s.processid = s2.processid) THEN
                   (select Allowed_process from processshowlist where fetch_status = 3 and process_name = 3 LIMIT 1)

                   WHEN s2.process_type = 3 AND (s2.Approved_status = 3 OR s2.Approved_status =2 OR s2.Approved_status = 0) AND 
                   NOT EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 6 AND s.processid = s2.processid) THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 3 LIMIT 1)

                   WHEN s2.process_type = 4 THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 4 LIMIT 1)
                   WHEN s2.process_type = 5 THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 5 LIMIT 1)

                   WHEN s2.process_type = 6 AND EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 2 AND s.processid = s2.processid) THEN
                   (select Allowed_process from processshowlist where fetch_status = 2 and process_name = 6 LIMIT 1)

                   WHEN s2.process_type = 6 AND not EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 2 AND s.processid = s2.processid) THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 6 LIMIT 1)

                   WHEN s2.process_type = 7 THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 7 LIMIT 1)
                   WHEN s2.process_type = 8 THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 8 LIMIT 1)
                   WHEN s2.process_type = 9 AND EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 2 AND s.processid = s2.processid) THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 9 LIMIT 1)
                   WHEN s2.process_type = 9 AND NOT EXISTS (SELECT 1 from salesprocesslist s where s.process_type = 2 AND s.processid = s2.processid) THEN
                   (select Allowed_process from processshowlist where fetch_status = 2 and process_name = 9 LIMIT 1)
                   WHEN s2.process_type = 10 THEN
                   (select Allowed_process from processshowlist where fetch_status = 1 and process_name = 10 LIMIT 1)
                   ELSE (select Allowed_process from
                      processshowlist where fetch_status = 1 AND process_name = 1 LIMIT 1) END,
                   'pdfpath', s2.salesprocess_path,
                   'apporvedstatus', s2.Approved_status,
                   'internalstatus',s2.Internal_approval
                 ) AS TimelineEvent
          FROM salesprocesslist s2
          LEFT JOIN processshowlist psl2 
            ON psl2.processshowlist_id = s2.process_type
          WHERE s2.processid = sp.cprocess_id
          ORDER BY s2.cprocess_id ASC
        ) t
      ) AS TimelineEvents 
  FROM salesprocessmaster sp 
  JOIN enquirycustomermaster cr ON sp.customer_id = cr.customer_id 
  LEFT JOIN salesprocesslist s ON s.processid = sp.cprocess_id 
  LEFT JOIN processshowlist psl ON psl.processshowlist_id = s.process_type 
  WHERE sp.status = 1 AND sp.archive_status = 0 AND sp.deleted_flag = 0
  AND sp.active_status = 1 
  AND sp.customer_id = ?
  GROUP BY sp.cprocess_id, sp.customer_id, sp.Process_date, cr.customer_name;
  `,
          [querydata.customerid]
        );
      }
    }
    if (sql[0]) {
      // console.log(JSON.stringify(sql));
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales process Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales process Fetched successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er,
      secret
    );
  }
}

//########################################################################################################################################################################
//########################################################################################################################################################################
//########################################################################################################################################################################
//########################################################################################################################################################################

async function AddSalesProcess(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ADD PROCESS OF SALES",
        ""
      );
    }

    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD PROCESS OF SALES",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD PROCESS OF SALES",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD PROCESS OF SALES",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD PROCESS OF SALES",
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
        "ADD PROCESS OF SALES",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("processdate") ||
      querydata.processdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process date missing. Please provide the Process date",
        "ADD PROCESS OF SALES",
        secret
      );
    }
    if (!querydata.hasOwnProperty("customerid") || querydata.customerid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing. Please provide the Customer id",
        "ADD PROCESS OF SALES",
        secret
      );
    }
    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD PROCESS OF SALES",
        secret
      );
    }

    const [sql] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS(?,?,?,@processid); select @processid;`,
      [querydata.processdate, querydata.customerid, userid]
    );
    const objectvalue1 = sql[1][0];
    const processid = objectvalue1["@processid"];
    if (processid != null && processid != "") {
      const [sql1] = await db.spcall(
        `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,@prolistid); select @prolistid;`,
        ["Requirements", querydata.processdate, userid, processid]
      );
      const objectvalue2 = sql1[1][0];
      const prolistid = objectvalue2["@prolistid"];
      if (prolistid != null && prolistid != "") {
        for (const product of querydata.product) {
          if (
            !product.hasOwnProperty("productname") ||
            !product.hasOwnProperty("productquantity")
          ) {
            return helper.getErrorResponse(
              false,
              "error",
              "Product details are incomplete. Please provide productname and productquantity.",
              "ADD PROCESS OF SALES",
              secret
            );
          } else {
            const [sql2] = await db.spcall(
              `CALL SP_CUSTOMER_REQ_ADD(?,?,?,@productid); SELECT @productid;`,
              [product.productname, product.productquantity, prolistid]
            );
            const objectvalue3 = sql2[1][0];
            const productid = objectvalue3["@productid"];
          }

          return helper.getSuccessResponse(
            true,
            "success",
            "Sales Product Added Successfully",
            processid,
            secret
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Error adding the Cusotmer requirements",
          "ADD PROCESS OF SALES",
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error adding the Sales Process",
        "ADD PROCESS OF SALES",
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er,
      secret
    );
  }
}

//#####################################################################################################################################################################################
//###############################################################################################################################################################################
//######################################################################################################################################################################################
//######################################################################################################################################################################################

async function AddProcessList(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ADD SALES PROCESS LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD SALES PROCESS LIST",
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
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("custsalesname") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer sales missing. Please provide the Customer sales",
        "ADD SALES PROCESS LIST",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("salesprocesspath") ||
      querydata.salesprocesspath == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process path missing. Please provide the Sales process path.",
        "ADD SALES PROCESS LIST",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("salesprocessdate") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales Process date missing. Please provide the Sales Process date",
        "ADD SALES PROCESS LIST",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("processid") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process id missing. Please provide the Sales Process id",
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("processtype") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process type missing. Please provide the Sales Process type",
        "ADD SALES PROCESS LIST",
        secret
      );
    }

    const [sql] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,@prolist); select @prolist;`,
      [
        querydata.custsalesname,
        querydata.salesprocesspath,
        querydata.salesprocessdate,
        userid,
        querydata.processid,
        querydata.processtype,
      ]
    );
    const objectvalue1 = sql[1][0];
    const processlistid = objectvalue1["@prolist"];
    if (processlistid != null && processlistid != "") {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales Process List Added Successfully",
        processlistid,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error adding the Sales Process List",
        "ADD SALES PROCESS LIST",
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

async function UpdateProcessList(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "UPDATE SALES PROCESS LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE SALES PROCESS LIST",
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
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("custsalesname") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer sales name missing. Please provide the Customer sales name",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("salesprocesspath") ||
      querydata.salesprocesspath == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process path missing. Please provide the Sales process path",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("salesprocessdate") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process date missing. Please provide the Sales process date",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("processlistid") ||
      querydata.cprocessid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process list id missing. Please provide the process ",
        "UPDATE SALES PROCESS LIST",
        secret
      );
    }

    const sql = await db.query(
      `UPDATE salesprocesslist set custsales_name = ?,salesprocess_path = ?, siteprocess_date = ?, process_id = ? where cprocess_id = ?`,
      [
        querydata.custsalesname,
        querydata.salesprocesspath,
        querydata.salesprocessdate,
        querydata.processid,
        querydata.processlistid,
      ]
    );

    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Process list Updated Successfully.",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while updating the data.",
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

async function UpdateSalesProcess(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "UPDATE SALES PROCESS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "UPDATE SALES PROCESS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "UPDATE SALES PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE SALES PROCESS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE SALES PROCESS",
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
        "UPDATE SALES PROCESS",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("custsalesname") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer sales name missing. Please provide the Customer sales name",
        "UPDATE SALES PROCESS",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("salesprocessdate") ||
      querydata.salesprocessdate == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales process date missing. Please provide the Sales process date",
        "UPDATE SALES PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("customerid") || querydata.customerid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing. Please provide the Customer id",
        "UPDATE SALES PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("cprocessid") || querydata.cprocessid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Client Process id missing. Please provide the Client Process id",
        "UPDATE SALES PROCESS",
        secret
      );
    }
    const sql = await db.query(
      `UPDATE salesprocessmaster SET Client_name = ?,Process_date = ?,Customer_id = ? where cprocess_id = ?`,
      [
        querydata.custsalesname,
        querydata.salesprocessdate,
        querydata.customerid,
        querydata.cprocessid,
      ]
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

async function detailsPreLoader(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH AUTO GENERATED ID FOR EVENTS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
    var sql1 = [],
      sql2 = [],
      customercode = "";

    const sql = await db.query(
      `select customer_type,customer_id,exist_customerid,exist_branchid,customer_name,customer_phoneno,customer_mailid,customer_gstno,billing_address,address,BillingAdddress_name,Process_titile from enquirycustomermaster where customer_id IN(select customer_id from salesprocessmaster where cprocess_id In(select processid from salesprocesslist where cprocess_id in(?)))`,
      [querydata.eventid]
    );
    var eventnumber,
      title,
      customerid,
      customertype,
      branchid,
      gstno,
      emailid,
      invoice_number = null,
      contact_number,
      customer_name,
      billing_address,
      billingaddress_name,
      client_address,
      client_addressname,
      product;
    if (sql.length > 0) {
      customertype = sql[0].customer_type || 0;
      customerid = sql[0].exist_customerid || 0;
      branchid = sql[0].exist_branchid || 0;
      title = sql[0].Process_titile || "";
      gstno = sql[0].customer_gstno || "";
      contact_number = sql[0].customer_phoneno || "";
      customer_name = sql[0].customer_name || "";
      billing_address = sql[0].billing_address || "";
      billingaddress_name = sql[0].BillingAdddress_name || "";
      client_address = sql[0].address || "";
      client_addressname = sql[0].customer_name || "";
      emailid = sql[0].customer_mailid || "";

      if (customertype == 1) {
        if (querydata.eventtype == "invoice") {
          // product = await db.query(
          //   `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno,
          //   product_total producttotal from quotation_productmaster where process_id IN(select cprocess_id from salesprocesslist where processid In(select processid from salesprocesslist
          //   where cprocess_id in(select cprocess_id from salesprocesslist where Approved_status = 1 and Processid in (select processid from salesprocesslist where cprocess_id = ?) order by
          //   cprocess_id DESC ) and
          //   process_type IN (2,3)))`,
          //   [querydata.eventid]
          // );
          product = await db.query(
            `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno,
            product_total producttotal from quotation_productmaster where process_id IN(select cprocess_id from salesprocesslist where cprocess_id = ? and process_type IN (2,3) and approved_status = 1) and status =1  order by productsno`,
            [querydata.eventid]
          );
          if (product.length == 0) {
            return helper.getErrorResponse(
              false,
              "error",
              "You don't have any approved Quotation. Please approve atleast one quotation",
              "INVOICE",
              secret
            );
          }
          customercode = "SSIPL";
          const [result1] = await db.spcall(
            `CALL Generate_invoiceid(?,?,@p_invoice_id); select @p_invoice_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_invoice_id"];
        } else if (querydata.eventtype == "proformainvoice") {
          product = await db.query(
            `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno,
            product_total producttotal from quotation_productmaster where process_id IN(select cprocess_id from salesprocesslist where cprocess_id = ? and process_type IN (2,3) and approved_status = 1) and status =1 order by productsno`,
            [querydata.eventid]
          );
          if (product.length == 0) {
            return helper.getErrorResponse(
              false,
              "error",
              "You don't have any approved Quotation. Please approve atleast one quotation",
              "INVOICE",
              secret
            );
          }
          customercode = "SSIPL";
          const [result1] = await db.spcall(
            `CALL Generate_proformainvoiceid(?,?,@p_invoice_id); select @p_invoice_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_invoice_id"];
        } else if (querydata.eventtype == "quotation") {
          customercode = "SSIPL";
          const [result1] = await db.spcall(
            `CALL Generate_quotationid(?,?,@p_quotation_id); select @p_quotation_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_quotation_id"];
        } else if (querydata.eventtype == "deliverychallan") {
          var ccode;
          product = await db.query(
            `SELECT * FROM (
              SELECT ipm.inv_productid AS productid,ipm.invoice_id invoice_number, ipm.product_name AS productname, ipm.product_quantity AS invoice_quantity, ipm.product_hsn AS producthsn, ipm.product_price 
              AS productprice, ipm.product_gst AS productgst, ipm.product_sno AS productsno, COALESCE(delivered.total_delivered, 0) AS delivered_quantity, 
              (ipm.product_quantity - COALESCE(delivered.total_delivered, 0)) AS productquantity, ipm.process_id FROM invoice_productmaster ipm LEFT JOIN 
              (SELECT inv_productid, SUM(product_quantity) AS total_delivered FROM dc_productmaster GROUP BY inv_productid) delivered ON ipm.inv_productid = delivered.inv_productid
            ) t WHERE t.productquantity > 0 AND process_id IN (SELECT cprocess_id FROM salesprocesslist WHERE processid IN (SELECT processid FROM salesprocesslist WHERE 
            cprocess_id = ?) AND process_type = 4);
            `,
            [querydata.eventid]
          );
          if (product.length == 0) {
            return helper.getErrorResponse(
              false,
              "error",
              "Product Doesn't exists.",
              "DELIVERY CHALLAN",
              secret
            );
          }
          const sql = await db.query(
            `SELECT cprocess_gene_id  FROM salesprocesslist 
             WHERE processid IN ( SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) 
             AND process_type = 5 ORDER BY Row_updated_date DESC LIMIT 1`,
            [querydata.eventid]
          );
          if (sql[0]) {
            ccode = sql[0].cprocess_gene_id;
            const [result1] = await db.spcall(
              `CALL Generate_DeliveryChallan(?,?,@p_deliverychallan_id); select @p_deliverychallan_id`,
              [userid, ccode]
            );
            const objectValue = result1[1][0];
            eventnumber = objectValue["@p_deliverychallan_id"];
          } else {
            ccode = "SSIPL-DC/";
            const [result1] = await db.spcall(
              `CALL GenerateDeliverychId(?,?,@p_deliverychallan_id); select @p_deliverychallan_id`,
              [userid, ccode]
            );
            const objectValue = result1[1][0];
            eventnumber = objectValue["@p_deliverychallan_id"];
          }
          invoice_number = product[0].invoice_number;
        } else if (querydata.eventtype == "requestforquotation") {
          const [result1] = await db.spcall(
            `CALL Generate_rfq(?,@p_rfq_id); select @p_rfq_id`,
            [userid]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_rfq_id"];
        } else if (querydata.eventtype == "revisedrequestforquotation") {
          const sql = await db.query(
            `select cprocess_gene_id from salesprocesslist where processid IN ( SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) 
            AND process_type IN(2,3) ORDER BY Row_updated_date DESC LIMIT 1`,
            [querydata.eventid]
          );
          var ccode = `SSIPL-RRFQ/`;
          if (sql.length > 0) {
            ccode = sql[0].cprocess_gene_id;
          }
          const [result1] = await db.spcall(
            `CALL Generate_rrfq(?,?,@p_rfq_id); select @p_rfq_id`,
            [userid, ccode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_rfq_id"];
        } else if (querydata.eventtype == "debitnote") {
          const [result] = await db.query(
            `CALL Generate_debitnote(?,@p_debitnote_id); select @p_debitnote_id`,
            [userid]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_debitnote_id"];
        } else if (querydata.eventtype == "creditnote") {
          const [result] = await db.query(
            `CALL Generate_creditnote(?,@p_creditnote_id); select @p_creditnote_id`,
            [userid]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_creditnote_id"];
        } else if (querydata.eventtype == "revisedquotation") {
          const sql = await db.query(
            `select cprocess_gene_id from salesprocesslist where processid IN ( SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) 
            AND process_type IN(2,3) ORDER BY Row_updated_date DESC LIMIT 1`,
            [querydata.eventid]
          );
          var ccode = `SSIPL-QUOTE/`;
          if (sql.length > 0) {
            ccode = sql[0].cprocess_gene_id;
          }
          const [result] = await db.spcall(
            `CALL Generate_revisedquotation(?,?,@p_quotation_id); select @p_quotation_id`,
            [userid, ccode]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_quotation_id"];
          product = await db.query(
            `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from quotation_productmaster where process_id = ?`,
            [querydata.eventid]
          );
        }
      } else if (customertype == 2) {
        // if (customerid != 0 && customerid != "") {
        //   sql1 = await db.query1(
        //     `select ccode from customermaster where customer_id IN (?)`,
        //     [customerid]
        //   );
        // } else {
        //   sql2 = await db.query1(
        //     `select branch_code from branchmaster where branch_id in(?)`,
        //     branchid
        //   );
        // }
        // if (sql1.length > 0) {
        //   customercode = sql1[0].ccode || "SSIPL";
        // } else if (sql2.length > 0) {
        customercode = "SSIPL";
        // } else {
        //   return helper.getErrorResponse(
        //     false,
        //     "error",
        //     "Company or branch id not found",
        //     "GET THE EVENT NUMBER",
        //     secret
        //   );
        // }
        if (querydata.eventtype == "invoice") {
          product = await db.query(
            `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno,
            product_total producttotal from quotation_productmaster where process_id IN(select cprocess_id from salesprocesslist where cprocess_id = ? and process_type IN (2,3) and approved_status = 1) and status =1 order by productsno`,
            [querydata.eventid]
          );
          if (product.length == 0) {
            return helper.getErrorResponse(
              false,
              "error",
              "You don't have any approved Quotation. Please approve atleast one quotation",
              "INVOICE",
              secret
            );
          }
          if (customercode == "null") {
            customercode = "SSIPL";
          }
          const [result1] = await db.spcall(
            `CALL Generate_invoiceid(?,?,@p_invoice_id); select @p_invoice_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_invoice_id"];
          // product = await db.query(
          //   `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from quotation_productmaster where process_id IN(select cprocess_id from salesprocesslist where processid In(select processid from salesprocesslist where cprocess_id in(?) and approved_status = 1 and process_type IN (2,3)))`,
          //   [querydata.eventid]
          // );
        } else if (querydata.eventtype == "proformainvoice") {
          product = await db.query(
            `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno,
            product_total producttotal from quotation_productmaster where process_id IN(select cprocess_id from salesprocesslist where cprocess_id = ? and process_type IN (2,3) and approved_status = 1) and status =1 order by productsno`,
            [querydata.eventid]
          );
          if (product.length == 0) {
            return helper.getErrorResponse(
              false,
              "error",
              "You don't have any approved Quotation. Please approve atleast one quotation",
              "INVOICE",
              secret
            );
          }
          customercode = "SSIPL";
          const [result1] = await db.spcall(
            `CALL Generate_proformainvoiceid(?,?,@p_invoice_id); select @p_invoice_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_invoice_id"];
        } else if (querydata.eventtype == "quotation") {
          customercode = "SSIPL";
          const [result1] = await db.spcall(
            `CALL Generate_quotationid(?,?,@p_quotation_id); select @p_quotation_id`,
            [userid, customercode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_quotation_id"];
        } else if (querydata.eventtype == "deliverychallan") {
          var ccode;
          product = await db.query(
            `SELECT * FROM (
              SELECT ipm.inv_productid AS productid,ipm.invoice_id invoice_number, ipm.product_name AS productname, ipm.product_quantity AS invoice_quantity, ipm.product_hsn AS 
              producthsn, ipm.product_price 
              AS productprice, ipm.product_gst AS productgst, ipm.product_sno AS productsno, COALESCE(delivered.total_delivered, 0) AS delivered_quantity, 
              (ipm.product_quantity - COALESCE(delivered.total_delivered, 0)) AS productquantity, ipm.process_id FROM invoice_productmaster ipm LEFT JOIN 
              (SELECT inv_productid, SUM(product_quantity) AS total_delivered FROM dc_productmaster GROUP BY inv_productid) delivered ON ipm.inv_productid = delivered.inv_productid
            ) t WHERE t.productquantity > 0 AND process_id IN (SELECT cprocess_id FROM salesprocesslist WHERE processid IN (SELECT processid FROM salesprocesslist WHERE 
            cprocess_id = ?) AND process_type = 4);
            `,
            [querydata.eventid]
          );
          if (product.length == 0) {
            return helper.getErrorResponse(
              false,
              "error",
              "Product Doesn't exists.",
              "DELIVERY CHALLAN",
              secret
            );
          }
          const sql = await db.query(
            `SELECT cprocess_gene_id  FROM salesprocesslist 
             WHERE processid IN ( SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) 
             AND process_type = 5 ORDER BY Row_updated_date DESC LIMIT 1`,
            [querydata.eventid]
          );
          if (sql[0]) {
            ccode = sql[0].cprocess_gene_id;
            const [result1] = await db.spcall(
              `CALL Generate_DeliveryChallan(?,?,@p_deliverychallan_id); select @p_deliverychallan_id`,
              [userid, ccode]
            );
            const objectValue = result1[1][0];
            eventnumber = objectValue["@p_deliverychallan_id"];
          } else {
            ccode = "SSIPL-DC/";
            const [result1] = await db.spcall(
              `CALL GenerateDeliverychId(?,?,@p_deliverychallan_id); select @p_deliverychallan_id`,
              [userid, ccode]
            );
            const objectValue = result1[1][0];
            eventnumber = objectValue["@p_deliverychallan_id"];
          }
          invoice_number = product[0].invoice_number;
        } else if (querydata.eventtype == "requestforquotation") {
          const [result1] = await db.spcall(
            `CALL Generate_rfq(?,@p_rfq_id); select @p_rfq_id`,
            [userid]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_rfq_id"];
        } else if (querydata.eventtype == "revisedrequestforquotation") {
          const sql = await db.query(
            `select cprocess_gene_id from salesprocesslist where processid IN ( SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) 
            AND process_type IN(2,3) ORDER BY Row_updated_date DESC LIMIT 1`,
            [querydata.eventid]
          );
          var ccode = `SSIPL-RFQ/`;
          if (sql.length > 0) {
            ccode = sql[0].cprocess_gene_id;
          }
          const [result1] = await db.spcall(
            `CALL Generate_rrfq(?,?,@p_rfq_id); select @p_rfq_id`,
            [userid, ccode]
          );
          const objectValue = result1[1][0];
          eventnumber = objectValue["@p_rfq_id"];
        } else if (querydata.eventtype == "debitnote") {
          const [result] = await db.query(
            `CALL Generate_debitnote(?,@p_debitnote_id); select @p_debitnote_id`,
            [userid]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_debitnote_id"];
        } else if (querydata.eventtype == "creditnote") {
          const [result] = await db.query(
            `CALL Generate_creditnote(?,@p_creditnote_id); select @p_creditnote_id`,
            [userid]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_creditnote_id"];
        } else if (querydata.eventtype == "revisedquotation") {
          const sql = await db.query(
            `select cprocess_gene_id from salesprocesslist where processid IN ( SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) 
            AND process_type IN(2,3) ORDER BY Row_updated_date DESC LIMIT 1`,
            [querydata.eventid]
          );
          var ccode = `SSIPL-QUOTE/`;
          if (sql[0]) {
            ccode = sql[0].cprocess_gene_id;
          }
          const [result] = await db.spcall(
            `CALL Generate_revisedquotation(?,?,@p_quotation_id); select @p_quotation_id`,
            [userid, ccode]
          );
          const objectValue = result[1][0];
          eventnumber = objectValue["@p_quotation_id"];
          product = await db.query(
            `select product_name productname,product_quantity productquantity,product_hsn producthsn, product_price productprice,product_gst productgst,product_sno productsno, product_total producttotal from quotation_productmaster where process_id = ?`,
            [querydata.eventid]
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Please provide the valid customer",
          "FETCH AUTO GENERATED ID FOR EVENTS",
          secret
        );
      }
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
          emailid: emailid,
          contact_number: contact_number,
          billing_address: billing_address,
          billingaddress_name: billingaddress_name,
          client_address: client_address,
          client_addressname: client_addressname,
          product: product,
          invoice_number: invoice_number,
          fromaddress_name: "SPORADA SECURE INDIA PVT LTD",
          from_address:
            "87/7, 3RD FLOOR, SAKTHIVEL TOWERS, TRICHY ROAD, RAMANATHAPURAM, COIMBATORE - 641045",
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

async function GetProcessShow(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET PROCESS SHOW LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET PROCESS SHOW LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET PROCESS SHOW LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET PROCESS SHOW LIST",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET PROCESS SHOW LIST",
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

        "GET PROCESS SHOW LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("currentprocess") ||
      querydata.currentprocess == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Current process missing. Please provide the Current process",
        "GET PROCESS SHOW LIST",
        secret
      );
    }

    const sql = await db.query(
      `select Allowed_process from processshowlist where processname = ? and status = 1`,
      [querydata.currentprocess]
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Allowed Process Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Process not found",
        "GET PROCESS SHOW LIST",
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

async function GetProcessCustomer(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET PROCESS CUSTOMER",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
      await db.query(`select Customer_id, customer_name,customer_phoneno,customer_gstno from enquirycustomermaster where customer_id In
      (select customer_id from salesprocessmaster where status = 1 and active_status = 1 and deleted_flag = 0);`);
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

//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

// async function GetCustomerList(sales) {
//   try {
//     // Check if the session token exists
//     if (!sales.hasOwnProperty("STOKEN")) {
//       return helper.getErrorResponse(
//         false,
//         "Login sessiontoken missing. Please provide the Login sessiontoken",
//         "GET CUSTOMER LIST",
//         ""
//       );
//     }

//     // Validate session token length
//     if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
//       return helper.getErrorResponse(
//         false,
//         "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
//         "GET CUSTOMER LIST",
//         ""
//       );
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
//       [sales.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return helper.getErrorResponse(
//         false,
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "GET CUSTOMER LIST",
//         ""
//       );
//     }
//     var secret = sales.STOKEN.substring(0, 16);
//     const [result1] = await db.spcall(
//       `CALL Gen_sub_reqId(?,?,@p_req_id); select @p_req_id`,
//       [userid]
//     );
//     const objectValue = result1[1][0];
//     const Sub_requirement_id = objectValue["@p_req_id"];

//     const sql = await db.query1(
//       `select Customer_id, customer_name from customermaster where status = 1 and deleted_flag = 0;`
//     );
//     if (sql[0]) {
//       return helper.getSuccessResponse(true, Sub_requirement_id, sql, secret);
//     } else {
//       return helper.getErrorResponse(
//         false,
//         "Customers not available",
//         "GET CUSTOMER LIST",
//         secret
//       );
//     }
//   } catch (er) {
//     return helper.getErrorResponse(
//       false,
//       "Internal Error. Please contact Administration",
//       er.message,
//       secret
//     );
//   }
// }

async function GetCustomerList(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET CUSTOMER LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Fetch customer list
    const sql = await db.query1(
      `SELECT Customer_id, customer_name,ccode FROM customermaster WHERE status = 1 AND deleted_flag = 0;`
    );
    try {
      if (sql[0]) {
        const customerList = sql;
        // Generate unique Sub_requirement_id for all customers in parallel
        const promises = customerList.map(async (customer) => {
          const [result1] = await db.spcall(
            `CALL Gen_sub_reqId(?,?,@p_req_id); SELECT @p_req_id;`,
            [userid, customer.ccode]
          );
          const objectValue = result1[1][0];
          customer.Sub_requirement_id = objectValue["@p_req_id"];
        });

        // Wait for all Sub_requirement_id generation to complete
        await Promise.all(promises);
        // Return success response with the updated customer list
        return helper.getSuccessResponse(
          true,
          "success",
          "Customer list retrieved",
          customerList,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Customers not available",
          "GET CUSTOMER LIST",
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
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function GetCustomerDetails(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET CUSTOMER LIST",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      const sql = await db.query1(
        `SELECT customer_id,customer_name,Email_id,Admin_username,Contact_no,Address,Billing_address,
        (SELECT gstno FROM branchmaster WHERE branchmaster.customer_id = customermaster.customer_id LIMIT 1) AS gstno FROM customermaster WHERE status = 1 AND deleted_flag = 0;`
      );
      if (sql[0]) {
        return helper.getSuccessResponse(
          true,
          "success",
          "Customer Details Fetched Successfully",
          sql,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Customers not available",
          "GET CUSTOMER LIST",
          secret
        );
      }
    } else {
      var secret = sales.STOKEN.substring(0, 16);
      var querydata;

      // Decrypt querystring
      try {
        querydata = await helper.decrypt(sales.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "GET CUSTOMER LIST",
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
          "GET CUSTOMER LIST",
          secret
        );
      }

      // Validate required fields
      if (
        !querydata.hasOwnProperty("customerid") ||
        querydata.custsalesname == ""
      ) {
        return helper.getErrorResponse(
          false,
          "error",
          "Customer id missing. Please provide the Customer id",
          "GET CUSTOMER LIST",
          secret
        );
      }
      const sql = await db.query1(
        `SELECT customer_id,customer_name,Email_id,Admin_username,Contact_no,Address,Billing_address,
      (SELECT gstno FROM branchmaster WHERE branchmaster.customer_id = customermaster.customer_id LIMIT 1) AS gstno FROM customermaster WHERE status = 1 AND deleted_flag = 0 and customer_id =?;`,
        [querydata.customerid]
      );
      if (sql[0]) {
        return helper.getSuccessResponse(
          true,
          "success",
          "Customer Details Fetched Successfully",
          sql,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Customers not available",
          "GET CUSTOMER LIST",
          secret
        );
      }
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

//############################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getQuotationId(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH QUOTATION ID",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH QUOTATION ID",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH QUOTATION ID",
        secret
      );
    }

    const customercode = "ssipl-quo";
    const [result1] = await db.spcall(
      `CALL Generate_quotationid(?,?,@p_quotation_id); select @p_quotation_id`,
      [userid, customercode]
    );
    const objectValue = result1[1][0];
    const Quotationid = objectValue["@p_quotation_id"];
    if (Quotationid != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Quotation id fetched successfully",
        { Quotationid: Quotationid },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching Customer Quotation id",
        "FETCH QUOTATION ID",
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

//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getInvoiceId(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH INVOICE ID",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH INVOICE ID",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH INVOICE ID",
        secret
      );
    }

    const customercode = "ssipl-inv";
    const [result1] = await db.spcall(
      `CALL Generate_invoiceid(?,?,@p_invoice_id); select @p_invoice_id`,
      [userid, customercode]
    );
    const objectValue = result1[1][0];
    const Invoiceid = objectValue["@p_invoice_id"];
    if (Invoiceid != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Invoice id fetched successfully",
        { Invoiceid: Invoiceid },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching Customer Invoice id",
        "FETCH INVOICE ID",
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
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getDeliveryChalnId(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH DELIVERY CHALLAN ID",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH DELIVERY CHALLAN ID",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH DELIVERY CHALLAN ID",
        secret
      );
    }

    const customercode = "ssipl-dc";
    const [result1] = await db.spcall(
      `CALL GenerateDeliverychId(?,@p_deliverychallan_id); select @p_deliverychallan_id`,
      [userid]
    );
    const objectValue = result1[1][0];
    const DeliveryChallanid = objectValue["@p_deliverychallan_id"];
    if (DeliveryChallanid != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Delivery challan id fetched successfully",
        { DeliveryChallanid: DeliveryChallanid },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching id for the Delivery Challan",
        "FETCH DELIVERY CHALLAN ID",
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

async function getRequestforQuotationId(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH REQUEST FOR QUOTATION ID",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH REQUEST FOR QUOTATION ID",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH REQUEST FOR QUOTATION ID",
        secret
      );
    }

    const customercode = "ssipl-rfq";
    const [result1] = await db.spcall(
      `CALL Generate_rfq(?,@p_rfq_id); select @p_rfq_id`,
      [userid]
    );
    const objectValue = result1[1][0];
    const Requestforquotationid = objectValue["@p_rfq_id"];
    if (Requestforquotationid != null) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Request for Quotation id fetched successfully",
        { Requestforquotationid: Requestforquotationid },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Fetching id for the Request for quotation",
        "FETCH REQUEST FOR QUOTATION ID",
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

async function getCusReq(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET CUSTOMER REQUIREMENT",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET CUSTOMER REQUIREMENT",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET CUSTOMER REQUIREMENT",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET CUSTOMER REQUIREMENT",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET CUSTOMER LIST",
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
        "GET CUSTOMER LIST",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("processid") ||
      querydata.custsalesname == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "process id missing. Please provide the process id",
        "GET CUSTOMER LIST",
        secret
      );
    }
    const sql = await db.query(
      `select cm.Customer_id,cm.customer_name,cm.customer_mailid,cm.customer_phoneno,cm.customer_gstno,cm.address,cm.billing_address,cm.pdf_path,cr.custsales_name,
      cr.salesprocess_date,cr.cprocess_gene_id from salesprocesslist cr,enquirycustomermaster cm,salesprocessmaster sp where cm.customer_id = sp.customer_id and sp.cprocess_id = cr.processid and cr.processid = ?`,
      [querydata.processid]
    );
    if (sql[0]) {
      const pdfpath = sql[0].pdf_path;
      var pdfbinary;
      if (pdfpath != null) {
        pdfbinary = await helper.convertFileToBinary(pdfpath);
      }
      try {
        if (secret != null && secret != "") {
          const returnstr = JSON.stringify({
            code: true,
            status: "success",
            message: "Customer requiement fetched Successfully",
            data: sql,
            pdfpath,
            pdfbinary,
          });
          encryptedResponse = await helperencrypt(returnstr, secret);
          return { encryptedResponse };
        } else {
          return {
            code: true,
            status: "success",
            message: "Customer requiement fetched Successfully",
            data: sql,
            pdfpath,
            pdfbinary,
          };
        }
      } catch (er) {
        return {
          code: true,
          status: "success",
          message: "Customer requiement fetched Successfully",
          data: sql,
          pdfpath,
          pdfbinary,
        };
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Customers not available",
        "GET CUSTOMER LIST",
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
//##################################################################################################################################################################################################

// async function addQuotation(req, res) {
//   try {
//     var secret, sales, querydata;
//     try {
//       await uploadFile.uploadQuotationp(req, res);
//       sales = req.body;
//       // Check if the session token exists
//       if (!sales.STOKEN) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Login session token missing. Please provide the Login session token",
//           "ADD QUOTATION",
//           ""
//         );
//       }
//       secret = sales.STOKEN.substring(0, 16);
//       querydata;

//       // Validate session token length
//       if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Login session token size invalid. Please provide the valid Session token",
//           "ADD QUOTATION",
//           secret
//         );
//       }
//       if (!req.file) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Please upload a file!",
//           "ADD QUOTATION",
//           secret
//         );
//       }
//     } catch (er) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         `Could not upload the file. ${er.message}`,
//         er.message,
//         secret
//       );
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
//       [sales.STOKEN]
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
//     if (!sales.querystring) {
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
//       querydata = await helper.decrypt(sales.querystring, secret);
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

//     // Validate required fields
//     if (!querydata.hasOwnProperty("title") || querydata.title == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Title missing. Please provide the Title",
//         "ADD QUOTATION",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Process id missing. Please provide the Process id",
//         "ADD QUOTATION",
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
//         "ADD QUOTATION",
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
//         "ADD QUOTATION",
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
//         "ADD QUOTATION",
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
//         "ADD QUOTATION",
//         secret
//       );
//     }

//     if (!querydata.hasOwnProperty("product") || querydata.product == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Product Details missing. Please provide the Product Details.",
//         "ADD QUOTATION",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("emailid")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Email id missing. Please provide the Email id",
//         "ADD QUATATION",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("ccemail")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "CC Email id missing. Please provide the CC Email id",
//         "ADD QUATATION",
//         secret
//       );
//     }

//     if (!querydata.hasOwnProperty("phoneno")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Contact number missing. Please provide the contact number.",
//         "ADD QUOTATION",
//         secret
//       );
//     }
//     if (
//       !querydata.hasOwnProperty("quotationgenid") ||
//       querydata.quotationgenid == ""
//     ) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Quatation generated id missing. Please provide the Quotation id",
//         "ADD QUOTATION",
//         secret
//       );
//     }

//     if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Product Notes missing. Please provide the Product Notes.",
//         "ADD QUOTATION",
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
//         "ADD QUOTATION",
//         secret
//       );
//     }
//     if (!querydata.hasOwnProperty("feedback")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Feedback missing. Please provide the feedback",
//         "ADD QUOTATION",
//         secret
//       );
//     }
//     var WhatsappSent, EmailSent;
//     const [sql1] = await db.spcall(
//       `CALL SP_ADD_QUOTATION_PROCESS(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
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
//         querydata.title,
//       ]
//     );
//     const objectvalue2 = sql1[1][0];
//     const quatationid = objectvalue2["@prolistid"];
//     var Quoteid;
//     if (quatationid != null && quatationid != 0) {
//       for (const product of querydata.product) {
//         if (
//           !product.hasOwnProperty("productname") ||
//           !product.hasOwnProperty("producthsn") ||
//           !product.hasOwnProperty("productgst") ||
//           !product.hasOwnProperty("productprice") ||
//           !product.hasOwnProperty("productquantity") ||
//           !product.hasOwnProperty("productsno") ||
//           !product.hasOwnProperty("producttotal")
//         ) {
//           return helper.getErrorResponse(
//             false,
//             "error",
//             "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
//             "ADD QUATATION",
//             secret
//           );
//         } else {
//           const [sql2] = await db.spcall(
//             `CALL SP_QUOTATION_ADD(?,?,?,?,?,?,?,?,?,?,?,@quoteid); SELECT @quoteid;`,
//             [
//               product.productname,
//               product.productquantity,
//               product.productgst,
//               product.productprice,
//               product.producthsn,
//               querydata.quotationgenid,
//               JSON.stringify(querydata.notes),
//               querydata.pdfpath,
//               quatationid,
//               product.productsno,
//               product.producttotal,
//             ]
//           );
//           const objectvalue3 = sql2[1][0];
//           Quoteid = objectvalue3["@quoteid"];
//         }
//       }
//       const sql = await db.query(
//         `Update generatequotationid set status = 0 where quotation_id IN('${querydata.quotationgenid}')`
//       );
//       const sql2 = await db.query(
//         `select u.Email_id,a.secret from usermaster u CROSS JOIN apikey a where u.user_design = 'Administrator' and u.status = 1 and a.status = 1`
//       );
//       var emailid = "",
//         apikey = "15b97956-b296-11";
//       if (sql2.length > 0) {
//         emailid =
//           sql2.length > 0 ? sql2.map((item) => item.Email_id).join(",") : "";
//         apikey = sql2[0].secret;
//       } else {
//         emailid = `sales@sporadasecure.com`;
//         apikey = "15b97956-b296-11";
//       }
//       EmailSent = await mailer.sendapprovequotation(
//         "Administrator",
//         emailid,
//         `Action Required!!! Received Quotation Approve Request for ${querydata.clientaddressname}`,
//         "apporvequotation.html",
//         `${apiserver}/sales/intquoteapprove?quoteid=${quatationid}&STOKEN=${apikey}&s=1&feedback='Apporved'`,
//         "APPROVEQUOTATION_SEND",
//         querydata.clientaddressname,
//         "QUOTATION APPROVAL",
//         `${apiserver}/sales/intquoteapprove?quoteid=${quatationid}&STOKEN=${apikey}&s=3`,
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
//           "refresh",
//           "Quotation sent successfully to the Administrator for eventid" +
//             quatationid +
//             ". Please contact Administrator for further action."
//         );
//         await mqttclient.publishMqttMessage(
//           "Notification",
//           "Quotation sent Internally for " + querydata.clientaddressname
//         );
//         return helper.getSuccessResponse(
//           true,
//           "success",
//           "Quotation sent successfully to the Administrator. Please contact Administrator for further action.",
//           { EmailSent: EmailSent },
//           secret
//         );
//       } else {
//         const sql = await db.query(
//           `delete from salesprocesslist where cprocess_id =?`,
//           [quatationid]
//         );
//         await mqttclient.publishMqttMessage(
//           "Notification",
//           "Error sending the Quotation for eventid" +
//             quatationid +
//             ". Please try again"
//         );
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Error sending the Quotation. Please try again",
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
//       "Internal error. Please contact Administration",
//       er.message,
//       secret
//     );
//   }
// }

async function addQuotation(req, res) {
  try {
    var secret, sales, querydata;
    try {
      await uploadFile.uploadQuotationp(req, res);
      sales = req.body;
      // Check if the session token exists
      if (!sales.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token missing. Please provide the Login session token",
          "ADD QUOTATION",
          ""
        );
      }
      secret = sales.STOKEN.substring(0, 16);
      querydata;

      // Validate session token length
      if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token size invalid. Please provide the valid Session token",
          "ADD QUOTATION",
          secret
        );
      }
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

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
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
    if (!sales.querystring) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD QUOTATION",
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
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
        "ADD QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD QUATATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD QUATATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD QUOTATION",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("quotationgenid") ||
      querydata.quotationgenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Quatation generated id missing. Please provide the Quotation id",
        "ADD QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD QUOTATION",
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
        "ADD QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD QUOTATION",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_QUOTATION_PROCESS(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
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
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const quatationid = objectvalue2["@prolistid"];
    var Quoteid;
    if (quatationid != null && quatationid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD QUATATION",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_QUOTATION_ADD(?,?,?,?,?,?,?,?,?,?,?,@quoteid); SELECT @quoteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.quotationgenid,
              JSON.stringify(querydata.notes),
              querydata.pdfpath,
              quatationid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          Quoteid = objectvalue3["@quoteid"];
        }
      }
      const sql = await db.query(
        `Update generatequotationid set status = 0 where quotation_id IN('${querydata.quotationgenid}')`
      );
      const sql2 = await db.query(
        `select u.Email_id,a.secret from usermaster u CROSS JOIN apikey a where u.user_design = 'Administrator' and u.status = 1 and a.status = 1`
      );
      var emailid = "",
        apikey = "15b97956-b296-11";
      if (sql2.length > 0) {
        emailid =
          sql2.length > 0 ? sql2.map((item) => item.Email_id).join(",") : "";
        apikey = sql2[0].secret;
      } else {
        emailid = `sales@sporadasecure.com`;
        apikey = "15b97956-b296-11";
      }
      EmailSent = await mailer.sendapprovequotation(
        "Administrator",
        emailid,
        `Action Required!!! Received Quotation Approve Request for ${querydata.clientaddressname}`,
        "apporvequotation.html",
        `${apiserver}/sales/intquoteapprove?quoteid=${quatationid}&STOKEN=${apikey}&s=1&feedback='Apporved'`,
        "APPROVEQUOTATION_SEND",
        querydata.clientaddressname,
        "QUOTATION APPROVAL",
        `${apiserver}/sales/intquoteapprove?quoteid=${quatationid}&STOKEN=${apikey}&s=3`,
        req.file.path
      );
      if (EmailSent == true) {
        const sql = await db.query(
          `INSERT INTO quotation_mailbox(process_id,emailid,ccemail,phoneno,feedback,clientname,message_type,pdf_path)
        VALUES(?,?,?,?,?,?,?,?)`,
          [
            quatationid,
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
          "refresh",
          "Quotation sent successfully to the Administrator for eventid" +
            quatationid +
            ". Please contact Administrator for further action."
        );
        await mqttclient.publishMqttMessage(
          "Notification",
          "Quotation sent Internally for " + querydata.clientaddressname
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
          `delete from salesprocesslist where cprocess_id =?`,
          [quatationid]
        );
        await mqttclient.publishMqttMessage(
          "Notification",
          "Error sending the Quotation for eventid" +
            quatationid +
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
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Quotation.",
        "ADD QUOTATION",
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
//##################################################################################################################################################################################################

async function addCustomQuotation(req, res) {
  try {
    var secret, sales, querydata, userid;
    try {
      await uploadFile.uploadQuotationp(req, res);
      sales = req.body;
      // Check if the session token exists
      if (!sales.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token missing. Please provide the Login session token",
          "ADD CUSTOM QUOTATION",
          ""
        );
      }
      secret = sales.STOKEN.substring(0, 16);

      // Validate session token length
      if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login session token size invalid. Please provide the valid Session token",
          "ADD CUSTOM QUOTATION",
          secret
        );
      }

      // Validate session token
      const [result] = await db.spcall(
        "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
        [sales.STOKEN]
      );
      const objectvalue = result[1][0];
      userid = objectvalue["@result"];

      if (userid == null) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken Invalid. Please provide the valid sessiontoken",
          "ADD CUSTOM QUOTATION",
          secret
        );
      }
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD CUSTOM QUOTATION",
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

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD CUSTOM QUOTATION",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD CUSTOM QUOTATION",
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
        "ADD CUSTOM QUOTATION",
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
        "ADD CUSTOM QUOTATION",
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
        "ADD CUSTOM QUOTATION",
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
        "ADD CUSTOM QUOTATION",
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
        "ADD CUSTOM QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD CUSTOM QUATATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD CUSTOM QUATATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD CUSTOM QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("date") || querydata.date == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Date missing. Please provide the date.",
        "ADD CUSTOM QUOTATION",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("quotationgenid") ||
      querydata.quotationgenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Quatation generated id missing. Please provide the Quotation id",
        "ADD CUSTOM QUOTATION",
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
        "ADD CUSTOM QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD CUSTOM QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("gst_number")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Gst number missing. Please provide the Gst number ",
        "ADD CUSTOM QUOTATION",
        secret
      );
    }
    var WhatsappSent = false,
      EmailSent = false;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_CUSTOM_PDF(?,?,?,?,?,?,?,?,?,?,?,?,?,@customid); SELECT @customid;`,
      [
        querydata.clientaddressname,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.emailid,
        querydata.phoneno,
        querydata.gst_number,
        querydata.date,
        1,
        querydata.quotationgenid,
        querydata.feedback,
        req.file.path,
        userid,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const quatationid = objectvalue2["@customid"];
    var Quoteid;

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
      EmailSent = await mailer.sendQuotation(
        querydata.clientaddressname,
        querydata.emailid,
        "Your Quotation from Sporada Secure India Private Limited",
        "quotationpdf.html",
        ``,
        "QUOTATION_PDF_SEND",
        req.file.path,
        querydata.feedback,
        querydata.ccemail
      );
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
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
        mailer.sendQuotation(
          querydata.clientaddressname,
          querydata.emailid,
          "Your Quotation from Sporada Secure India Private Limited",
          "quotationpdf.html",
          ``,
          "QUOTATION_PDF_SEND",
          req.file.path,
          querydata.feedback,
          querydata.ccemail
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
      "Notification",
      "Custom Quotation sent Successfully for " + querydata.clientaddressname
    );
    await mqttclient.publishMqttMessage(
      "refresh",
      "Custom Quotation sent Successfully for " + querydata.clientaddressname
    );
    return helper.getSuccessResponse(
      true,
      "success",
      "Custom Quotation added successfully",
      {
        quotationid: Quoteid,
        WhatsappSent: WhatsappSent,
        EmailSent: EmailSent,
      },
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

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
async function SendPdf(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadcustompdf(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "SEND PDF"
        );
      }
    } catch (er) {
      console.log(JSON.stringify(er.message));
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "SEND PDF",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "SEND PDF",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "SEND PDF",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "SEND PDF",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "SEND PDF",
        secret
      );
      0;
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "SEND PDF",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the Feedback.",
        "SEND PDF",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "SEND PDF",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "SEND PDF",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "SEND PDF",
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
        "SEND PDF",
        secret
      );
    }
    var WhatsappSent = 0,
      EmailSent = 0;
    const promises = [];
    const phoneNumbers = querydata.phoneno
      ? querydata.phoneno
          .split(",")
          .map((num) => num.trim())
          .filter((num) => num !== "")
      : [];

    let whatsappResults = [];
    let emailResult = false;

    // Send Email or WhatsApp Message
    if (querydata.messagetype === 1) {
      // Send only email
      try {
        emailResult = await mailer.sendQuotation(
          "",
          querydata.emailid,
          "PDF from Sporada Secure India Private Limited",
          "sendpdf.html",
          ``,
          "SENDPDF",
          req.file.path,
          querydata.feedback,
          querydata.ccemail
        );
        EmailSent = emailResult;
      } catch (error) {
        console.error("Email sending failed:", error);
        EmailSent = false;
      }
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
      try {
        const whatsappPromises = phoneNumbers.map((number) =>
          axios.post(`${config.whatsappip}/billing/sendpdf`, {
            phoneno: number,
            feedback: querydata.feedback,
            pdfpath: req.file.path,
          })
        );
        const responses = await Promise.all(whatsappPromises);
        WhatsappSent = responses.filter(
          (response) => response.data.code === true
        ).length;
      } catch (error) {
        console.error("WhatsApp sending failed:", error);
        WhatsappSent = 0;
      }
    } else if (querydata.messagetype === 3) {
      // Send both email & WhatsApp
      try {
        const emailPromise = mailer.sendQuotation(
          "",
          querydata.emailid,
          "PDF from Sporada Secure India Private Limited",
          "sendpdf.html",
          ``,
          "SENDPDF",
          req.file.path,
          querydata.feedback,
          querydata.ccemail
        );

        const whatsappPromises = phoneNumbers.map((number) =>
          axios.post(`${config.whatsappip}/billing/sendpdf`, {
            phoneno: number,
            feedback: querydata.feedback,
            pdfpath: req.file.path,
          })
        );

        const [emailResult, whatsappResponses] = await Promise.all([
          emailPromise,
          Promise.all(whatsappPromises),
        ]);

        EmailSent = emailResult;
        WhatsappSent = whatsappResponses.filter(
          (response) => response.status == 200
        ).length;
      } catch (error) {
        console.error("Sending failed:", error);
        EmailSent = false;
        WhatsappSent = 0;
      }
    }

    let isSuccess = false;
    if (querydata.messagetype == 1 && EmailSent) {
      isSuccess = true;
    } else if (
      querydata.messagetype == 2 &&
      WhatsappSent == phoneNumbers.length
    ) {
      isSuccess = true;
    } else if (
      querydata.messagetype === 3 &&
      EmailSent &&
      WhatsappSent == phoneNumbers.length
    ) {
      isSuccess = true;
    }

    if (isSuccess) {
      return helper.getSuccessResponse(
        true,
        "success",
        "PDF sent successfully",
        { WhatsappSent, EmailSent },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "failure",
        "Failed to send PDF to all intended recipients",
        { WhatsappSent, EmailSent },
        secret
      );
    }

    // var WhatsappSent = 0,
    //   EmailSent = 0;
    // const promises = [];
    // const phoneNumbers = querydata.phoneno
    //   ? querydata.phoneno
    //       .split(",")
    //       .map((num) => num.trim())
    //       .filter((num) => num !== "") // Removes empty values
    //   : [];
    // // Send Email or WhatsApp Message
    // if (querydata.messagetype === 1) {
    //   // Send only email
    //   EmailSent = await mailer.sendQuotation(
    //     "",
    //     querydata.emailid,
    //     "PDF from Sporada Secure India Private Limited",
    //     "sendpdf.html",
    //     ``,
    //     "SENDPDF",
    //     req.file.path,
    //     querydata.feedback,
    //     querydata.ccemail
    //   );
    // } else if (querydata.messagetype === 2) {
    //   // Send only WhatsApp
    //   WhatsappSent = await Promise.all(
    //     phoneNumbers.map(async (number) => {
    //       try {
    //         const response = await axios.post(
    //           `${config.whatsappip}/billing/sendpdf`,
    //           {
    //             phoneno: number,
    //             feedback: querydata.feedback,
    //             pdfpath: req.file.path,
    //           }
    //         );
    //         return response.data.code;
    //       } catch (error) {
    //         console.error(`WhatsApp Error for ${number}:`, error.message);
    //         return false;
    //       }
    //     })
    //   );
    // } else if (querydata.messagetype === 3) {
    //   // Send both email & WhatsApp in parallel
    //   promises.push(
    //     mailer.sendQuotation(
    //       "",
    //       querydata.emailid,
    //       "PDF from Sporada Secure India Private Limited",
    //       "sendpdf.html",
    //       ``,
    //       "SENDPDF",
    //       req.file.path,
    //       querydata.feedback,
    //       querydata.ccemail
    //     )
    //   );

    //   promises.push(
    //     Promise.all(
    //       phoneNumbers.map(async (number) => {
    //         try {
    //           const response = await axios.post(
    //             `${config.whatsappip}/billing/sendpdf`,
    //             {
    //               phoneno: number,
    //               feedback: querydata.feedback,
    //               pdfpath: req.file.path,
    //             }
    //           );
    //           return response.data.code;
    //         } catch (error) {
    //           console.error(`WhatsApp Error for ${number}:`, error.message);
    //           return false;
    //         }
    //       })
    //     ).then((results) => (WhatsappSent = results))
    //   );

    //   // Run both requests in parallel and wait for completion
    //   [EmailSent] = await Promise.all(promises);
    // }
    // return helper.getSuccessResponse(
    //   true,
    //   "success",
    //   "Pdf send successfully",
    //   {
    //     WhatsappSent: WhatsappSent,
    //     EmailSent: EmailSent,
    //   },
    //   secret
    // );
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

//######################################################################################################################################################################################
//#########################################################################################################################################################################################
//########################################################################################################################################################################################
//#########################################################################################################################################################################################

async function addDeliveryChallan(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadDeliverychln(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD DELIVERY CHALLAN FOR PROCESS"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD DELIVERY CHALLAN",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD DELIVERY CHALLAN",
        secret
      );
      0;
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the Feedback.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("dcgenid") || querydata.dcgenid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Delivery challan id missing. Please provide the Delivery Challan id",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD DELIVERY CHALLAN",
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
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("gst_number")) {
      return helper.getErrorResponse(
        false,
        "error",
        "GST number missing. Please provide the GST number.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("date") || querydata.date == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Date missing. Please provide the Date.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("productfeedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Product feedback missing. Please provide the Product feedback.",
        "ADD DELIVERY CHALLAN",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_INVOICE2(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@invoiceid); select @invoiceid;`,
      [
        querydata.clientaddressname,
        querydata.gst_number,
        userid,
        querydata.processid,
        querydata.dcgenid,
        5,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
        querydata.emailid || "",
        querydata.ccEmail || "",
        querydata.phoneno || "",
      ]
    );
    const objectvalue2 = sql1[1][0];
    const deliverychallanid = objectvalue2["@invoiceid"];
    var deliverychallan;
    if (deliverychallanid != null && deliverychallanid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productid") ||
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            -"error",
            "Product details are incomplete. Please provide productid, productname ,productquantity, producthsn, productgst,producttotal,productsno and productprice.",
            "ADD DELIVERY CHALLAN",
            secret
          );
          // return helper.getErrorResponse(false,"error","Product details are incomplete. Please provide the Productname, Productquantity,producthsn")
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_DELIVERYCHALLAN_ADD(?,?,?,?,?,?,?,?,?,?,?,?,@dcid); SELECT @dcid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.dcgenid,
              JSON.stringify(querydata.notes),
              req.file.path,
              deliverychallanid,
              product.productsno,
              product.producttotal,
              product.productid,
            ]
          );
          const objectvalue2 = sql1[1][0];
          deliverychallan = objectvalue2["@dcid"];
          // Quoteid = objectvalue3["@quoteid"];
        }
      }
      if (querydata.productfeedback != null && querydata.productfeedback != 0) {
        const sql2 = await db.query(
          `Update salesprocesslist set feedback = '${querydata.productfeedback}' where cprocess_gene_id IN('${querydata.dcgenid}')`
        );
      }
      const sql = await db.query(
        `Update generatedeliverychallanid set status = 0 where dc_id IN('${querydata.dcgenid}')`
      );
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
        EmailSent = await mailer.sendQuotation(
          querydata.clientaddressname,
          querydata.emailid,
          "Your Delivery Challan from Sporada Secure India Private Limited",
          "deliverychallanpdf.html",
          ``,
          "DELIVERYCHALLAN_PDF_SEND",
          req.file.path,
          querydata.feedback,
          querydata.ccemail
        );
      } else if (querydata.messagetype === 2) {
        // Send only WhatsApp
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
          mailer.sendQuotation(
            querydata.clientaddressname,
            querydata.emailid,
            "Your Delivery Challan from Sporada Secure India Private Limited",
            "deliverychallanpdf.html",
            ``,
            "DELIVERYCHALLAN_PDF_SEND",
            req.file.path,
            querydata.feedback,
            querydata.ccemail
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
        "Notification",
        "Delivery challan sent Successfully for " + querydata.clientaddressname
      );
      await mqttclient.publishMqttMessage(
        "refresh",
        "Delivery challan sent Successfully for " + querydata.clientaddressname
      );
      return helper.getSuccessResponse(
        true,
        "success",
        "Delivery challan added successfully",
        {
          dcid: deliverychallanid,
          WhatsappSent: WhatsappSent,
          EmailSent: EmailSent,
        },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Delivery Challan.",
        "ADD DELIVERY CHALLAN",
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

async function addCustomDeliveryChallan(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadDeliverychln(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD CUSTOM DELIVERY CHALLAN FOR PROCESS"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD CUSTOM DELIVERY CHALLAN",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
      0;
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD CUSTOM DELIVERY CHALLAN",
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
        "ADD CUSTOM DELIVERY CHALLAN",
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
        "ADD CUSTOM DELIVERY CHALLAN",
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
        "ADD CUSTOM DELIVERY CHALLAN",
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
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }

    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the Feedback.",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("dcgenid") || querydata.dcgenid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Delivery challan id missing. Please provide the Delivery Challan id",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD CUSTOM DELIVERY CHALLAN",
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
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("gst_number")) {
      return helper.getErrorResponse(
        false,
        "error",
        "GST number missing. Please provide the GST number.",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }
    if (!querydata.hasOwnProperty("date") || querydata.date == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Date missing. Please provide the Date.",
        "ADD CUSTOM DELIVERY CHALLAN",
        secret
      );
    }
    const [sql1] = await db.spcall(
      `CALL SP_ADD_CUSTOM_PDF(?,?,?,?,?,?,?,?,?,?,?,?,?,@customid); SELECT @customid;`,
      [
        querydata.clientaddressname,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.emailid,
        querydata.phoneno,
        querydata.gst_number,
        querydata.date,
        3,
        querydata.dcgenid,
        querydata.feedback,
        req.file.path,
        userid,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const deliverychallanid = objectvalue2["@customid"];
    var deliverychallan, WhatsappSent, EmailSent;
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
      EmailSent = await mailer.sendQuotation(
        querydata.clientaddressname,
        querydata.emailid,
        "Your Delivery Challan from Sporada Secure India Private Limited",
        "deliverychallanpdf.html",
        ``,
        "DELIVERYCHALLAN_PDF_SEND",
        req.file.path,
        querydata.feedback,
        querydata.ccemail
      );
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
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
        mailer.sendQuotation(
          querydata.clientaddressname,
          querydata.emailid,
          "Your Delivery Challlan from Sporada Secure India Private Limited",
          "deliverychallanpdf.html",
          ``,
          "DELIVERYCHALLAN_PDF_SEND",
          req.file.path,
          querydata.feedback,
          querydata.ccemail
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
    return helper.getSuccessResponse(
      true,
      "success",
      "Custom Delivery challan added successfully",
      {
        dcid: deliverychallanid,
        WhatsappSent: WhatsappSent,
        EmailSent: EmailSent,
      },
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

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addFeedback(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ADD FEEDBACK FOR EVENTS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
      `Update salesprocesslist set feedback = ? where cprocess_id = ?`,
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getBinaryFile(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
    if (querydata.hasOwnProperty("eventid")) {
      if (querydata.eventtype == "revisedquotation") {
        sql = await db.query(
          `select salesprocess_path from salesprocesslist where processid IN ( SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) 
          AND process_type IN(2,3) ORDER BY Row_updated_date DESC LIMIT 1`,
          [querydata.eventid]
        );
      } else {
        sql = await db.query(
          `select salesprocess_path from salesprocesslist where cprocess_id = ?`,
          [querydata.eventid]
        );
      }
    }

    if (querydata.hasOwnProperty("invoicenumber")) {
      sql = await db.query(
        `select salesprocess_path from salesprocesslist where cprocess_gene_id = ?`,
        [querydata.invoicenumber]
      );
    }
    if (sql.length > 0) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].salesprocess_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].salesprocess_path);
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
        { binarydata },
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

async function getCustomBinaryfile(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
        "Custom PDF id missing. Please provide the Custom PDF id",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select pdf_path from custompdfmaster where custom_id = ?`,
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

async function DeleteProcess(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "DELETE PROCESS OF THE CUSTOMER",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
      `UPDATE salesprocessmaster SET status = 0, deleted_flag = 1, active_status = 0 WHERE cprocess_id IN (${processIdsString})`
    );
    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales Process Deleted Successfully",
        "",
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No matching Sales Process found to delete",
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

async function ArchiveProcess(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ARCHIVE PROCESS OF THE CUSTOMER",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
      `UPDATE salesprocessmaster SET archive_status = ${querydata.type} WHERE cprocess_id IN (${processIdsString})`
    );
    if (sql.affectedRows) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales Process Archived Successfully",
        "",
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No matching Sales Process found to archive",
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

async function addRFQ(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadRFQuotation(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD REQUEST FOR QUOTATION"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD REQUEST FOR QUOTATION",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vendorname") || querydata.vendorname == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor name missing. Please provide the Vendor name",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("vendorid") || querydata.vendorid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor id missing. Please provide the Vendor id",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("vendoraddress") ||
      querydata.vendoraddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor address missing. Please provide the Vendor address",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    //

    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD REQUEST FOR QUATATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("rfqgenid") || querydata.rfqgenid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Request for Quatation generated id missing.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD REQUEST FOR QUOTATION",
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
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email missing. Please provide the cc email.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("title")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the title.",
        "ADD REQUEST FOR QUOTATION",
        secret
      );
    }
    for (const product of querydata.product) {
      if (
        !product.hasOwnProperty("productname") ||
        !product.hasOwnProperty("productquantity")
      ) {
        return helper.getErrorResponse(
          false,
          "error",
          "Product details are incomplete. Please provide productname and productquantity",
          "ADD REQUEST FOR QUOTATION",
          secret
        );
      }
    }
    var WhatsappSent = 0,
      EmailSent = 0;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_RFQ_PROCESS(?,?,?,?,?,?,?,?,?,@rfqid,@vprocessid); select @rfqid,@vprocessid;`,
      [
        querydata.vendorname,
        userid,
        querydata.processid,
        querydata.rfqgenid,
        6,
        req.file.path,
        querydata.vendoraddress,
        querydata.title,
        querydata.vendorid,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const rfqid = objectvalue2["@rfqid"];
    const vendorid = objectvalue2["@vprocessid"];
    var Rfqid;
    if (rfqid != null && rfqid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("productquantity")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname and productquantity",
            "ADD REQUEST FOR QUOTATION",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_RFQ_ADD(?,?,?,?,?,?,@rfqid); SELECT @rfqid;`,
            [
              product.productname,
              product.productquantity,
              querydata.rfqgenid,
              JSON.stringify(querydata.notes),
              req.file.path,
              vendorid,
            ]
          );
          const objectvalue3 = sql2[1][0];
          Rfqid = objectvalue3["@rfqid"];
        }
      }
      const sql = await db.query(
        `Update generaterfqid set status = 0 where rfqgen_id = '${querydata.rfqgenid}'`
      );
      // Send Email or WhatsApp Message
      if (querydata.messagetype == 1) {
        try {
          EmailSent = await mailer.sendInvoice(
            querydata.vendorname,
            querydata.emailid,
            "Request for Quotation from Sporada Secure India Private Limited",
            "rfgpdf.html",
            ``,
            "RFQ_PDF_SEND",
            req.file.path,
            "",
            "",
            "",
            querydata.ccemail
          );
        } catch (er) {
          EmailSent = false;
        }
      } else if (querydata.messagetype == 2) {
        try {
          WhatsappSent = await axios.post(
            `${config.whatsappip}/billing/sendpdf`,
            {
              phoneno: querydata.phoneno,
              feedback: `We hope you're doing well. We are interested in procuring the following products and would like to request a quotation from your company`,
              pdfpath: req.file.path,
            }
          );
          if (WhatsappSent.data.code == true) {
            WhatsappSent = WhatsappSent.data.code;
          } else {
            WhatsappSent = WhatsappSent.data.code;
          }
        } catch (er) {
          WhatsappSent = false;
        }
      } else {
        try {
          WhatsappSent = await axios.post(
            `${config.whatsappip}/billing/sendpdf`,
            {
              phoneno: querydata.phoneno,
              feedback: `We hope you're doing well. We are interested in procuring the following products and would like to request a quotation from your company`,
              pdfpath: req.file.path,
            }
          );
          if (WhatsappSent.data.code == true) {
            WhatsappSent = WhatsappSent.data.code;
          } else {
            WhatsappSent = WhatsappSent.data.code;
          }
        } catch (er) {
          WhatsappSent = false;
        }
        try {
          EmailSent = await mailer.sendInvoice(
            querydata.vendorname,
            querydata.emailid,
            "Request for Quotation from Sporada Secure India Private Limited",
            "rfgpdf.html",
            ``,
            "RFQ_PDF_SEND",
            req.file.path,
            "",
            "",
            "",
            querydata.ccemail
          );
        } catch (er) {
          EmailSent = false;
        }
      }
      await mqttclient.publishMqttMessage(
        "Notification",
        "Request for quotation sent Successfully for " + querydata.vendorname
      );
      await mqttclient.publishMqttMessage(
        "refresh",
        "Request for quotation sent Successfully for " + querydata.vendorname
      );
      return helper.getSuccessResponse(
        true,
        "success",
        "Request for Quotation added successfully",
        {
          rfqid: Rfqid,
          WhatsappSent: WhatsappSent,
          EmailSent: EmailSent,
        },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the request for Quotation.",
        "ADD REQUEST FOR QUOTATION",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addRevisedQuotation(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadRFQuotation(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD REVISED QUOTATION FOR PROCESS"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD REVISED QUOTATION FOR PROCESS",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }
    //

    if (!querydata.hasOwnProperty("emailid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("quotationgenid") ||
      querydata.quotationgenid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Revised Quotation generated id missing.",
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD REVISED QUOTATION FOR PROCESS",
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
        "ADD REVISED QUOTATION FOR PROCESS",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_REVISED_QUOTATION_PROCESS(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
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
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const quatationid = objectvalue2["@prolistid"];
    var RevQuoteid;
    if (quatationid != null && quatationid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD REVISED QUOTATION",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_QUOTATION_ADD(?,?,?,?,?,?,?,?,?,?,?,@quoteid); SELECT @quoteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.quotationgenid,
              JSON.stringify(querydata.notes),
              querydata.pdfpath,
              quatationid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          RevQuoteid = objectvalue3["@revquoteid"];
        }
      }

      const sql = await db.query(
        `Update generaterevisedquotationid set status = 0 where revquotation_id IN('${querydata.quotationgenid}')`
      );
      const sql2 = await db.query(
        `select u.Email_id,a.secret from usermaster u CROSS JOIN apikey a where u.user_design = 'Administrator' and u.status = 1 and a.status = 1`
      );
      var emailid = "",
        apikey = "15b97956-b296-11";
      if (sql2.length > 0) {
        emailid =
          sql2.length > 0 ? sql2.map((item) => item.Email_id).join(",") : "";
        apikey = sql2[0].secret;
      } else {
        emailid = `sales@sporadasecure.com`;
        apikey = "15b97956-b296-11";
      }
      EmailSent = await mailer.sendapprovequotation(
        "Administrator",
        emailid,
        // ,ceo@sporadasecure.com.ramachadran.m@sporadasecure.com',
        `Action Required!!! Received Quotation Approve Request for ${querydata.clientaddressname}`,
        "apporvequotation.html",
        `${apiserver}/sales/intquoteapprove?quoteid=${quatationid}&STOKEN=${apikey}&s=1&feedback='Apporved'`,
        "APPROVEQUOTATION_SEND",
        querydata.clientaddressname,
        "QUOTATION APPROVAL",
        `${apiserver}/sales/intquoteapprove?quoteid=${quatationid}&STOKEN=${apikey}&s=3`,
        req.file.path
      );
      if (EmailSent == true) {
        const sql = await db.query(
          `INSERT INTO quotation_mailbox(process_id,emailid,ccemail,phoneno,feedback,clientname,message_type,pdf_path)
        VALUES(?,?,?,?,?,?,?,?)`,
          [
            quatationid,
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
          "Quotation sent Internally for " + querydata.clientaddressname
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "Quotation sent Internally for " + querydata.clientaddressname
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
          `delete from salesprocesslist where cprocess_id =?`,
          [quatationid]
        );
        return helper.getErrorResponse(
          false,
          "error",
          "Error sending the Email. Please try again",
          { EmailSent: EmailSent },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Revised Quotation.",
        "ADD REVISED QUOTATION FOR PROCESS",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addCreditNote(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadCreditNote(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD CREDIT NOTE FOR PROCESS"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD CREDIT NOTE FOR PROCESS",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    //

    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("creditnoteid") ||
      querydata.creditnoteid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Credit note generated id missing.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback") || querydata.feedback == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.clientaddressname,
        userid,
        querydata.processid,
        querydata.creditnoteid,
        7,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const creditnoteid = objectvalue2["@prolistid"];
    var Creditnoteid;
    if (creditnoteid != null && creditnoteid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD CREDIT NOTE",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_CREDITNOTE_ADD(?,?,?,?,?,?,?,?,?,?,?,@crdnteid); SELECT @crdnteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.creditnoteid,
              JSON.stringify(querydata.notes),
              req.file.path,
              creditnoteid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          Creditnoteid = objectvalue3["@crdnteid"];
        }
        // const sql1 = await db.query(`Update generatecreditnteid set status =1 where creditnotegen_id = ?`,[querydata.creditnoteid]);
        // const promises1 = [];

        const sql = await db.query(
          `Update generatecreditnteid set status = 0 where creditnotegen_id = '${querydata.creditnoteid}'`
        );
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
            "Your Credit Note from Sporada Secure India Private Limited",
            "quotationpdf.html",
            ``,
            "CREDITNOTE_PDF_SEND",
            req.file.path
          );
        } else if (querydata.messagetype === 2) {
          // Send only WhatsApp
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
              "Your Credit Note from Sporada Secure India Private Limited",
              "quotationpdf.html",
              ``,
              "CREDITNOTE_PDF_SEND",
              req.file.path
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
        return helper.getSuccessResponse(
          true,
          "success",
          "Credit note added successfully",
          {
            creditnoteid: Creditnoteid,
            WhatsappSent: WhatsappSent,
            EmailSent: EmailSent,
          },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Credit Note.",
        "ADD CREDIT NOTE FOR PROCESS",
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

//##############################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function addDebitNote(req, res) {
  try {
    var secret;
    try {
      await uploadFile.uploadCreditNote(req, res);
      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a file!",
          "ADD DEBIT NOTE FOR PROCESS"
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        er.message,
        ""
      );
    }

    const sales = req.body;
    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD DEBIT NOTE FOR PROCESS",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD DEBIT NOTE FOR PROCESS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("title") || querydata.title == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Title missing. Please provide the Title",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Process id missing. Please provide the Process id",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("product") || querydata.product == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Details missing. Please provide the Product Details.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    //

    if (!querydata.hasOwnProperty("emailid") || querydata.emailid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("rrrrr") || querydata.rrrrr == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD CREDIR NOTE FOR PROCESS",
        secret
      );
    }
    if (!querydata.hasOwnProperty("phoneno") || querydata.phoneno == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("creditnoteid") ||
      querydata.creditnoteid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Credit note generated id missing.",
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    if (!querydata.hasOwnProperty("notes") || querydata.notes == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Product Notes missing. Please provide the Product Notes.",
        "ADD CREDIT NOTE FOR PROCESS",
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
        "ADD CREDIT NOTE FOR PROCESS",
        secret
      );
    }

    var WhatsappSent, EmailSent;
    const [sql1] = await db.spcall(
      `CALL SP_ADD_SALES_PROCESS_LIST(?,?,?,?,?,?,?,?,?,?,@prolistid); select @prolistid;`,
      [
        querydata.title,
        userid,
        querydata.processid,
        querydata.creditnoteid,
        7,
        req.file.path,
        querydata.clientaddress,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.title,
      ]
    );
    const objectvalue2 = sql1[1][0];
    const creditnoteid = objectvalue2["@prolistid"];
    var RevQuoteid;
    if (creditnoteid != null && creditnoteid != 0) {
      for (const product of querydata.product) {
        if (
          !product.hasOwnProperty("productname") ||
          !product.hasOwnProperty("producthsn") ||
          !product.hasOwnProperty("productgst") ||
          !product.hasOwnProperty("productprice") ||
          !product.hasOwnProperty("productquantity") ||
          !product.hasOwnProperty("productsno") ||
          !product.hasOwnProperty("producttotal")
        ) {
          return helper.getErrorResponse(
            false,
            "error",
            "Product details are incomplete. Please provide productname ,productquantity, producthsn, productgst and productprice.",
            "ADD CREDIT NOTE",
            secret
          );
        } else {
          const [sql2] = await db.spcall(
            `CALL SP_CREDITNOTE_ADD(?,?,?,?,?,?,?,?,?,?,?,@revquoteid); SELECT @revquoteid;`,
            [
              product.productname,
              product.productquantity,
              product.productgst,
              product.productprice,
              product.producthsn,
              querydata.creditnoteid,
              JSON.stringify(querydata.notes),
              querydata.pdfpath,
              creditnoteid,
              product.productsno,
              product.producttotal,
            ]
          );
          const objectvalue3 = sql2[1][0];
          RevQuoteid = objectvalue3["@revquoteid"];
        }
        const sql = await db.query(
          `Update generatecreditnteid set status = 0 where creditnotegen_id = '${querydata.creditnoteid}'`
        );
        // Send Email or WhatsApp Message
        if (querydata.messagetype == 1 || querydata.messagetype == 3) {
          EmailSent = await mailer.sendInvoice(
            querydata.clientaddressname,
            querydata.emailid,
            "Your Credit Note from Sporada Secure India Private Limited",
            "quotationpdf.html",
            ``,
            "QUOTATION_PDF_SEND",
            req.file.path
          );
        }
        if (querydata.messagetype == 2 || querydata.messagetype == 3) {
          WhatsappSent = await axios.post(
            `${config.whatsappip}/billing/sendpdf`,
            {
              phoneno: querydata.phoneno,
              feedback: `We hope you're doing well. Please find attached your credit note with Sporada Secure.`,
              pdfpath: req.file.path,
            }
          );
          if (WhatsappSent.data.code == true) {
            WhatsappSent = WhatsappSent.data.code;
          } else {
            WhatsappSent = WhatsappSent.data.code;
          }
        }
        return helper.getSuccessResponse(
          true,
          "success",
          "Credit note added successfully",
          {
            rfqid: RevQuoteid,
            WhatsappSent: WhatsappSent,
            EmailSent: EmailSent,
          },
          secret
        );
      }
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while adding the Revised Quotation.",
        "ADD CREDIT NOTE FOR PROCESS",
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

async function getProducts(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET THE AVAILABLE PRODUCTS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET THE AVAILABLE PRODUCTS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET THE AVAILABLE PRODUCTS",
        secret
      );
    }
    const sql = await db.query(
      `select product_name,product_hsn,product_price,product_gst from productmaster where status = 1`
    );

    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Products Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Products Fetched successfully",
        sql,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getNotes(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET THE NOTES",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET THE NOTES",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET THE NOTES",
        secret
      );
    }
    const sql = await db.query(
      `select notes from notesmaster where status = 1`
    );

    if (sql[0]) {
      const allNotes = sql.flatMap((row) => JSON.parse(row.notes));
      return helper.getSuccessResponse(
        true,
        "success",
        "Notes Fetched successfully",
        { notes: allNotes },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Notes Fetched successfully",
        { notes: [] },
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er,
      secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function salesData(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH SALES DATA",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "FETCH SALES DATA",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH SALES DATA",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "FETCH SALES DATA",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "FETCH SALES DATA",
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
        "FETCH SALES DATA",
        secret
      );
    }

    // Validate required fields
    if (
      !querydata.hasOwnProperty("salesperiod") ||
      querydata.salesperiod == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Sales period missing. Please provide the sales period",
        "FETCH SALES DATA",
        secret
      );
    }
    var sql;
    let startDate;

    if (querydata.salesperiod === "monthly") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (querydata.salesperiod === "yearly") {
      const now = new Date();
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    sql = await db.query(
      `SELECT 
          SUM(product_total) AS Total_amount,
          COUNT(inv_productid) AS Total_invoices,
          SUM(CASE WHEN payment_status = 1 THEN product_total ELSE 0 END) AS Paid_total,
          COUNT(CASE WHEN payment_status = 1 THEN inv_productid ELSE NULL END) AS Paid_invoices,
          SUM(CASE WHEN payment_status = 0 THEN product_total ELSE 0 END) AS Pending_total,
          COUNT(CASE WHEN payment_status = 0 THEN inv_productid ELSE NULL END) AS Pending_invoices
       FROM invoice_productmaster 
       WHERE status = 1 AND DATE(Row_updated_date) >= ?`,
      [startDate.toISOString().split("T")[0]]
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales data fetched successfully",
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
        "Sales data fetched successfully",
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

async function clientProfile(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH CLIENT PROFILE DATE",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
      `SELECT customer_name, customer_mailid, customer_phoneno, customer_gstno, 
      Address, Billing_address, billingadddress_name, Customer_type,exist_customerid,exist_branchid,
      (SELECT COUNT(*) FROM salesprocessmaster WHERE customer_id = c.customer_id AND status = 1) AS total_process,
      (SELECT COUNT(*) FROM salesprocessmaster WHERE customer_id = c.customer_id AND active_status = 1 AND status = 1) AS active_process,
      (SELECT COUNT(*) FROM salesprocessmaster WHERE customer_id = c.customer_id AND active_status = 0 AND status = 1) AS inactive_process
FROM enquirycustomermaster c
WHERE customer_id = ? and status =1`,
      [querydata.customerid]
    );
    var customertype, companycount, sitecount;
    if (sql[0]) {
      if (sql[0].Customer_type == 1) {
        customertype = "Enquiry";
        companycount = 0;
        sitecount = 0;
      } else {
        var sql1;
        if (sql[0].exist_customerid != 0) {
          sql1 = await db.query1(
            `SELECT COUNT(*) AS companycount, Customer_type,(SELECT COUNT(*) FROM branchmaster WHERE customer_id = c.customer_id) AS branch_count
     FROM customermaster c WHERE customer_id = ?`,
            [sql[0].exist_customerid]
          );
        } else if (sql[0].exist_branchid != 0) {
          sql1 = await db.query1(
            `SELECT COUNT(*) AS branch_count, c.Customer_type,(SELECT COUNT(*) FROM customermaster WHERE customer_id IN  (SELECT customer_id FROM branchmaster WHERE branch_id = b.branch_id)) AS companycount FROM branchmaster b JOIN customermaster c ON b.customer_id = c.customer_id WHERE b.branch_id = ?`,
            [sql[0].exist_branchid]
          );
        }
        if (sql1[0].Customer_type == 1) {
          customertype = "Company";
        } else {
          customertype = "Organization";
        }
        companycount = sql1[0].companycount;
        sitecount = sql1[0].branch_count;
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

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function approveQuotation(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "APPROVE THE QUOTATION",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 10) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "APPROVE THE QUOTATION",
        secret
      );
    }

    // Validate session token
    const result = await db.query(`select secret from apikey where secret =?`, [
      sales.STOKEN,
    ]);
    if (result.length == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "APPROVE THE QUOTATION",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(sales.querystring, secret);
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
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "APPROVE THE QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("user_ip") || querydata.user_ip == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "User ip missing. Please provide the User ip",
        "APPROVE THE QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("timestamp") || querydata.timestamp == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "timestamp missing. Please provide the timestamp",
        "APPROVE THE QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("module") || querydata.module == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Module missing. Please provide the module",
        "APPROVE THE QUOTATION",
        secret
      );
    }
    if (querydata.module == "sales") {
      const sql = await db.query(
        `
    UPDATE salesprocesslist
    JOIN (
      SELECT processid FROM salesprocesslist WHERE cprocess_id = ?
    ) AS sp ON (
      salesprocesslist.processid = sp.processid
      AND salesprocesslist.process_type NOT IN (2, 3)
    ) OR salesprocesslist.cprocess_id = ? 
    SET 
      Approved_status = 1,
      user_ip = ?,
      Timestamp = ? Where Approved_status = 2;
  `,
        [
          querydata.eventid,
          querydata.eventid,
          querydata.user_ip,
          querydata.timestamp,
        ]
      );
      const sql1 = await db.query(
        `UPDATE salesprocesslist JOIN (SELECT processid FROM salesprocesslist WHERE cprocess_id = ?) AS sub ON salesprocesslist.processid = sub.processid
        SET Approved_status = 1 WHERE salesprocesslist.process_type NOT IN (2, 3);`,
        [querydata.eventid]
      );
      var processid;
      const sql2 = await db.query(
        `SELECT processid FROM salesprocesslist WHERE cprocess_id = ?`,
        [querydata.eventid]
      );
      if (sql2.length > 0) {
        processid = sql2.processid;
      }
      if (sql.affectedRows > 0) {
        await mqttclient.publishMqttMessage(
          "refresh",
          "Sales Quotation approved for the process id " + processid
        );
        await mqttclient.publishMqttMessage(
          "Notification",
          "Sales Quotation approved for the process id " + processid
        );
        return helper.getSuccessResponse(
          true,
          "success",
          "Approved Successfully",
          processid,
          secret
        );
      } else {
        return helper.getSuccessResponse(
          false,
          "error",
          "Action has already been taken for this quotation.",
          querydata.eventid,
          secret
        );
      }
    } else if (querydata.module == "subscription") {
      const sql = await db.query(
        `
    UPDATE subscriptionprocesslist
    JOIN (
      SELECT processid FROM subscriptionprocesslist WHERE sprocess_id = ?
    ) AS sp ON (
      subscriptionprocesslist.processid = sp.processid
      AND subscriptionprocesslist.process_type NOT IN (2, 3)
    ) OR subscriptionprocesslist.sprocess_id = ? 
    SET 
      Approved_status = 1,
      user_ip = ?,
      Timestamp = ? Where Approved_status = 2;
  `,
        [
          querydata.eventid,
          querydata.eventid,
          querydata.user_ip,
          querydata.timestamp,
        ]
      );
      const sql1 = await db.query(
        `UPDATE subscriptionprocesslist JOIN (SELECT processid FROM subscriptionprocesslist WHERE sprocess_id = ?) AS sub ON subscriptionprocesslist.processid = sub.processid
        SET Approved_status = 1 WHERE subscriptionprocesslist.process_type NOT IN (2, 3);`,
        [querydata.eventid]
      );
      var processid;
      const sql2 = await db.query(
        `SELECT processid FROM subscriptionprocesslist WHERE sprocess_id = ?`,
        [querydata.eventid]
      );
      if (sql2.length > 0) {
        processid = sql2.processid;
      }
      if (sql.affectedRows > 0) {
        await mqttclient.publishMqttMessage(
          "refresh",
          "Sales Quotation approved for the process id " + processid
        );
        await mqttclient.publishMqttMessage(
          "Notification",
          "Sales Quotation approved for the process id " + processid
        );
        return helper.getSuccessResponse(
          true,
          "success",
          "Approved Successfully",
          processid,
          secret
        );
      } else {
        return helper.getSuccessResponse(
          false,
          "error",
          "Action has already been taken for this quotation.",
          querydata.eventid,
          secret
        );
      }
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
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function rejectQuotation(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "REJECT QUOTATION",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 10) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "REJECT QUOTATION",
        secret
      );
    }

    // Validate session token
    const result = await db.query(`select secret from apikey where secret =?`, [
      sales.STOKEN,
    ]);
    if (result.length == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "REJECT QUOTATION",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "REJECT QUOTATION",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "REJECT QUOTATION",
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
        "REJECT QUOTATION",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing. Please provide the event id",
        "REJECT QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("reason") || querydata.reason == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Reason missing. Please provide the reason",
        "REJECT QUOTATION",
        secret
      );
    }
    if (!querydata.hasOwnProperty("module") || querydata.module == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Module missing. Please provide the module",
        "REJECT QUOTATION",
        secret
      );
    }
    if (querydata.module == "sales") {
      const sql = await db.query(
        `UPDATE salesprocesslist
         JOIN (
           SELECT processid FROM salesprocesslist WHERE cprocess_id = ?
         ) AS sp ON (
           salesprocesslist.processid = sp.processid AND salesprocesslist.process_type NOT IN (2, 3)
         )
         OR salesprocesslist.cprocess_id = ? 
         SET 
           Approved_status = 3,
           Rejected_reason = ? Where Approved_status = 2;;`,
        [querydata.eventid, querydata.eventid, querydata.reason]
      );
      const sql1 = await db.query(
        `UPDATE salesprocesslist JOIN (SELECT processid FROM salesprocesslist WHERE cprocess_id = 132) AS sub ON salesprocesslist.processid = sub.processid
        SET Approved_status = 3 WHERE salesprocesslist.process_type NOT IN (2, 3);`,
        [querydata.eventid]
      );
      var processid;
      const sql2 = await db.query(
        `SELECT processid FROM salesprocesslist WHERE cprocess_id = ?`,
        [querydata.eventid]
      );
      if (sql2.length > 0) {
        processid = sql2[0].processid;
      }
      if (sql.affectedRows > 0) {
        await mqttclient.publishMqttMessage(
          "refresh",
          "Sales Quotation Rejected for the process id " + processid
        );
        await mqttclient.publishMqttMessage(
          "Notification",
          "Sales Quotation Rejected for the process id " + processid
        );
        return helper.getSuccessResponse(
          true,
          "success",
          "Rejected Successfully",
          querydata.eventid,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Action has already been taken for this quotation.",
          querydata.eventid,
          secret
        );
      }
    } else if (querydata.module == "subscription") {
      const sql = await db.query(
        `UPDATE subscriptionprocesslist
         JOIN (
           SELECT processid FROM subscriptionprocesslist WHERE sprocess_id = ?
         ) AS sp ON (
          subscriptionprocesslist.processid = sp.processid AND subscriptionprocesslist.process_type NOT IN (2, 3)
         )
         OR subscriptionprocesslist.sprocess_id = ? 
         SET 
           Approved_status = 3,
           Rejected_reason = ? Where Approved_status = 2;;`,
        [querydata.eventid, querydata.eventid, querydata.reason]
      );
      const sql1 = await db.query(
        `UPDATE subscriptionprocesslist JOIN (SELECT processid FROM subscriptionprocesslist WHERE sprocess_id = ?) AS sub ON subscriptionprocesslist.processid = sub.processid
        SET Approved_status = 3 WHERE subscriptionprocesslist.process_type NOT IN (2, 3);`,
        [querydata.eventid]
      );
      var processid;
      const sql2 = await db.query(
        `SELECT processid FROM subscriptionprocesslist WHERE sprocess_id = ?`,
        [querydata.eventid]
      );
      if (sql2.length > 0) {
        processid = sql2[0].processid;
      }
      if (sql.affectedRows > 0) {
        await mqttclient.publishMqttMessage(
          "refresh",
          "Sales Quotation Rejected for the process id " + processid
        );
        await mqttclient.publishMqttMessage(
          "Notification",
          "Sales Quotation Rejected for the process id " + processid
        );
        return helper.getSuccessResponse(
          true,
          "success",
          "Rejected Successfully",
          querydata.eventid,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Action has already been taken for this quotation.",
          querydata.eventid,
          secret
        );
      }
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

//#############################################################################################################################################################################################
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function QuotationApproval(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "APPROVE THE QUOTATION",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 10) {
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
      [sales.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "APPROVE THE QUOTATION"
      );
    }
    // Validate required fields
    if (
      !sales.hasOwnProperty("quoteid") ||
      sales.quoteid == 0 ||
      sales.quoteid == undefined
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Quotation id missing. Please provide the quotation id",
        "APPROVE THE QUOTATION"
      );
    }
    if (!sales.hasOwnProperty("s") || sales.s == 0 || sales.s == undefined) {
      return helper.getErrorResponse(
        false,
        "error",
        "Link Invalid. Please try again",
        "APPROVE THE QUOTATION"
      );
    }
    const sql = await db.query(
      `UPDATE salesprocesslist set Approved_status = ${sales.s} where cprocess_id = ?`,
      [sales.quoteid]
    );
    if (sales.s == 1) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Quotation Approved Successfully",
        { quoteid: sales.quoteid }
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Quotation rejected Successfully",
        { quoteid: sales.quoteid }
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal Error. Please contact Administration",
      er.message
    );
  }
}
// async function QuotationApproval(req, res) {
//   try {
//     let sales = req.query;

//     // Path to HTML files
//     const htmlPath = path.resolve(__dirname, "..", "htmlresponse");

//     // Check if the session token exists
//     if (!sales.hasOwnProperty("STOKEN")) {
//       return res.sendFile(path.join(htmlPath, "error.html"));
//     }

//     var secret = sales.STOKEN.substring(0, 16);

//     // Validate session token length
//     if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
//       return res.sendFile(path.join(htmlPath, "invalid_token.html"));
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
//       [sales.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return res.sendFile(path.join(htmlPath, "invalid_token.html"));
//     }
//     // Validate required fields
//     if (!sales.hasOwnProperty("quoteid") || !sales.quoteid) {
//       return res.sendFile(path.join(htmlPath, "missing_quoteid.html"));
//     }

//     if (!sales.hasOwnProperty("s") || sales.s == 0 || sales.s == undefined) {
//       return res.sendFile(path.join(htmlPath, "internal_error.html"));
//     }

//     if (
//       !sales.hasOwnProperty("feedback") ||
//       sales.feedback == "" ||
//       sales.feedback == undefined
//     ) {
//       return res.sendFile(path.join(htmlPath, "internal_error.html"));
//     }

//     // Update the database
//     await db.query(
//       `UPDATE salesprocesslist SET Approved_status = ? WHERE cprocess_id = ?`,
//       [sales.s, sales.quoteid]
//     );

//     // Send the correct HTML file
//     if (sales.s == 1) {
//       const sql = await db.query(
//         `select emailid,ccemail,clientname,phoneno,feedback,message_type,pdf_path from quotation_mailbox where status = 1 and process_id = ${sales.quoteid} LIMIT 1 `
//       );
//       if (sql[0]) {
//         const promises = [];
//         const phoneNumbers = sql[0].phoneno
//           ? sql[0].phoneno
//               .split(",")
//               .map((num) => num.trim())
//               .filter((num) => num !== "") // Removes empty values
//           : [];
//         // Send Email or WhatsApp Message
//         if (sql[0].message_type === 1) {
//           // Send only email
//           EmailSent = await mailer.sendQuotation(
//             sql[0].clientname,
//             sql[0].emailid,
//             "Your Quotation from Sporada Secure India Private Limited",
//             "quotationpdf.html",
//             ``,
//             "QUOTATION_PDF_SEND",
//             sql[0].pdf_path,
//             sql[0].feedback,
//             sql[0].ccemail
//           );
//         } else if (sql[0].message_type === 2) {
//           // Send only WhatsApp
//           WhatsappSent = await Promise.all(
//             phoneNumbers.map(async (number) => {
//               try {
//                 const response = await axios.post(
//                   `${config.whatsappip}/billing/sendpdf`,
//                   {
//                     phoneno: number,
//                     feedback: sql[0].feedback,
//                     pdfpath: sql[0].pdf_path,
//                   }
//                 );
//                 return response.data.code;
//               } catch (error) {
//                 console.error(`WhatsApp Error for ${number}:`, error.message);
//                 return false;
//               }
//             })
//           );
//         } else if (sql[0].message_type === 3) {
//           // Send both email & WhatsApp in parallel
//           promises.push(
//             mailer.sendQuotation(
//               sql[0].clientname,
//               sql[0].emailid,
//               "Your Quotation from Sporada Secure India Private Limited",
//               "quotationpdf.html",
//               ``,
//               "QUOTATION_PDF_SEND",
//               sql[0].pdf_path,
//               sql[0].feedback,
//               sql[0].ccemail
//             )
//           );

//           promises.push(
//             Promise.all(
//               phoneNumbers.map(async (number) => {
//                 try {
//                   const response = await axios.post(
//                     `${config.whatsappip}/billing/sendpdf`,
//                     {
//                       phoneno: number,
//                       feedback: sql[0].feedback,
//                       pdfpath: sql[0].pdf_path,
//                     }
//                   );
//                   return response.data.code;
//                 } catch (error) {
//                   console.error(`WhatsApp Error for ${number}:`, error.message);
//                   return false;
//                 }
//               })
//             ).then((results) => (WhatsappSent = results))
//           );

//           // Run both requests in parallel and wait for completion
//           [EmailSent] = await Promise.all(promises);
//         }
//       }
//       await mqttclient.publishMqttMessage(
//         "refresh",
//         "Quotation approved for the process id " + sales.quoteid
//       );
//       await mqttclient.publishMqttMessage(
//         "Notification",
//         "Quotation approved for the process id " + sales.quoteid
//       );
//       return res.sendFile(path.join(htmlPath, "approved.html"));
//     } else {
//       await mqttclient.publishMqttMessage(
//         "Notification",
//         "Quotation Rejected for the process id " + sales.quoteid
//       );
//       return res.sendFile(path.join(htmlPath, "rejected.html"));
//     }
//   } catch (er) {
//     // await mqttclient.publishMqttMessage(
//     //   "Configuration",
//     //   "Error in the quotation approval process " + sales.quoteid
//     // );
//     return res.sendFile(
//       path.join(__dirname, "..", "htmlresponse", "internal_error.html")
//     );
//   }
// }

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function IntQuotationApproval(req, res) {
  try {
    let sales = req.query;

    // Path to HTML files
    const htmlPath = path.resolve(__dirname, "..", "htmlresponse");

    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return res.sendFile(path.join(htmlPath, "error.html"));
    }

    // var secret = sales.STOKEN.substring(0, 16);

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 10) {
      return res.sendFile(path.join(htmlPath, "invalid_token.html"));
    }

    // Validate session token
    const result = await db.query(`select secret from apikey where secret =?`, [
      sales.STOKEN,
    ]);

    if (result.length == 0) {
      return res.sendFile(path.join(htmlPath, "invalid_token.html"));
    }
    // Validate required fields
    if (!sales.hasOwnProperty("quoteid") || !sales.quoteid) {
      return res.sendFile(path.join(htmlPath, "missing_quoteid.html"));
    }

    if (!sales.hasOwnProperty("s") || sales.s == 0 || sales.s == undefined) {
      return res.sendFile(path.join(htmlPath, "internal_error.html"));
    }

    var sql1;
    const sql3 = await db.query(
      `select cprocess_id from salesprocesslist where status = 1 and cprocess_id = ? and cprocess_id  = (select cprocess_id from salesprocesslist where process_type IN(2,3) and
      processid = (select processid from salesprocesslist where cprocess_id = ? Order by processid) Order by cprocess_id DESC LIMIT 1)`,
      [sales.quoteid, sales.quoteid]
    );
    if (sql3.length == 0) {
      return res.sendFile(path.join(htmlPath, "quotation_invalid.html"));
    }
    // Update the database
    if (sales.s == 1) {
      sql1 = await db.query(
        `UPDATE salesprocesslist SET Internal_approval = ?,Approved_status = ? WHERE cprocess_id = ? and Internal_approval = 2`,
        [sales.s, 2, sales.quoteid]
      );
    } else {
      sql1 = await db.query(
        `UPDATE salesprocesslist SET Internal_approval = ? WHERE cprocess_id = ? and Internal_approval = 2`,
        [sales.s, sales.quoteid]
      );
    }
    const sql = await db.query(
      `SELECT q.emailid, q.ccemail, q.clientname, q.phoneno, q.feedback,q.message_type, q.pdf_path, a.secret FROM quotation_mailbox q CROSS JOIN apikey a
      WHERE q.status = 1 AND q.process_id = ? AND a.status = 1;`,
      [sales.quoteid]
    );
    const link = `${apiserver1}?eventid=${sales.quoteid}&STOKEN=${sql[0].secret}&module=sales`;
    const feedbackMessage =
      "If you want to proceed with the quotation, please click the following link: " +
      link;
    // Send the correct HTML file
    if (sql1.affectedRows) {
      if (sales.s == 1) {
        // const sql = await db.query(
        //   `select emailid,ccemail,clientname,phoneno,feedback,message_type,pdf_path from quotation_mailbox where status = 1 and process_id = ${sales.quoteid} LIMIT 1 `
        // );
        if (sql[0]) {
          const promises = [];
          const phoneNumbers = sql[0].phoneno
            ? sql[0].phoneno
                .split(",")
                .map((num) => num.trim())
                .filter((num) => num !== "") // Removes empty values
            : [];
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
              `${apiserver1}?eventid=${sales.quoteid}&STOKEN=${sql[0].secret}&module=sales`,
              `${apiserver1}?eventid=${sales.quoteid}&STOKEN=${sql[0].secret}&module=sales`
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
                `${apiserver1}?eventid=${sales.quoteid}&STOKEN=${sql[0].secret}&module=sales`,
                `${apiserver1}?eventid=${sales.quoteid}&STOKEN=${sql[0].secret}&module=sales`
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
          "Quotation approved Internally for " + sql[0].clientname
        );
        await mqttclient.publishMqttMessage(
          "Notification",
          "Quotation approved Internally for " + sql[0].clientname
        );
        return res.sendFile(path.join(htmlPath, "approved.html"));
      } else {
        await mqttclient.publishMqttMessage(
          "Notification",
          "Quotation Rejected Internally for " + sql[0].clientname
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "Quotation Rejected Internally for " + sql[0].clientname
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

//#########################################################################################################################################################################################
//#########################################################################################################################################################################################
//#########################################################################################################################################################################################
//#########################################################################################################################################################################################

async function RejectSuggestion(sales) {
  try {
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "REJECT THE SUGGESTION",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 10) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "REJECT THE SUGGESTION",
        secret
      );
    }

    // Validate session token
    const result = await db.query(`select secret from apikey where secret =?`, [
      sales.STOKEN,
    ]);

    if (result.length == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "REJECT THE SUGGESTION",
        secret
      );
    }
    // Update the database
    const sql = await db.query(`select * from rejectsugest where status = 1;`);

    // Send the correct HTML file
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Reason Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Reason Fetched Successfully",
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

//###########################################################################################################################################################################################
//############################################################################################################################################################################################
//#############################################################################################################################################################################################
//############################################################################################################################################################################################

async function GetCustomPDF(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 30) {
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
      [sales.STOKEN]
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
      `select custom_id custompdfid,customeraddress_name,customeraddress,billing_address,billingaddress_name,customer_mailid,customer_phoneno,customer_gstno,add_date date,custom_type,gen_id,pdf_path,pdf_path path from custompdfmaster where status = 1 order by Row_updated_date DESC`
    );
    var data;
    if (sql.length > 0) {
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

//##########################################################################################################################################################################################
//############################################################################################################################################################################################
//#############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function getQuotationDetails(sales) {
  try {
    // Check if the session token exists
    if (!sales.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF AND QUOTATION DETAILS",
        ""
      );
    }
    var secret = sales.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 15) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET BINARY DATA FOR PDF AND QUOTATION DETAILS",
        secret
      );
    }

    // Validate session token
    const result = await db.query(`select secret from apikey where secret =?`, [
      sales.STOKEN,
    ]);

    if (result.length == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET BINARY DATA FOR PDF AND QUOTATION DETAILS",
        secret
      );
    }
    // Check if querystring is provided
    if (!sales.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET BINARY DATA FOR PDF AND QUOTATION DETAILS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET BINARY DATA FOR PDF AND QUOTATION DETAILS",
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
        "GET BINARY DATA FOR PDF AND QUOTATION DETAILS",
        secret
      );
    }
    if (
      querydata.hasOwnProperty("eventid") == false ||
      querydata.eventid == 0 ||
      querydata.eventid == null
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Event id missing",
        "Get Quotation",
        secret
      );
    }
    if (
      querydata.hasOwnProperty("module") == false ||
      querydata.module == 0 ||
      querydata.module == null
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Module missing",
        "Get Quotation",
        secret
      );
    }
    if (querydata.module == "sales") {
      const sql = await db.query(
        `select custsales_name,salesprocess_path pdfpath,DATE_FORMAT(salesprocess_date, '%Y-%m-%d') AS salesprocess_date,salesprocess_path pdf_path,
      cprocess_gene_id quotation_id, 'Sporada Secure India Private Limited' AS mailed_by,'alerts@sporadasecure.com' AS mail_from
      from salesprocesslist where status = 1 and cprocess_id = ? and cprocess_id = (select cprocess_id from salesprocesslist where process_type IN(2,3) and
      processid = (select processid from salesprocesslist where cprocess_id = ? Order by processid) Order by cprocess_id DESC LIMIT 1)`,
        [querydata.eventid, querydata.eventid]
      );
      var data;
      if (sql.length > 0) {
        for (let i = 0; i < sql.length; i++) {
          // Ensure file exists
          if (!fs.existsSync(sql[i].pdf_path)) {
            return helper.getErrorResponse(
              false,
              "error",
              "File does not exist",
              "GET BINARY DATA FOR PDF AND QUOTATION DETAILS",
              secret
            );
          }
          // for (let i = 0; i < sql.length; i++) {
          binarydata = await helper.convertFileToBinary(sql[i].pdf_path);
          sql[i].pdf_path = binarydata;
        }

        return helper.getSuccessResponse(
          true,
          "success",
          "Quotation Details Fetched Successfully",
          sql[0],
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Session expired.",
          sql,
          secret
        );
      }
    } else if (querydata.module == "subscription") {
      const sql = await db.query(
        `select custsubs_name custsales_name,subsprocess_path pdfpath,DATE_FORMAT(subsprocess_date, '%Y-%m-%d') AS salesprocess_date,subsprocess_path pdf_path,
      sprocess_gene_id quotation_id, 'Sporada Secure India Private Limited' AS mailed_by,'alerts@sporadasecure.com' AS mail_from
      from subscriptionprocesslist where status = 1 and sprocess_id = ? and sprocess_id = (select sprocess_id from subscriptionprocesslist where process_type IN(2,3) and
      processid = (select processid from subscriptionprocesslist where sprocess_id = ? Order by processid) Order by sprocess_id DESC LIMIT 1)`,
        [querydata.eventid, querydata.eventid]
      );
      var data;
      if (sql.length > 0) {
        for (let i = 0; i < sql.length; i++) {
          // Ensure file exists
          if (!fs.existsSync(sql[i].pdf_path)) {
            return helper.getErrorResponse(
              false,
              "error",
              "File does not exist",
              "GET BINARY DATA FOR PDF AND QUOTATION DETAILS",
              secret
            );
          }
          // for (let i = 0; i < sql.length; i++) {
          binarydata = await helper.convertFileToBinary(sql[i].pdf_path);
          sql[i].pdf_path = binarydata;
        }

        return helper.getSuccessResponse(
          true,
          "success",
          "Quotation Details Fetched Successfully",
          sql[0],
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Session expired.",
          sql,
          secret
        );
      }
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
async function ClientSendPdf(sales) {
  try {
    var secret;

    // Check if the session token exists
    if (!sales.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "SEND PDF",
        ""
      );
    }
    secret = sales.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (sales.STOKEN.length > 50 || sales.STOKEN.length < 10) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "SEND PDF",
        secret
      );
    }

    // Validate session token
    const result = await db.query(`select secret from apikey where secret =?`, [
      sales.STOKEN,
    ]);

    if (result.length == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "SEND PDF",
        secret
      );
    }

    // Check if querystring is provided
    if (!sales.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "SEND PDF",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(sales.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "SEND PDF",
        secret
      );
      0;
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "SEND PDF",
        secret
      );
    }
    if (!querydata.hasOwnProperty("pdfpath")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Pdf path missing. Please provide the Pdf Path",
        "SEND PDF",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the Feedback.",
        "SEND PDF",
        secret
      );
    }
    if (!querydata.hasOwnProperty("ccemail")) {
      return helper.getErrorResponse(
        false,
        "error",
        "CC Email id missing. Please provide the CC Email id",
        "SEND PDF",
        secret
      );
    }
    if (!querydata.hasOwnProperty("emailid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Email id missing. Please provide the Email id",
        "SEND PDF",
        secret
      );
    }

    if (!querydata.hasOwnProperty("phoneno")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Contact number missing. Please provide the contact number.",
        "SEND PDF",
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
        "SEND PDF",
        secret
      );
    }
    const promises = [];
    var EmailSent = 0,
      WhatsappSent = 0;
    const phoneNumbers = querydata.phoneno
      ? querydata.phoneno
          .split(",")
          .map((num) => num.trim())
          .filter((num) => num !== "") // Removes empty values
      : [];
    // Send Email or WhatsApp Message
    if (querydata.messagetype === 1) {
      // Send only email
      EmailSent = await mailer.sendQuotation(
        "",
        querydata.emailid,
        "PDF from Sporada Secure India Private Limited",
        "sendpdf.html",
        ``,
        "SENDPDF",
        querydata.pdfpath,
        querydata.feedback,
        querydata.ccemail
      );
    } else if (querydata.messagetype === 2) {
      // Send only WhatsApp
      WhatsappSent = await Promise.all(
        phoneNumbers.map(async (number) => {
          try {
            const response = await axios.post(
              `${config.whatsappip}/billing/sendpdf`,
              {
                phoneno: number,
                feedback: querydata.feedback,
                pdfpath: querydata.pdfpath,
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
        mailer.sendQuotation(
          "",
          querydata.emailid,
          "PDF from Sporada Secure India Private Limited",
          "sendpdf.html",
          ``,
          "SENDPDF",
          querydata.pdfpath,
          querydata.feedback,
          querydata.ccemail
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
                  pdfpath: querydata.pdfpath,
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
    return helper.getSuccessResponse(
      true,
      "success",
      "Pdf send successfully",
      {
        WhatsappSent: WhatsappSent,
        EmailSent: EmailSent,
      },
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
  addsale,
  UpdateenqCustomer,
  uploadMor,
  addInvoice,
  addProformaInvoice,
  addCustomInvoice,
  uploadCustomerReq,
  uploadQuotatation,
  uploadDeliveryChallan,
  uploadRFQ,
  getProcesslist,
  AddSalesProcess,
  AddProcessList,
  UpdateSalesProcess,
  UpdateProcessList,
  detailsPreLoader,
  GetProcessShow,
  GetProcessCustomer,
  GetCustomerList,
  GetCustomerDetails,
  getDeliveryChalnId,
  getRequestforQuotationId,
  getCusReq,
  getQuotationId,
  getInvoiceId,
  addQuotation,
  addCustomQuotation,
  SendPdf,
  addDeliveryChallan,
  addCustomDeliveryChallan,
  addFeedback,
  getBinaryFile,
  getCustomBinaryfile,
  DeleteProcess,
  ArchiveProcess,
  addRFQ,
  addRevisedQuotation,
  addCreditNote,
  addDebitNote,
  getProducts,
  getNotes,
  salesData,
  clientProfile,
  approveQuotation,
  rejectQuotation,
  QuotationApproval,
  IntQuotationApproval,
  RejectSuggestion,
  GetCustomPDF,
  getQuotationDetails,
  ClientSendPdf,
};
