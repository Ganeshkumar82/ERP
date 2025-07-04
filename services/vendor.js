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
//########################################### REQUEST BODY FOR VENDOR DETAILS PRELOADER (RFQ ID GENERATOR) ###################################################
// {
//   "STOKEN": "your_session_token"
// }
//####################################################################### RESPONSE BODY FOR VENDOR DETAILS PRELOADER ##########################################
// {
//   "code": true,
//   "message": "RFQ ID generated successfully",
//   "rfq_id": "SSIPL-RFQ/2507/01"
// }
// Note: RFQ ID format is SSIPL-RFQ/{YYMM}/{counter} where:
// - YYMM is year-month (e.g., 2507 for July 2025)
// - counter is 2-digit sequential number (01, 02, etc.)
// Generated using Gen_vendor_rfqId stored procedure and stored in vendor_rfq_ids table
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function vendorDetailsPreLoader(req, res) {
  try {
    const { STOKEN } = req.body;
    if (!STOKEN) {
      return res.json({
        code: false,
        message: "Session token (STOKEN) is required",
        rfq_id: null
      });
    }
    // Validate session token length
    if (STOKEN.length > 50 || STOKEN.length < 30) {
      return res.json({
        code: false,
        message: "Session token size invalid. Please provide a valid session token",
        rfq_id: null
      });
    }
    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];
    if (!userid) {
      return res.json({
        code: false,
        message: "Session token invalid. Please provide a valid session token",
        rfq_id: null
      });
    }
    // Generate a unique RFQ ID using Gen_vendor_rfqId SP with slash delimiter
    let newRfqId;
    try {
      const [rfqResult] = await db.spcall(
        `CALL Gen_vendor_rfqId(?, '/', @out); SELECT @out;`,
        [userid]
      );
      const objectValue = rfqResult[1][0];
      newRfqId = objectValue["@out"];
    } catch (e) {
      return res.json({
        code: false,
        message: "Failed to generate RFQ ID using stored procedure.",
        rfq_id: null
      });
    }
    // Ensure uniqueness in vendor_rfq_ids table
    const exists = await db.query(
      `SELECT rfq_id FROM vendor_rfq_ids WHERE rfq_id = ?`,
      [newRfqId]
    );
    if (exists && exists.length > 0) {
      return res.json({
        code: false,
        message: "RFQ ID collision, please try again",
        rfq_id: null
      });
    }
    // Insert into vendor_rfq_ids (handled by stored procedure)
    // Note: The stored procedure already inserts into vendor_rfq_ids table
    return res.json({
      code: true,
      message: "RFQ ID generated successfully",
      rfq_id: newRfqId
    });
  } catch (er) {
    return res.json({
      code: false,
      message: "Internal error. Please contact Administration",
      rfq_id: null
    });
  }
}

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR GET PROCESS LIST #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_optional_filters"
// }
// Optional filters in querystring:
// {
//   "vprocess_id": 1,  // Optional - specific process ID
//   "vendor_id": 1,    // Optional - filter by vendor
//   "status": 1        // Optional - filter by status
// }
//####################################################################### RESPONSE BODY FOR GET PROCESS LIST #######################################################
// {
//   "code": true,
//   "message": "Process list fetched successfully",
//   "Value": [
//     {
//       "vprocess_id": 1,
//       "vendor_name": "JK constructiond",
//       "Process_date": "2025-03-04",
//       "Vendor_id": 1,
//       "Customer_id": null,
//       "Row_updated_date": "2025-03-04 15:50:53",
//       "status": 1,
//       "deleted_flag": 0,
//       "archive_data": 0,
//       "Created_by": 4,
//       "cprocess_id": 4,
//       "feedback": null,
//       "vprocess_gen_id": "ssipl/rfq250301"
//     }
//   ]
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetProcessList(processData) {
  try {
    // Check if the session token exists
    if (!processData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "GET PROCESS LIST",
        ""
      );
    }

    // Validate session token length
    if (processData.STOKEN.length > 50 || processData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "GET PROCESS LIST",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [processData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "Login session token Invalid. Please provide the valid session token",
        "GET PROCESS LIST",
        ""
      );
    }

    // Check if querystring is provided
    if (!processData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "Querystring missing. Please provide the querystring",
        "GET PROCESS LIST",
        ""
      );
    }

    var secret = processData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(processData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET PROCESS LIST",
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
        "GET PROCESS LIST",
        secret
      );
    }

    try {
      let sql;
      let queryParams = [];
      
      // Base query with JOIN to get vendor name
      let baseQuery = `
        SELECT 
          vpm.vprocess_id,
          vm.vendor_name,
          vpm.Process_date,
          vpm.Vendor_id,
          vpm.Customer_id,
          vpm.Row_updated_date,
          vpm.status,
          vpm.deleted_flag,
          vpm.archive_data,
          vpm.Created_by,
          vpm.cprocess_id,
          vpm.feedback,
          vpm.vprocess_gen_id
        FROM vendorprocessmaster vpm
        LEFT JOIN vendormaster vm ON vpm.Vendor_id = vm.vendor_id
        WHERE vpm.deleted_flag = 0
      `;

      // Add filters based on querydata
      if (querydata.hasOwnProperty("vprocess_id") && querydata.vprocess_id != null && querydata.vprocess_id !== "") {
        baseQuery += " AND vpm.vprocess_id = ?";
        queryParams.push(querydata.vprocess_id);
      }

      if (querydata.hasOwnProperty("vendor_id") && querydata.vendor_id != null && querydata.vendor_id !== "") {
        baseQuery += " AND vpm.Vendor_id = ?";
        queryParams.push(querydata.vendor_id);
      }

      if (querydata.hasOwnProperty("status") && querydata.status != null && querydata.status !== "") {
        baseQuery += " AND vpm.status = ?";
        queryParams.push(querydata.status);
      }

      // Order by latest first
      baseQuery += " ORDER BY vpm.Row_updated_date DESC";

      // Execute the query
      sql = await db.query(baseQuery, queryParams);

      return helper.getSuccessResponse(
        true,
        "Process list fetched successfully",
        sql,
        secret
      );
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
//########################################### REQUEST BODY FOR POST RFQ #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_rfq_details"
// }
// File upload in form-data with key "file"
// Optional querystring data:
// {
//   "rfq_id": "SSIPL-RFQ/2507/01",
//   "vendor_id": 1,
//   "vendor_email": "vendor@example.com",
//   "cc_email": "cc@example.com",
//   "notes": "Additional notes"
// }
//####################################################################### RESPONSE BODY FOR POST RFQ #######################################################
// {"code":true,"message":"RFQ Posted Successfully","Value":{"vprocess_id": 1, "process_id": 2}}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function PostRFQ(req, res) {
  try {
    // Upload the PDF file first using dedicated RFQ upload function
    try {
      await uploadFile.uploadPostRFQ(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "Please upload a PDF file!",
          "POST RFQ",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        `Could not upload the file. ${er.message}`,
        "POST RFQ",
        ""
      );
    }

    let rfqData = req.body;

    // Check if the session token exists
    if (!rfqData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "POST RFQ",
        ""
      );
    }

    // Validate session token length
    if (rfqData.STOKEN.length > 50 || rfqData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "POST RFQ",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [rfqData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "Login session token Invalid. Please provide the valid session token",
        "POST RFQ",
        ""
      );
    }

    // Check if querystring is provided
    if (!rfqData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "Querystring missing. Please provide the querystring",
        "POST RFQ",
        ""
      );
    }

    var secret = rfqData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(rfqData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "Querystring Invalid error. Please provide the valid querystring.",
        "POST RFQ",
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
        "POST RFQ",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("rfq_id") || querydata.rfq_id == "") {
      return helper.getErrorResponse(
        false,
        "RFQ ID missing. Please provide the RFQ ID",
        "POST RFQ",
        secret
      );
    }

    if (!querydata.hasOwnProperty("vendor_id") || querydata.vendor_id == "") {
      return helper.getErrorResponse(
        false,
        "Vendor ID missing. Please provide the Vendor ID",
        "POST RFQ",
        secret
      );
    }

    try {
      // Get vendor details
      const vendorDetails = await db.query(
        `SELECT vendor_name, vendor_mail, vendor_address FROM vendormaster WHERE vendor_id = ? AND status = 1 AND deleted_flag = 0`,
        [querydata.vendor_id]
      );

      if (!vendorDetails || vendorDetails.length === 0) {
        return helper.getErrorResponse(
          false,
          "Vendor not found or inactive",
          "POST RFQ",
          secret
        );
      }

      const vendor = vendorDetails[0];
      const filePath = req.file.path;
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD

      // Insert into vendorprocessmaster
      const vprocessResult = await db.query(
        `INSERT INTO vendorprocessmaster (
          vendor_name,
          Process_date,
          Vendor_id,
          Customer_id,
          status,
          deleted_flag,
          archive_data,
          Created_by,
          vprocess_gen_id,
          Row_updated_date
        ) VALUES (?, ?, ?, NULL, 1, 0, 0, ?, ?, NOW())`,
        [
          vendor.vendor_name,
          formattedDate,
          querydata.vendor_id,
          userid,
          querydata.rfq_id
        ]
      );

      const vprocess_id = vprocessResult.insertId;

      // Insert into vprocesslist
      const processResult = await db.query(
        `INSERT INTO vprocesslist (
          process_name,
          Process_filepath,
          Process_date,
          Approved_status,
          status,
          deleted_flag,
          Created_by,
          vprocess_gen_id,
          process_type,
          vendor_address,
          vendor_name,
          Row_updated_date
        ) VALUES (?, ?, ?, 0, 1, 0, ?, ?, 'RFQ', ?, ?, NOW())`,
        [
          'RFQ',
          filePath,
          formattedDate,
          userid,
          querydata.rfq_id,
          vendor.vendor_address,
          vendor.vendor_name
        ]
      );

      const process_id = processResult.insertId;

      // Send email to vendor
      try {
        const mailer = require("../mailer");
        
        // For now, hardcoded email as requested
        const vendorEmail = "kishorekkumar34@gmail.com";
        const ccEmail = querydata.cc_email || "";
        
        const subject = `Request for Quotation - ${querydata.rfq_id}`;
        const notes = querydata.notes || "Please review the attached RFQ document and provide your best quotation.";
        
        // Send email with PDF attachment using vendor-specific function
        const emailSent = await mailer.sendVendorRFQ(
          vendor.vendor_name,
          vendorEmail,
          subject,
          "VENDORRFQ", // module tag for email settings
          filePath, // file path for attachment
          querydata.rfq_id, // RFQ ID
          notes, // additional notes
          ccEmail // CC email
        );

        if (!emailSent) {
          console.log("Warning: Email sending failed, but RFQ was saved successfully");
        }
      } catch (emailError) {
        console.log("Warning: Email sending error:", emailError);
        // Continue execution even if email fails
      }

      if (vprocess_id != null && process_id != null) {
        return helper.getSuccessResponse(
          true,
          "RFQ Posted Successfully",
          {
            vprocess_id: vprocess_id,
            process_id: process_id,
            vendor_name: vendor.vendor_name,
            rfq_id: querydata.rfq_id
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "Error while posting the RFQ.",
          "POST RFQ",
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

module.exports = {
  AddVendor,
  GetVendor,
  AddQuotation,
  vendorDetailsPreLoader,
  GetProcessList,
  PostRFQ
};

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################