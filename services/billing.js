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
const { el } = require("date-fns/locale");

//###############################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################

// async function getSubscriptionInvoice(billing) {
//   try {
//     if (!billing.STOKEN) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token missing. Please provide the Login session token",
//         "FETCH SUBSCRIPTION INVOICE",
//         ""
//       );
//     }
//     secret = billing.STOKEN.substring(0, 16);
//     var querydata;

//     // Validate session token length
//     if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token size invalid. Please provide the valid Session token",
//         "FETCH SUBSCRIPTION INVOICE",
//         secret
//       );
//     }

//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
//       [billing.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "FETCH SUBSCRIPTION INVOICE",
//         secret
//       );
//     }
//     var sql = [];
//     // Check if querystring is provided
//     if (!billing.querystring) {
//       sql = await db.query(
//         `select sbg.subscription_generatedid recurredbillid,sbm.subscription_billid,sbm.site_Ids,sbm.client_addressname,sbm.client_address,sbm.billing_addressname,sbm.billing_address
//         ,sbg.pdf_path pdf_data,sbg.Invoice_no,sbg.TotalAmount,sbm.email_id,sbg.phone_no,sbg.ccemail,sbm.bill_date date,sbm.customer_GST gstnumber,DATE_FORMAT(cvm.Due_date, '%Y-%m-%d %H:%i:%s') AS Due_date,sbm.hsn_code,sbm.plantype,sbm.billmode,sbg.payment_status,sbm.pendingPayments,sbm.plan_name,cvm.voucher_id,cvm.voucher_number,CASE WHEN cvm.fully_cleared = 1 THEN NULL WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
//         , cvm.Overdue_days as Overdue_history from subscriptionbillmaster sbm JOIN subscriptionbillgenerated sbg ON sbm.subscription_billid = sbg.subscription_billid JOIN clientvouchermaster cvm ON cvm.invoice_number = sbg.Invoice_no where sbm.Email_sent = 1 and sbm.status = 1`
//       );
//     } else {
//       // Decrypt querystring
//       try {
//         querydata = await helper.decrypt(billing.querystring, secret);
//       } catch (ex) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Querystring Invalid error. Please provide the valid querystring.",
//           "ADD RECURRING INVOICE",
//           secret
//         );
//       }

//       // Parse the decrypted querystring
//       try {
//         querydata = JSON.parse(querydata);
//       } catch (ex) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Querystring JSON error. Please provide valid JSON",
//           "ADD RECURRING INVOICE",
//           secret
//         );
//       }
//       var sqlParams = [];
//       let query = `select sbg.subscription_generatedid recurredbillid,sbm.subscription_billid,sbm.site_Ids,sbm.client_addressname,sbm.client_address,sbm.billing_addressname,sbm.billing_address
//     ,sbg.pdf_path pdf_data,sbg.Invoice_no,sbg.TotalAmount,sbm.email_id,sbg.phone_no,sbg.ccemail,sbm.bill_date date,sbm.customer_GST gstnumber,DATE_FORMAT(cvm.Due_date, '%Y-%m-%d %H:%i:%s') AS Due_date,sbm.hsn_code,sbm.plantype,sbm.billmode,sbg.payment_status,sbm.pendingPayments,sbm.plan_name,cvm.voucher_id,cvm.voucher_number,CASE WHEN cvm.fully_cleared = 1 THEN NULL WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
//     , cvm.Overdue_days as Overdue_history from subscriptionbillmaster sbm
//     JOIN subscriptionbillgenerated sbg ON sbm.subscription_billid = sbg.subscription_billid JOIN clientvouchermaster cvm ON cvm.invoice_number = sbg.Invoice_no where sbm.Email_sent = 1 and sbm.status = 1`;
//       if (
//         querydata.customerid != 0 &&
//         querydata.customerid != undefined &&
//         querydata.customerid != null
//       ) {
//         query += ` AND Processid in(select cprocess_id from salesprocessmaster where customer_id = ?)`;
//         sqlParams.push(querydata.customerid);
//       }
//       if (
//         querydata.startdate != null &&
//         querydata.startdata != 0 &&
//         querydata.startdate != undefined &&
//         querydata.enddate != null &&
//         querydata.enddate != 0 &&
//         querydata.enddate != undefined
//       ) {
//         query += ` AND salesprocess_date BETWEEN ? and ?`;
//         sqlParams.push(querydata.startdate, querydata.enddate);
//       }
//       if (
//         querydata.paymentstatus != null &&
//         querydata.paymentstatus != undefined
//       ) {
//         if (querydata.paymentstatus == 0) {
//           query += ` AND salesprocess_date BETWEEN ? and ?`;
//           sqlParams.push(querydata.startdate, querydata.enddate);
//         } else if (querydata.paymentstatus == 1) {
//           query += ` AND salesprocess_date BETWEEN ? and ?`;
//           sqlParams.push(querydata.startdate, querydata.enddate);
//         }
//       }
//       if (
//         querydata.duedays != null &&
//         querydata.duedays != undefined &&
//         querydata.duedays > 0
//       ) {
//         query += ` AND DATEDIFF(CURDATE(), sbm.Due_date) >= ?`;
//         sqlParams.push(querydata.duedays);
//       }
//       sql = await db.query(query, sqlParams);
//     }

//     if (sql.length > 0) {
//       return helper.getSuccessResponse(
//         true,
//         "success",
//         "The generated Recurring Invoice is successfully fetched.",
//         sql,
//         secret
//       );
//     } else {
//       return helper.getSuccessResponse(
//         true,
//         "success",
//         "The generated Recurring Invoice is successfully fetched.",
//         sql,
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

async function getSubscriptionInvoice(billing) {
  try {
    if (!billing.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "FETCH SUBSCRIPTION INVOICE",
        ""
      );
    }
    secret = billing.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH SUBSCRIPTION INVOICE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH SUBSCRIPTION INVOICE",
        secret
      );
    }
    var sql = [];
    // Check if querystring is provided
    if (!billing.querystring) {
      sql = await db.query(
        `select sbg.subscription_generatedid recurredbillid,sbm.subscription_billid,sbm.site_Ids,sbm.client_addressname,sbm.client_address,sbm.billing_addressname,sbm.billing_address
        ,sbg.pdf_path pdf_data,sbg.Invoice_no,sbg.TotalAmount,sbm.email_id,sbg.phone_no,sbg.ccemail,sbm.bill_date date,sbm.customer_GST gstnumber,sbm.Due_date,sbm.hsn_code,sbm.plantype,sbm.billmode,sbg.payment_status,sbm.pendingPayments,sbm.plan_name,cvm.voucher_id,cvm.voucher_number,CASE WHEN CURDATE() > sbm.Due_date THEN DATEDIFF(CURDATE(), sbm.Due_date) ELSE 0 END AS overdue_days,CASE WHEN CURDATE() > sbm.Due_date THEN 1 ELSE 0 END AS is_overdue from subscriptionbillmaster sbm JOIN subscriptionbillgenerated sbg ON sbm.subscription_billid = sbg.subscription_billid JOIN clientvouchermaster cvm ON cvm.invoice_number = sbg.Invoice_no where sbm.Email_sent = 1 and sbm.status = 1`
      );
    } else {
      // Decrypt querystring
      try {
        querydata = await helper.decrypt(billing.querystring, secret);
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
      var sqlParams = [];
      let query = `select sbg.subscription_generatedid recurredbillid,sbm.subscription_billid,sbm.site_Ids,sbm.client_addressname,sbm.client_address,sbm.billing_addressname,sbm.billing_address
    ,sbg.pdf_path pdf_data,sbg.Invoice_no,sbg.TotalAmount,sbm.email_id,sbg.phone_no,sbg.ccemail,sbm.bill_date date,sbm.customer_GST gstnumber,sbm.Due_date,sbm.hsn_code,sbm.plantype,sbm.billmode,sbg.payment_status,sbm.pendingPayments,sbm.plan_name,cvm.voucher_id,cvm.voucher_number,CASE WHEN CURDATE() > sbm.Due_date THEN DATEDIFF(CURDATE(), sbm.Due_date) ELSE 0 END AS overdue_days,CASE WHEN CURDATE() > sbm.Due_date THEN 1 ELSE 0 END AS is_overdue from subscriptionbillmaster sbm
    JOIN subscriptionbillgenerated sbg ON sbm.subscription_billid = sbg.subscription_billid JOIN clientvouchermaster cvm ON cvm.invoice_number = sbg.Invoice_no where sbm.Email_sent = 1 and sbm.status = 1`;
      if (
        querydata.customerid != 0 &&
        querydata.customerid != undefined &&
        querydata.customerid != null
      ) {
        query += ` AND cvm.customer_id = ?`;
        sqlParams.push(querydata.customerid);
      }
      if (
        querydata.plantype != null &&
        querydata.plantype != undefined &&
        querydata.plantype !== ""
      ) {
        query += ` AND LOWER(sbm.plantype) = LOWER(?)`;
        sqlParams.push(querydata.plantype);
      }

      // if (querydata.planname && querydata.planname.trim() !== "") {
      //   const planName = querydata.planname.trim();

      //   // Check if the plan name exists in DB
      //   const checkPlanQuery = `SELECT COUNT(*) as count FROM subscriptionbillmaster WHERE TRIM(plan_name) = ?`;
      //   const [checkResult] = await db.query(checkPlanQuery, [planName]);

      //   if (checkResult.count === 0) {
      //     // Plan name not found, throw error
      //     return helper.getErrorResponse(
      //       false,
      //       "error",
      //       "Plan doesn't exist or subscribed",
      //       "ADD RECURRING INVOICE",
      //       secret
      //     );
      //   }

      //   // Plan exists, add filter to main query
      //   query += ` AND sbm.plan_name = ?`;
      //   sqlParams.push(planName);
      // }
      if (
        querydata.startdate != null &&
        querydata.startdata != 0 &&
        querydata.startdate != undefined &&
        querydata.enddate != null &&
        querydata.enddate != 0 &&
        querydata.enddate != undefined
      ) {
        query += ` AND DATE(sbm.Row_updated_date) BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      }
      if (querydata.paymentstatus) {
        if (querydata.paymentstatus === "paid") {
          query += ` AND cvm.fully_cleared = 1`;
        } else if (querydata.paymentstatus === "partial") {
          query += ` AND cvm.fully_cleared = 0 AND cvm.partially_cleared = 1`;
        } else if (querydata.paymentstatus === "unpaid") {
          query += ` AND cvm.fully_cleared = 0 AND cvm.partially_cleared = 0`;
        }
      }

      // if (
      //   querydata.duedays != null &&
      //   querydata.duedays != undefined &&
      //   querydata.duedays > 0
      // ) {
      //   query += ` AND DATEDIFF(CURDATE(), sbm.Due_date) >= ?`;
      //   sqlParams.push(querydata.duedays);
      // }
      // console.log(query);
      sql = await db.query(query, sqlParams);
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

//###############################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################
//################################################################################################################################################################################################

async function getSalesInvoice(billing) {
  try {
    if (!billing.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "FETCH SALES INVOICE",
        ""
      );
    }
    secret = billing.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH SALES INVOICE",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH SALES INVOICE",
        secret
      );
    }
    var sql = [];
    // Check if querystring is provided
    if (!billing.querystring) {
      sql = await db.query(
        `select spl.cprocess_id event_id,spl.cprocess_gene_id invoicenumber,spl.custsales_name client_addressname, spl.client_address, spl.billingaddress_name billing_addressname,spl.billing_address,spl.gst_number gstnumber,spl.email_id,
        spl.phone_number phone_no, spl.ccemail, spl.invoice_amount, spl.processid,DATE_FORMAT(spl.salesprocess_date, '%Y-%m-%d %H:%i:%s') AS date,cvm.voucher_id,cvm.voucher_number,CASE WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
        , cvm.Overdue_days as Overdue_history,cvm.Due_date,spl.payment_status,spl.paid_amount from
        salesprocesslist spl JOIN clientvouchermaster cvm ON cvm.invoice_number = spl.cprocess_gene_id where spl.process_type = 4 and spl.status = 1;`
      );
    } else {
      // Decrypt querystring
      try {
        querydata = await helper.decrypt(billing.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "ADD SALES INVOICE",
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
          "ADD SALES INVOICE",
          secret
        );
      }
      var sqlParams = [];
      let query = `select spl.cprocess_id event_id,spl.cprocess_gene_id invoicenumber,spl.custsales_name client_addressname, spl.client_address, spl.billingaddress_name billing_addressname,spl.billing_address,spl.gst_number gstnumber,spl.email_id,spl.payment_status,
      spl.phone_number, spl.ccemail, spl.invoice_amount, spl.processid,spl.salesprocess_date date,cvm.voucher_id,cvm.voucher_number,CASE WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
      , cvm.Overdue_days as Overdue_history,cvm.Due_date  from
      salesprocesslist spl JOIN clientvouchermaster cvm ON cvm.invoice_number = spl.cprocess_gene_id where spl.process_type = 4 and spl.status = 1`;

      if (
        querydata.customerid != 0 &&
        querydata.customerid != undefined &&
        querydata.customerid != null
      ) {
        query += ` AND spl.Processid in(select cprocess_id from salesprocessmaster where customer_id = ?)`;
        sqlParams.push(querydata.customerid);
      } else if (
        querydata.startdate != null &&
        querydata.startdata != 0 &&
        querydata.startdate != undefined &&
        querydata.enddate != null &&
        querydata.enddate != 0 &&
        querydata.enddate != undefined
      ) {
        query += ` AND spl.salesprocess_date BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      } else if (querydata.paymentstatus) {
        if (querydata.paymentstatus === "paid") {
          query += ` AND cvm.fully_cleared = 1`;
        } else if (querydata.paymentstatus === "partial") {
          query += ` AND cvm.fully_cleared = 0 AND cvm.partially_cleared = 1`;
        } else if (querydata.paymentstatus === "unpaid") {
          query += ` AND cvm.fully_cleared = 0 AND cvm.partially_cleared = 0`;
        }
      }
      sql = await db.query(query, sqlParams);
    }

    if (sql.length > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "The Sales invoice is successfully fetched.",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "The Sales Invoice is successfully fetched.",
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
    if (
      !querydata.hasOwnProperty("recurredbillid") ||
      querydata.recurredbillid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Recurred bill id missing. Please provide the Recurred bill",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select pdf_path from subscriptionbillgenerated where subscription_generatedid = ?`,
      [querydata.recurredbillid]
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

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getTransactionFile(subscription) {
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
      !querydata.hasOwnProperty("transactionid") ||
      querydata.transactionid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Transaction id missing. Please provide the transaction id",
        "GET BINARY DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select file_path from vouchertransactions where vouchertrans_id = ?`,
      [querydata.transactionid]
    );
    var data;
    if (sql[0]) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].file_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].file_path);
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
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getVouchers(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET VOUCHERS",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET VOUCHERS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET VOUCHERS",
        secret
      );
    }
    var sql,
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT voucher_id,invoice_number,voucher_type,email_id,phone_number,client_name,client_address, pending_amount,fully_cleared,partially_cleared,gstnumber,Total_amount,sub_total,
      IGST,CGST,SGST,voucher_number,invoice_type,customer_id,CASE WHEN invoice_type IN ('sales', 'subscription') THEN 1 WHEN SUM(Total_amount) OVER (PARTITION BY customer_id, invoice_type) >= 100000 THEN 1 ELSE 0 END AS tds_calculation,ROUND(sub_total * 0.02, 2) AS tdscalculation_amount, payment_details, Description, DATE_FORMAT(DATE(Row_updated_date), '%Y-%m-%d %H:%i:%s') AS date, DATE_FORMAT(DATE(Due_date), '%Y-%m-%d %H:%i:%s') AS Due_date,CASE WHEN fully_cleared = 1 THEN NULL WHEN Due_date IS NULL OR DATEDIFF(CURDATE(), Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), Due_date) END AS Overdue_days
, Overdue_days as Overdue_history FROM clientvouchermaster WHERE status = 1`;
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET VOUCHERS",
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
        "GET VOUCHERS",
        secret
      );
    }

    sql = `SELECT voucher_id,invoice_number,voucher_type,email_id,phone_number,client_name,client_address, pending_amount,fully_cleared,partially_cleared,gstnumber,Total_amount,sub_total,
    IGST,CGST,SGST,voucher_number,invoice_type,customer_id,CASE WHEN invoice_type IN ('sales', 'subscription') THEN 1 WHEN SUM(Total_amount) OVER (PARTITION BY customer_id, invoice_type) >= 100000 THEN 1 ELSE 0 END AS tds_calculation,ROUND(sub_total * 0.02, 2) AS tdscalculation_amount, payment_details, Description, DATE_FORMAT(DATE(Row_updated_date), '%Y-%m-%d %H:%i:%s') AS date, DATE_FORMAT(DATE(Due_date), '%Y-%m-%d %H:%i:%s') AS Due_date,CASE WHEN fully_cleared = 1 THEN NULL WHEN Due_date IS NULL OR DATEDIFF(CURDATE(), Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), Due_date) END AS Overdue_days
, Overdue_days as Overdue_history FROM clientvouchermaster WHERE status = 1`;

    if (
      querydata.vouchernumber != null &&
      querydata.vouchernumber != 0 &&
      querydata.vouchernumber != undefined
    ) {
      sql += ` and voucher_number = ?`;
      sqlParams.push(querydata.vouchernumber);
    }
    if (
      querydata.voucherid != null &&
      querydata.voucherid != 0 &&
      querydata.voucherid != undefined
    ) {
      sql += ` and voucher_id = ?`;
      sqlParams.push(querydata.voucherid);
    }
    if (
      querydata.vouchertype != null &&
      querydata.vouchertype != 0 &&
      querydata.vouchertype != undefined
    ) {
      if (querydata.vouchertype == "payment") {
        sql += ` and voucher_type LIKE '%payment%'`;
      } else if (querydata.vouchertype == "receipt") {
        sql += ` and voucher_type LIKE '%receipt%'`;
      } else {
        sql += ` and voucher_type LIKE '%consolidate%'`;
      }
    }
    if (
      querydata.paymentstatus != null &&
      querydata.paymentstatus != 0 &&
      querydata.paymentstatus != undefined
    ) {
      if (querydata.paymentstatus == "partial") {
        sql += ` and partially_cleared = 1 AND fully_cleared = 0`;
      } else if (querydata.paymentstatus == "paid") {
        sql += ` and partially_cleared = 0 AND fully_cleared = 1`;
      } else if (querydata.paymentstatus == "unpaid") {
        sql += ` and partially_cleared = 0 AND fully_cleared = 0`;
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and invoice_type like '%sales%'`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and invoice_type like '%subscription%'`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and invoice_type like '%vendor%'`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and customer_id = ?`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      if (querydata.startdate == querydata.enddate) {
        sql += ` and DATE(Row_updated_date) = ?`;
        sqlParams.push(querydata.enddate);
      } else {
        sql += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      }
    }

    // console.log(sql);
    var query = await db.query(sql, sqlParams);
    // if (query[0] && Array.isArray(query)) {
    //   query = query.map((row) => {
    //     if (row.invoice_type == "sales" || row.invoice_type == "subscription") {
    //       row.tds_calculation = 1;
    //     }
    //     return row;
    //   });
    // }

    if (query.length > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Vouchers fetched Successfully",
        query,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Vouchers fetched Successfully",
        query,
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
//#####
async function ClearVouchers(req, res) {
  let secret, querydata, billing;
  try {
    try {
      await uploadFile.uploadVoucher(req, res);
      billing = req.body;
      // Check if the session token exists
      if (!billing.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken missing. Please provide the Login sessiontoken",
          "CLEAR VOUCHERS",
          ""
        );
      }
      secret = billing.STOKEN.substring(0, 16);
      querydata;
      // Validate session token length
      if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
          "CLEAR VOUCHERS",
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
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "CLEAR VOUCHERS",
        secret
      );
    }
    // Check if querystring is provided
    if (!billing.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "CLEAR VOUCHERS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CLEAR VOUCHERS",
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
        "CLEAR VOUCHERS",
        secret
      );
    }
    const requiredFields = [
      { field: "voucherid", message: "Voucher id missing." },
      { field: "vouchernumber", message: "Voucher number missing." },
      { field: "paymentstatus", message: "Payment status missing." },
      { field: "IGST", message: "IGST missing." },
      { field: "SGST", message: "SGST missing." },
      { field: "CGST", message: "CGST missing." },
      { field: "tds", message: "tds deductions missing." },
      {
        field: "grossamount",
        message: "totalamount missing.",
      },
      {
        field: "subtotal",
        message: "Sub total missing.",
      },
      { field: "date", message: "Date missing" },
      { field: "paidamount", message: "Paid amount missing." },
      { field: "clientaddressname", message: "Client address name missing." },
      { field: "clientaddress", message: "Client address missing." },
      { field: "invoicenumber", message: "Invoice number missing." },
      { field: "emailid", message: "Email id missing." },
      { field: "phoneno", message: "Phone no missing." },
      { field: "tdsstatus", message: "TDS status missing." },
      { field: "invoicetype", message: "Invoice type missing." },
      { field: "gstnumber", message: "GST number missing." },
      { field: "feedback", message: "Feedback type missing." },
      { field: "transactiondetails", message: "Transaction details missing." },
      { field: "paymentmode", message: "Payment mode missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "CLEAR VOUCHERS",
          secret
        );
      }
    }
    let totalamount = querydata.grossamount || 0;
    let subtotal = querydata.subtotal || 0;
    let IGST = querydata.IGST || 0;
    let CGST = querydata.CGST || 0;
    let SGST = querydata.SGST || 0;
    let tdsamount = 0;
    let partially = 0;
    var paymentdetails = null;
    var description = null;
    var transactionid = 0;
    try {
      var path = null;
      var receipt_path = null;
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
          if (file && file.originalname) {
            const fileNameLower = file.originalname.toLowerCase();

            if (fileNameLower.includes("receipt")) {
              receipt_path = file.path;
            } else {
              path = file.path;
            }
          }
        });
      }
      if (req.file) {
        const fileNameLower = req.file.originalname.toLowerCase();
        if (fileNameLower.includes("receipt")) {
          receipt_path = req.file.path;
        } else {
          path = req.file.path;
        }
      }
      if (req.files) {
        Object.values(req.files).forEach((fileArray) => {
          fileArray.forEach((file) => {
            if (file && file.originalname) {
              const fileNameLower = file.originalname.toLowerCase();

              if (fileNameLower.includes("receipt")) {
                receipt_path = file.path;
              } else {
                path = file.path;
              }
            }
          });
        });
      }
      const [sql50] = await db.spcall(
        `CALL InsertVoucherTransaction(?, ?, ?, ?, ?, ?, ?,?,?,@transaction_id);select @transaction_id;`,
        [
          querydata.voucherid,
          querydata.vouchernumber,
          querydata.paidamount,
          querydata.transactiondetails,
          path || null,
          querydata.paymentstatus,
          querydata.tdsstatus,
          querydata.paymentmode,
          receipt_path || null,
        ]
      );
      const objectvalue = sql50[1][0];
      transactionid = objectvalue["@transaction_id"];
    } catch (er) {
      console.log(er);
    }
    try {
      var pending_amount = 0;
      if (querydata.paymentstatus == "partial") {
        const sql9 = await db.query(
          `select Pending_amount from clientvouchermaster where voucher_id = ?`,
          [querydata.voucherid]
        );
        if (sql9.length > 0) {
          const pending_amount = parseFloat(sql9[0].Pending_amount || 0);
          const updatedPending =
            pending_amount - parseFloat(querydata.paidamount || 0);
          if (updatedPending <= 0) {
            return helper.getErrorResponse(
              false,
              "error",
              "Partial payment cannot be the same as the total amount. Please clear the Voucher in FULL payment",
              "CLEAR THE VOUCHER",
              secret
            );
          }
        }
        const sql = await db.query(
          `UPDATE clientvouchermaster SET  partially_cleared = 1, Pending_amount = Pending_amount - ?, paid_amount = paid_amount + ? ,payment_details = JSON_ARRAY_APPEND( IFNULL(payment_details, JSON_ARRAY()), '$', 
           JSON_OBJECT('date', NOW(), 'amount', ?, 'transanctiondetails',?,'feedback',?,'transactionid',?,'paymentmode',?)),cleared_date = ? WHERE voucher_id = ? and fully_cleared != 1 and total_amount > ? and pending_amount > 0`,
          [
            querydata.paidamount,
            querydata.paidamount,
            querydata.paidamount,
            querydata.transactiondetails,
            querydata.feedback,
            transactionid,
            querydata.paymentmode,
            formatDate(querydata.date),
            querydata.voucherid,
            querydata.paidamount,
          ]
        );
        if (sql.changedRows > 0) {
          partially = 1;
          if (querydata.invoicetype == "sales") {
            const sql1 = await db.query(
              `Update salesprocesslist SET payment_status = 2, Paid_amount = Paid_amount + ? where cprocess_gene_id = ? and payment_status != 1`,
              [querydata.paidamount, querydata.invoicenumber]
            );
          } else if (querydata.invoicetype == "subscription") {
            const sql2 = await db.query(
              `UPDATE subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.subscription_billid = sbm.subscription_billid SET sbg.payment_status = 2,sbm.Paidamount =sbm.Paidamount + ?, 
           sbm.pendingpayments = ? WHERE sbg.invoice_no = ? and sbg.payment_status != 1
          `,
              [querydata.paidamount, pending_amount, querydata.invoicenumber]
            );
          } else if (querydata.invoicetype == "vendor") {
          }
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Voucher not cleared",
            querydata.vouchernumber,
            secret
          );
        }
      } else if (querydata.paymentstatus == "complete") {
        if (querydata.tdsstatus) {
          tdsamount = Math.round(querydata.subtotal * 0.02);
        } else {
          tdsamount = 0;
        }

        const sql = await db.query(
          `UPDATE clientvouchermaster SET fully_cleared = 1, partially_cleared = 0,Pending_amount = 0,paid_amount = paid_amount + ?,payment_details = JSON_ARRAY_APPEND(
               COALESCE(
                 NULLIF(payment_details, ''), 
                 JSON_ARRAY()
               ), 
               '$', 
               JSON_OBJECT(
                 'date', ?, 
                 'amount', ?, 
                 'transanctiondetails', ?,
                 'transactionid',?,
                 'feedback',?,
                 'paymentmode',? )),cleared_date = ? WHERE voucher_id = ? AND ROUND(Total_amount) = ROUND(paid_amount + ? + ?)`,
          [
            querydata.paidamount,
            querydata.date,
            querydata.paidamount,
            querydata.transactiondetails,
            transactionid,
            querydata.feedback,
            querydata.paymentmode,
            formatDate(querydata.date),
            querydata.voucherid,
            querydata.paidamount,
            tdsamount,
          ]
        );
        if (sql.changedRows > 0) {
          const sql43 = await db.query(
            `select payment_details,description from clientvouchermaster where voucher_id = ?`,
            [querydata.voucherid]
          );
          if (sql43.length > 0) {
            paymentdetails = sql43[0].payment_details;
            description = sql43[0].description;
          }
          if (querydata.invoicetype == "sales") {
            const sql1 = await db.query(
              `Update salesprocesslist SET Paid_amount = Paid_amount + ?,payment_status = 1 where cprocess_gene_id = ?`,
              [querydata.paidamount, querydata.invoicenumber]
            );
          } else if (querydata.invoicetype == "subscription") {
            const sql2 = await db.query(
              `UPDATE subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.subscription_billid = sbm.subscription_billid SET sbg.payment_status = 1,sbm.Paidamount =sbm.Paidamount + ? 
        WHERE sbg.invoice_no = ?
          `,
              [querydata.paidamount, querydata.invoicenumber]
            );
            if (!Array.isArray(paymentdetails)) {
              paymentdetails = [paymentdetails];
            } else {
              paymentdetails = paymentdetails;
            }
            if (querydata.tdsstatus == true) {
              const [sql4] = await db.spcall(
                `CALL upsert_tdsledger(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [
                  querydata.voucherid,
                  querydata.vouchernumber,
                  querydata.clientaddressname,
                  querydata.IGST,
                  querydata.CGST,
                  querydata.SGST,
                  querydata.grossamount,
                  querydata.subtotal,
                  tdsamount,
                  querydata.gstnumber,
                  "receivable",
                  description,
                  JSON.stringify(paymentdetails),
                  JSON.stringify({
                    gst: { IGST: IGST, SGST: SGST, CGST: CGST },
                    tds: tdsamount || 0,
                    total: totalamount || 0,
                    subtotal: subtotal || 0,
                  }),
                  querydata.invoicenumber,
                ]
              );
            }
          } else if (querydata.invoicetype == "vendor") {
          }
          const sql5 = await db.query(
            `Update gstledger SET payment_details = ? where voucher_id = ?`,
            [JSON.stringify(paymentdetails), querydata.voucherid]
          );
          // const [sql5] = await db.spcall(
          //   `CALL upsert_gstledger(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
          //   [
          //     querydata.voucherid,
          //     querydata.vouchernumber,
          //     querydata.clientaddressname,
          //     querydata.IGST,
          //     querydata.CGST,
          //     querydata.SGST,
          //     querydata.grossamount,
          //     querydata.subtotal,
          //     querydata.gstnumber,
          //     "output",
          //     description,
          //     JSON.stringify(paymentdetails),
          //     JSON.stringify({
          //       gst: { IGST: IGST, SGST: SGST, CGST: CGST },
          //       tds: tdsamount || 0,
          //       total: totalamount || 0,
          //       subtotal: subtotal || 0,
          //     }),
          //     querydata.invoicenumber,
          //   ]
          // );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Paid Amount not matching the total amount.",
            querydata.vouchernumber,
            secret
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Voucher not cleared",
          querydata.vouchernumber,
          secret
        );
      }
    } catch (er) {
      const sql7 = await db.query(
        `DELETE FROM tdsledger WHERE voucher_number = ?`,
        [querydata.vouchernumber]
      );

      return helper.getErrorResponse(
        false,
        "error",
        "Error clearing the Voucher",
        querydata.vouchernumber,
        secret
      );
    }
    try {
      const sql9 = await db.spcall(
        `CALL SP_CREDIT_CLIENT_LEDGER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ledgerid); select @ledgerid;`,
        [
          querydata.invoicenumber,
          querydata.clientaddressname,
          JSON.stringify({
            gst: { IGST: IGST, SGST: SGST, CGST: CGST },
            tds: tdsamount || 0,
            total: totalamount || 0,
            subtotal: subtotal || 0,
          }),
          JSON.stringify({
            amount: querydata.paidamount,
            transactiondetails: querydata.transactiondetails,
            date: formatDate(querydata.date),
            feedback: querydata.feedback,
            paymentmode: querydata.paymentmode,
            tdsamount: tdsamount,
          }),
          querydata.gstnumber,
          querydata.paidamount,
          subtotal,
          IGST,
          CGST,
          SGST,
          tdsamount,
          "subscription",
          querydata.voucherid,
          querydata.vouchernumber,
          "receivable",
          description,
          partially,
        ]
      );
    } catch (er) {
      console.log(er);
    }
    try {
      await mqttclient.publishMqttMessage(
        "refresh",
        "Voucher Cleared Successfully"
      );

      let tdsAmount = Number(querydata.tds) || 0;
      let cgstAmount = Number(querydata.CGST);
      let sgstAmount = Number(querydata.SGST);
      let igstAmount = Number(querydata.IGST);

      if (cgstAmount === 0) cgstAmount = null;
      if (sgstAmount === 0) sgstAmount = null;
      if (igstAmount === 0) igstAmount = null;

      let gstAmount = 0;
      if (igstAmount) {
        gstAmount = igstAmount;
      } else {
        if (cgstAmount) gstAmount += cgstAmount;
        if (sgstAmount) gstAmount += sgstAmount;
      }
      if (gstAmount === 0) gstAmount = undefined;

      const args = [
        querydata.clientaddressname || "Customer",
        querydata.emailid,
        `Voucher Cleared: ${querydata.invoicenumber}`,
        querydata.invoicenumber,
        querydata.date,
        querydata.grossamount,
        tdsAmount > 0 ? tdsAmount : undefined,
        gstAmount,
        cgstAmount,
        sgstAmount,
        igstAmount,
      ];

      if (receipt_path) {
        args.push(receipt_path);
      }

      await mailer.sendVoucherClearedEmail(...args);

      return helper.getSuccessResponse(
        true,
        "success",
        "Voucher Cleared Successfully",
        querydata.vouchernumber,
        secret
      );
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Error Sending the Receipt",
        querydata.vouchernumber,
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
//#####
async function ClearConsolidateVouchers(req, res, next) {
  let secret,
    querydata1,
    querydata2,
    billing,
    emailid = null,
    clientaddressname = null;
  try {
    try {
      await uploadFile.uploadVoucher(req, res);
      billing = req.body;
      // Check if the session token exists
      if (!billing.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken missing. Please provide the Login sessiontoken",
          "CLEAR CONSOLIDATE VOUCHERS",
          ""
        );
      }
      secret = billing.STOKEN.substring(0, 16);
      // var querydata;
      // Validate session token length
      if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
          "CLEAR CONSOLIDATE VOUCHERS",
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
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }
    // Check if querystring is provided
    if (!billing.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata1 = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata1 = JSON.parse(querydata1);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }
    const requiredFields1 = [
      { field: "voucherids", message: "Voucher ids missing." },
      { field: "vouchernumbers", message: "Voucher numbers missing." },
      { field: "totalpaidamount", message: "Paid amount missing." },
      { field: "tdsstatus", message: "TDS status missing." },
      { field: "feedback", message: "Feedback type missing." },
      { field: "date", message: "Date missing." },
      { field: "transactiondetails", message: "Transaction details missing." },
      { field: "voucherlist", message: "Voucher list missing." },
      { field: "paymentstatus", message: "Payment status missing." },
      { field: "paymentmode", message: "Payment mode missing." },
      { field: "customerids", message: "Customer ids missing." },
    ];
    for (const { field, message } of requiredFields1) {
      if (!querydata1.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "CLEAR CONSOLIDATE VOUCHERS",
          secret
        );
      }
    }
    let tdsamount = 0;
    let partially = 0;
    var paymentdetails = null;
    var description = `CONSOLIDATED CLEARANCE`;
    var transactionid = 0;
    try {
      var path = null;
      var receipt_path = null;
      if (req.files && Array.isArray(req.files)) {
        req.files.forEach((file) => {
          if (file && file.originalname) {
            const fileNameLower = file.originalname.toLowerCase();

            if (fileNameLower.includes("receipt")) {
              receipt_path = file.path;
            } else {
              path = file.path;
            }
          }
        });
      }
      if (req.file) {
        const fileNameLower = req.file.originalname.toLowerCase();
        if (fileNameLower.includes("receipt")) {
          receipt_path = req.file.path;
        } else {
          path = req.file.path;
        }
      }
      const [sql50] = await db.spcall(
        `CALL InsertVoucherTransaction(?, ?, ?, ?, ?, ?, ?,?,?,@transaction_id);select @transaction_id;`,
        [
          JSON.stringify(querydata1.voucherids),
          JSON.stringify(querydata1.vouchernumbers),
          querydata1.paidamount,
          querydata1.transactiondetails,
          path || null,
          `complete`,
          querydata1.tdsstatus,
          querydata1.paymentmode,
          receipt_path || null,
        ]
      );
      const objectvalue = sql50[1][0];
      transactionid = objectvalue["@transaction_id"];
    } catch (er) {
      console.log(er);
    }

    if (!Array.isArray(querydata1.voucherlist)) {
      querydata2 = [querydata1.voucherlist]; // Wrap in an array if it's a single object
    } else {
      querydata2 = querydata1.voucherlist;
    }
    const firstClientName = querydata2[0]?.clientaddressname || "customer";
    for (const querydata of querydata2) {
      const requiredFields = [
        { field: "voucherid", message: "Voucher id missing." },
        { field: "vouchernumber", message: "Voucher number missing." },
        { field: "IGST", message: "IGST missing." },
        { field: "SGST", message: "SGST missing." },
        { field: "CGST", message: "CGST missing." },
        { field: "tds", message: "tds deductions missing." },
        { field: "paidamount", message: "Paid amount missing." },
        {
          field: "grossamount",
          message: "totalamount missing.",
        },
        {
          field: "subtotal",
          message: "Sub total missing.",
        },
        { field: "clientaddressname", message: "Client address name missing." },
        { field: "clientaddress", message: "Client address missing." },
        { field: "invoicenumber", message: "Invoice number missing." },
        { field: "emailid", message: "Email id missing." },
        { field: "phoneno", message: "Phone no missing." },
        { field: "invoicetype", message: "Invoice type missing." },
        { field: "gstnumber", message: "GST number missing." },
      ];

      for (const { field, message } of requiredFields) {
        if (!querydata.hasOwnProperty(field)) {
          return helper.getErrorResponse(
            false,
            "error",
            message,
            "CLEAR CONSOLIDATE VOUCHERS",
            secret
          );
        }
      }
      let totalamount = querydata.grossamount || 0;
      let subtotal = querydata.subtotal || 0;
      let IGST = querydata.IGST || 0;
      let CGST = querydata.CGST || 0;
      let SGST = querydata.SGST || 0;
      clientaddressname = querydata.clientaddressname || "";
      // Collect all invoice numbers from the voucherlist
      invoiceNumbers = querydata2.map((q) => q.invoicenumber);
      // 1. Check all vouchers are for the same company (by Customer_id)
      const firstCustomerId = querydata1.customerids[0]; // Assuming customerids is an array and we take the first one

      const allSameCustomer = querydata1.customerids.every(
        (id) => id === firstCustomerId
      );

      if (!allSameCustomer) {
        // const sql7 = await db.query(
        //   `DELETE FROM vouchertransactions WHERE vouchertrans_id = ?`,
        //   [transactionid]
        // );
        return helper.getErrorResponse(
          false,
          "error",
          "All vouchers must belong to the same company for consolidated clearance.",
          "CLEAR CONSOLIDATE VOUCHERS",
          secret
        );
      }

      try {
        if (querydata1.paymentstatus == "complete") {
          if (querydata1.tdsstatus) {
            tdsamount = Math.round(querydata.subtotal * 0.02);
          } else {
            tdsamount = 0;
          }
          const sql = await db.query(
            `UPDATE clientvouchermaster SET fully_cleared = 1, partially_cleared = 0,Pending_amount = 0,paid_amount = paid_amount + ?,payment_details = JSON_ARRAY_APPEND(
               COALESCE(
                 NULLIF(payment_details, ''), 
                 JSON_ARRAY()
               ), 
               '$', 
               JSON_OBJECT(
                 'date', ?, 
                 'amount', ?, 
                 'transanctiondetails', ?,
                 'transactionid',?,
                 'feedback',?,
                 'paymentmode',? )),cleared_date = ? WHERE voucher_id = ? AND ROUND(Total_amount) = ROUND(paid_amount + ? + ?)`,
            [
              querydata.paidamount,
              formatDate(querydata1.date),
              querydata.paidamount,
              querydata1.transactiondetails,
              transactionid,
              querydata1.feedback,
              querydata1.paymentmode,
              formatDate(querydata1.date),
              querydata.voucherid,
              querydata.paidamount,
              tdsamount,
            ]
          );
          if (sql.changedRows > 0) {
            emailid = `${emailid},${querydata.emailid}`;
            const sql43 = await db.query(
              `select payment_details from clientvouchermaster where voucher_id = ?`,
              [querydata.voucherid]
            );
            if (sql43.length > 0) {
              paymentdetails = sql43[0].payment_details;
              description = `CONSOLIDATED CLEARANCE`;
            }
            if (querydata.invoicetype == "sales") {
              const sql1 = await db.query(
                `Update salesprocesslist SET Paid_amount = Paid_amount + ?,payment_status = 1 where cprocess_gene_id = ?`,
                [querydata.paidamount, querydata.invoicenumber]
              );
            } else if (querydata.invoicetype == "subscription") {
              const sql2 = await db.query(
                `UPDATE subscriptionbillgenerated sbg JOIN subscriptionbillmaster sbm ON sbg.subscription_billid = sbm.subscription_billid SET sbg.payment_status = 1,sbm.Paidamount =sbm.Paidamount + ? 
        WHERE sbg.invoice_no = ?
          `,
                [querydata.paidamount, querydata.invoicenumber]
              );
              if (querydata.tdsstatus == true) {
                const [sql4] = await db.spcall(
                  `CALL upsert_tdsledger(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                  [
                    querydata.voucherid,
                    querydata.vouchernumber,
                    querydata.clientaddressname,
                    querydata.IGST,
                    querydata.CGST,
                    querydata.SGST,
                    querydata.grossamount,
                    querydata.subtotal,
                    tdsamount,
                    querydata.gstnumber,
                    "receivable",
                    ``,
                    JSON.stringify(paymentdetails),
                    JSON.stringify({
                      gst: { IGST: IGST, SGST: SGST, CGST: CGST },
                      tds: tdsamount || 0,
                      total: totalamount || 0,
                      subtotal: subtotal || 0,
                    }),
                    querydata.invoicenumber,
                  ]
                );
              }
            } else if (querydata.invoicetype == "vendor") {
            }
            const sql5 = await db.query(
              `Update gstledger SET payment_details = ? where voucher_id = ?`,
              [JSON.stringify(paymentdetails), querydata.voucherid]
            );
            // const [sql5] = await db.spcall(
            //   `CALL upsert_gstledger(?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
            //   [
            //     querydata.voucherid,
            //     querydata.vouchernumber,
            //     querydata.clientaddressname,
            //     querydata.IGST,
            //     querydata.CGST,
            //     querydata.SGST,
            //     querydata.grossamount,
            //     querydata.subtotal,
            //     querydata.gstnumber,
            //     "output",
            //     description,
            //     JSON.stringify(paymentdetails),
            //     JSON.stringify({
            //       gst: { IGST: IGST, SGST: SGST, CGST: CGST },
            //       tds: tdsamount || 0,
            //       total: totalamount || 0,
            //       subtotal: subtotal || 0,
            //     }),
            //     querydata.invoicenumber,
            //   ]
            // );
          } else {
            return helper.getErrorResponse(
              false,
              "error",
              "Paid Amount not matching the total amount.",
              querydata.vouchernumber,
              secret
            );
          }
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Voucher not cleared",
            querydata.vouchernumber,
            secret
          );
        }
      } catch (er) {
        const sql6 = await db.query(
          `delete from gstledger where voucher_number = ?`,
          [querydata.vouchernumber]
        );
        const sql7 = await db.query(
          `DELETE FROM tdsledger WHERE voucher_number = ?`,
          [querydata.vouchernumber]
        );

        return helper.getErrorResponse(
          false,
          "error",
          "Error clearing the Voucher",
          querydata.vouchernumber,
          secret
        );
      }
      try {
        const sql9 = await db.spcall(
          `CALL SP_CREDIT_CLIENT_LEDGER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ledgerid); select @ledgerid;`,
          [
            querydata.invoicenumber,
            querydata.clientaddressname,
            JSON.stringify({
              gst: { IGST: IGST, SGST: SGST, CGST: CGST },
              tds: tdsamount || 0,
              total: totalamount || 0,
              subtotal: subtotal || 0,
            }),
            JSON.stringify({
              amount: querydata.paidamount,
              transactiondetails: querydata1.transactiondetails,
              date: formatDate(querydata1.date),
              feedback: querydata1.feedback,
              paymentmode: querydata1.paymentmode,
              tdsamount: tdsamount,
            }),
            querydata.gstnumber,
            querydata.paidamount,
            subtotal,
            IGST,
            CGST,
            SGST,
            tdsamount,
            "subscription",
            querydata.voucherid,
            querydata.vouchernumber,
            "receivable",
            description,
            partially,
          ]
        );
      } catch (er) {
        console.log(er);
      }
    }
    await mqttclient.publishMqttMessage(
      "refresh",
      "Consolidated voucher Cleared Successfully"
    );
    // console.log("Query Data GST breakdown:");
    querydata2.forEach((q, i) => {
      // console.log(
      //   `Row ${i + 1}: IGST: ${q.IGST}, CGST: ${q.CGST}, SGST: ${q.SGST}`
      // );
    });

    let totalIGST = 0,
      totalCGST = 0,
      totalSGST = 0;
    let tdsAmount = 0;

    // Sum up the GST and TDS amounts safely
    for (const q of querydata2) {
      totalIGST += parseFloat(q.IGST) || 0;
      totalCGST += parseFloat(q.CGST) || 0;
      totalSGST += parseFloat(q.SGST) || 0;
      tdsAmount += parseFloat(q.tds) || 0;
    }

    const totalGST = totalIGST + totalCGST + totalSGST;

    // console.log("Total CGST Amount:", totalCGST);
    // console.log("Total SGST Amount:", totalSGST);
    // console.log("Total IGST Amount:", totalIGST);
    // console.log("Total GST Amount:", totalGST);
    // console.log("Total TDS Amount:", tdsAmount);

    // GST type consistency check across vouchers
    let gstType = null;

    const allIGST = querydata2.every(
      (q) =>
        (parseFloat(q.IGST) || 0) > 0 &&
        (parseFloat(q.CGST) || 0) === 0 &&
        (parseFloat(q.SGST) || 0) === 0
    );

    const allCGSTSGST = querydata2.every(
      (q) =>
        (parseFloat(q.IGST) || 0) === 0 &&
        (parseFloat(q.CGST) || 0) > 0 &&
        (parseFloat(q.SGST) || 0) > 0
    );

    if (allIGST) {
      gstType = "IGST";
    } else if (allCGSTSGST) {
      gstType = "CGST + SGST";
    } else {
      console.error("GST Type mismatch across vouchers. Raw data:", querydata2);
      return helper.getErrorResponse(
        false,
        "error",
        "All vouchers must have the same GST type (IGST or CGST+SGST) for consolidated clearance.",
        "CLEAR CONSOLIDATE VOUCHERS",
        secret
      );
    }

    const args = [
      firstClientName || "Customer", // recipientName
      emailid, // recipientEmail
      `Consolidated Voucher Cleared: ${invoiceNumbers.join(", ")}`, // subject
      invoiceNumbers, // invoiceNumbers
      querydata1.date, // clearedDate
      querydata1.totalpaidamount, // totalAmount
      tdsAmount > 0 ? tdsAmount : undefined, // tdsAmount
      totalIGST, // igstAmount
      totalCGST, // cgstAmount
      totalSGST, // sgstAmount
    ];

    // Add receipt_path only if it exists
    if (receipt_path) {
      args.push(receipt_path);
    }

    await mailer.sendConsolidatedClearedEmail(...args);

    return helper.getSuccessResponse(
      true,
      "success",
      "Voucher Cleared Successfully",
      querydata1.vouchernumbers,
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

async function accountLedger(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "CLIENT LEDGER",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "CLIENT LEDGER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "CLIENT LEDGER",
        secret
      );
    }
    var sql, formattedStartDate, formattedEndDate;
    sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT cl.clientledger_id,cl.voucher_id,cl.voucher_number,cl.client_name,cl.tdsamount,cl.gst_number,cl.invoicenumber,cl.ledger_type,DATE(cl.Row_updated_date) date,cl.debitamount, cl.creditamount,cl.billdetails,cl.description, cl.partially_cleared,cl.Payment_details,CASE WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
      , cvm.Overdue_days as Overdue_history,cvm.invoice_type,cl.opening_balance FROM clientledger cl JOIN clientvouchermaster cvm ON cvm.voucher_id = cl.voucher_id where cl.status =1 order by cl.Row_updated_date`;
    }
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CLIENT LEDGER",
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
        "CLIENT LEDGER",
        secret
      );
    }

    sql = `SELECT cl.clientledger_id,cl.voucher_id,cl.voucher_number,cl.client_name,cl.tdsamount,cl.gst_number,cl.invoicenumber,cl.ledger_type,DATE(cl.Row_updated_date) date,cl.debitamount, cl.creditamount,cl.billdetails,cl.description, cl.partially_cleared,cl.Payment_details,CASE WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
    , cvm.Overdue_days as Overdue_history,cvm.invoice_type,cl.opening_balance FROM clientledger cl JOIN clientvouchermaster cvm ON cvm.voucher_id = cl.voucher_id where cl.status =1`;

    if (
      querydata.ledgertype != null &&
      querydata.ledgertype != 0 &&
      querydata.ledgertype != undefined
    ) {
      if (querydata.ledgertype == "receivable") {
        sql += ` and cl.ledger_type LIKE '%receivable%'`;
      } else if (querydata.ledgertype == "payable") {
        sql += ` and cl.ledger_type LIKE '%payable%'`;
      }
    }
    if (
      querydata.paymenttype != null &&
      querydata.paymenttype != 0 &&
      querydata.paymenttype != undefined
    ) {
      if (querydata.paymenttype == "credit") {
        sql += ` and cl.creditamount != 0`;
      } else if (querydata.paymenttype == "debit") {
        sql += ` and cl.debitamount != 0`;
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and cvm.invoice_type like '%sales%'`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and cvm.invoice_type like '%subscription%'`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and cvm.invoice_type like '%vendor%'`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and cvm.customer_id = ?`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      formattedStartDate = querydata.startdate;
      formattedEndDate = querydata.enddate;
      if (querydata.startdate == querydata.enddate) {
        sql += ` and DATE(cl.Row_updated_date) = ?`;
        sqlParams.push(querydata.enddate);
      } else {
        sql += ` and DATE(cl.Row_updated_date) BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      }
    } else {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 100); // Subtract 100 days
      startDate.setHours(0, 0, 0, 0); // Set to the start of the day
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999); // Set to the end of the current day
      const formatDate = (date) => date.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
      formattedStartDate = formatDate(startDate);
      formattedEndDate = formatDate(endDate);

      sql += ` and DATE(cl.Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(formattedStartDate, formattedEndDate);
    }
    sql += ` order by cl.Row_updated_date`;
    // console.log(sql);
    var sql1, customer_name;
    const query = await db.query(sql, sqlParams);
    if (query) {
      let netAmount = 0;
      let creditAmount = 0;
      let debitAmount = 0;
      const updatedRows = query.map((entry) => {
        const debit = parseFloat(entry.debitamount || 0);
        const credit = parseFloat(entry.creditamount || 0);
        creditAmount += credit;
        debitAmount += debit;
        netAmount += credit - debit;

        return {
          ...entry,
          balance: parseFloat(netAmount.toFixed(2)), // Add running net amount
        };
      });

      if (
        querydata.customerid != null &&
        querydata.customerid != 0 &&
        querydata.customerid != undefined
      ) {
        let rawId = querydata.customerid;
        let extractedId = rawId.split("-")[1]; // "11"
        sql1 = await db.query1(
          `select customer_name from customermaster where customer_id = (?)`,
          [extractedId]
        );
        if (sql1.length > 0) {
          customer_name = sql1[0].customer_name;
        }
      }

      return helper.getSuccessResponse(
        true,
        "success",
        "Client Ledger fetched Successfully",
        {
          customer_name: customer_name,
          ledgerlist: updatedRows,
          creditAmount: creditAmount,
          debitAmount: debitAmount,
          balanceAmount: netAmount,
          startdate: formattedStartDate,
          enddate: formattedEndDate,
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

async function consolidateLedger(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "CONSOLIDATE LEDGER",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "CONSOLIDATE LEDGER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "CONSOLIDATE LEDGER",
        secret
      );
    }
    var sql,
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT clientledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,totalamount,subtotal,tdsamount,gst_number,invoicenumber,ledger_type,DATE(Row_updated_date),debitamount, creditamount,billdetails FROM clientledger where status =1`;
    }
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CONSOLIDATE LEDGER",
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
        "CONSOLIDATE LEDGER",
        secret
      );
    }

    sql = `SELECT clientledger_id,voucher_id,voucher_number,client_name,IGST,CGST,SGST,totalamount,subtotal,tdsamount,gst_number,invoicenumber,ledger_type,DATE(Row_updated_date),debitamount, creditamount,billdetails FROM clientledger where status =1`;

    if (
      querydata.tdstype != null &&
      querydata.tdstype != 0 &&
      querydata.tdstype != undefined
    ) {
      if (querydata.ledgertype == "receivable") {
        sql += ` and ledger_type LIKE '%receivable%'`;
      } else if (querydata.ledgertype == "payable") {
        sql += ` and ledger_type LIKE '%payable%'`;
      }
    }
    if (
      querydata.paymenttype != null &&
      querydata.paymenttype != 0 &&
      querydata.paymenttype != undefined
    ) {
      if (querydata.paymenttype == "credit") {
        sql += ` and creditamount != 0`;
      } else if (querydata.paymenttype == "debit") {
        sql += ` and debitamount != 0`;
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      sql += ` and DATE(Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(querydata.startdate, querydata.enddate);
    }

    // console.log(sql);
    const query = await db.query(sql, sqlParams);
    if (query) {
      let netAmount = 0;
      let creditAmount = 0;
      let debitAmount = 0;
      const updatedRows = query.map((entry) => {
        const debit = parseFloat(entry.debitamount || 0);
        const credit = parseFloat(entry.creditamount || 0);
        creditAmount += credit;
        debitAmount += debit;
        netAmount += credit - debit;
        return {
          ...entry,
          netamount: parseFloat(netAmount.toFixed(2)), // Add running net amount
        };
      });

      return helper.getSuccessResponse(
        true,
        "success",
        "Consolidate Ledger fetched Successfully",
        {
          ledgerlist: updatedRows,
          creditAmount: creditAmount,
          debitAmount: debitAmount,
          balanceAmount: netAmount,
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

async function TDSLedger(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "TDS LEDGER",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    var querydata, formattedStartDate, formattedEndDate;
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "TDS LEDGER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "TDS LEDGER",
        secret
      );
    }
    var sql,
      sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT tl.tdsledger_id, tl.voucher_id, tl.voucher_number, tl.client_name, tl.IGST, tl.CGST, tl.SGST, tl.totalamount, tl.subtotal, tl.tdsamount, tl.gst_number, tl.tds_type, DATE_FORMAT(DATE(tl.Row_updated_date), '%Y-%m-%d %H:%i:%s') AS date, tl.tds_filed, tl.payment_details, tl.description, tl.bill_details,cvm.invoice_number,CASE WHEN tl.tds_type = 'Receivable' THEN tl.tdsamount ELSE 0 END AS creditAmount, CASE WHEN tl.tds_type = 'Payable' THEN tl.tdsamount ELSE 0 END AS debitAmount,CASE WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
      , cvm.Overdue_days as Overdue_history,cvm.invoice_type FROM tdsledger tl JOIN clientvouchermaster cvm ON cvm.voucher_id = tl.voucher_id WHERE tl.status = 1`;
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "TDS LEDGER",
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
        "TDS LEDGER",
        secret
      );
    }

    sql = `SELECT tl.tdsledger_id, tl.voucher_id, tl.voucher_number, tl.client_name, tl.IGST, tl.CGST, tl.SGST, tl.totalamount, tl.subtotal, tl.tdsamount, tl.gst_number, tl.tds_type, DATE_FORMAT(DATE(tl.Row_updated_date), '%Y-%m-%d %H:%i:%s') AS date, tl.tds_filed, tl.payment_details, tl.description, tl.bill_details,cvm.invoice_number,CASE WHEN tl.tds_type = 'Receivable' THEN tl.tdsamount ELSE 0 END AS creditAmount, CASE WHEN tl.tds_type = 'Payable' THEN tl.tdsamount ELSE 0 END AS debitAmount,CASE WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
    , cvm.Overdue_days as Overdue_history,cvm.invoice_type FROM tdsledger tl JOIN clientvouchermaster cvm ON cvm.voucher_id = tl.voucher_id WHERE tl.status = 1`;

    if (
      querydata.tdstype != null &&
      querydata.tdstype != 0 &&
      querydata.tdstype != undefined
    ) {
      if (querydata.tdstype == "receivable") {
        sql += ` and tl.tds_type LIKE '%receivable%'`;
      } else if (querydata.tdstype == "payable") {
        sql += ` and tl.tds_type LIKE '%payable%'`;
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and cvm.invoice_type like '%sales%'`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and cvm.invoice_type like '%subscription%'`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and cvm.invoice_type like '%vendor%'`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and cvm.customer_id = ?`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      formattedStartDate = querydata.startdate;
      formattedEndDate = querydata.enddate;
      if (querydata.startdate == querydata.enddate) {
        sql += ` and DATE(tl.Row_updated_date) = ?`;
        sqlParams.push(querydata.enddate);
      } else {
        sql += ` and DATE(tl.Row_updated_date) BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      }
    } else {
      const now = new Date();
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      const financialYearStart =
        currentMonth >= 3
          ? new Date(currentYear, 3, 1) // April 1st of the current year
          : new Date(currentYear - 1, 3, 1); // April 1st of the previous year
      financialYearStart.setHours(0, 0, 0, 0);
      const financialYearEnd = new Date(now);
      financialYearEnd.setHours(23, 59, 59, 999);
      const formatDate = (date) => date.toISOString().split("T")[0];
      formattedStartDate = formatDate(financialYearStart);
      formattedEndDate = formatDate(financialYearEnd);

      sql += ` and DATE(tl.Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(formattedStartDate, formattedEndDate);
    }
    // console.log(sql);
    const query = await db.query(sql, sqlParams);

    if (query.length > 0) {
      let netTdsAmount = 0;
      let totalTds = 0;
      let totalPaid = 0;
      let totalReceivables = 0;
      let totalPayables = 0;
      let updatedRows = [];

      query.forEach((entry) => {
        // payment_details can be object or array
        let paid = 0;
        if (Array.isArray(entry.payment_details)) {
          paid = entry.payment_details.reduce(
            (sum, pd) => sum + parseFloat(pd.amount || 0),
            0
          );
        } else if (
          entry.payment_details &&
          typeof entry.payment_details === "object"
        ) {
          paid = parseFloat(entry.payment_details.amount || 0);
        }
        const tds = parseFloat(entry.tdsamount || 0);
        totalPaid += paid;
        totalTds += tds;
        netTdsAmount += tds - paid;

        // Sum receivables/payables
        if (entry.tds_type === "receivable") {
          totalReceivables += tds;
        } else if (entry.tds_type === "payable") {
          totalPayables += tds;
        }

        updatedRows.push({
          ...entry,
          paidamount: paid,
          balance: parseFloat((tds - paid).toFixed(2)),
          runningbalance: parseFloat(netTdsAmount.toFixed(2)),
        });
      });

      return helper.getSuccessResponse(
        true,
        "success",
        "Tds Ledger fetched Successfully",
        {
          tdsledger: updatedRows,
          totalTds: totalTds,
          totalPaid: totalPaid,
          netTdsBalance: netTdsAmount,
          totalReceivables: totalReceivables,
          totalPayables: totalPayables,
          netTds: totalReceivables - totalPayables,
          startdate: formattedStartDate,
          enddate: formattedEndDate,
        },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Tds Ledger fetched Successfully",
        {
          tdsledger: query,
          totalTds: 0,
          totalPaid: 0,
          netTdsBalance: 0,
          totalReceivables: 0,
          totalPayables: 0,
          netTds: 0,
          startdate: formattedStartDate,
          enddate: formattedEndDate,
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

async function GSTLedger(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GST LEDGER",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GST LEDGER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GST LEDGER",
        secret
      );
    }
    var sql, query1, query2, formattedStartDate, formattedEndDate;
    sqlParams = [];
    // Check if querystring is provided
    if (!billing.hasOwnProperty("querystring")) {
      sql = `SELECT gl.gstledger_id,gl.voucher_id,gl.voucher_number,gl.client_name,gl.IGST,gl.CGST,gl.SGST,gl.gst_number,(gl.IGST+gl.CGST+gl.SGST) totalgst,gl.gst_type,DATE_FORMAT(DATE(gl.Row_updated_date), '%Y-%m-%d %H:%i:%s') AS date,gl.gst_filed,gl.totalamount,gl.subtotal,gl.payment_details,gl.description,gl.bill_details,gl.invoice_number,CASE WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
      , cvm.Overdue_days as Overdue_history,cvm.invoice_type FROM gstledger gl JOIN clientvouchermaster cvm ON cvm.voucher_id = gl.voucher_id where gl.status = 1`;
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GST LEDGER",
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
        "GST LEDGER",
        secret
      );
    }

    sql = `SELECT gl.gstledger_id,gl.voucher_id,gl.voucher_number,gl.client_name,gl.IGST,gl.CGST,gl.SGST,gl.gst_number,(gl.IGST+gl.CGST+gl.SGST) totalgst,gl.gst_type,DATE_FORMAT(DATE(gl.Row_updated_date), '%Y-%m-%d %H:%i:%s') AS date,gl.gst_filed,gl.totalamount,gl.subtotal,gl.payment_details,gl.description,gl.bill_details,gl.invoice_number,CASE WHEN cvm.Due_date IS NULL OR DATEDIFF(CURDATE(), cvm.Due_date) <= 0 THEN 0 ELSE DATEDIFF(CURDATE(), cvm.Due_date) END AS Overdue_days
    , cvm.Overdue_days as Overdue_history,cvm.invoice_type FROM gstledger gl JOIN clientvouchermaster cvm ON cvm.voucher_id = gl.voucher_id where gl.status = 1`;
    query1 = `select SUM(gl.IGST) IGST,SUM(gl.CGST) CGST,SUM(gl.SGST) SGST FROM gstledger gl WHERE gl.status = 1 and gl.gst_type = 'input'`;
    query2 = `select SUM(gl.IGST) IGST,SUM(gl.CGST) CGST,SUM(gl.SGST) SGST FROM gstledger gl WHERE gl.status = 1 and gl.gst_type = 'output'`;
    if (
      querydata.gsttype != null &&
      querydata.gsttype != 0 &&
      querydata.gsttype != undefined
    ) {
      if (querydata.gsttype == "input") {
        sql += ` and gl.gst_type LIKE '%input%'`;
      } else if (querydata.gsttype == "output") {
        sql += ` and gl.gst_type LIKE '%output%'`;
      } else {
      }
    }
    if (
      querydata.invoicetype != null &&
      querydata.invoicetype != 0 &&
      querydata.invoicetype != undefined
    ) {
      if (querydata.invoicetype == "sales") {
        sql += ` and cvm.invoice_type like '%sales%'`;
        query1 += ` and gl.voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
        query2 += ` and gl.voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%sales%')`;
      } else if (querydata.invoicetype == "subscription") {
        sql += ` and cvm.invoice_type like '%subscription%'`;
        query1 += ` and gl.voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
        query2 += ` and gl.voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%subscription%')`;
      } else if (querydata.invoicetype == "vendor") {
        sql += ` and cvm.invoice_type like '%vendor%'`;
        query1 += ` and gl.voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
        query2 += ` and gl.voucher_id IN (select voucher_id from clientvouchermaster where invoice_type like '%vendor%')`;
      }
    }
    if (
      querydata.customerid != null &&
      querydata.customerid != 0 &&
      querydata.customerid != undefined
    ) {
      sql += ` and cvm.customer_id = ?`;
      query1 += ` and gl.voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      query2 += ` and gl.voucher_id IN (select voucher_id from clientvouchermaster where customer_id = ?)`;
      sqlParams.push(querydata.customerid);
    }
    if (
      querydata.plantype != null &&
      querydata.plantype != 0 &&
      querydata.plantype != undefined &&
      querydata.invoicetype === "subscription"
    ) {
      if (querydata.plantype.toLowerCase() === "prepaid") {
        sql += ` and gl.invoice_number IN (SELECT g.invoice_number FROM gstledger g JOIN clientvouchermaster c ON g.invoice_number = c.invoice_number JOIN subscriptionbillgenerated sbg ON sbg.Invoice_no = g.invoice_number JOIN subscriptionbillmaster sbm ON sbm.Customer_id = sbg.Customer_id WHERE LOWER(TRIM(sbm.plantype)) = 'prepaid' AND sbg.Invoice_no IS NOT NULL)`;
        query1 += ` and gl.invoice_number IN (SELECT g.invoice_number FROM gstledger g JOIN clientvouchermaster c ON g.invoice_number = c.invoice_number JOIN subscriptionbillgenerated sbg ON sbg.Invoice_no = g.invoice_number JOIN subscriptionbillmaster sbm ON sbm.Customer_id = sbg.Customer_id WHERE LOWER(TRIM(sbm.plantype)) = 'prepaid' AND sbg.Invoice_no IS NOT NULL)`;
        query2 += ` and gl.invoice_number IN (SELECT g.invoice_number FROM gstledger g JOIN clientvouchermaster c ON g.invoice_number = c.invoice_number JOIN subscriptionbillgenerated sbg ON sbg.Invoice_no = g.invoice_number JOIN subscriptionbillmaster sbm ON sbm.Customer_id = sbg.Customer_id WHERE LOWER(TRIM(sbm.plantype)) = 'prepaid' AND sbg.Invoice_no IS NOT NULL)`;
      } else if (querydata.plantype.toLowerCase() === "postpaid") {
        sql += ` and gl.invoice_number IN (SELECT g.invoice_number FROM gstledger g JOIN clientvouchermaster c ON g.invoice_number = c.invoice_number JOIN subscriptionbillgenerated sbg ON sbg.Invoice_no = g.invoice_number JOIN subscriptionbillmaster sbm ON sbm.Customer_id = sbg.Customer_id WHERE LOWER(TRIM(sbm.plantype)) = 'postpaid' AND sbg.Invoice_no IS NOT NULL)`;
        query1 += ` and gl.invoice_number IN (SELECT g.invoice_number FROM gstledger g JOIN clientvouchermaster c ON g.invoice_number = c.invoice_number JOIN subscriptionbillgenerated sbg ON sbg.Invoice_no = g.invoice_number JOIN subscriptionbillmaster sbm ON sbm.Customer_id = sbg.Customer_id WHERE LOWER(TRIM(sbm.plantype)) = 'postpaid' AND sbg.Invoice_no IS NOT NULL)`;
        query2 += ` and gl.invoice_number IN (SELECT g.invoice_number FROM gstledger g JOIN clientvouchermaster c ON g.invoice_number = c.invoice_number JOIN subscriptionbillgenerated sbg ON sbg.Invoice_no = g.invoice_number JOIN subscriptionbillmaster sbm ON sbm.Customer_id = sbg.Customer_id WHERE LOWER(TRIM(sbm.plantype)) = 'postpaid' AND sbg.Invoice_no IS NOT NULL)`;
      }
    }
    if (
      querydata.startdate != null &&
      querydata.startdate != 0 &&
      querydata.startdate != undefined &&
      querydata.enddate != null &&
      querydata.enddate != 0 &&
      querydata.enddate != undefined
    ) {
      formattedStartDate = querydata.startdate;
      formattedEndDate = querydata.enddate;
      if (querydata.startdate == querydata.enddate) {
        sql += ` and DATE(gl.Row_updated_date) = ?`;
        sqlParams.push(querydata.enddate);
      } else {
        sql += ` and DATE(gl.Row_updated_date) BETWEEN ? and ?`;
        query1 += ` and DATE(gl.Row_updated_date) BETWEEN ? and ?`;
        query2 += ` and DATE(gl.Row_updated_date) BETWEEN ? and ?`;
        sqlParams.push(querydata.startdate, querydata.enddate);
      }
    } else {
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 45); // Subtract 100 days
      startDate.setHours(0, 0, 0, 0); // Set to the start of the day
      const endDate = new Date(now);
      endDate.setHours(23, 59, 59, 999); // Set to the end of the current day
      const formatDate = (date) => date.toISOString().split("T")[0]; // Format as 'YYYY-MM-DD'
      formattedStartDate = formatDate(startDate);
      formattedEndDate = formatDate(endDate);

      sql += ` and DATE(gl.Row_updated_date) BETWEEN ? and ?`;
      query1 += ` and DATE(gl.Row_updated_date) BETWEEN ? and ?`;
      query2 += ` and DATE(gl.Row_updated_date) BETWEEN ? and ?`;
      sqlParams.push(formattedStartDate, formattedEndDate);
    }
    // console.log(sql);
    const query = await db.query(sql, sqlParams);
    const sql1 = await db.query(query1, sqlParams);
    const sql2 = await db.query(query2, sqlParams);
    var input = 0,
      output = 0,
      total = 0,
      inputsgst = 0,
      outputsgst = 0,
      totalsgst = 0,
      inputcgst = 0,
      outputcgst = 0,
      totalcgst = 0,
      inputigst = 0,
      outputigst = 0,
      totaligst = 0;
    if (sql1.length > 0 && sql2.length > 0) {
      input = sql1[0].IGST + sql1[0].SGST + sql1[0].CGST;
      output = sql2[0].IGST + sql2[0].SGST + sql2[0].CGST;
      total = output - input;
      inputsgst = sql1[0].SGST;
      outputsgst = sql2[0].SGST;
      totalsgst = outputsgst - inputsgst;
      inputcgst = sql1[0].CGST;
      outputcgst = sql2[0].CGST;
      totalcgst = outputcgst - inputcgst;
      inputigst = sql1[0].IGST;
      outputigst = sql2[0].IGST;
      totaligst = outputigst - inputigst;
    }
    if (query.length > 0) {
      if (
        querydata.gsttype != null &&
        querydata.gsttype != 0 &&
        querydata.gsttype != undefined
      ) {
        if (querydata.gsttype == "input") {
          return helper.getSuccessResponse(
            true,
            "success",
            "Gst Ledger fetched Successfully",
            {
              gstlist: query,
              inputgst: input,
              outputgst: 0,
              totalgst: 0,
              inputsgst: inputsgst,
              outputsgst: 0,
              totalsgst: 0,
              inputcgst: inputcgst,
              outputcgst: 0,
              totalcgst: 0,
              inputigst: inputigst,
              outputigst: 0,
              totaligst: 0,
              startdate: formattedStartDate,
              enddate: formattedEndDate,
            },
            secret
          );
        } else if (querydata.gsttype == "output") {
          return helper.getSuccessResponse(
            true,
            "success",
            "Gst Ledger fetched Successfully",
            {
              gstlist: query,
              inputgst: 0,
              outputgst: output,
              totalgst: 0,
              inputsgst: 0,
              outputsgst: outputsgst,
              totalsgst: 0,
              inputcgst: 0,
              outputcgst: outputcgst,
              totalcgst: 0,
              inputigst: 0,
              outputigst: outputigst,
              totaligst: 0,
              startdate: formattedStartDate,
              enddate: formattedEndDate,
            },
            secret
          );
        } else {
          return helper.getSuccessResponse(
            true,
            "success",
            "Gst Ledger fetched Successfully",
            {
              gstlist: query,
              inputgst: input,
              outputgst: output,
              totalgst: total,
              inputsgst: inputsgst,
              outputsgst: outputsgst,
              totalsgst: totalsgst,
              inputcgst: inputcgst,
              outputcgst: outputcgst,
              totalcgst: totalcgst,
              inputigst: inputigst,
              outputigst: outputigst,
              totaligst: totaligst,
              startdate: formattedStartDate,
              enddate: formattedEndDate,
            },
            secret
          );
        }
      }
      return helper.getSuccessResponse(
        true,
        "success",
        "Gst Ledger fetched Successfully",
        {
          gstlist: query,
          inputgst: input,
          outputgst: output,
          totalgst: total,
          inputsgst: inputsgst,
          outputsgst: outputsgst,
          totalsgst: totalsgst,
          inputcgst: inputcgst,
          outputcgst: outputcgst,
          totalcgst: totalcgst,
          inputigst: inputigst,
          outputigst: outputigst,
          totaligst: totaligst,
          startdate: formattedStartDate,
          enddate: formattedEndDate,
        },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Gst Ledger fetched Successfully",
        {
          gstlist: query,
          inputgst: 0,
          outputgst: 0,
          totalgst: 0,
          inputsgst: 0,
          outputsgst: 0,
          totalsgst: 0,
          inputcgst: 0,
          outputcgst: 0,
          totalcgst: 0,
          inputigst: 0,
          outputigst: 0,
          totaligst: 0,
          startdate: formattedStartDate,
          enddate: formattedEndDate,
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

async function getSubscriptionCustomer(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET SUBSCRIPTION CUSTOMER",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
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
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [billing.STOKEN]
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

    const sql =
      await db.query1(`select cm.customer_id customer_id, cm.customer_name customer_name,scm.Phoneno customer_phoneno,scm.billing_gst customer_gstno,cm.customer_pan,scm.Billing_address from customermaster cm JOIN branchmaster bm ON bm.customer_id = cm.customer_id JOIN subscriptioncustomertrans scm 
      ON bm.branch_id = scm.Branch_id where cm.status = 1 GROUP by cm.customer_id order by cm.customer_id;`);
    if (sql.length) {
      const updatedSql = sql.map((row) => ({
        ...row,
        customer_id: `SB-${row.customer_id}`,
      }));
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription customer Fetched Successfully",
        updatedSql,
        secret
      );
    } else {
      return helper.getErrorResponse(
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

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function getSalesCustomer(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET SALES CUSTOMER",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET SALES CUSTOMER",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET SALES CUSTOMER",
        secret
      );
    }

    const sql = await db.query(
      `select customer_id, customer_name,customer_phoneno,customer_gstno from enquirycustomermaster where status = 1`
    );
    if (sql.length) {
      const updatedSql = sql.map((row) => ({
        ...row,
        customer_id: `SA-${row.customer_id}`,
      }));
      return helper.getSuccessResponse(
        true,
        "success",
        "Sales customer Fetched Successfully",
        updatedSql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Sales customer Fetched Successfully",
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

async function addOverdueDetails(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "ADD OVERDUE DETAILS",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "ADD OVERDUE DETAILS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "ADD OVERDUE DETAILS",
        secret
      );
    }

    // Check if querystring is provided
    if (!billing.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD OVERDUE DETAILS",
        secret
      );
    }

    // Decrypt querystring
    let querydata;
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD OVERDUE DETAILS",
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
        "ADD OVERDUE DETAILS",
        secret
      );
    }

    // Validate required fields
    const requiredFields = [
      { field: "voucherid", message: "Voucher id missing." },
      { field: "date", message: "Date missing." },
      { field: "feedback", message: "Feedback missing." },
    ];
    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD OVERDUE DETAILS",
          secret
        );
      }
    }

    const overdueEntry = {
      date: formatDate(querydata.date),
      feedback: querydata.feedback,
    };

    // Append overdueEntry to Overdue_days JSON array
    const sql = await db.query(
      `UPDATE clientvouchermaster
       SET Overdue_days = JSON_ARRAY_APPEND(Overdue_days, '$', CAST(? AS JSON))
       WHERE voucher_id = ?`,
      [JSON.stringify(overdueEntry), querydata.voucherid]
    );

    if (sql.affectedRows > 0) {
      await mqttclient.publishMqttMessage(
        "refresh",
        "Overdue details updated successfully"
      );
      return helper.getSuccessResponse(
        true,
        "success",
        "Overdue details updated successfully",
        {
          voucherid: querydata.voucherid,
          date: querydata.date,
          feedback: querydata.feedback,
        },
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No voucher updated. Please check the voucher id.",
        "ADD OVERDUE DETAILS",
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
const formatDate = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
async function getDashboardDetails(billing) {
  try {
    // Check if the session token exists
    if (!billing.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET DASHBOARD DETAILS",
        ""
      );
    }
    var secret = billing.STOKEN.substring(0, 16);
    // Validate session token length
    if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET DASHBOARD DETAILS",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET DASHBOARD DETAILS",
        secret
      );
    }

    // Check if querystring is provided
    if (!billing.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET DASHBOARD DETAILS",
        secret
      );
    }

    // Decrypt querystring
    let querydata;
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET DASHBOARD DETAILS",
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
        "GET DASHBOARD DETAILS",
        secret
      );
    }

    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    function formatDate(date) {
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, "0");
      const dd = String(date.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    const fromDate = querydata.fromDate || formatDate(firstDay);
    const toDate =
      querydata.toDate ||
      (querydata.fromDate ? formatDate(now) : formatDate(lastDay));

    const inputType = querydata.type ? querydata.type.toLowerCase().trim() : "";

    let filterCondition = "";
    let types = [];

    if (inputType === "receivables") {
      filterCondition = "voucher_type = 'receipt voucher'";
    } else if (inputType === "payables") {
      filterCondition = "voucher_type = 'payment voucher'";
    } else {
      types =
        inputType === "all" || inputType === ""
          ? ["sales", "subscription", "purchase"]
          : [inputType];
      const placeholders = types.map(() => "?").join(", ");
      filterCondition = `invoice_type IN (${placeholders})`;
    }

    // Dynamically adjust params for query
    const params = [...types, fromDate, toDate].filter(Boolean);

    const sql = `
    SELECT 
    COUNT(*) AS totalInvoices,
    SUM(
        CAST(sub_total AS DECIMAL) +
        CAST(IGST AS DECIMAL) +
        CAST(CGST AS DECIMAL) +
        CAST(SGST AS DECIMAL)
    ) AS totalAmount,
    COUNT(CASE
        WHEN
            CAST(pending_amount AS DECIMAL) = 0
            AND (fully_cleared = 1 OR partially_cleared = 1)
        THEN 1
    END) AS paidInvoices,
    SUM(CASE
        WHEN
            CAST(paid_amount AS DECIMAL) > 0
            AND CAST(pending_amount AS DECIMAL) = 0
            AND (fully_cleared = 1 OR partially_cleared = 1)
        THEN CAST(paid_amount AS DECIMAL)
        ELSE 0
    END) AS paidAmount,
    COUNT(CASE
        WHEN NOT (
            CAST(pending_amount AS DECIMAL) = 0
            AND (fully_cleared = 1 OR partially_cleared = 1)
        )
        THEN 1
    END) AS pendingInvoices,
    SUM(
        GREATEST(
            ( 
                CAST(sub_total AS DECIMAL) +
                CAST(IGST AS DECIMAL) +
                CAST(CGST AS DECIMAL) +
                CAST(SGST AS DECIMAL)
            ) - CAST(paid_amount AS DECIMAL),
            0
        )
    ) AS pendingAmount
FROM clientvouchermaster
WHERE status = 1
    AND Deleted_flag = 0
    AND ${filterCondition}
    AND DATE(created_at) BETWEEN ? AND ?           
`;

    const [rows] = await db.query(sql, params);

    // Check if data exists
    if (!rows || rows.length === 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "No dashboard data found for the user.",
        "GET DASHBOARD DETAILS",
        secret
      );
    }

    return helper.getSuccessResponse(
      true,
      "success",
      "Dashboard details retrieved successfully.",
      {
        dashboard: rows, // only return the single object
      },
      secret
    );
  } catch (error) {
    console.error("DASHBOARD ERROR:", error); // optional log for debugging
    return helper.getErrorResponse(
      false,
      "error",
      "Internal server error.",
      "GET DASHBOARD DETAILS",
      secret
    );
  }
}

//#################################################################################################################################################################################
//#################################################################################################################################################################################
//#################################################################################################################################################################################
//#################################################################################################################################################################################

async function updatePaymentDetails(req, res, next) {
  let secret, querydata, billing;
  try {
    try {
      await uploadFile.uploadVoucher(req, res);
      billing = req.body;
      // Check if the session token exists
      if (!billing.STOKEN) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken missing. Please provide the Login sessiontoken",
          "UPDATE PAYMENT DETAILS",
          ""
        );
      }
      secret = billing.STOKEN.substring(0, 16);
      querydata;
      // Validate session token length
      if (billing.STOKEN.length > 50 || billing.STOKEN.length < 30) {
        return helper.getErrorResponse(
          false,
          "error",
          "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
          "UPDATE PAYMENT DETAILS",
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
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [billing.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "UPDATE PAYMENT DETAILS",
        secret
      );
    }
    // Check if querystring is provided
    if (!billing.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE PAYMENT DETAILS",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(billing.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE PAYMENT DETAILS",
        secret
      );
    }

    // Parse and assign
    let paymentdetails = null;

    try {
      querydata = JSON.parse(querydata);
      paymentdetails = querydata.paymentdetails || {};
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "UPDATE PAYMENT DETAILS",
        secret
      );
    }

    // Now you can safely access like:
    const mode = paymentdetails.paymentmode;
    const requiredFields = [
      { field: "paymentdetails", message: "Payment Details missing." },
      { field: "transactionid", message: "Transaction id missing." },
      { field: "voucherid", message: "Voucher id missing." },
      // { field: "paymentmode", message: "Payment mode missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "UPDATE PAYMENT DETAILS",
          secret
        );
      }
    }

    // Append overdueEntry to Overdue_days JSON array
    const sql = await db.query(
      `UPDATE clientvouchermaster
       SET Payment_details = ?
       WHERE voucher_id = ? AND Payment_details IS NOT NULL`,
      [JSON.stringify(paymentdetails), querydata.voucherid]
    );
    var path = null;
    if (req.file != null) {
      path = req.file.path;
    }
    if (path != null) {
      const sql3 = await db.query(
        `Update vouchertransactions Set file_path = ?,payment_mode =? where vouchertrans_id = ?`,
        [path, mode, querydata.transactionid]
      );
    }

    if (sql.affectedRows > 0) {
      await mqttclient.publishMqttMessage(
        "refresh",
        "Payment details updated successfully"
      );
      return helper.getSuccessResponse(
        true,
        "success",
        "Payment details updated successfully",
        querydata.voucherid,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No voucher updated. Please check the voucher id.",
        "UPDATE PAYMENT DETAILS",
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
//#################################################################################################################################################################################
//#################################################################################################################################################################################
//#################################################################################################################################################################################
//#################################################################################################################################################################################

async function getReceiptFile(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET RECEIPT DATA FOR PDF",
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
        "GET RECEIPT DATA FOR PDF",
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
        "GET RECEIPT DATA FOR PDF",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET RECEIPT DATA FOR PDF",
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
        "GET RECEIPT DATA FOR PDF",
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
        "GET RECEIPT DATA FOR PDF",
        secret
      );
    }

    if (
      !querydata.hasOwnProperty("transactionid") ||
      querydata.transactionid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Transaction id missing. Please provide the transaction id",
        "GET RECEIPT DATA FOR PDF",
        secret
      );
    }
    const sql = await db.query(
      `select receipt_path from vouchertransactions where vouchertrans_id = ?`,
      [querydata.transactionid]
    );
    var data;
    if (sql[0]) {
      // Ensure file exists
      if (!fs.existsSync(sql[0].receipt_path)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET RECEIPT DATA FOR PDF",
          secret
        );
      }
      binarydata = await helper.convertFileToBinary(sql[0].receipt_path);
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

//#################################################################################################################################################################################
//#################################################################################################################################################################################
//#################################################################################################################################################################################
//#################################################################################################################################################################################

async function addOpeningBalance(subscription) {
  try {
    // Check if the session token exists
    if (!subscription.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET RECEIPT DATA FOR PDF",
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
        "GET RECEIPT DATA FOR PDF",
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
        "GET RECEIPT DATA FOR PDF",
        secret
      );
    }

    // Check if querystring is provided
    if (!subscription.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET RECEIPT DATA FOR PDF",
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
        "GET RECEIPT DATA FOR PDF",
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
        "GET RECEIPT DATA FOR PDF",
        secret
      );
    }

    const requiredFields = [
      { field: "customerid", message: "Customer id missing." },
      { field: "year", message: "Year missing." },
      { field: "balance_amount", message: "Balance amount missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "Add the opening balance",
          secret
        );
      }
    }
    var customer_name;
    try {
      const [result1] = await db.spcall(
        `CALL sp_InsertOrUpdate_OpeningBalance(?, ?, ?,@p_id); select @p_id`,
        [querydata.customerid, querydata.year, querydata.balance_amount]
      );
      const objectvalue = result1[1][0];
      const openingbalance_id = objectvalue["@p_id"];
      try {
        const customerid = querydata.customerid;
        if (customerid != null && customerid != 0 && customerid != undefined) {
          sql1 = await db.query1(
            `select customer_name from customermaster where customer_id = (?)`,
            [customerid]
          );
          if (sql1.length > 0) {
            customer_name = sql1[0].customer_name;
          }
        }
        const [sql2] = await db.spcall(
          `CALL InsertClientVoucher(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@voucher_id,@voucher_number); select @voucher_id,@voucher_number`,
          [
            openingbalance_id,
            "opening balance voucher",
            null,
            null,
            null,
            customer_name,
            null,
            null,
            null,
            querydata.balance_amount,
            0,
            0,
            0,
            0,
            "subscription",
            `SB-${customerid}`,
            `Opening balance for ${customerid}`,
            null,
          ]
        );
        const objectvalue = sql2[1][0];
        const voucherid = objectvalue["@voucher_id"];
        const vouchernumber = objectvalue["@voucher_number"];
        const [sql3] = await db.spcall(
          `CALL SP_DEBIT_CLIENT_LEDGER(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,@ledgerid); select @ledgerid`,
          [
            openingbalance_id,
            customer_name,
            null,
            JSON.stringify({
              amount: 0,
              transactiondetails: null,
              date: null,
              feedback: null,
            }),
            null,
            querydata.balance_amount,
            0,
            0,
            0,
            0,
            0,
            "subscription",
            voucherid,
            vouchernumber,
            "receivable",
            `opening balance`,
            1,
          ]
        );
      } catch (er) {
        console.log(`Invoice number not exits ${er.message}`);
        console.log(`Invoice number not exits ${er}`);
      }
      return helper.getSuccessResponse(
        true,
        "success",
        "Opening balance updated successfully",
        querydata.customerid,
        secret
      );
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Error while inserting the opening balance",
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

//#################################################################################################################################################################################
//#################################################################################################################################################################################
//#################################################################################################################################################################################
//#################################################################################################################################################################################

async function getOpeningBalance(subscription) {
  let secret = null;

  try {
    /* ===============================
       Session Token Validation
    =============================== */
    if (!subscription.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing",
        "GET OPENING BALANCE",
        ""
      );
    }

    secret = subscription.STOKEN.substring(0, 16);

    if (subscription.STOKEN.length > 50 || subscription.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid sessiontoken size",
        "GET OPENING BALANCE",
        secret
      );
    }

    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [subscription.STOKEN]
    );

    const userid = result[1][0]["@result"];

    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid sessiontoken",
        "GET OPENING BALANCE",
        secret
      );
    }

    /* ===============================
       Querystring Handling
    =============================== */
    if (!subscription.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing",
        "GET OPENING BALANCE",
        secret
      );
    }

    let querydata;

    try {
      querydata = await helper.decrypt(subscription.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (err) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid querystring",
        "GET OPENING BALANCE",
        secret
      );
    }

    if (!querydata.year) {
      return helper.getErrorResponse(
        false,
        "error",
        "Year is required",
        "GET OPENING BALANCE",
        secret
      );
    }

    /* ===============================
       Fetch Branch IDs
    =============================== */
    let branchIds = [];

    if (querydata.branchid) {
      branchIds = [querydata.branchid];
    } else if (querydata.customerid) {
      const branches = await db.query1(
        `SELECT branch_id FROM branchmaster WHERE customer_id = ?`,
        [querydata.customerid]
      );

      branchIds = branches.map((b) => b.branch_id);
    } else if (querydata.organizationid) {
      const customers = await db.query1(
        `SELECT customer_id FROM customermaster WHERE organization_id = ?`,
        [querydata.organizationid]
      );

      const customerIds = customers.map((c) => c.customer_id);

      if (customerIds.length > 0) {
        const placeholders = customerIds.map(() => "?").join(",");

        const branches = await db.query1(
          `SELECT branch_id FROM branchmaster WHERE customer_id IN (${placeholders})`,
          customerIds
        );

        branchIds = branches.map((b) => b.branch_id);
      }
    } else {
      // 🔥 No filter → ALL branches
      const branches = await db.query1(`SELECT branch_id FROM branchmaster`);

      branchIds = branches.map((b) => b.branch_id);
    }

    /* ===============================
       Clean Data
    =============================== */
    branchIds = branchIds.filter((id) => id != null);

    /* ===============================
       Fetch Opening Balance
    =============================== */

    let balances = [];

    // ✅ If NO branches → fetch full year data
    if (branchIds.length === 0) {
      const rows = await db.query(
        `SELECT branch_id, balance_amount 
         FROM openingbalance
         WHERE year = ?`,
        [querydata.year]
      );
      balances = rows;
    } else {
      const placeholders = branchIds.map(() => "?").join(",");

      const rows = await db.query(
        `SELECT branch_id, balance_amount 
         FROM openingbalance
         WHERE branch_id IN (${placeholders}) AND year = ?`,
        [...branchIds, querydata.year]
      );

      balances = rows;
    }

    /* ===============================
       Response Handling
    =============================== */

    if (!balances.length) {
      return helper.getSuccessResponse(
        true,
        "success",
        "No opening balance found",
        {
          total_balance: 0,
          data: null,
        },
        secret
      );
    }

    const totalBalance = balances.reduce(
      (sum, row) => sum + Number(row.balance_amount || 0),
      0
    );

    return helper.getSuccessResponse(
      true,
      "success",
      "Opening balance fetched successfully",
      {
        total_balance: totalBalance,
        data: balances,
      },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal server error",
      er.message,
      secret
    );
  }
}
module.exports = {
  getSubscriptionInvoice,
  getSalesInvoice,
  getBinaryFile,
  getTransactionFile,
  getVouchers,
  ClearVouchers,
  ClearConsolidateVouchers,
  accountLedger,
  consolidateLedger,
  TDSLedger,
  GSTLedger,
  getSubscriptionCustomer,
  getSalesCustomer,
  addOverdueDetails,
  getDashboardDetails,
  updatePaymentDetails,
  getReceiptFile,
  addOpeningBalance,
  getOpeningBalance,
};
