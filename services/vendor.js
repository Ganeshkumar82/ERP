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

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR ADD VENDOR ######################################################################################
// {
//   "vendorname": "JK Construction",
//   "address": "123 Main Street, Coimbatore",
//   "state": "Tamil Nadu", 
//   "pincode": "641001",
//   "contactpersonname": "John Doe",
//   "contactpersondesignation": "Manager",
//   "contactpersonphone": "8393923242",
//   "email": "jk@gmail.com",
//   "businesstype": "Manufacturer",
//   "yearofestablishment": 2010,
//   "gstnumber": "33ABCD43wsd123",
//   "pannumber": "ABCPD1234E",
//   "annualturnover": 50000000.00,
//   "productsservices": "Construction materials, cement, steel",
//   "hsnsaccode": "2523,7207",
//   "description": "Leading manufacturer of construction materials",
//   "bankname": "State Bank of India",
//   "branchname": "Coimbatore Main",
//   "accountnumber": "1234567890",
//   "ifsccode": "SBIN0001234",
//   "isocertification": "ISO 9001:2015",
//   "othercertifications": "BIS certification for cement"
// }
// File uploads (form-data):
// - registration_certificate: PDF/Image file
// - pan_upload: PDF/Image file  
// - cancelled_cheque: PDF/Image file
// - logo_upload: PDF/Image file
//####################################################################### RESPONSE BODY FOR ADD VENDOR #######################################################
// {"code":true,"message":"Vendor Added Successfully","Value":13}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function AddVendor(req, res) {
  try {
    // Upload KYC documents individually - they will be provided in the same order
    let registrationCertPath = null;
    let panUploadPath = null;
    let cancelledChequePath = null;
    let logoPath = null;

    // Upload registration certificate if provided
    if (req.files && req.files.registration_certificate) {
      try {
        await uploadFile.uploadVendorRegistrationCert(req, res);
        registrationCertPath = req.file ? req.file.path : null;
      } catch (er) {
        return helper.getErrorResponse(
          false,
          "error",
          `Could not upload registration certificate. ${er.message}`,
          "ADD VENDOR",
          ""
        );
      }
    }

    // Upload PAN document if provided
    if (req.files && req.files.pan_upload) {
      try {
        await uploadFile.uploadVendorPAN(req, res);
        panUploadPath = req.file ? req.file.path : null;
      } catch (er) {
        return helper.getErrorResponse(
          false,
          "error",
          `Could not upload PAN document. ${er.message}`,
          "ADD VENDOR",
          ""
        );
      }
    }

    // Upload cancelled cheque if provided
    if (req.files && req.files.cancelled_cheque) {
      try {
        await uploadFile.uploadVendorCancelledCheque(req, res);
        cancelledChequePath = req.file ? req.file.path : null;
      } catch (er) {
        return helper.getErrorResponse(
          false,
          "error",
          `Could not upload cancelled cheque. ${er.message}`,
          "ADD VENDOR",
          ""
        );
      }
    }

    // Upload logo if provided
    if (req.files && req.files.logo_upload) {
      try {
        await uploadFile.uploadVendorLogo(req, res);
        logoPath = req.file ? req.file.path : null;
      } catch (er) {
        return helper.getErrorResponse(
          false,
          "error",
          `Could not upload logo. ${er.message}`,
          "ADD VENDOR",
          ""
        );
      }
    }

    let vendor = req.body;

    // Check if the session token exists
    if (!vendor.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD VENDOR",
        ""
      );
    }

    // Validate session token length
    if (vendor.STOKEN.length > 50 || vendor.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
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
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ADD VENDOR",
        vendor.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!vendor.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD VENDOR",
        vendor.STOKEN.substring(0, 16)
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
        "error",
        "Querystring JSON error. Please provide valid JSON",
        "ADD VENDOR",
        secret
      );
    }

    // Validate required fields
    const requiredFields = [
      { field: "vendorname", message: "Vendor name missing. Please provide the Vendor name" },
      { field: "email", message: "Email missing. Please provide the Email" },
      { field: "contactpersonphone", message: "Contact person phone missing. Please provide the Contact person phone" },
      { field: "businesstype", message: "Business type missing. Please provide the Business type" },
      { field: "yearofestablishment", message: "Year of establishment missing. Please provide the Year of establishment" },
      { field: "gstnumber", message: "GST number missing. Please provide the GST number" },
      { field: "pannumber", message: "PAN number missing. Please provide the PAN number" },
      { field: "annualturnover", message: "Annual turnover missing. Please provide the Annual turnover" },
      { field: "productsservices", message: "Products/Services missing. Please provide the Products/Services" },
      { field: "hsnsaccode", message: "HSN/SAC code missing. Please provide the HSN/SAC code" },
      { field: "bankname", message: "Bank name missing. Please provide the Bank name" },
      { field: "branchname", message: "Branch name missing. Please provide the Branch name" },
      { field: "accountnumber", message: "Account number missing. Please provide the Account number" },
      { field: "ifsccode", message: "IFSC code missing. Please provide the IFSC code" }
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field) || querydata[field] === "" || querydata[field] == null) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD VENDOR",
          secret
        );
      }
    }

    // Validate business type enum
    const validBusinessTypes = ['Manufacturer', 'Distributor', 'Service Provider', 'Others'];
    if (!validBusinessTypes.includes(querydata.businesstype)) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid business type. Must be one of: Manufacturer, Distributor, Service Provider, Others",
        "ADD VENDOR",
        secret
      );
    }

    try {
      // File paths are already set from individual uploads above

      // Insert vendor into new vendors table
      const sql = await db.query(
        `INSERT INTO vendors (
          vendor_name, address, state, pincode, contact_person_name, contact_person_designation, 
          contact_person_phone, email, business_type, year_of_establishment, gst_number, 
          pan_number, annual_turnover, products_services, hsn_sac_code, description,
          bank_name, branch_name, account_number, ifsc_code, iso_certification, 
          other_certifications, registration_certificate_path, pan_upload_path, cancelled_cheque_path, logo_path
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          querydata.vendorname,
          querydata.address || null,
          querydata.state || null,
          querydata.pincode || null,
          querydata.contactpersonname || null,
          querydata.contactpersondesignation || null,
          querydata.contactpersonphone,
          querydata.email,
          querydata.businesstype,
          querydata.yearofestablishment,
          querydata.gstnumber,
          querydata.pannumber,
          querydata.annualturnover,
          querydata.productsservices,
          querydata.hsnsaccode,
          querydata.description || null,
          querydata.bankname,
          querydata.branchname,
          querydata.accountnumber,
          querydata.ifsccode,
          querydata.isocertification || null,
          querydata.othercertifications || null,
          registrationCertPath,
          panUploadPath,
          cancelledChequePath,
          logoPath
        ]
      );

      const vendorid = sql.insertId;

      if (vendorid != null && vendorid !== "") {
        return helper.getSuccessResponse(
          true,
          "success",
          "Vendor Added Successfully",
          {
            vendorid: vendorid,
            registration_certificate_uploaded: !!registrationCertPath,
            pan_upload_uploaded: !!panUploadPath,
            cancelled_cheque_uploaded: !!cancelledChequePath,
            logo_uploaded: !!logoPath
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Error while adding the vendor.",
          "ADD VENDOR",
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
  } catch (er) {
    // Extract secret if available from request body
    const secret = (req && req.body && req.body.STOKEN) ? req.body.STOKEN.substring(0, 16) : "";
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
//   "message": "Vendor Fetched Successfully",
//   "Value": [
//     {
//       "id": 1,
//       "vendor_name": "JK Construction",
//       "address": "123 Main Street, Coimbatore",
//       "state": "Tamil Nadu",
//       "pincode": "641001",
//       "contact_person_name": "John Doe",
//       "contact_person_designation": "Manager",
//       "contact_person_phone": "8393923242",
//       "email": "jk@gmail.com",
//       "business_type": "Manufacturer",
//       "year_of_establishment": 2010,
//       "gst_number": "33ABCD43wsd123",
//       "pan_number": "ABCPD1234E",
//       "annual_turnover": 50000000.00,
//       "products_services": "Construction materials, cement, steel",
//       "hsn_sac_code": "2523,7207",
//       "description": "Leading manufacturer of construction materials",
//       "bank_name": "State Bank of India",
//       "branch_name": "Coimbatore Main",
//       "account_number": "1234567890",
//       "ifsc_code": "SBIN0001234",
//       "iso_certification": "ISO 9001:2015",
//       "other_certifications": "BIS certification for cement",
//       "registration_certificate_path": "/path/to/registration.pdf",
//       "pan_upload_path": "/path/to/pan.pdf",
//       "cancelled_cheque_path": "/path/to/cheque.pdf",
//       "logo_path": "/path/to/logo.png",
//       "updated_at": "2025-07-07 10:30:00",
//       "created_at": "2025-07-07 10:30:00",
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
      if (querydata.vendorid == 0 || !querydata.vendorid) {
        // Fetch all vendors
        sql = await db.query(
          `SELECT vendorid, vendor_name, address, state, pincode, contact_person_name, 
           contact_person_designation, contact_person_phone, email, business_type, 
           year_of_establishment, gst_number, pan_number, annual_turnover, 
           products_services, hsn_sac_code, description, bank_name, branch_name, 
           account_number, ifsc_code, iso_certification, other_certifications,
           registration_certificate_path, pan_upload_path, cancelled_cheque_path,
           created_at, updated_at , logo_path
           FROM vendors ORDER BY created_at DESC`
        );
      } else {
        // Fetch specific vendor
        sql = await db.query(
          `SELECT vendorid, vendor_name, address, state, pincode, contact_person_name, 
           contact_person_designation, contact_person_phone, email, business_type, 
           year_of_establishment, gst_number, pan_number, annual_turnover, 
           products_services, hsn_sac_code, description, bank_name, branch_name, 
           account_number, ifsc_code, iso_certification, other_certifications,
           registration_certificate_path, pan_upload_path, cancelled_cheque_path,
           created_at, updated_at , logo_path
           FROM vendors WHERE vendorid = ?`,
          [querydata.vendorid]
        );
      }

      // Convert document files to binary for each vendor
      for (let i = 0; i < sql.length; i++) {
        // // Convert Registration Certificate to binary if available
        // if (sql[i].registration_certificate_path) {
        //   try {
        //     const binaryData = await helper.convertFileToBinary(sql[i].registration_certificate_path);
        //     sql[i].registration_certificate_binary = binaryData;
        //   } catch (error) {
        //     console.error("Error reading registration certificate:", sql[i].registration_certificate_path, error);
        //     sql[i].registration_certificate_binary = null;
        //   }
        // }

        // // Convert PAN upload to binary if available
        // if (sql[i].pan_upload_path) {
        //   try {
        //     const binaryData = await helper.convertFileToBinary(sql[i].pan_upload_path);
        //     sql[i].pan_upload_binary = binaryData;
        //   } catch (error) {
        //     console.error("Error reading PAN upload:", sql[i].pan_upload_path, error);
        //     sql[i].pan_upload_binary = null;
        //   }
        // }

        // // Convert Cancelled Cheque to binary if available
        // if (sql[i].cancelled_cheque_path) {
        //   try {
        //     const binaryData = await helper.convertFileToBinary(sql[i].cancelled_cheque_path);
        //     sql[i].cancelled_cheque_binary = binaryData;
        //   } catch (error) {
        //     console.error("Error reading cancelled cheque:", sql[i].cancelled_cheque_path, error);
        //     sql[i].cancelled_cheque_binary = null;
        //   }
        // }

        // Format the dates
        if (sql[i].created_at) {
          sql[i].created_at = new Date(sql[i].created_at).toISOString().slice(0, 19).replace('T', ' ');
        }
        if (sql[i].updated_at) {
          sql[i].updated_at = new Date(sql[i].updated_at).toISOString().slice(0, 19).replace('T', ' ');
        }
      }

      return helper.getSuccessResponse(
        true,
        "success",
        "Vendor Fetched Successfully",
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
          "",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        `Could not upload the file. ${er.message}`,
        "ADD QUOTATION",
        "",
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
        "",
        ""
      );
    }

    // Validate session token length
    if (quotation.STOKEN.length > 50 || quotation.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "ADD QUOTATION",
        "",
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
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ADD QUOTATION",
        quotation.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!quotation.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD QUOTATION",
        quotation.STOKEN.substring(0, 16)
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
          "success",
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
    // Extract secret if available from request body
    const secret = (req && req.body && req.body.STOKEN) ? req.body.STOKEN.substring(0, 16) : "";
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

async function vendorDetailsPreLoader(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "VENDOR DETAILS PRELOADER",
        "",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "VENDOR DETAILS PRELOADER",
        "",
        ""
      );
    }
    let secret = vendorData.STOKEN.substring(0, 16);

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [vendorData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "Login session token Invalid. Please provide the valid session token",
        "VENDOR DETAILS PRELOADER",
        "",
        ""
      );
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
      return helper.getErrorResponse(
        false,
        "Failed to generate RFQ ID using stored procedure.",
        "VENDOR DETAILS PRELOADER",
        "",
        secret
      );
    }

    // Return success response with the generated RFQ ID
    return helper.getSuccessResponse(
      true,
      "success",
      "RFQ ID generated successfully",
      { rfq_id: newRfqId },
      secret
    );
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "Internal error. Please contact Administration",
      "VENDOR DETAILS PRELOADER",
      er.message,
      secret
    );
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
        "",
        ""
      );
    }

    // Validate session token length
    if (processData.STOKEN.length > 50 || processData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "GET PROCESS LIST",
        "",
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
        "",
        ""
      );
    }

    // Check if querystring is provided
    if (!processData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "Querystring missing. Please provide the querystring",
        "GET PROCESS LIST",
        "",
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
        "success",
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
// Required querystring data:
// {
//   "rfq_id": "SSIPL-RFQ/2507/01",
//   "vendorid": 1
// }
// Optional querystring data:
// {
//   "cc_email": "cc@example.com",
//   "notes": "Additional notes",
//   "feedback": "Please provide your best quotation",
//   "messagetype": 1,  // 1 = email only, 2 = WhatsApp only, 3 = both (default: 1)
//   "product_name": "Steel Rods",
//   "product_quantity": 100
// }
//####################################################################### RESPONSE BODY FOR POST RFQ #######################################################
// {
//   "code": true,
//   "message": "RFQ Posted Successfully",
//   "Value": {
//     "vprocess_id": 1,
//     "process_id": 2,
//     "vendor_name": "ABC Company",
//     "rfq_id": "SSIPL-RFQ/2507/01",
//     "emailsent": true,
//     "whatsappsent": false,
//     "messagetype": 1
//   }
// }
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
    if (!rfqData || !("STOKEN" in rfqData) || rfqData.STOKEN === undefined) {
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
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "POST RFQ",
        rfqData.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!rfqData || !("querystring" in rfqData) || rfqData.querystring === undefined) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "POST RFQ",
        rfqData && rfqData.STOKEN ? rfqData.STOKEN.substring(0, 16) : ""
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
    if (!querydata || !("rfqgenid" in querydata) || querydata.rfqgenid === "" || querydata.rfqgenid === undefined) {
      return helper.getErrorResponse(
        false,
        "RFQ ID missing. Please provide the RFQ ID",
        "POST RFQ",
        secret
      );
    }

    if (!querydata || !("vendorid" in querydata) || querydata.vendorid === "" || querydata.vendorid === undefined) {
      return helper.getErrorResponse(
        false,
        "Vendor ID missing. Please provide the Vendor ID",
        "POST RFQ",
        secret
      );
    }

    // Validate messagetype if provided
    if (querydata && ("messagetype" in querydata) && ![1, 2, 3].includes(querydata.messagetype)) {
      return helper.getErrorResponse(
        false,
        "Invalid message type. Use 1 for email only, 2 for WhatsApp only, 3 for both",
        "POST RFQ",
        secret
      );
    }

    // Set default messagetype to 1 (email only) if not provided
    const messagetype = querydata.messagetype || 1;

    try {
      // Get basic vendor details for communication
      const vendorDetails = await db.query(
        `SELECT 
          vendor_name, 
          email, 
          contact_person_phone
        FROM vendors WHERE vendorid = ?`,
        [querydata.vendorid]
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

      // Insert vendor RFQ details into vendor_rfq_details table using querystring data
      const rfqDetailsResult = await db.query(
        `INSERT INTO vendor_rfq_details (
          rfqgenid,
          vendor_id,
          vendor_name,
          gstin,
          pan,
          contact_person,
          vendor_address,
          title,
          email_id,
          phone_no,
          cc_email,
          message_type,
          feedback,
          rfq_date,
          notes,
          products,
          row_updated_date,
          status,
          deleted_flag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), 1, 0)`,
        [
          querydata.rfqgenid ||'',
          querydata.vendorid,
          querydata.vendorname || '',
          querydata.GSTIN || '',
          querydata.PAN || '',
          querydata.Contact_person || '',
          querydata.vendoraddress || '',
          querydata.title || '',
          querydata.emailid || '',
          querydata.phoneno || '',
          querydata.ccemail || '',
          messagetype,
          querydata.feedback || '',
          querydata.date ? new Date(querydata.date) : new Date(),
          querydata.notes ? JSON.stringify(querydata.notes) : JSON.stringify([]),
          querydata.product ? JSON.stringify(querydata.product) : JSON.stringify([])
        ]
      );

      // Insert notes into vendor_notesmaster table (if notes exist)
      if (querydata.notes && Array.isArray(querydata.notes) && querydata.notes.length > 0) {
        for (const noteItem of querydata.notes) {
          try {
            // Extract note content based on structure (handle both string and object notes)
            let noteContent = '';
            if (typeof noteItem === 'string') {
              noteContent = noteItem.trim();
            } else if (typeof noteItem === 'object' && noteItem.note) {
              noteContent = noteItem.note.trim();
            } else if (typeof noteItem === 'object' && noteItem.notes) {
              noteContent = noteItem.notes.trim();
            }

            // Skip empty notes
            if (!noteContent) {
              continue;
            }

            // Format note as JSON array (based on your table structure)
            const formattedNote = JSON.stringify([noteContent]);

            // Check if note already exists in vendor_notesmaster
            const existingNote = await db.query(
              `SELECT notes_id FROM vendor_notesmaster 
               WHERE JSON_EXTRACT(notes, '$[0]') = ? AND deleted_flag = 0 
               LIMIT 1`,
              [noteContent]
            );

            // Insert note only if it doesn't exist
            if (!existingNote || existingNote.length === 0) {
              await db.query(
                `INSERT INTO vendor_notesmaster (
                  notes, 
                  row_updated_date, 
                  status, 
                  deleted_flag
                ) VALUES (?, NOW(), 1, 0)`,
                [formattedNote]
              );
            }
          } catch (noteError) {
            console.error('Error inserting note:', noteError);
            // Continue processing other notes even if one fails
          }
        }
      }

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
          querydata.vendorname || vendor.vendor_name,
          formattedDate,
          querydata.vendorid,
          userid,
          querydata.rfqgenid || querydata.rfqid
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
        ) VALUES (?, ?, ?, 0, 1, 0, ?, ?, 1, ?, ?, NOW())`,
        [
          'RFQ',
          filePath,
          formattedDate,
          userid,
          querydata.rfqgenid || querydata.rfqid,
          querydata.vendoraddress || vendor.address || '',
          querydata.vendorname || vendor.vendor_name
        ]
      );

      const process_id = processResult.insertId;

      // Initialize response flags
      let emailSent = false;
      let whatsappSent = false;

      // Get required modules
      const mailer = require("../mailer");
      const axios = require("axios");
      const config = require("../config");

      // Prepare email and WhatsApp data
      const vendorEmail = /*vendor.email ||*/ "kishorekkumar34@gmail.com"; // Fallback email
      const ccEmail = querydata.cc_email || "";
      const subject = `Request for Quotation - ${querydata.rfqgenid || querydata.rfqid}`;
      const notes = querydata.feedback || querydata.notes || "Please review the attached RFQ document and provide your best quotation.";
      
      // Process phone numbers (handle single or comma-separated numbers)
      const phoneNumbers = vendor.contact_person_phone 
        ? vendor.contact_person_phone
            .split(",")
            .map((num) => num.trim())
            .filter((num) => num !== "") // Remove empty values
        : [];

      // Send based on messagetype
      if (messagetype === 1) {
        // Send only email
        try {
          emailSent = await mailer.sendVendorRFQ(
            vendor.vendor_name,
            vendorEmail,
            subject,
            "VENDORRFQ", // module tag for email settings
            filePath, // file path for attachment
            querydata.rfqgenid || querydata.rfqid, // RFQ ID
            notes, // additional notes
            ccEmail // CC email
          );
        } catch (emailError) {
          console.log("Warning: Email sending error:", emailError);
          emailSent = false;
        }
      } else if (messagetype === 2) {
        // Send only WhatsApp
        if (phoneNumbers.length > 0) {
          try {
            const whatsappResults = await Promise.all(
              phoneNumbers.map(async (number) => {
                try {
                  const response = await axios.post(
                    `${config.whatsappip}/billing/sendpdf`,
                    {
                      phoneno: number,
                      feedback: notes,
                      pdfpath: filePath,
                    }
                  );
                  return response.data.code || false;
                } catch (error) {
                  console.error(`WhatsApp Error for ${number}:`, error.message);
                  return false;
                }
              })
            );
            whatsappSent = whatsappResults.some(result => result === true);
          } catch (whatsappError) {
            console.log("Warning: WhatsApp sending error:", whatsappError);
            whatsappSent = false;
          }
        } else {
          console.log("Warning: No phone numbers available for WhatsApp sending");
          whatsappSent = false;
        }
      } else if (messagetype === 3) {
        // Send both email and WhatsApp
        const promises = [];

        // Email promise
        promises.push(
          mailer.sendVendorRFQ(
            vendor.vendor_name,
            vendorEmail,
            subject,
            "VENDORRFQ",
            filePath,
            querydata.rfqgenid || querydata.rfqid,
            notes,
            ccEmail
          ).then(result => {
            emailSent = result;
            return result;
          }).catch(error => {
            console.log("Warning: Email sending error:", error);
            emailSent = false;
            return false;
          })
        );

        // WhatsApp promise
        if (phoneNumbers.length > 0) {
          promises.push(
            Promise.all(
              phoneNumbers.map(async (number) => {
                try {
                  const response = await axios.post(
                    `${config.whatsappip}/billing/sendpdf`,
                    {
                      phoneno: number,
                      feedback: notes,
                      pdfpath: filePath,
                    }
                  );
                  return response.data.code || false;
                } catch (error) {
                  console.error(`WhatsApp Error for ${number}:`, error.message);
                  return false;
                }
              })
            ).then(results => {
              whatsappSent = results.some(result => result === true);
              return whatsappSent;
            }).catch(error => {
              console.log("Warning: WhatsApp sending error:", error);
              whatsappSent = false;
              return false;
            })
          );
        } else {
          console.log("Warning: No phone numbers available for WhatsApp sending");
          whatsappSent = false;
        }

        // Wait for all promises to complete
        await Promise.all(promises);
      }

      if (vprocess_id != null && process_id != null) {
        return helper.getSuccessResponse(
          true,
          "success",
          "RFQ Posted Successfully",
          {
            vprocess_id: vprocess_id,
            process_id: process_id,
            vendor_name: vendor.vendor_name,
            rfqid: querydata.rfqgenid || querydata.rfqid,
            emailsent: emailSent,
            whatsappsent: whatsappSent,
            messagetype: messagetype
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

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR GET SUB PROCESS LIST #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_process_id"
// }
// Required querystring data:
// {
//   "vprocess_id": 1  // Required - parent process ID to fetch subprocess list
// }
//####################################################################### RESPONSE BODY FOR GET SUB PROCESS LIST #######################################################
// {
//   "code": true,
//   "message": "Sub process list fetched successfully",
//   "Value": [
//     {
//       "process_id": 1,
//       "process_name": "RFQ",
//       "Process_filepath": "/path/to/file.pdf",
//       "Process_date": "2025-07-04",
//       "Approved_status": 0,
//       "status": 1,
//       "deleted_flag": 0,
//       "Created_by": 4,
//       "vprocess_gen_id": "SSIPL-RFQ/2507/01",
//       "process_type": "RFQ",
//       "vendor_address": "chinnverampatti,udumallai",
//       "vendor_name": "JK constructiond",
//       "Row_updated_date": "2025-07-04 15:50:53"
//     }
//   ]
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetSubProcessList(processData) {
  try {
    // Check if the session token exists
    if (!processData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "GET SUB PROCESS LIST",
        "",
        ""
      );
    }

    // Validate session token length
    if (processData.STOKEN.length > 50 || processData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "GET SUB PROCESS LIST",
        "",
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
        "GET SUB PROCESS LIST",
        "",
        ""
      );
    }

    // Check if querystring is provided
    if (!processData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET SUB PROCESS LIST",
        processData.STOKEN.substring(0, 16)
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
        "GET SUB PROCESS LIST",
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
        "GET SUB PROCESS LIST",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vprocess_id") || querydata.vprocess_id == null || querydata.vprocess_id === "") {
      return helper.getErrorResponse(
        false,
        "Process ID missing. Please provide the vprocess_id",
        "GET SUB PROCESS LIST",
        secret
      );
    }

    try {
      // Query to fetch subprocess list from vprocesslist table
      const sql = await db.query(
        `SELECT 
          process_id,
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
        FROM vprocesslist 
        WHERE vprocess_id = ? AND deleted_flag = 0
        ORDER BY Row_updated_date DESC`,
        [querydata.vprocess_id]
      );

      return helper.getSuccessResponse(
        true,
        "success",
        "Sub process list fetched successfully",
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
//########################################### REQUEST BODY FOR UPDATE VENDOR REGISTRATION CERTIFICATE ######################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_vendor_id"
// }
// File upload in form-data with key "registration_certificate"
// Required querystring data:
// {
//   "vendorid": 1
// }
//####################################################################### RESPONSE BODY FOR UPDATE VENDOR REGISTRATION CERTIFICATE #######################################################
// {"code":true,"message":"Registration Certificate Updated Successfully","Value":{"vendorid": 1, "file_path": "/path/to/file.pdf"}}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function UpdateVendorRegistrationCert(req, res) {
  try {
    // Upload the registration certificate file first
    try {
      await uploadFile.uploadVendorRegistrationCert(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a registration certificate file!",
          "UPDATE VENDOR REGISTRATION CERT",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        "UPDATE VENDOR REGISTRATION CERT",
        ""
      );
    }

    let vendorData = req.body;

    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "UPDATE VENDOR REGISTRATION CERT",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE VENDOR REGISTRATION CERT",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [vendorData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "UPDATE VENDOR REGISTRATION CERT",
        vendorData.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE VENDOR REGISTRATION CERT",
        vendorData.STOKEN.substring(0, 16)
      );
    }

    var secret = vendorData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(vendorData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE VENDOR REGISTRATION CERT",
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
        "UPDATE VENDOR REGISTRATION CERT",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vendorid") || querydata.vendorid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor ID missing. Please provide the Vendor ID",
        "UPDATE VENDOR REGISTRATION CERT",
        secret
      );
    }

    try {
      const filePath = req.file.path;

      // Update vendor registration certificate path
      const sql = await db.query(
        `UPDATE vendors SET registration_certificate_path = ?, updated_at = CURRENT_TIMESTAMP WHERE vendorid = ?`,
        [filePath, querydata.vendorid]
      );

      if (sql.affectedRows > 0) {
        return helper.getSuccessResponse(
          true,
          "success",
          "Registration Certificate Updated Successfully",
          {
            vendorid: querydata.vendorid,
            file_path: filePath
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Vendor not found or no changes made.",
          "UPDATE VENDOR REGISTRATION CERT",
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
  } catch (er) {
    const secret = (req && req.body && req.body.STOKEN) ? req.body.STOKEN.substring(0, 16) : "";
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
//########################################### REQUEST BODY FOR UPDATE VENDOR PAN ######################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_vendor_id"
// }
// File upload in form-data with key "pan_upload"
// Required querystring data:
// {
//   "vendorid": 1
// }
//####################################################################### RESPONSE BODY FOR UPDATE VENDOR PAN #######################################################
// {"code":true,"message":"PAN Document Updated Successfully","Value":{"vendorid": 1, "file_path": "/path/to/file.pdf"}}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function UpdateVendorPAN(req, res) {
  try {
    // Upload the PAN file first
    try {
      await uploadFile.uploadVendorPAN(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a PAN document file!",
          "UPDATE VENDOR PAN",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        "UPDATE VENDOR PAN",
        ""
      );
    }

    let vendorData = req.body;

    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "UPDATE VENDOR PAN",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE VENDOR PAN",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [vendorData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "UPDATE VENDOR PAN",
        vendorData.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE VENDOR PAN",
        vendorData.STOKEN.substring(0, 16)
      );
    }

    var secret = vendorData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(vendorData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE VENDOR PAN",
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
        "UPDATE VENDOR PAN",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vendorid") || querydata.vendorid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor ID missing. Please provide the Vendor ID",
        "UPDATE VENDOR PAN",
        secret
      );
    }

    try {
      const filePath = req.file.path;

      // Update vendor PAN path
      const sql = await db.query(
        `UPDATE vendors SET pan_upload_path = ?, updated_at = CURRENT_TIMESTAMP WHERE vendorid = ?`,
        [filePath, querydata.vendorid]
      );

      if (sql.affectedRows > 0) {
        return helper.getSuccessResponse(
          true,
          "success",
          "PAN Document Updated Successfully",
          {
            vendorid: querydata.vendorid,
            file_path: filePath
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Vendor not found or no changes made.",
          "UPDATE VENDOR PAN",
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
  } catch (er) {
    const secret = (req && req.body && req.body.STOKEN) ? req.body.STOKEN.substring(0, 16) : "";
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
//########################################### REQUEST BODY FOR UPDATE VENDOR CANCELLED CHEQUE ######################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_vendor_id"
// }
// File upload in form-data with key "cancelled_cheque"
// Required querystring data:
// {
//   "vendorid": 1
// }
//####################################################################### RESPONSE BODY FOR UPDATE VENDOR CANCELLED CHEQUE #######################################################
// {"code":true,"message":"Cancelled Cheque Updated Successfully","Value":{"vendorid": 1, "file_path": "/path/to/file.pdf"}}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function UpdateVendorCancelledCheque(req, res) {
  try {
    // Upload the cancelled cheque file first
    try {
      await uploadFile.uploadVendorCancelledCheque(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a cancelled cheque file!",
          "UPDATE VENDOR CANCELLED CHEQUE",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        "UPDATE VENDOR CANCELLED CHEQUE",
        ""
      );
    }

    let vendorData = req.body;

    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "UPDATE VENDOR CANCELLED CHEQUE",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE VENDOR CANCELLED CHEQUE",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [vendorData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "UPDATE VENDOR CANCELLED CHEQUE",
        vendorData.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE VENDOR CANCELLED CHEQUE",
        vendorData.STOKEN.substring(0, 16)
      );
    }

    var secret = vendorData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(vendorData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE VENDOR CANCELLED CHEQUE",
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
        "UPDATE VENDOR CANCELLED CHEQUE",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vendorid") || querydata.vendorid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor ID missing. Please provide the Vendor ID",
        "UPDATE VENDOR CANCELLED CHEQUE",
        secret
      );
    }

    try {
      const filePath = req.file.path;

      // Update vendor cancelled cheque path
      const sql = await db.query(
        `UPDATE vendors SET cancelled_cheque_path = ?, updated_at = CURRENT_TIMESTAMP WHERE vendorid = ?`,
        [filePath, querydata.vendorid]
      );

      if (sql.affectedRows > 0) {
        return helper.getSuccessResponse(
          true,
          "success",
          "Cancelled Cheque Updated Successfully",
          {
            vendorid: querydata.vendorid,
            file_path: filePath
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Vendor not found or no changes made.",
          "UPDATE VENDOR CANCELLED CHEQUE",
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
  } catch (er) {
    const secret = (req && req.body && req.body.STOKEN) ? req.body.STOKEN.substring(0, 16) : "";
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
//########################################### REQUEST BODY FOR UPDATE VENDOR LOGO ######################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_vendor_id"
// }
// File upload in form-data with key "logo_upload"
// Required querystring data:
// {
//   "vendorid": 1
// }
//####################################################################### RESPONSE BODY FOR UPDATE VENDOR LOGO #######################################################
// {"code":true,"message":"Logo Updated Successfully","Value":{"vendorid": 1, "file_path": "/path/to/file.pdf"}}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function UpdateVendorLogo(req, res) {
  try {
    // Upload the logo file first
    try {
      await uploadFile.uploadVendorLogo(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "error",
          "Please upload a logo file!",
          "UPDATE VENDOR LOGO",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload the file. ${er.message}`,
        "UPDATE VENDOR LOGO",
        ""
      );
    }

    let vendorData = req.body;

    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "UPDATE VENDOR LOGO",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE VENDOR LOGO",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [vendorData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "UPDATE VENDOR LOGO",
        vendorData.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE VENDOR LOGO",
        vendorData.STOKEN.substring(0, 16)
      );
    }

    var secret = vendorData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(vendorData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE VENDOR LOGO",
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
        "UPDATE VENDOR LOGO",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vendorid") || querydata.vendorid == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor ID missing. Please provide the Vendor ID",
        "UPDATE VENDOR LOGO",
        secret
      );
    }

    try {
      const filePath = req.file.path;

      // Update vendor logo path
      const sql = await db.query(
        `UPDATE vendors SET logo_path = ?, updated_at = CURRENT_TIMESTAMP WHERE vendorid = ?`,
        [filePath, querydata.vendorid]
      );

      if (sql.affectedRows > 0) {
        return helper.getSuccessResponse(
          true,
          "success",
          "Logo Updated Successfully",
          {
            vendorid: querydata.vendorid,
            file_path: filePath
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Vendor not found or no changes made.",
          "UPDATE VENDOR LOGO",
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
  } catch (er) {
    const secret = (req && req.body && req.body.STOKEN) ? req.body.STOKEN.substring(0, 16) : "";
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
//########################################### REQUEST BODY FOR GET PRODUCTS #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_vendor_id"
// }
// Required querystring data:
// {
//   "vendorid": 1
// }
//####################################################################### RESPONSE BODY FOR GET PRODUCTS #######################################################
// {
//   "code": true,
//   "message": "Products Fetched Successfully",
//   "Value": [
//     {
//       "id": 1,
//       "vendorid": 1,
//       "productname": "keyboard",
//       "gstpercent": "18.00",
//       "hsn": "1324234",
//       "price": "2131.00"
//     }
//   ]
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetProducts(productData) {
  try {
    // Check if the session token exists
    if (!productData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "GET PRODUCTS",
        ""
      );
    }

    // Validate session token length
    if (productData.STOKEN.length > 50 || productData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET PRODUCTS",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [productData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "GET PRODUCTS",
        ""
      );
    }

    // Check if querystring is provided
    if (!productData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET PRODUCTS",
        ""
      );
    }

    var secret = productData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(productData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET PRODUCTS",
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
        "GET PRODUCTS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vendorid") || querydata.vendorid == null || querydata.vendorid === "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor ID missing. Please provide the vendorid",
        "GET PRODUCTS",
        secret
      );
    }

    try {
      // Query to fetch products for the specific vendor
      const sql = await db.query(
        `SELECT 
          id,
          vendorid,
          productname,
          gstpercent,
          hsn,
          price AS lastknown_price
        FROM vendorproducts 
        WHERE vendorid = ?`,
        [querydata.vendorid]
      );

      return helper.getSuccessResponse(
        true,
        "success",
        "Products Fetched Successfully",
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
      ""
    );
  }
}

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################


//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR GET NOTES #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_optional_filters"
// }
// Optional filters in querystring:
// {
//   "notes_id": 1  // Optional - specific note ID to fetch
// }
//####################################################################### RESPONSE BODY FOR GET NOTES #######################################################
// {
//   "code": true,
//   "message": "Notes fetched successfully",
//   "Value": [
//     {
//       "notes_id": 1,
//       "notes": "Please provide your best quotation for the steel products",
//       "row_updated_date": "2025-07-07 10:30:00",
//       "status": 1
//     }
//   ]
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function getNotes(notesData) {
  try {
    // Check if the session token exists
    if (!notesData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "GET NOTES",
        ""
      );
    }

    // Validate session token length
    if (notesData.STOKEN.length > 50 || notesData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET NOTES",
        ""
      );
    }

    var secret = notesData.STOKEN.substring(0, 16);

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [notesData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "GET NOTES",
        secret
      );
    }

    try {
      let sql;
      
      // Base query to get active notes
      let baseQuery = `
        SELECT *
        FROM vendor_notesmaster
      `;
      // Execute the query
      sql = await db.query(baseQuery);
      // console.log("SQL Query Executed: ", sql);
   

      return helper.getSuccessResponse(
        true,
        "success",
        "Notes fetched successfully",
        sql[0],
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
//########################################### REQUEST BODY FOR GET COMBINED PROCESS LIST #####################################################################################
// {
//   "STOKEN": "your_session_token"
// }
//####################################################################### RESPONSE BODY FOR GET COMBINED PROCESS LIST #######################################################
// {
//   "code": true,
//   "message": "Combined process list fetched successfully",
//   "Value": [
//     {
//       "vprocess_id": 1,
//       "vendor_name": "JK constructiond",
//       "Process_date": "2025-03-04",
//       "vendorid": 1,
//       "Customer_id": null,
//       "Row_updated_date": "2025-03-04 15:50:53",
//       "status": 1,
//       "deleted_flag": 0,
//       "archive_data": 0,
//       "Created_by": 4,
//       "cprocess_id": 4,
//       "feedback": null,
//       "vprocess_gen_id": "ssipl/rfq250301",
//       "subprocess_list": [
//         {
//           "process_id": 1,
//           "process_name": "RFQ",
//           "Process_filepath": "/path/to/file.pdf",
//           "Process_date": "2025-07-04",
//           "Approved_status": 0,
//           "status": 1,
//           "deleted_flag": 0,
//           "Created_by": 4,
//           "vprocess_gen_id": "SSIPL-RFQ/2507/01",
//           "process_type": "RFQ",
//           "vendor_address": "chinnverampatti,udumallai",
//           "vendor_name": "JK constructiond",
//           "Row_updated_date": "2025-07-04 15:50:53"
//         }
//       ]
//     }
//   ]
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetCombinedProcessList(processData) {
  try {
    // Check if the session token exists
    if (!processData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "GET COMBINED PROCESS LIST",
        "",
        ""
      );
    }

    // Validate session token length
    if (processData.STOKEN.length > 50 || processData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "GET COMBINED PROCESS LIST",
        "",
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
        "GET COMBINED PROCESS LIST",
        "",
        ""
      );
    }

    var secret = processData.STOKEN.substring(0, 16);

    try {
      // Base query with JOIN to get vendor name - fetch all processes
      let baseQuery = `
        SELECT 
          vpm.vprocess_id,
          vm.vendor_name,
          vpm.Process_date,
          vm.vendorid,
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
        LEFT JOIN vendors vm ON vpm.Vendor_id = vm.vendorid
        WHERE vpm.deleted_flag = 0
        ORDER BY vpm.Row_updated_date DESC
      `;

      // Execute the main query to get all process list
      const processListResult = await db.query(baseQuery);

      // For each process, fetch its subprocess list
      const combinedResult = await Promise.all(
        processListResult.map(async (process) => {
          try {
            // Fetch subprocess list for this process
            const subProcessList = await db.query(
              `SELECT 
                vprocess_id,
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
              FROM vprocesslist 
              WHERE vprocess_id = ? AND deleted_flag = 0
              ORDER BY Row_updated_date DESC`,
              [process.vprocess_id]
            );

            // Add subprocess_list as JSONB array to the process object
            return {
              ...process,
              subprocess_list: subProcessList || []
            };
          } catch (subError) {
            console.error(`Error fetching subprocess for vprocess_id ${process.vprocess_id}:`, subError);
            // Return process with empty subprocess_list if there's an error
            return {
              ...process,
              subprocess_list: []
            };
          }
        })
      );

      return helper.getSuccessResponse(
        true,
        "success",
        "Combined process list fetched successfully",
        combinedResult,
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
//########################################### REQUEST BODY FOR GET ALL PROCESS LIST #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_filters"
// }
// Required querystring data:
// {
//   "vendorid": 1,     // Required - vendor ID to filter processes (0 for all vendors)
//   "listtype": 1      // Required - 1 for active processes, 2 for archived processes
// }
//####################################################################### RESPONSE BODY FOR GET ALL PROCESS LIST #######################################################
// {
//   "code": true,
//   "message": "Vendor process Fetched successfully",
//   "Value": [
//     {
//       "processid": 1,
//       "title": "RFQ Process",
//       "vendor_name": "JK Construction",
//       "Process_date": "20250704",
//       "age_in_days": 3,
//       "process_count": 2,
//       "TimelineEvents": [
//         {
//           "Eventid": 1,
//           "Eventname": "RFQ Posted",
//           "feedback": "Please provide quotation",
//           "Allowed_process": {"quotation": true, "rfq": false},
//           "pdfpath": "/path/to/rfq.pdf",
//           "apporvedstatus": 0,
//           "internalstatus": 1
//         }
//       ]
//     }
//   ]
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetAllProcessList(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET THE AVAILABLE VENDOR PROCESSES",
        ""
      );
    }
    var secret = vendorData.STOKEN.substring(0, 16);
    var querydata;
    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken size invalid. Please provide the valid Sessiontoken",
        "GET THE AVAILABLE VENDOR PROCESSES",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [vendorData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET THE AVAILABLE VENDOR PROCESSES",
        secret
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET THE AVAILABLE VENDOR PROCESSES",
        secret
      );
    }

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(vendorData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "GET THE AVAILABLE VENDOR PROCESSES",
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
        "GET THE AVAILABLE VENDOR PROCESSES",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("vendorid")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Vendor id missing. Please provide the Vendor id",
        "GET THE AVAILABLE VENDOR PROCESSES",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("listtype")) {
      return helper.getErrorResponse(
        false,
        "error",
        "List type missing. Please provide the list type",
        "GET THE AVAILABLE VENDOR PROCESSES",
        secret
      );
    }

    var sql;
    if (querydata.listtype == 1) {
      // Active processes
      if (querydata.vendorid == 0) {
        // All vendors
        sql = await db.query(
          `SELECT 
            vpm.vprocess_id processid,
            (SELECT vpl1.process_name 
              FROM vprocesslist vpl1 
              WHERE vpl1.vprocess_id = vpm.vprocess_id 
              ORDER BY vpl1.Row_updated_date ASC 
              LIMIT 1) AS title,
            vm.vendor_name,
            DATE_FORMAT(vpm.Process_date, '%Y%m%d') AS Process_date,
            DATEDIFF(CURDATE(), vpm.Process_date) AS age_in_days,
            COUNT(vpm.vprocess_id) OVER(PARTITION BY vpm.Vendor_id) AS process_count, 
            (
              SELECT JSON_ARRAYAGG(t.TimelineEvent)
              FROM (
                SELECT JSON_OBJECT(
                         'Eventid', vpl2.vprocess_id,
                         'Eventname', vpl2.process_name,
                         'feedback', vpm.feedback,
                         'Allowed_process', CAST(
                          '{"rfq": false, "quotation": true, "revised_quotation": false, "delivery_challan": false}' 
                          AS JSON),
                         'pdfpath', vpl2.Process_filepath,
                         'apporvedstatus', vpl2.Approved_status,
                         'internalstatus', vpl2.status
                       ) AS TimelineEvent
                FROM vprocesslist vpl2
                WHERE vpl2.vprocess_id = vpm.vprocess_id
                ORDER BY vpl2.Row_updated_date ASC
              ) t
            ) AS TimelineEvents  
          FROM vendorprocessmaster vpm 
          JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
          LEFT JOIN vprocesslist vpl ON vpl.vprocess_id = vpm.vprocess_id 
          WHERE vpm.status = 1 
          AND vpm.deleted_flag = 0 AND vpm.archive_data = 0
          GROUP BY vpm.vprocess_id, vpm.Vendor_id, vpm.Process_date, vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`
        );
      } else {
        // Specific vendor
        sql = await db.query(
          `SELECT 
            vpm.vprocess_id processid,
            (SELECT vpl1.process_name 
              FROM vprocesslist vpl1 
              WHERE vpl1.vprocess_id = vpm.vprocess_id 
              ORDER BY vpl1.Row_updated_date ASC 
              LIMIT 1) AS title,
            vm.vendor_name,
            DATE_FORMAT(vpm.Process_date, '%Y%m%d') AS Process_date,
            DATEDIFF(CURDATE(), vpm.Process_date) AS age_in_days,
            COUNT(vpm.vprocess_id) OVER(PARTITION BY vpm.Vendor_id) AS process_count, 
            (
              SELECT JSON_ARRAYAGG(t.TimelineEvent)
              FROM (
                SELECT JSON_OBJECT(
                         'Eventid', vpl2.vprocess_id,
                         'Eventname', vpl2.process_name,
                         'feedback', vpm.feedback,
                         'Allowed_process', CAST(
                          '{"rfq": false, "quotation": true, "revised_quotation": false, "delivery_challan": false}' 
                          AS JSON),
                         'pdfpath', vpl2.Process_filepath,
                         'apporvedstatus', vpl2.Approved_status,
                         'internalstatus', vpl2.status
                       ) AS TimelineEvent
                FROM vprocesslist vpl2
                WHERE vpl2.vprocess_id = vpm.vprocess_id
                ORDER BY vpl2.Row_updated_date ASC
              ) t
            ) AS TimelineEvents  
          FROM vendorprocessmaster vpm 
          JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
          LEFT JOIN vprocesslist vpl ON vpl.vprocess_id = vpm.vprocess_id 
          WHERE vpm.status = 1 AND vpm.deleted_flag = 0 AND vpm.archive_data = 0
          AND vpm.Vendor_id = ?
          GROUP BY vpm.vprocess_id, vpm.Vendor_id, vpm.Process_date, vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`,
          [querydata.vendorid]
        );
      }
    } else {
      // Archived processes
      if (querydata.vendorid == 0) {
        // All vendors
        sql = await db.query(
          `SELECT 
            vpm.vprocess_id processid,
            (SELECT vpl1.process_name 
              FROM vprocesslist vpl1 
              WHERE vpl1.vprocess_id = vpm.vprocess_id 
              ORDER BY vpl1.Row_updated_date ASC 
              LIMIT 1) AS title,
            vm.vendor_name,
            DATE_FORMAT(vpm.Process_date, '%Y%m%d') AS Process_date,
            DATEDIFF(CURDATE(), vpm.Process_date) AS age_in_days,
            COUNT(vpm.vprocess_id) OVER(PARTITION BY vpm.Vendor_id) AS process_count, 
            (
              SELECT JSON_ARRAYAGG(t.TimelineEvent)
              FROM (
                SELECT JSON_OBJECT(
                         'Eventid', vpl2.vprocess_id,
                         'Eventname', vpl2.process_name,
                         'feedback', vpm.feedback,
                         'Allowed_process', CAST(
                          '{"rfq": false, "quotation": false, "revised_quotation": false, "delivery_challan": false}' 
                          AS JSON),
                         'pdfpath', vpl2.Process_filepath,
                         'apporvedstatus', vpl2.Approved_status,
                         'internalstatus', vpl2.status
                       ) AS TimelineEvent
                FROM vprocesslist vpl2
                WHERE vpl2.vprocess_id = vpm.vprocess_id
                ORDER BY vpl2.Row_updated_date ASC
              ) t
            ) AS TimelineEvents 
          FROM vendorprocessmaster vpm 
          JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
          LEFT JOIN vprocesslist vpl ON vpl.vprocess_id = vpm.vprocess_id 
          WHERE vpm.status = 1 
          AND vpm.deleted_flag = 0 AND vpm.archive_data = 1
          GROUP BY vpm.vprocess_id, vpm.Vendor_id, vpm.Process_date, vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`
        );
      } else {
        // Specific vendor
        sql = await db.query(
          `SELECT 
            vpm.vprocess_id processid,
            (SELECT vpl1.process_name 
              FROM vprocesslist vpl1 
              WHERE vpl1.vprocess_id = vpm.vprocess_id 
              ORDER BY vpl1.Row_updated_date ASC 
              LIMIT 1) AS title,
            vm.vendor_name,
            DATE_FORMAT(vpm.Process_date, '%Y%m%d') AS Process_date,
            DATEDIFF(CURDATE(), vpm.Process_date) AS age_in_days,
            COUNT(vpm.vprocess_id) OVER(PARTITION BY vpm.Vendor_id) AS process_count, 
            (
              SELECT JSON_ARRAYAGG(t.TimelineEvent)
              FROM (
                SELECT JSON_OBJECT(
                         'Eventid', vpl2.vprocess_id,
                         'Eventname', vpl2.process_name,
                         'feedback', vpm.feedback,
                         'Allowed_process', CAST(
                          '{"rfq": false, "quotation": false, "revised_quotation": false, "delivery_challan": false}' 
                          AS JSON),
                         'pdfpath', vpl2.Process_filepath,
                         'apporvedstatus', vpl2.Approved_status,
                         'internalstatus', vpl2.status
                       ) AS TimelineEvent
                FROM vprocesslist vpl2
                WHERE vpl2.vprocess_id = vpm.vprocess_id
                ORDER BY vpl2.Row_updated_date ASC
              ) t
            ) AS TimelineEvents 
          FROM vendorprocessmaster vpm 
          JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
          LEFT JOIN vprocesslist vpl ON vpl.vprocess_id = vpm.vprocess_id 
          WHERE vpm.status = 1 AND vpm.deleted_flag = 0 AND vpm.archive_data = 1
          AND vpm.Vendor_id = ?
          GROUP BY vpm.vprocess_id, vpm.Vendor_id, vpm.Process_date, vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`,
          [querydata.vendorid]
        );
      }
    }
    
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Vendor process Fetched successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Vendor process Fetched successfully",
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

module.exports = {
  AddVendor,
  GetVendor,
  AddQuotation,
  vendorDetailsPreLoader,
  GetProcessList,
  PostRFQ,
  GetSubProcessList,
  UpdateVendorRegistrationCert,
  UpdateVendorPAN,
  UpdateVendorCancelledCheque,
  UpdateVendorLogo,
  GetProducts,
  getNotes,
  GetCombinedProcessList,
  GetAllProcessList
};

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################