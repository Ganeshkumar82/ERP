const db = require("../db");
const helper = require("../helper");
const uploadFile = require("../middleware");

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR ADD VENDOR ######################################################################################
// {
//   "vendorname": "JK constructiond",
//   "vendormailid": "jk@gmail.com",
//   "vendorphoneno": "8393923242",
//   "vendoraddress": "chinnverampatti,udumallai",
//   "vendorgst": "33ABCD43wsd123",
//   "vendorproducts": [
//     { "productname": "Cement", "gstpercent": 18.0, "hsn": "2523", "price": 350.00 },
//     { "productname": "Steel", "gstpercent": 18.0, "hsn": "7207", "price": 600.00 }
//   ]
// }
//####################################################################### RESPONSE BODY FOR ADD VENDOR #######################################################
// {"code":true,"message":"Vendor Added Successfully","Value":13}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function AddVendor(vendor) {
  try {
    // Check if the session token exists
    if (!vendor.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "ADD VENDOR",
        ""
      );
    }

    // Validate session token length
    if (vendor.STOKEN.length > 50 || vendor.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "ADD VENDOR",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [vendor.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "Login session token Invalid. Please provide the valid session token",
        "ADD VENDOR",
        ""
      );
    }

    // Check if querystring is provided
    if (!vendor.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "Querystring missing. Please provide the querystring",
        "ADD VENDOR",
        ""
      );
    }

    var secret = vendor.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(vendor.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD VENDOR",
        secret
      );
    }

    // Parse the decrypted querystring
    try {
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "Querystring JSON error. Please provide valid JSON",
        "ADD VENDOR",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vendorname") || querydata.vendorname == "") {
      return helper.getErrorResponse(
        false,
        "Vendor name missing. Please provide the Vendor name",
        "ADD VENDOR",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("vendormailid") ||
      querydata.vendormailid == ""
    ) {
      return helper.getErrorResponse(
        false,
        "Vendor Email id missing. Please provide the Vendor Email id",
        "ADD VENDOR",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("vendorphoneno") ||
      querydata.vendorphoneno == ""
    ) {
      return helper.getErrorResponse(
        false,
        "Vendor Phone number missing. Please provide the Vendor Phone number",
        "ADD VENDOR",
        secret
      );
    }
    if (
      !querydata.hasOwnProperty("vendoraddress") ||
      querydata.vendoraddress == ""
    ) {
      return helper.getErrorResponse(
        false,
        "Vendor address missing. Please provide the Vendor address",
        "ADD VENDOR",
        secret
      );
    }
    if (!querydata.hasOwnProperty("vendorgst") || querydata.vendorgst == "") {
      return helper.getErrorResponse(
        false,
        "Vendor GST Number missing. Please provide the Vendor GST number",
        "ADD VENDOR",
        secret
      );
    }

    try {
      // Insert vendor into vendormaster
      const sql = await db.query(
        `INSERT INTO vendormaster (vendor_name, vendor_mail, vendor_phoneno, vendor_address, vendor_gstno, status, deleted_flag, Row_updated_date, Created_by) VALUES (?, ?, ?, ?, ?, 1, 0, NOW(), ?)`,
        [
          querydata.vendorname,
          querydata.vendormailid,
          querydata.vendorphoneno,
          querydata.vendoraddress,
          querydata.vendorgst,
          userid,
        ]
      );
      const vendorid = sql.insertId;
      // Insert vendorproducts if provided
      if (Array.isArray(querydata.vendorproducts) && querydata.vendorproducts.length > 0) {
        for (const prod of querydata.vendorproducts) {
          if (prod.productname && prod.gstpercent != null && prod.hsn && prod.price != null) {
            await db.query(
              `INSERT INTO vendorproducts (vendor_id, productname, gstpercent, hsn, price) VALUES (?, ?, ?, ?, ?)` ,
              [
                vendorid,
                prod.productname,
                prod.gstpercent,
                prod.hsn,
                prod.price
              ]
            );
          }
        }
      }
      if (vendorid != null && vendorid != "") {
        return helper.getSuccessResponse(
          true,
          "Vendor Added Successfully",
          vendorid,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "Error while adding the vendor.",
          "ADD VENDOR",
          secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "Internal error. Please contact Administration",
        er.message,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "Internal error. Please contact Administration",
      er.message,
      secret
    );
  }
}

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR GET VENDOR #####################################################################################
// {
//   "vendorid": 1
// }
// OR
//   empty body - For fetching all the vendor list
//####################################################################### RESPONSE BODY FOR GET VENDOR #######################################################
// {
//   "code": true,
//   "message": "Vendor Fethced Successfully",
//   "Value": [
//     {
//       "vendor_id": 1,
//       "vendor_name": "JK constructiond",
//       "vendor_mail": "jk@gmail.com",
//       "vendor_phoneno": "8393923242",
//       "vendor_gstno": "33ABCD43wsd123",
//       "vendor_address": "chinnverampatti,udumallai",
//       "vendorproducts": [
//         { "id": 1, "productname": "Cement", "gstpercent": 18.0, "hsn": "2523", "price": 350.00 },
//         { "id": 2, "productname": "Steel", "gstpercent": 18.0, "hsn": "7207", "price": 600.00 }
//       ]
//     }
//   ]
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetVendor(vendor) {
  try {
    // Check if the session token exists
    if (!vendor.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "FETCH VENDOR",
        ""
      );
    }

    // Validate session token length
    if (vendor.STOKEN.length > 50 || vendor.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH VENDOR",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [vendor.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "FETCH VENDOR",
        ""
      );
    }

    // Check if querystring is provided
    if (!vendor.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "FETCH VENDOR",
        ""
      );
    }

    var secret = vendor.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(vendor.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "FETCH VENDOR",
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
        "FETCH VENDOR",
        secret
      );
    }
    try {
      let sql;
      if (querydata.vendorid == 0) {
        sql = await db.query(
          `select vendor_id,vendor_name,vendor_mail,vendor_phoneno,vendor_gstno,vendor_address,Logo_path from vendormaster where status =1 and deleted_flag = 0`
        );
      } else {
        sql = await db.query(
          `select vendor_id,vendor_name,vendor_mail,vendor_phoneno,vendor_gstno,vendor_address,Logo_path from vendormaster where vendor_id = ${querydata.vendorid}`
        );
      }
      // For each vendor, fetch their products
      for (let i = 0; i < sql.length; i++) {
        // Convert Logo_path to binary if available
        if (sql[i].Logo_path) {
          try {
            const binaryData = await helper.convertFileToBinary(sql[i].Logo_path);
            sql[i].Logo_path = binaryData;
          } catch (error) {
            console.error("Error reading file:", sql[i].Logo_path, error);
            sql[i].Logo_path = null;
          }
        }
        // Fetch vendorproducts
        const products = await db.query(
          `SELECT id, productname, gstpercent, hsn, price FROM vendorproducts WHERE vendor_id = ?`,
          [sql[i].vendor_id]
        );
        sql[i].vendorproducts = products;
      }
      return helper.getSuccessResponse(
        true,
        "success",
        "Vendor Fethced Successfully",
        sql,
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

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//####################################################################### REQUEST BODY  ##############################################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_rfq_id"
// }
// File upload in form-data with key "file"
//####################################################################### RESPONSE BODY  ##############################################################################################################
// {"code":true,"message":"Quotation Added Successfully","Value":1}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function AddQuotation(req, res) {
  try {
    // Upload the PDF file first
    try {
      await uploadFile.uploadVendorQuotation(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "Please upload a PDF file!",
          "ADD QUOTATION",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        `Could not upload the file. ${er.message}`,
        "ADD QUOTATION",
        ""
      );
    }

    let quotation = req.body;

    // Check if the session token exists
    if (!quotation.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "ADD QUOTATION",
        ""
      );
    }

    // Validate session token length
    if (quotation.STOKEN.length > 50 || quotation.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "ADD QUOTATION",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [quotation.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "Login session token Invalid. Please provide the valid session token",
        "ADD QUOTATION",
        ""
      );
    }

    // Check if querystring is provided
    if (!quotation.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "Querystring missing. Please provide the querystring",
        "ADD QUOTATION",
        ""
      );
    }

    var secret = quotation.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(quotation.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
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
        "Querystring JSON error. Please provide valid JSON",
        "ADD QUOTATION",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("rfqid") || querydata.rfqid == "") {
      return helper.getErrorResponse(
        false,
        "RFQ ID missing. Please provide the RFQ ID",
        "ADD QUOTATION",
        secret
      );
    }

    try {
      // Get the file path from the uploaded file
      const filePath = req.file.path;
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD
      const formattedDateTime = currentDate.toISOString().slice(0, 19).replace('T', ' '); // YYYY-MM-DD HH:MM:SS

      // Insert into vprocesslist (or your table name)
      const sql = await db.query(
        `INSERT INTO vprocesslist (
          Process_filepath,
          Process_date,
          Created_by,
          vprocess_gen_id,
          process_type,
          process_name
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [
          filePath,
          formattedDate,
          userid,
          querydata.rfqid,
          'QUOTATION',
          'RFQ'
        ]
      );
      // Get the inserted id
      const vprocessid = sql.insertId;
      if (vprocessid != null && vprocessid !== "") {
        return helper.getSuccessResponse(
          true,
          "Quotation Added Successfully",
          vprocessid,
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "Error while adding the quotation.",
          "ADD QUOTATION",
          secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "Internal error. Please contact Administration",
        er.message,
        secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "Internal error. Please contact Administration",
      er.message,
      ""
    );
  }
}

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR VENDOR DETAILS PRELOADER #########################################################################
// {
//   "event_id": "some_event_uid",
//   "event_type": "some_event_type"
// }
//####################################################################### RESPONSE BODY FOR VENDOR DETAILS PRELOADER ##########################################
// {
//   "code": true,
//   "message": "RFQ ID fetched successfully",
//   "rfq_gen_id": "ssipl/rfq250301"
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function vendorDetailsPreLoader(req, res) {
  try {
    const { event_id, event_type } = req.body;
    if (!event_id || !event_type) {
      return res.json({
        code: false,
        message: "event_id and event_type are required",
        rfq_gen_id: null
      });
    }
    // Fetch the rfq_gen_id from your table (assuming vprocesslist or similar)
    const result = await db.query(
      `SELECT vprocess_gen_id FROM vprocesslist WHERE event_id = ? AND event_type = ? LIMIT 1`,
      [event_id, event_type]
    );
    if (result && result.length > 0) {
      return res.json({
        code: true,
        message: "RFQ ID fetched successfully",
        rfq_gen_id: result[0].vprocess_gen_id
      });
    } else {
      return res.json({
        code: false,
        message: "No RFQ ID found for the given event_id and event_type",
        rfq_gen_id: null
      });
    }
  } catch (er) {
    return res.json({
      code: false,
      message: "Internal error. Please contact Administration",
      rfq_gen_id: null
    });
  }
}

module.exports = {
  AddVendor,
  GetVendor,
  AddQuotation,
  vendorDetailsPreLoader
};

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################