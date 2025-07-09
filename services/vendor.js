const db = require("../db");
const helper = require("../helper");
const uploadFile = require("../middleware");
const mqttclient = require("../mqttclient");

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
  let secret = ""; // Initialize secret early to avoid undefined errors
  
  try {
    // Debug logging
    console.log("AddVendor - req.body before upload:", req.body);
    console.log("AddVendor - req.files before upload:", req.files);
    
    // Upload all KYC documents at once to preserve req.body
    let registrationCertPath = null;
    let panUploadPath = null;
    let cancelledChequePath = null;
    let logoPath = null;

    try {
      await uploadFile.uploadVendorKYCDocuments(req, res);
      
      // Debug logging after upload
      console.log("AddVendor - req.body after upload:", req.body);
      console.log("AddVendor - req.files after upload:", req.files);
      
      // Extract file paths from uploaded files
      // Handle case where all files come with fieldname 'files' but different originalname
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          // Match by originalname when fieldname is generic 'files'
          if (file.fieldname === 'files') {
            switch (file.originalname) {
              case 'registration_certificate':
                registrationCertPath = file.path;
                console.log(`Mapped registration_certificate: ${file.path}`);
                break;
              case 'pan_upload':
                panUploadPath = file.path;
                console.log(`Mapped pan_upload: ${file.path}`);
                break;
              case 'cancelled_cheque':
                cancelledChequePath = file.path;
                console.log(`Mapped cancelled_cheque: ${file.path}`);
                break;
              case 'logo_upload':
                logoPath = file.path;
                console.log(`Mapped logo_upload: ${file.path}`);
                break;
              default:
                console.log(`Unknown file originalname: ${file.originalname}`);
                break;
            }
          } else {
            // Match by fieldname for properly named form fields
            switch (file.fieldname) {
              case 'registration_certificate':
                registrationCertPath = file.path;
                break;
              case 'pan_upload':
                panUploadPath = file.path;
                break;
              case 'cancelled_cheque':
                cancelledChequePath = file.path;
                break;
              case 'logo_upload':
                logoPath = file.path;
                break;
              default:
                console.log(`Unknown file field: ${file.fieldname}`);
                break;
            }
          }
        }
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Could not upload files. ${er.message}`,
        "ADD VENDOR",
        secret
      );
    }

    let vendor = req.body;

    // Get secret from request body if available for error handling
    if (vendor && vendor.STOKEN && vendor.STOKEN.length >= 16) {
      secret = vendor.STOKEN.substring(0, 16);
    }

    // Check if the session token exists
    if (!vendor.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD VENDOR",
        secret
      );
    }

    // Update secret from STOKEN once we know it exists and is valid
    secret = vendor.STOKEN.substring(0, 16);

    // Validate session token length
    if (vendor.STOKEN.length > 50 || vendor.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD VENDOR",
        secret
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
        secret
      );
    }

    // Check if querystring is provided
    if (!vendor.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD VENDOR",
        secret
      );
    }

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

    // Check if this is an update operation (vendorid provided) or add operation
    const isUpdate = querydata.vendorid && querydata.vendorid !== "" && querydata.vendorid != null;
    
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
      if (!querydata[field] || querydata[field] === "" || querydata[field] == null) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "ADD VENDOR",
          secret
        );
      }
    }


    try {
      // File paths are already set from individual uploads above
      let result;
      let vendorid;

      if (isUpdate) {
        // Update existing vendor
        const updateFields = [];
        const updateValues = [];
        
        // Build dynamic update query - only update fields that are provided
        updateFields.push('vendor_name = ?');
        updateValues.push(querydata.vendorname);
        
        if (querydata.address !== undefined) {
          updateFields.push('address = ?');
          updateValues.push(querydata.address || null);
        }
        
        if (querydata.state !== undefined) {
          updateFields.push('state = ?');
          updateValues.push(querydata.state || null);
        }
        
        if (querydata.pincode !== undefined) {
          updateFields.push('pincode = ?');
          updateValues.push(querydata.pincode || null);
        }
        
        if (querydata.contactpersonname !== undefined) {
          updateFields.push('contact_person_name = ?');
          updateValues.push(querydata.contactpersonname || null);
        }
        
        if (querydata.contactpersondesignation !== undefined) {
          updateFields.push('contact_person_designation = ?');
          updateValues.push(querydata.contactpersondesignation || null);
        }
        
        updateFields.push('contact_person_phone = ?');
        updateValues.push(querydata.contactpersonphone);
        
        updateFields.push('email = ?');
        updateValues.push(querydata.email);
        
        updateFields.push('business_type = ?');
        updateValues.push(querydata.businesstype);
        
        updateFields.push('year_of_establishment = ?');
        updateValues.push(querydata.yearofestablishment);
        
        updateFields.push('gst_number = ?');
        updateValues.push(querydata.gstnumber);
        
        updateFields.push('pan_number = ?');
        updateValues.push(querydata.pannumber);
        
        updateFields.push('annual_turnover = ?');
        updateValues.push(querydata.annualturnover);
        
        updateFields.push('products_services = ?');
        updateValues.push(querydata.productsservices);
        
        updateFields.push('hsn_sac_code = ?');
        updateValues.push(querydata.hsnsaccode);
        
        if (querydata.description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(querydata.description || null);
        }
        
        updateFields.push('bank_name = ?');
        updateValues.push(querydata.bankname);
        
        updateFields.push('branch_name = ?');
        updateValues.push(querydata.branchname);
        
        updateFields.push('account_number = ?');
        updateValues.push(querydata.accountnumber);
        
        updateFields.push('ifsc_code = ?');
        updateValues.push(querydata.ifsccode);
        
        if (querydata.isocertification !== undefined) {
          updateFields.push('iso_certification = ?');
          updateValues.push(querydata.isocertification || null);
        }
        
        if (querydata.othercertifications !== undefined) {
          updateFields.push('other_certifications = ?');
          updateValues.push(querydata.othercertifications || null);
        }
        
        // Only update file paths if new files were uploaded
        if (registrationCertPath) {
          updateFields.push('registration_certificate_path = ?');
          updateValues.push(registrationCertPath);
        }
        
        if (panUploadPath) {
          updateFields.push('pan_upload_path = ?');
          updateValues.push(panUploadPath);
        }
        
        if (cancelledChequePath) {
          updateFields.push('cancelled_cheque_path = ?');
          updateValues.push(cancelledChequePath);
        }
        
        if (logoPath) {
          updateFields.push('logo_path = ?');
          updateValues.push(logoPath);
        }
        
        // Add updated_at timestamp
        updateFields.push('updated_at = NOW()');
        
        // Add vendorid for WHERE clause
        updateValues.push(querydata.vendorid);
        
        const updateSql = `UPDATE vendors SET ${updateFields.join(', ')} WHERE vendor_id = ?`;
        
        result = await db.query(updateSql, updateValues);
        vendorid = querydata.vendorid;
        
        if (result.affectedRows > 0) {
          // MQTT notifications for vendor update
          await mqttclient.publishMqttMessage(
            "Notification",
            "Vendor Updated Successfully - " + querydata.vendorname
          );
          await mqttclient.publishMqttMessage(
            "refresh",
            "Vendor Updated Successfully"
          );
          
          return helper.getSuccessResponse(
            true,
            "success",
            "Vendor Updated Successfully",
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
            "Vendor not found or no changes made.",
            "ADD VENDOR",
            secret
          );
        }
      } else {
        // Insert new vendor
        result = await db.query(
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

        vendorid = result.insertId;

        if (vendorid != null && vendorid !== "") {
          // MQTT notifications for new vendor
          await mqttclient.publishMqttMessage(
            "Notification",
            "Vendor Added Successfully - " + querydata.vendorname
          );
          await mqttclient.publishMqttMessage(
            "refresh",
            "Vendor Added Successfully"
          );
          
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
//   "querystring": "encrypted_data_containing_process_and_event_id"
// }
// File upload in form-data with key "file"
// Required querystring data:
// {
//   "processid": 1,  // vprocess_id from vendorprocessmaster
//   "eventid": 2,    // process_id from vprocesslist (parent event)
//   "feedback": "Optional vendor feedback on quotation"
// }
//####################################################################### RESPONSE BODY  ##############################################################################################################
// {"code":true,"message":"Quotation Added Successfully","Value":{"vprocess_id": 1, "process_id": 2}}
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
    if (!quotation.STOKEN) {
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
    if (!quotation.querystring) {
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

    if (!querydata.processid || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "Event ID missing. Please provide the process_id)",
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

      // Insert into vprocesslist with proper relationship linking
      const sql = await db.query(
        `INSERT INTO vprocesslist (
          Process_filepath,
          Process_date,
          Created_by,
          process_type,
          process_name,
          process_id,
          feedback,
          Row_updated_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          filePath,
          formattedDate,
          userid,
          2,
          'QUOTATION',
          querydata.processid,
          querydata.feedback || null
        ]
      );

      // Get the inserted vprocess_id (auto-increment primary key)
      const vprocess_id = sql.insertId;
      
      if (vprocess_id != null && vprocess_id !== "") {
        // MQTT notifications for quotation upload
        await mqttclient.publishMqttMessage(
          "Notification",
          "Vendor Quotation Added Successfully"
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "Vendor Quotation Added Successfully"
        );
        
        return helper.getSuccessResponse(
          true,
          "success",
          "Quotation Added Successfully",
          {
            vprocess_id: vprocess_id,
            process_id: querydata.processid,
          },
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

    // Generate or retrieve RFQ ID using Gen_vendor_rfqId stored procedure
    // The stored procedure now handles checking for existing valid IDs and generating new ones
    let rfqId;
    
    try {
      const [rfqResult] = await db.spcall(
        `CALL Gen_vendor_rfqId(?, '/', @out); SELECT @out;`,
        [userid]
      );
      const objectValue = rfqResult[1][0];
      rfqId = objectValue["@out"];
      
      if (!rfqId) {
        return helper.getErrorResponse(
          false,
          "Failed to generate or retrieve RFQ ID using stored procedure.",
          "VENDOR DETAILS PRELOADER",
          "",
          secret
        );
      }
    } catch (e) {
      return helper.getErrorResponse(
        false,
        "Failed to generate RFQ ID using stored procedure.",
        "VENDOR DETAILS PRELOADER",
        "",
        secret
      );
    }

    // Return success response with the RFQ ID
    return helper.getSuccessResponse(
      true,
      "success",
      "RFQ ID generated successfully",
      { rfq_id: rfqId },
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

      // Validate RFQ ID is provided (should come from preloader endpoint)
      if (!querydata.rfqgenid || querydata.rfqgenid.trim() === '') {
        return helper.getErrorResponse(
          false,
          "RFQ ID missing. Please use vendorDetailsPreLoader endpoint to generate RFQ ID first",
          "POST RFQ",
          secret
        );
      }

      const rfqGenId = querydata.rfqgenid;
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
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          rfqGenId,
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
          querydata.product ? JSON.stringify(querydata.product) : JSON.stringify([]),
          1, // status
          0  // deleted_flag
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
          rfqGenId
        ]
      );

      const process_id = vprocessResult.insertId;

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
          process_id,
          Row_updated_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'RFQ',
          filePath,
          formattedDate,
          0, // Approved_status
          1, // status
          0, // deleted_flag
          userid,
          rfqGenId,
          1, // process_type
          querydata.vendoraddress || vendor.address || '',
          querydata.vendorname || vendor.vendor_name,
          process_id
        ]
      );

      const vprocess_id = processResult.insertId;

      // Initialize response flags
      let emailSent = false;
      let whatsappSent = false;

      // Update generatevrfqids status to 0 (mark as used) after successful vprocesslist insertion
      // This ensures the RFQ ID cannot be reused for another process
      try {
        await db.query(
          `UPDATE generatevrfqids SET status = 0, row_updated_date = NOW() 
           WHERE TRIM(LOWER(rfq_id)) = TRIM(LOWER(?))`,
          [rfqGenId]
        );
      } catch (updateError) {
        console.log("Warning: Could not update RFQ ID status:", updateError);
        // Continue execution even if update fails
      }

      // Get required modules
      const mailer = require("../mailer");
      const axios = require("axios");
      const config = require("../config");

      // Prepare email and WhatsApp data
      const vendorEmail = /*vendor.email ||*/ "kishorekkumar34@gmail.com"; // Fallback email
      const ccEmail = querydata.cc_email || "";
      const subject = `Request for Quotation - ${rfqGenId}`;
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
            rfqGenId, // RFQ ID
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
            rfqGenId,
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
        // MQTT notifications for RFQ posting
        await mqttclient.publishMqttMessage(
          "Notification",
          "RFQ Posted Successfully to " + vendor.vendor_name
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "RFQ Posted Successfully"
        );
        
        return helper.getSuccessResponse(
          true,
          "success",
          "RFQ Posted Successfully",
          {
            vprocess_id: vprocess_id,
            process_id: process_id,
            vendor_name: vendor.vendor_name,
            rfqid: rfqGenId,
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
      // Query to fetch subprocess list from vprocesslist table using process_id
      const sql = await db.query(
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
        WHERE process_id = ? AND deleted_flag = 0
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
              WHERE process_id = ? AND deleted_flag = 0
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
      // Archived processes (listtype 1 = show archived data)
      if (querydata.vendorid == 0) {
        // All vendors
        sql = await db.query(
          `SELECT 
            vpm.vprocess_id processid,
            (SELECT vpl1.process_name 
              FROM vprocesslist vpl1 
              WHERE vpl1.process_id = vpm.vprocess_id 
              ORDER BY vpl1.Row_updated_date ASC 
              LIMIT 1) AS title,
            vm.vendor_name,
            DATE_FORMAT(vpm.Process_date, '%Y%m%d') AS Process_date,
            ABS(DATEDIFF(CURDATE(), vpm.Process_date)) AS age_in_days,
            COUNT(vpm.vprocess_id) OVER(PARTITION BY vpm.Vendor_id) AS process_count, 
            (
              SELECT JSON_ARRAYAGG(t.TimelineEvent)
              FROM (
                SELECT JSON_OBJECT(
                         'Eventid', vpl2.vprocess_id,
                         'Eventname', vpsl2.processname,
                         'feedback', vpl2.feedback,
                         'Allowed_process', CAST(
                          '{"PO": false, "RRFQ": false, "UPLOAD_DC": false, "GET_APPROVAL": false, "UPLOAD_QUOTE": false, "UPLOAD_INVOICE": false}' 
                          AS JSON),
                         'pdfpath', vpl2.Process_filepath,
                         'apporvedstatus', vpl2.Approved_status,
                         'internalstatus', vpl2.status
                       ) AS TimelineEvent
                FROM vprocesslist vpl2
                LEFT JOIN vprocessshowlist vpsl2 
                  ON vpsl2.processshowlist_id = vpl2.process_type
                WHERE vpl2.process_id = vpm.vprocess_id
                ORDER BY vpl2.Row_updated_date ASC
              ) t
            ) AS TimelineEvents  
          FROM vendorprocessmaster vpm 
          JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
          LEFT JOIN vprocesslist vpl ON vpl.process_id = vpm.vprocess_id 
          LEFT JOIN vprocessshowlist vpsl ON vpsl.processshowlist_id = vpl.process_type 
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
              WHERE vpl1.process_id = vpm.vprocess_id 
              ORDER BY vpl1.Row_updated_date ASC 
              LIMIT 1) AS title,
            vm.vendor_name,
            DATE_FORMAT(vpm.Process_date, '%Y%m%d') AS Process_date,
            ABS(DATEDIFF(CURDATE(), vpm.Process_date)) AS age_in_days,
            COUNT(vpm.vprocess_id) OVER(PARTITION BY vpm.Vendor_id) AS process_count, 
            (
              SELECT JSON_ARRAYAGG(t.TimelineEvent)
              FROM (
                SELECT JSON_OBJECT(
                         'Eventid', vpl2.vprocess_id,
                         'Eventname', vpsl2.processname,
                         'feedback', vpl2.feedback,
                         'Allowed_process', CAST(
                          '{"PO": false, "RRFQ": false, "UPLOAD_DC": false, "GET_APPROVAL": false, "UPLOAD_QUOTE": false, "UPLOAD_INVOICE": false}' 
                          AS JSON),
                         'pdfpath', vpl2.Process_filepath,
                         'apporvedstatus', vpl2.Approved_status,
                         'internalstatus', vpl2.status
                       ) AS TimelineEvent
                FROM vprocesslist vpl2
                LEFT JOIN vprocessshowlist vpsl2 
                  ON vpsl2.processshowlist_id = vpl2.process_type
                WHERE vpl2.process_id = vpm.vprocess_id
                ORDER BY vpl2.Row_updated_date ASC
              ) t
            ) AS TimelineEvents  
          FROM vendorprocessmaster vpm 
          JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
          LEFT JOIN vprocesslist vpl ON vpl.process_id = vpm.vprocess_id 
          LEFT JOIN vprocessshowlist vpsl ON vpsl.processshowlist_id = vpl.process_type 
          WHERE vpm.status = 1 AND vpm.deleted_flag = 0 AND vpm.archive_data = 1
          AND vpm.Vendor_id = ?
          GROUP BY vpm.vprocess_id, vpm.Vendor_id, vpm.Process_date, vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`,
          [querydata.vendorid]
        );
      }
    } else {
      // Active processes (listtype != 1 = show unarchived data)
      if (querydata.vendorid == 0) {
        // All vendors
        sql = await db.query(
          `SELECT 
            vpm.vprocess_id processid,
            (SELECT vpl1.process_name 
              FROM vprocesslist vpl1 
              WHERE vpl1.process_id = vpm.vprocess_id 
              ORDER BY vpl1.Row_updated_date ASC 
              LIMIT 1) AS title,
            vm.vendor_name,
            DATE_FORMAT(vpm.Process_date, '%Y%m%d') AS Process_date,
            ABS(DATEDIFF(CURDATE(), vpm.Process_date)) AS age_in_days,
            COUNT(vpm.vprocess_id) OVER(PARTITION BY vpm.Vendor_id) AS process_count, 
            (
              SELECT JSON_ARRAYAGG(t.TimelineEvent)
              FROM (
                SELECT JSON_OBJECT(
                         'Eventid', vpl2.vprocess_id,
                         'Eventname', vpsl2.processname,
                         'feedback', vpl2.feedback,
                         'Allowed_process', vpsl2.allowed_process,
                         'pdfpath', vpl2.Process_filepath,
                         'apporvedstatus', vpl2.Approved_status,
                         'internalstatus', vpl2.status
                       ) AS TimelineEvent
                FROM vprocesslist vpl2
                LEFT JOIN vprocessshowlist vpsl2 
                  ON vpsl2.processshowlist_id = vpl2.process_type
                WHERE vpl2.process_id = vpm.vprocess_id
                ORDER BY vpl2.Row_updated_date ASC
              ) t
            ) AS TimelineEvents 
          FROM vendorprocessmaster vpm 
          JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
          LEFT JOIN vprocesslist vpl ON vpl.process_id = vpm.vprocess_id 
          LEFT JOIN vprocessshowlist vpsl ON vpsl.processshowlist_id = vpl.process_type 
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
              WHERE vpl1.process_id = vpm.vprocess_id 
              ORDER BY vpl1.Row_updated_date ASC 
              LIMIT 1) AS title,
            vm.vendor_name,
            DATE_FORMAT(vpm.Process_date, '%Y%m%d') AS Process_date,
            ABS(DATEDIFF(CURDATE(), vpm.Process_date)) AS age_in_days,
            COUNT(vpm.vprocess_id) OVER(PARTITION BY vpm.Vendor_id) AS process_count, 
            (
              SELECT JSON_ARRAYAGG(t.TimelineEvent)
              FROM (
                SELECT JSON_OBJECT(
                         'Eventid', vpl2.vprocess_id,
                         'Eventname', vpsl2.processname,
                         'feedback', vpl2.feedback,
                         'Allowed_process', vpsl2.allowed_process,
                         'pdfpath', vpl2.Process_filepath,
                         'apporvedstatus', vpl2.Approved_status,
                         'internalstatus', vpl2.status
                       ) AS TimelineEvent
                FROM vprocesslist vpl2
                LEFT JOIN vprocessshowlist vpsl2 
                  ON vpsl2.processshowlist_id = vpl2.process_type
                WHERE vpl2.process_id = vpm.vprocess_id
                ORDER BY vpl2.Row_updated_date ASC
              ) t
            ) AS TimelineEvents 
          FROM vendorprocessmaster vpm 
          JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
          LEFT JOIN vprocesslist vpl ON vpl.process_id = vpm.vprocess_id 
          LEFT JOIN vprocessshowlist vpsl ON vpsl.processshowlist_id = vpl.process_type 
          WHERE vpm.status = 1 AND vpm.deleted_flag = 0 AND vpm.archive_data = 0
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
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function activevendors(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "GET ACTIVE VENDORS",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET ACTIVE VENDORS",
        ""
      );
    }

    var secret = vendorData.STOKEN.substring(0, 16);

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
        "GET ACTIVE VENDORS",
        secret
      );
    }

    try {
      // Query to fetch active vendors with vendorid and vendor_name
      const sql = await db.query(
        `SELECT 
          vendorid, 
          vendor_name
        FROM vendors 
        WHERE status = 1 AND deleted_flag = 0
        ORDER BY vendor_name ASC`
      );

      return helper.getSuccessResponse(
        true,
        "success",
        "Active vendors fetched successfully",
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
//########################################### REQUEST BODY FOR GET BINARY FILE #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_event_id"
// }
// Required querystring data:
// {
//   "eventid": 1  // Required - vprocess_id from vprocesslist to get the binary file
// }
//####################################################################### RESPONSE BODY FOR GET BINARY FILE #######################################################
// {
//   "code": true,
//   "message": "File Binary Fetched Successfully",
//   "Value": "base64_encoded_binary_data_here"
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function getBinaryFile(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET BINARY DATA FOR PDF",
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
        "GET BINARY DATA FOR PDF",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      `CALL SP_STOKEN_CHECK(?,@result); SELECT @result;`,
      [vendorData.STOKEN]
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
    if (!vendorData.hasOwnProperty("querystring")) {
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
      querydata = await helper.decrypt(vendorData.querystring, secret);
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

    // Query to get the file path from vprocesslist using vprocess_id (eventid)
    const sql = await db.query(
      `SELECT Process_filepath FROM vprocesslist WHERE vprocess_id = ?`,
      [querydata.eventid]
    );

    if (sql.length > 0) {
      const filePath = sql[0].Process_filepath;
      
      // Check if file path exists
      if (!filePath) {
        return helper.getErrorResponse(
          false,
          "error",
          "File path not found for the given event",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }

      // Check if file exists on disk
      const fs = require("fs");
      if (!fs.existsSync(filePath)) {
        return helper.getErrorResponse(
          false,
          "error",
          "File does not exist",
          "GET BINARY DATA FOR PDF",
          secret
        );
      }

      // Convert file to binary data
      const binarydata = await helper.convertFileToBinary(filePath);
      
      return helper.getSuccessResponse(
        true,
        "success",
        "File Binary Fetched Successfully",
        binarydata,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Event not found or no file associated",
        "GET BINARY DATA FOR PDF",
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

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR ARCHIVE PROCESS #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_process_id_and_type"
// }
// Required querystring data:
// {
//   "processid": 4,  // Required - single vprocess_id from vendorprocessmaster
//   "type": 1        // Required - 1 for archive, 0 for unarchive
// }
// OR for multiple processes:
// {
//   "processid": [4, 5, 6],  // Required - array of vprocess_ids from vendorprocessmaster
//   "type": 1                // Required - 1 for archive, 0 for unarchive
// }
//####################################################################### RESPONSE BODY FOR ARCHIVE PROCESS #######################################################
// {
//   "code": true,
//   "message": "All 3 process(es) archived successfully",
//   "Value": {
//     "operation": "archive",
//     "total_processed": 3,
//     "success_count": 3,
//     "error_count": 0,
//     "results": [
//       {
//         "vprocess_id": 4,
//         "vendor_name": "JK Construction",
//         "status": "success",
//         "message": "Process archived successfully",
//         "archive_status": "archived"
//       }
//     ]
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function ArchiveProcess(processData) {
  try {
    // Check if the session token exists
    if (!processData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ARCHIVE PROCESS",
        ""
      );
    }

    // Validate session token length
    if (processData.STOKEN.length > 50 || processData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ARCHIVE PROCESS",
        ""
      );
    }

    var secret = processData.STOKEN.substring(0, 16);

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
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ARCHIVE PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!processData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ARCHIVE PROCESS",
        secret
      );
    }

    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(processData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ARCHIVE PROCESS",
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
        "ARCHIVE PROCESS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "" || querydata.processid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process ID missing. Please provide the processid",
        "ARCHIVE PROCESS",
        secret
      );
    }

    // Validate type field
    if (!querydata.hasOwnProperty("type") || (querydata.type !== 0 && querydata.type !== 1)) {
      return helper.getErrorResponse(
        false,
        "error",
        "Type missing or invalid. Please provide type (1 for archive, 0 for unarchive)",
        "ARCHIVE PROCESS",
        secret
      );
    }

    try {
      // Handle both single process ID and array of process IDs
      let processIds = Array.isArray(querydata.processid) ? querydata.processid : [querydata.processid];
      let results = [];
      let successCount = 0;
      let errorCount = 0;
      
      const operation = querydata.type === 1 ? "archive" : "unarchive";
      const archiveValue = querydata.type; // 1 for archive, 0 for unarchive

      for (let processId of processIds) {
        try {
          // Check if the process exists
          const checkProcess = await db.query(
            `SELECT vprocess_id, vendor_name, archive_data, deleted_flag 
             FROM vendorprocessmaster 
             WHERE vprocess_id = ? AND deleted_flag = 0`,
            [processId]
          );

          if (checkProcess.length === 0) {
            results.push({
              vprocess_id: processId,
              status: "error",
              message: "Process not found or already deleted"
            });
            errorCount++;
            continue;
          }

          // Check if already in the desired state
          if (checkProcess[0].archive_data === archiveValue) {
            results.push({
              vprocess_id: processId,
              vendor_name: checkProcess[0].vendor_name,
              status: "skipped",
              message: `Process is already ${operation}d`
            });
            continue;
          }

          // Update the archive status
          const sql = await db.query(
            `UPDATE vendorprocessmaster 
             SET archive_data = ?, Row_updated_date = NOW() 
             WHERE vprocess_id = ? AND deleted_flag = 0`,
            [archiveValue, processId]
          );

          if (sql.affectedRows > 0) {
            results.push({
              vprocess_id: processId,
              vendor_name: checkProcess[0].vendor_name,
              status: "success",
              message: `Process ${operation}d successfully`,
              archive_status: operation === "archive" ? "archived" : "active"
            });
            successCount++;
          } else {
            results.push({
              vprocess_id: processId,
              status: "error",
              message: `Failed to ${operation} the process`
            });
            errorCount++;
          }
        } catch (processError) {
          results.push({
            vprocess_id: processId,
            status: "error",
            message: `Error processing: ${processError.message}`
          });
          errorCount++;
        }
      }

      // Send MQTT notifications for bulk operations
      if (successCount > 0) {
        try {
          const message = `${successCount} Process(es) ${operation.charAt(0).toUpperCase() + operation.slice(1)}d Successfully`;
          mqttclient.publishMqttMessage("Notification", message).catch(err => console.log('MQTT Notification error:', err));
          mqttclient.publishMqttMessage("refresh", `Process ${operation} completed`).catch(err => console.log('MQTT Refresh error:', err));
        } catch (mqttError) {
          console.log('MQTT publish error:', mqttError);
        }
      }

      // Determine response message
      let responseMessage;
      if (successCount > 0 && errorCount === 0) {
        responseMessage = `All ${successCount} process(es) ${operation}d successfully`;
      } else if (successCount > 0 && errorCount > 0) {
        responseMessage = `${successCount} process(es) ${operation}d successfully, ${errorCount} failed`;
      } else {
        responseMessage = `Failed to ${operation} processes`;
      }

      return helper.getSuccessResponse(
        true,
        "success",
        responseMessage,
        {
          operation: operation,
          total_processed: processIds.length,
          success_count: successCount,
          error_count: errorCount,
          results: results
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
//########################################### REQUEST BODY FOR DELETE PROCESS #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_process_id_and_type"
// }
// Required querystring data:
// {
//   "processid": 4,  // Required - single vprocess_id from vendorprocessmaster
//   "type": 1        // Required - 1 for delete, 0 for undelete
// }
// OR for multiple processes:
// {
//   "processid": [4, 5, 6],  // Required - array of vprocess_ids from vendorprocessmaster
//   "type": 1                // Required - 1 for delete, 0 for undelete
// }
//####################################################################### RESPONSE BODY FOR DELETE PROCESS #######################################################
// {
//   "code": true,
//   "message": "All 3 process(es) deleted successfully",
//   "Value": {
//     "operation": "delete",
//     "total_processed": 3,
//     "success_count": 3,
//     "error_count": 0,
//     "results": [
//       {
//         "vprocess_id": 4,
//         "vendor_name": "JK Construction",
//         "status": "success",
//         "message": "Process deleted successfully",
//         "delete_status": "deleted"
//       }
//     ]
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function DeleteProcess(processData) {
  try {
    // Check if the session token exists
    if (!processData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "DELETE PROCESS",
        ""
      );
    }

    // Validate session token length
    if (processData.STOKEN.length > 50 || processData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "DELETE PROCESS",
        ""
      );
    }

    var secret = processData.STOKEN.substring(0, 16);

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
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "DELETE PROCESS",
        secret
      );
    }

    // Check if querystring is provided
    if (!processData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "DELETE PROCESS",
        secret
      );
    }

    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(processData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "DELETE PROCESS",
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
        "DELETE PROCESS",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "" || querydata.processid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process ID missing. Please provide the processid",
        "DELETE PROCESS",
        secret
      );
    }

    // Validate type field
    if (!querydata.hasOwnProperty("type") || (querydata.type !== 0 && querydata.type !== 1)) {
      return helper.getErrorResponse(
        false,
        "error",
        "Type missing or invalid. Please provide type (1 for delete, 0 for undelete)",
        "DELETE PROCESS",
        secret
      );
    }

    try {
      // Handle both single process ID and array of process IDs
      let processIds = Array.isArray(querydata.processid) ? querydata.processid : [querydata.processid];
      let results = [];
      let successCount = 0;
      let errorCount = 0;
      
      const operation = querydata.type === 1 ? "delete" : "undelete";
      const deleteValue = querydata.type; // 1 for delete, 0 for undelete
      const checkCondition = querydata.type === 1 ? "deleted_flag = 0" : "deleted_flag = 1";

      for (let processId of processIds) {
        try {
          // Check if the process exists in the expected state
          const checkProcess = await db.query(
            `SELECT vprocess_id, vendor_name, deleted_flag 
             FROM vendorprocessmaster 
             WHERE vprocess_id = ? AND ${checkCondition}`,
            [processId]
          );

          if (checkProcess.length === 0) {
            const notFoundMessage = querydata.type === 1 ? 
              "Process not found or already deleted" : 
              "Process not found or not deleted";
            results.push({
              vprocess_id: processId,
              status: "error",
              message: notFoundMessage
            });
            errorCount++;
            continue;
          }

          // Update the delete status
          const sql = await db.query(
            `UPDATE vendorprocessmaster 
             SET deleted_flag = ?, Row_updated_date = NOW() 
             WHERE vprocess_id = ?`,
            [deleteValue, processId]
          );

          // Also update related vprocesslist entries
          await db.query(
            `UPDATE vprocesslist 
             SET deleted_flag = ?, Row_updated_date = NOW() 
             WHERE process_id = ?`,
            [deleteValue, processId]
          );

          if (sql.affectedRows > 0) {
            results.push({
              vprocess_id: processId,
              vendor_name: checkProcess[0].vendor_name,
              status: "success",
              message: `Process ${operation}d successfully`,
              delete_status: operation === "delete" ? "deleted" : "active"
            });
            successCount++;
          } else {
            results.push({
              vprocess_id: processId,
              status: "error",
              message: `Failed to ${operation} the process`
            });
            errorCount++;
          }
        } catch (processError) {
          results.push({
            vprocess_id: processId,
            status: "error",
            message: `Error processing: ${processError.message}`
          });
          errorCount++;
        }
      }

      // Send MQTT notifications for bulk operations
      if (successCount > 0) {
        try {
          const message = `${successCount} Process(es) ${operation.charAt(0).toUpperCase() + operation.slice(1)}d Successfully`;
          mqttclient.publishMqttMessage("Notification", message).catch(err => console.log('MQTT Notification error:', err));
          mqttclient.publishMqttMessage("refresh", `Process ${operation} completed`).catch(err => console.log('MQTT Refresh error:', err));
        } catch (mqttError) {
          console.log('MQTT publish error:', mqttError);
        }
      }

      // Determine response message
      let responseMessage;
      if (successCount > 0 && errorCount === 0) {
        responseMessage = `All ${successCount} process(es) ${operation}d successfully`;
      } else if (successCount > 0 && errorCount > 0) {
        responseMessage = `${successCount} process(es) ${operation}d successfully, ${errorCount} failed`;
      } else {
        responseMessage = `Failed to ${operation} processes`;
      }

      return helper.getSuccessResponse(
        true,
        "success",
        responseMessage,
        {
          operation: operation,
          total_processed: processIds.length,
          success_count: successCount,
          error_count: errorCount,
          results: results
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
//########################################### REQUEST BODY FOR RRFQ PRELOADER #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_event_id"
// }
// Required querystring data:
// {
//   "eventid": 1  // Required - process_id from vprocesslist to find related RFQ details
// }
//####################################################################### RESPONSE BODY FOR RRFQ PRELOADER #######################################################
// {
//   "code": true,
//   "message": "RRFQ preloader data fetched successfully",
//   "Value": {
//     "rrfq_id": "SSIPL-RFQ/250756A",
//     "vendor_rfq_details": {
//       "id": 2,
//       "rfqgenid": "SSIPL-RFQ/250756",
//       "vendor_id": 1,
//       "vendor_name": "JK Constructiond",
//       "gstin": "33AATFN1941J1Z0",
//       "pan": "NAEPK8086H",
//       "contact_person": "Ravi Kumar",
//       "vendor_address": "Chinnverampatti, Udumallai",
//       "title": "yu",
//       "email_id": "hariprasath.s@sporadasecure.com",
//       "phone_no": "9344268155",
//       "cc_email": "",
//       "message_type": 3,
//       "feedback": "hello kishore",
//       "rfq_date": "2025-07-07 15:50:37",
//       "notes": ["Client needs to provide Ethernet cable and UPS power supply to the point where the device is proposed to install."],
//       "products": [{"productsno": 1, "productname": "keyboard", "productquantity": 56}],
//       "row_updated_date": "2025-07-07 15:50:37",
//       "status": 1,
//       "deleted_flag": 0
//     }
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function rrfqpreloader(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "RRFQ PRELOADER",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "RRFQ PRELOADER",
        ""
      );
    }

    var secret = vendorData.STOKEN.substring(0, 16);

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
        "RRFQ PRELOADER",
        secret
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "RRFQ PRELOADER",
        secret
      );
    }

    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(vendorData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "RRFQ PRELOADER",
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
        "RRFQ PRELOADER",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "" || querydata.eventid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Event ID missing. Please provide the eventid",
        "RRFQ PRELOADER",
        secret
      );
    }

    try {
      // Step 1: Find vprocess_id in vendorprocessmaster using eventid as process_id in vprocesslist
      const processQuery = await db.query(
        `SELECT vpm.vprocess_id, vpm.vprocess_gen_id 
         FROM vendorprocessmaster vpm
         INNER JOIN vprocesslist vpl ON vpl.process_id = vpm.vprocess_id
         WHERE vpl.vprocess_id = ? AND vpm.deleted_flag = 0 AND vpl.deleted_flag = 0`,
        [querydata.eventid]
      );

      if (processQuery.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Process not found for the given event ID",
          "RRFQ PRELOADER",
          secret
        );
      }

      const vprocessGenId = processQuery[0].vprocess_gen_id;

      // Step 2: Get vendor RFQ details using vprocess_gen_id as rfqgenid
      const rfqDetailsQuery = await db.query(
        `SELECT 
          id,
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
         FROM vendor_rfq_details 
         WHERE rfqgenid = ? AND deleted_flag = 0
         ORDER BY id DESC
         LIMIT 1`,
        [vprocessGenId]
      );

      if (rfqDetailsQuery.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Vendor RFQ details not found for the given process",
          "RRFQ PRELOADER",
          secret
        );
      }

      const vendorRfqDetails = rfqDetailsQuery[0];

      // Step 3: Check if RRFQ ID already exists, or generate new one
      let newRrfqId;
      
      // Check if a specific RRFQ ID is provided in the request
      if (querydata.rrfqgenid && querydata.rrfqgenid.trim() !== '') {
        // Check if the provided RRFQ ID already exists in vprocesslist
        const existingProcess = await db.query(
          `SELECT vprocess_gen_id FROM vprocesslist WHERE vprocess_gen_id = ? AND deleted_flag = 0 LIMIT 1`,
          [querydata.rrfqgenid]
        );
        
        if (existingProcess.length > 0) {
          // Use existing RRFQ ID
          newRrfqId = querydata.rrfqgenid;
        } else {
          // RRFQ ID provided but doesn't exist, use it as new
          newRrfqId = querydata.rrfqgenid;
        }
      } else {
        // No RRFQ ID provided, generate new one using stored procedure
        try {
          const [rrfqResult] = await db.spcall(
            `CALL Gen_vendor_rrfqId(?, ?, @rrfq_id); SELECT @rrfq_id;`,
            [vprocessGenId, userid]
          );
          const objectValue = rrfqResult[1][0];
          newRrfqId = objectValue["@rrfq_id"];
        } catch (e) {
          return helper.getErrorResponse(
            false,
            "error",
            "Failed to generate RRFQ ID using stored procedure",
            "RRFQ PRELOADER",
            secret
          );
        }
      }

      // Step 4: Parse JSON fields if they exist
      let parsedNotes = [];
      let parsedProducts = [];

      try {
        if (vendorRfqDetails.notes) {
          parsedNotes = JSON.parse(vendorRfqDetails.notes);
        }
      } catch (notesError) {
        console.warn("Error parsing notes JSON:", notesError);
        parsedNotes = vendorRfqDetails.notes || [];
      }

      try {
        if (vendorRfqDetails.products) {
          parsedProducts = JSON.parse(vendorRfqDetails.products);
        }
      } catch (productsError) {
        console.warn("Error parsing products JSON:", productsError);
        parsedProducts = vendorRfqDetails.products || [];
      }

      // Step 5: Format the response
      const responseData = {
        rrfq_id: newRrfqId,
        vendor_rfq_details: {
          id: vendorRfqDetails.id,
          rfqgenid: vendorRfqDetails.rfqgenid,
          vendor_id: vendorRfqDetails.vendor_id,
          vendor_name: vendorRfqDetails.vendor_name,
          gstin: vendorRfqDetails.gstin,
          pan: vendorRfqDetails.pan,
          contact_person: vendorRfqDetails.contact_person,
          vendor_address: vendorRfqDetails.vendor_address,
          title: vendorRfqDetails.title,
          email_id: vendorRfqDetails.email_id,
          phone_no: vendorRfqDetails.phone_no,
          cc_email: vendorRfqDetails.cc_email,
          message_type: vendorRfqDetails.message_type,
          feedback: vendorRfqDetails.feedback,
          rfq_date: vendorRfqDetails.rfq_date,
          notes: parsedNotes,
          products: parsedProducts,
          row_updated_date: vendorRfqDetails.row_updated_date,
          status: vendorRfqDetails.status,
          deleted_flag: vendorRfqDetails.deleted_flag
        }
      };

      // MQTT notifications for RRFQ preloader
      await mqttclient.publishMqttMessage(
        "Notification",
        "RRFQ ID Generated Successfully - " + newRrfqId
      );
      await mqttclient.publishMqttMessage(
        "refresh",
        "RRFQ ID Generated Successfully"
      );

      return helper.getSuccessResponse(
        true,
        "success",
        "RRFQ preloader data fetched successfully",
        responseData,
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
//########################################### REQUEST BODY FOR ADD FEEDBACK #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_eventid_and_feedback"
// }
// Required querystring data:
// {
//   "eventid": 123,      // vprocess_id in vprocesslist
//   "feedback": "Your feedback here"
// }
//####################################################################### RESPONSE BODY FOR ADD FEEDBACK #######################################################
// {
//   "code": true,
//   "message": "Feedback updated successfully",
//   "Value": { "eventid": 123, "feedback": "Your feedback here" }
// }
//##################################################################################################################################################################################################

async function addFeedback(feedbackData) {
  try {
    // Check if the session token exists
    if (!feedbackData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "ADD FEEDBACK",
        ""
      );
    }

    // Validate session token length
    if (feedbackData.STOKEN.length > 50 || feedbackData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "ADD FEEDBACK",
        ""
      );
    }

    var secret = feedbackData.STOKEN.substring(0, 16);

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [feedbackData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ADD FEEDBACK",
        secret
      );
    }

    // Check if querystring is provided
    if (!feedbackData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD FEEDBACK",
        secret
      );
    }

    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(feedbackData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD FEEDBACK",
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
        "ADD FEEDBACK",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || !querydata.eventid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Event ID missing. Please provide the eventid (vprocess_id)",
        "ADD FEEDBACK",
        secret
      );
    }
    if (!querydata.hasOwnProperty("feedback")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feedback",
        "ADD FEEDBACK",
        secret
      );
    }

    // Check if the event exists
    const check = await db.query(
      `SELECT vprocess_id FROM vprocesslist WHERE vprocess_id = ? AND deleted_flag = 0`,
      [querydata.eventid]
    );
    if (check.length === 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Event not found for the given eventid",
        "ADD FEEDBACK",
        secret
      );
    }

    // Update feedback
    const sql = await db.query(
      `UPDATE vprocesslist SET feedback = ?, Row_updated_date = NOW() WHERE vprocess_id = ?`,
      [querydata.feedback, querydata.eventid]
    );

    if (sql.affectedRows > 0) {
      // Prepare success response first
      const successResponse = helper.getSuccessResponse(
        true,
        "success",
        "Feedback updated successfully",
        { eventid: querydata.eventid, feedback: querydata.feedback },
        secret
      );
      
      // MQTT notifications for feedback update (non-blocking)
      try {
        mqttclient.publishMqttMessage(
          "refresh",
          "Feedback Updated Successfully"
        ).catch(err => console.log('MQTT Refresh error:', err));
      } catch (mqttError) {
        console.log('MQTT publish error:', mqttError);
      }
      
      return successResponse;
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "No changes made or event not found.",
        "ADD FEEDBACK",
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
//########################################### REQUEST BODY FOR POST RRFQ #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_rrfq_details"
// }
// File upload in form-data with key "file"
// Required querystring data:
// {
//   "rrfqgenid": "SSIPL-RFQ/2507/01A",
//   "vendorid": 1,
//   "processid": 4  // parent process_id from vendorprocessmaster
// }
// Optional querystring data:
// {
//   "vendorname": "JK Construction",
//   "gstin": "33AATFN1941J1Z0",
//   "pan": "NAEPK8086H",
//   "contact_person": "Ravi Kumar",
//   "vendor_address": "123 Main Street",
//   "title": "Revised RFQ for Steel Products",
//   "email_id": "vendor@example.com",
//   "phone_no": "9344268155",
//   "cc_email": "cc@example.com",
//   "message_type": 1,  // 1 = email only, 2 = WhatsApp only, 3 = both (default: 1)
//   "feedback": "Please provide your revised quotation",
//   "notes": ["Additional specifications", "Delivery requirements"],
//   "products": [{"productsno": 1, "productname": "Steel Rods", "productquantity": 100}]
// }
//####################################################################### RESPONSE BODY FOR POST RRFQ #######################################################
// {
//   "code": true,
//   "message": "RRFQ Posted Successfully",
//   "Value": {
//     "vprocess_id": 5,
//     "rrfq_details_id": 3,
//     "vendor_name": "JK Construction",
//     "rrfqgenid": "SSIPL-RFQ/2507/01A",
//     "emailsent": true,
//     "whatsappsent": false,
//     "messagetype": 1
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function PostRRFQ(req, res) {
  try {
    // Upload the PDF file first using dedicated RRFQ upload function
    try {
      await uploadFile.uploadPostRRFQ(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "Please upload a PDF file!",
          "POST RRFQ",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        `Could not upload the file. ${er.message}`,
        "POST RRFQ",
        ""
      );
    }

    let rrfqData = req.body;

    // Check if the session token exists
    if (!rrfqData || !("STOKEN" in rrfqData) || rrfqData.STOKEN === undefined) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "POST RRFQ",
        ""
      );
    }

    // Validate session token length
    if (rrfqData.STOKEN.length > 50 || rrfqData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "POST RRFQ",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [rrfqData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "POST RRFQ",
        rrfqData.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!rrfqData || !("querystring" in rrfqData) || rrfqData.querystring === undefined) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "POST RRFQ",
        rrfqData && rrfqData.STOKEN ? rrfqData.STOKEN.substring(0, 16) : ""
      );
    }

    var secret = rrfqData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(rrfqData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "Querystring Invalid error. Please provide the valid querystring.",
        "POST RRFQ",
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
        "POST RRFQ",
        secret
      );
    }

    // Validate required fields
    if (!querydata || !("vendorid" in querydata) || querydata.vendorid === "" || querydata.vendorid === undefined) {
      return helper.getErrorResponse(
        false,
        "Vendor ID missing. Please provide the Vendor ID",
        "POST RRFQ",
        secret
      );
    }

    if (!querydata || !("processid" in querydata) || querydata.processid === "" || querydata.processid === undefined) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process ID missing. Please provide the Process ID (parent process)",
        "POST RRFQ",
        secret
      );
    }

    // Validate messagetype if provided
    if (querydata && ("messagetype" in querydata) && ![1, 2, 3].includes(querydata.messagetype)) {
      return helper.getErrorResponse(
        false,
        "Invalid message type. Use 1 for email only, 2 for WhatsApp only, 3 for both",
        "POST RRFQ",
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
          "POST RRFQ",
          secret
        );
      }

      const vendor = vendorDetails[0];

      // Validate RRFQ ID is provided (should come from rrfqpreloader endpoint)
      if (!querydata.rrfqgenid || querydata.rrfqgenid.trim() === '') {
        return helper.getErrorResponse(
          false,
          "RRFQ ID missing. Please use rrfqpreloader endpoint to generate RRFQ ID first",
          "POST RRFQ",
          secret
        );
      }

      const rrfqGenId = querydata.rrfqgenid;
      const filePath = req.file.path;
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD

      // Insert vendor RRFQ details into vendor_rrfq_details table using querystring data
      const rrfqDetailsResult = await db.query(
        `INSERT INTO vendor_rrfq_details (
          rrfqgenid,
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
          rrfq_date,
          notes,
          products,
          row_updated_date,
          status,
          deleted_flag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          rrfqGenId,
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
          querydata.product ? JSON.stringify(querydata.product) : JSON.stringify([]),
          1, // status
          0  // deleted_flag
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

      // Insert into vprocesslist as a subprocess (no vendorprocessmaster entry for RRFQ)
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
          process_id,
          Row_updated_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          'RRFQ',
          filePath,
          formattedDate,
          0, // Approved_status
          1, // status
          0, // deleted_flag
          userid,
          rrfqGenId,
          3, // process_type for RRFQ
          querydata.vendoraddress || vendor.address || '',
          querydata.vendorname || vendor.vendor_name,
          querydata.processid // Parent process_id from vendorprocessmaster
        ]
      );

      const vprocess_id = processResult.insertId;

      // Initialize response flags
      let emailSent = false;
      let whatsappSent = false;

      // Update generatevrrfqids status to 0 (mark as used) after successful vprocesslist insertion
      // This ensures the RRFQ ID cannot be reused for another process
      try {
        await db.query(
          `UPDATE generatevrrfqids SET status = 0, row_updated_date = NOW() 
           WHERE TRIM(LOWER(rrfq_id)) = TRIM(LOWER(?))`,
          [rrfqGenId]
        );
      } catch (updateError) {
        console.log("Warning: Could not update RRFQ ID status:", updateError);
        // Continue execution even if update fails
      }

      // Get required modules
      const mailer = require("../mailer");
      const axios = require("axios");
      const config = require("../config");

      // Prepare email and WhatsApp data
      const vendorEmail = /*vendor.email ||*/ "kishorekkumar34@gmail.com"; // Fallback email
      const ccEmail = querydata.cc_email || "";
      const subject = `Revised Request for Quotation - ${rrfqGenId}`;
      const notes = querydata.feedback || querydata.notes || "Please review the attached revised RFQ document and provide your updated quotation.";
      
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
            "VENDORRRFQ", // module tag for email settings
            filePath, // file path for attachment
            rrfqGenId, // RRFQ ID
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
            "VENDORRRFQ",
            filePath,
            rrfqGenId,
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

      if (vprocess_id != null && rrfqDetailsResult.insertId != null) {
        // MQTT notifications for RRFQ posting
        await mqttclient.publishMqttMessage(
          "Notification",
          "RRFQ Posted Successfully to " + vendor.vendor_name
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "RRFQ Posted Successfully"
        );
        
        return helper.getSuccessResponse(
          true,
          "success",
          "RRFQ Posted Successfully",
          {
            vprocess_id: vprocess_id,
            rrfq_details_id: rrfqDetailsResult.insertId,
            vendor_name: vendor.vendor_name,
            rrfqgenid: rrfqGenId,
            emailsent: emailSent,
            whatsappsent: whatsappSent,
            messagetype: messagetype
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "Error while posting the RRFQ.",
          "POST RRFQ",
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
  activevendors,
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
  GetAllProcessList,
  getBinaryFile,
  ArchiveProcess,
  DeleteProcess,
  rrfqpreloader,
  addFeedback,
  PostRRFQ,
};

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################