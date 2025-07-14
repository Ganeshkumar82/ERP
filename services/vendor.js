const db = require("../db");
const helper = require("../helper");
const uploadFile = require("../middleware");
const mqttclient = require("../mqttclient");
const path = require("path");

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
    // Debug logging - files and body are already processed by middleware
    console.log("AddVendor - req.body (processed by middleware):", req.body);
    console.log("AddVendor - req.files (processed by middleware):", req.files);
    
    // Extract file paths from uploaded files (already processed by middleware)
    // Note: Middleware now ensures all files have proper extensions
    let registrationCertPath = null;
    let panUploadPath = null;
    let cancelledChequePath = null;
    let logoPath = null;

    // Process the files that were already uploaded by middleware
    if (req.files && Array.isArray(req.files)) {
      console.log(`Processing ${req.files.length} uploaded files`);
      for (const file of req.files) {
        console.log(`Processing file: fieldname=${file.fieldname}, originalname=${file.originalname}, path=${file.path}`);
        
        // Handle file mapping - check originalname when fieldname is 'files', otherwise use fieldname
        let fileIdentifier;
        if (file.fieldname === 'files' && file.originalname) {
          fileIdentifier = file.originalname;
        } else {
          fileIdentifier = file.fieldname;
        }
        
        switch (fileIdentifier) {
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
            console.log(`Unknown file field/name: ${fileIdentifier} (fieldname: ${file.fieldname}, originalname: ${file.originalname})`);
            break;
        }
      }
    } else {
      console.log("No files received in request");
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
      { field: "vendor_name", message: "Vendor name missing. Please provide the Vendor name" },
      { field: "email", message: "Email missing. Please provide the Email" },
      { field: "contact_person_phone", message: "Contact person phone missing. Please provide the Contact person phone" },
      { field: "business_type", message: "Business type missing. Please provide the Business type" },
      { field: "year_of_establishment", message: "Year of establishment missing. Please provide the Year of establishment" },
      { field: "gst_number", message: "GST number missing. Please provide the GST number" },
      { field: "pan_number", message: "PAN number missing. Please provide the PAN number" },
      { field: "annual_turnover", message: "Annual turnover missing. Please provide the Annual turnover" },
      { field: "products_services", message: "Products/Services missing. Please provide the Products/Services" },
      { field: "hsn_sac_code", message: "HSN/SAC code missing. Please provide the HSN/SAC code" },
      { field: "bank_name", message: "Bank name missing. Please provide the Bank name" },
      { field: "branch_name", message: "Branch name missing. Please provide the Branch name" },
      { field: "account_number", message: "Account number missing. Please provide the Account number" },
      { field: "ifsc_code", message: "IFSC code missing. Please provide the IFSC code" }
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
        updateValues.push(querydata.vendor_name);
        
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
        
        if (querydata.contact_person_name !== undefined) {
          updateFields.push('contact_person_name = ?');
          updateValues.push(querydata.contact_person_name || null);
        }
        
        if (querydata.contact_person_designation !== undefined) {
          updateFields.push('contact_person_designation = ?');
          updateValues.push(querydata.contact_person_designation || null);
        }
        
        updateFields.push('contact_person_phone = ?');
        updateValues.push(querydata.contact_person_phone);
        
        updateFields.push('email = ?');
        updateValues.push(querydata.email);
        
        updateFields.push('business_type = ?');
        updateValues.push(querydata.business_type);
        
        updateFields.push('year_of_establishment = ?');
        updateValues.push(querydata.year_of_establishment);
        
        updateFields.push('gst_number = ?');
        updateValues.push(querydata.gst_number);
        
        updateFields.push('pan_number = ?');
        updateValues.push(querydata.pan_number);
        
        updateFields.push('annual_turnover = ?');
        updateValues.push(querydata.annual_turnover);
        
        updateFields.push('products_services = ?');
        updateValues.push(querydata.products_services);
        
        updateFields.push('hsn_sac_code = ?');
        updateValues.push(querydata.hsn_sac_code);
        
        if (querydata.description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(querydata.description || null);
        }
        
        updateFields.push('bank_name = ?');
        updateValues.push(querydata.bank_name);
        
        updateFields.push('branch_name = ?');
        updateValues.push(querydata.branch_name);
        
        updateFields.push('account_number = ?');
        updateValues.push(querydata.account_number);
        
        updateFields.push('ifsc_code = ?');
        updateValues.push(querydata.ifsc_code);
        
        if (querydata.isocertification !== undefined) {
          updateFields.push('iso_certification = ?');
          updateValues.push(querydata.iso_certification || null);
        }
        
        if (querydata.othercertifications !== undefined) {
          updateFields.push('other_certifications = ?');
          updateValues.push(querydata.other_certifications || null);
        }
        
        // Only update file paths if new files were uploaded
        if (registrationCertPath) {
          updateFields.push('registration_certificate_path = ?');
          updateValues.push(registrationCertPath);
        }
        // If no new registration_certificate uploaded, the old path remains unchanged
        
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
        
        const updateSql = `UPDATE vendors SET ${updateFields.join(', ')} WHERE vendorid = ?`;
        
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
            querydata.vendor_name,
            querydata.address || null,
            querydata.state || null,
            querydata.pincode || null,
            querydata.contact_person_name || null,
            querydata.contact_person_designation || null,
            querydata.contact_person_phone,
            querydata.email,
            querydata.business_type,
            querydata.year_of_establishment,
            querydata.gst_number,
            querydata.pan_number,
            querydata.annual_turnover,
            querydata.products_services,
            querydata.hsn_sac_code,
            querydata.description || null,
            querydata.bank_name,
            querydata.branch_name,
            querydata.account_number,
            querydata.ifsc_code,
            querydata.iso_certification || null,
            querydata.other_certifications || null,
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

async function AddVendorResponse(req, res) {
  let secret = ""; // Initialize secret early to avoid undefined errors
  
  try {
    // Debug logging - files and body are already processed by middleware
    console.log("AddVendor - req.body (processed by middleware):", req.body);
    console.log("AddVendor - req.files (processed by middleware):", req.files);
    
    // Extract file paths from uploaded files (already processed by middleware)
    // Note: Middleware now ensures all files have proper extensions
    let registrationCertPath = null;
    let panUploadPath = null;
    let cancelledChequePath = null;
    let logoPath = null;

    // Process the files that were already uploaded by middleware
    if (req.files && Array.isArray(req.files)) {
      console.log(`Processing ${req.files.length} uploaded files`);
      for (const file of req.files) {
        console.log(`Processing file: fieldname=${file.fieldname}, originalname=${file.originalname}, path=${file.path}`);
        
        // Handle file mapping - check originalname when fieldname is 'files', otherwise use fieldname
        let fileIdentifier;
        if (file.fieldname === 'files' && file.originalname) {
          fileIdentifier = file.originalname;
        } else {
          fileIdentifier = file.fieldname;
        }
        
        switch (fileIdentifier) {
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
            console.log(`Unknown file field/name: ${fileIdentifier} (fieldname: ${file.fieldname}, originalname: ${file.originalname})`);
            break;
        }
      }
    } else {
      console.log("No files received in request");
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
      { field: "vendor_name", message: "Vendor name missing. Please provide the Vendor name" },
      { field: "email", message: "Email missing. Please provide the Email" },
      { field: "contact_person_phone", message: "Contact person phone missing. Please provide the Contact person phone" },
      { field: "business_type", message: "Business type missing. Please provide the Business type" },
      { field: "year_of_establishment", message: "Year of establishment missing. Please provide the Year of establishment" },
      { field: "gst_number", message: "GST number missing. Please provide the GST number" },
      { field: "pan_number", message: "PAN number missing. Please provide the PAN number" },
      { field: "annual_turnover", message: "Annual turnover missing. Please provide the Annual turnover" },
      { field: "products_services", message: "Products/Services missing. Please provide the Products/Services" },
      { field: "hsn_sac_code", message: "HSN/SAC code missing. Please provide the HSN/SAC code" },
      { field: "bank_name", message: "Bank name missing. Please provide the Bank name" },
      { field: "branch_name", message: "Branch name missing. Please provide the Branch name" },
      { field: "account_number", message: "Account number missing. Please provide the Account number" },
      { field: "ifsc_code", message: "IFSC code missing. Please provide the IFSC code" }
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
        updateValues.push(querydata.vendor_name);
        
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
        
        if (querydata.contact_person_name !== undefined) {
          updateFields.push('contact_person_name = ?');
          updateValues.push(querydata.contact_person_name || null);
        }
        
        if (querydata.contact_person_designation !== undefined) {
          updateFields.push('contact_person_designation = ?');
          updateValues.push(querydata.contact_person_designation || null);
        }
        
        updateFields.push('contact_person_phone = ?');
        updateValues.push(querydata.contact_person_phone);
        
        updateFields.push('email = ?');
        updateValues.push(querydata.email);
        
        updateFields.push('business_type = ?');
        updateValues.push(querydata.business_type);
        
        updateFields.push('year_of_establishment = ?');
        updateValues.push(querydata.year_of_establishment);
        
        updateFields.push('gst_number = ?');
        updateValues.push(querydata.gst_number);
        
        updateFields.push('pan_number = ?');
        updateValues.push(querydata.pan_number);
        
        updateFields.push('annual_turnover = ?');
        updateValues.push(querydata.annual_turnover);
        
        updateFields.push('products_services = ?');
        updateValues.push(querydata.products_services);
        
        updateFields.push('hsn_sac_code = ?');
        updateValues.push(querydata.hsn_sac_code);
        
        if (querydata.description !== undefined) {
          updateFields.push('description = ?');
          updateValues.push(querydata.description || null);
        }
        
        updateFields.push('bank_name = ?');
        updateValues.push(querydata.bank_name);
        
        updateFields.push('branch_name = ?');
        updateValues.push(querydata.branch_name);
        
        updateFields.push('account_number = ?');
        updateValues.push(querydata.account_number);
        
        updateFields.push('ifsc_code = ?');
        updateValues.push(querydata.ifsc_code);
        
        if (querydata.isocertification !== undefined) {
          updateFields.push('iso_certification = ?');
          updateValues.push(querydata.iso_certification || null);
        }
        
        if (querydata.othercertifications !== undefined) {
          updateFields.push('other_certifications = ?');
          updateValues.push(querydata.other_certifications || null);
        }
        
        // Only update file paths if new files were uploaded
        if (registrationCertPath) {
          updateFields.push('registration_certificate_path = ?');
          updateValues.push(registrationCertPath);
        }
        // If no new registration_certificate uploaded, the old path remains unchanged
        
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
        
        const updateSql = `UPDATE vendor_details SET ${updateFields.join(', ')} WHERE vendorid = ?`;
        
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
          `INSERT INTO vendor_details (
            vendor_name, address, state, pincode, contact_person_name, contact_person_designation, 
            contact_person_phone, email, business_type, year_of_establishment, gst_number, 
            pan_number, annual_turnover, products_services, hsn_sac_code, description,
            bank_name, branch_name, account_number, ifsc_code, iso_certification, 
            other_certifications, registration_certificate_path, pan_upload_path, cancelled_cheque_path, logo_path
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            querydata.vendor_name,
            querydata.address || null,
            querydata.state || null,
            querydata.pincode || null,
            querydata.contact_person_name || null,
            querydata.contact_person_designation || null,
            querydata.contact_person_phone,
            querydata.email,
            querydata.business_type,
            querydata.year_of_establishment,
            querydata.gst_number,
            querydata.pan_number,
            querydata.annual_turnover,
            querydata.products_services,
            querydata.hsn_sac_code,
            querydata.description || null,
            querydata.bank_name,
            querydata.branch_name,
            querydata.account_number,
            querydata.ifsc_code,
            querydata.iso_certification || null,
            querydata.other_certifications || null,
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
//########################################### REQUEST BODY FOR GET VENDOR WITH FILE #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_vendor_id_and_type"
// }
// Required querystring data:
// {
//   "vendorid": 1,     // Required - specific vendor ID
//   "type": "logo"     // Required - file type ("registration", "pan", "cheque", "logo")
// }
//####################################################################### RESPONSE BODY FOR GET VENDOR WITH FILE #######################################################
// {
//   "code": true,
//   "message": "File fetched successfully",
//   "Value": "base64_encoded_file_content_here"
// }
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
        // Always convert logo to base64 if available
        if (sql[i].logo_path) {
          try {
            const binaryData = await helper.convertFileToBinary(sql[i].logo_path);
            sql[i].logo_base64 = binaryData;
          } catch (error) {
            console.error("Error reading logo file:", sql[i].logo_path, error);
            sql[i].logo_base64 = null;
          }
        } else {
          sql[i].logo_base64 = null;
        }

        // Convert specific file to base64 if type is specified
        if (querydata.type) {
          const fileMapping = {
            'registration': 'registration_certificate_path',
            'pan': 'pan_upload_path',
            'cheque': 'cancelled_cheque_path',
            'logo': 'logo_path'
          };

          const pathField = fileMapping[querydata.type];
          if (pathField && sql[i][pathField]) {
            try {
              const binaryData = await helper.convertFileToBinary(sql[i][pathField]);
              sql[i][`${querydata.type}_base64`] = binaryData;
            } catch (error) {
              console.error(`Error reading ${querydata.type} file:`, sql[i][pathField], error);
              sql[i][`${querydata.type}_base64`] = null;
            }
          }
        }

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

async function GetVendorWithFile(vendor) {
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
      // Validate required fields
      if (!querydata.vendorid || querydata.vendorid == 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Vendor ID missing. Please provide the vendor ID",
          "FETCH VENDOR FILE",
          secret
        );
      }

      if (!querydata.type || querydata.type.trim() === "") {
        return helper.getErrorResponse(
          false,
          "error",
          "File type missing. Please provide the file type (registration, pan, cheque, logo)",
          "FETCH VENDOR FILE",
          secret
        );
      }

      const filename = querydata.type.toLowerCase();
      let pathColumn;
      let fileDescription;

      // Map file type to database column
      switch (filename) {
        case 'gstreg':
          pathColumn = 'registration_certificate_path';
          fileDescription = 'Registration Certificate';
          break;
        case 'pan':
          pathColumn = 'pan_upload_path';
          fileDescription = 'PAN Document';
          break;
        case 'cheque':
          pathColumn = 'cancelled_cheque_path';
          fileDescription = 'Cancelled Cheque';
          break;
        case 'logo':
          pathColumn = 'logo_path';
          fileDescription = 'Logo';
          break;
        default:
          return helper.getErrorResponse(
            false,
            "error",
            "Invalid file type. Supported types: registration, pan, cheque, logo",
            "FETCH VENDOR FILE",
            secret
          );
      }

      // Get the specific file path for the vendor
      const sql = await db.query(
        `SELECT ${pathColumn} as file_path FROM vendors WHERE vendorid = ?`,
        [querydata.vendorid]
      );

      if (sql.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Vendor not found",
          "FETCH VENDOR FILE",
          secret
        );
      }

      const filePath = sql[0].file_path;
      console.log(`GetVendorWithFile: Retrieved file path from database: ${filePath}`);

      if (!filePath) {
        return helper.getErrorResponse(
          false,
          "error",
          `${fileDescription} not found for this vendor`,
          "FETCH VENDOR FILE",
          secret
        );
      }

      // Convert file to base64
      try {
        // First try the exact path as stored in database
        let finalFilePath = filePath;
        
        // If the exact path doesn't exist, try with common extensions
        const fs = require('fs');
        if (!fs.existsSync(filePath)) {
          console.log(`File not found at exact path: ${filePath}, trying with extensions...`);
          const possibleExtensions = ['.pdf', '.jpg', '.jpeg', '.png'];
          let found = false;
          
          for (const ext of possibleExtensions) {
            const testPath = filePath + ext;
            if (fs.existsSync(testPath)) {
              finalFilePath = testPath;
              found = true;
              console.log(`Found file with extension: ${testPath}`);
              break;
            }
          }
          
          if (!found) {
            console.log(`File not found even with extensions. Original path: ${filePath}`);
            throw new Error(`File not found: ${filePath}`);
          }
        }
        
        const binaryData = await helper.convertFileToBinary(finalFilePath);
        
        return helper.getSuccessResponse(
          true,
          "success",
          `${fileDescription} fetched successfully`,
          binaryData,
          secret
        );
      } catch (fileError) {
        console.error(`Error reading ${fileDescription}:`, filePath, fileError);
        return helper.getErrorResponse(
          false,
          "error",
          `Error reading ${fileDescription} file. File may not exist or may be corrupted.`,
          "FETCH VENDOR FILE",
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
//           "Approved_status": 0,  // 0=null/not done anything, 1=approved, 2=mail sent but no action, 3=rejected
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
    
    // Base query with improved timeline event logic
    const baseQuery = `
      SELECT 
        vpm.vprocess_id AS processid,
        (
          SELECT vpl1.process_name 
          FROM vprocesslist vpl1 
          WHERE vpl1.process_id = vpm.vprocess_id 
          ORDER BY vpl1.Row_updated_date ASC 
          LIMIT 1
        ) AS title,
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
              'Allowed_process',
                CASE
                  WHEN vpsl2.processname = 'QUOTATION' AND vpl2.Row_updated_date = (
                    SELECT MAX(vpl3.Row_updated_date)
                    FROM vprocesslist vpl3
                    JOIN vprocessshowlist vpsl3 ON vpsl3.processshowlist_id = vpl3.process_type
                    WHERE vpl3.process_id = vpm.vprocess_id AND vpsl3.processname = 'QUOTATION'
                  ) AND vpl2.Approved_status = 1 THEN (
                    SELECT vpsl4.allowed_process
                    FROM vprocessshowlist vpsl4
                    WHERE vpsl4.processname = 'APPROVE'
                    LIMIT 1
                  )
                  WHEN vpsl2.processname = 'QUOTATION' AND vpl2.Row_updated_date = (
                    SELECT MAX(vpl3.Row_updated_date)
                    FROM vprocesslist vpl3
                    JOIN vprocessshowlist vpsl3 ON vpsl3.processshowlist_id = vpl3.process_type
                    WHERE vpl3.process_id = vpm.vprocess_id AND vpsl3.processname = 'QUOTATION'
                  ) AND vpl2.Approved_status = 2 THEN (
                    SELECT vpsl5.allowed_process
                    FROM vprocessshowlist vpsl5
                    WHERE vpsl5.processname = 'REJECT'
                    LIMIT 1
                  )
                  ELSE vpsl2.allowed_process
                END,
              'pdfpath', vpl2.Process_filepath,
              'apporvedstatus', vpl2.Approved_status,
              'internalstatus', vpl2.status
            ) AS TimelineEvent
            FROM vprocesslist vpl2
            LEFT JOIN vprocessshowlist vpsl2 
              ON vpsl2.processshowlist_id = vpl2.process_type
            WHERE vpl2.process_id = vpm.vprocess_id
              AND vpsl2.processname NOT IN ('APPROVE', 'REJECT')
            ORDER BY vpl2.Row_updated_date ASC
          ) t
        ) AS TimelineEvents

      FROM vendorprocessmaster vpm 
      JOIN vendors vm ON vpm.Vendor_id = vm.vendorid 
      LEFT JOIN vprocesslist vpl ON vpl.process_id = vpm.vprocess_id 
      LEFT JOIN vprocessshowlist vpsl ON vpsl.processshowlist_id = vpl.process_type 

      WHERE vpm.status = 1 
        AND vpm.deleted_flag = 0`;

    if (querydata.listtype == 1) {
      // Archived processes (listtype 1 = show archived data)
      if (querydata.vendorid == 0) {
        // All vendors - archived
        sql = await db.query(
          baseQuery + ` AND vpm.archive_data = 1
          GROUP BY 
            vpm.vprocess_id, 
            vpm.Vendor_id, 
            vpm.Process_date, 
            vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`
        );
      } else {
        // Specific vendor - archived
        sql = await db.query(
          baseQuery + ` AND vpm.archive_data = 1 AND vpm.Vendor_id = ?
          GROUP BY 
            vpm.vprocess_id, 
            vpm.Vendor_id, 
            vpm.Process_date, 
            vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`,
          [querydata.vendorid]
        );
      }
    } else {
      // Active processes (listtype != 1 = show unarchived data)
      if (querydata.vendorid == 0) {
        // All vendors - active
        sql = await db.query(
          baseQuery + ` AND vpm.archive_data = 0
          GROUP BY 
            vpm.vprocess_id, 
            vpm.Vendor_id, 
            vpm.Process_date, 
            vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`
        );
      } else {
        // Specific vendor - active
        sql = await db.query(
          baseQuery + ` AND vpm.archive_data = 0 AND vpm.Vendor_id = ?
          GROUP BY 
            vpm.vprocess_id, 
            vpm.Vendor_id, 
            vpm.Process_date, 
            vm.vendor_name
          ORDER BY vpm.Row_updated_date DESC`,
          [querydata.vendorid]
        );
      }
    }
    
    return helper.getSuccessResponse(
      true,
      "success",
      "Vendor process Fetched successfully",
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
      // Query to fetch active vendors from vendorprocessmaster with vendor_name and Vendor_id
      const sql = await db.query(
        `SELECT DISTINCT
          vpm.Vendor_id, 
          vm.vendor_name
        FROM vendorprocessmaster vpm
        LEFT JOIN vendors vm ON vpm.Vendor_id = vm.vendorid
        WHERE vpm.status = 1 AND vpm.deleted_flag = 0
        ORDER BY vm.vendor_name ASC`
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
//   "querystring": "encrypted_data_containing_event_id_and_type"
// }
// Required querystring data:
// {
//   "eventid": 1,          // Required - vprocess_id from vprocesslist to get the binary file
//   "eventtype": "RFQ"     // Required - process_name from vprocesslist (RFQ, RRFQ, QUOTATION, INVOICE, DC, PO)
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

    // // Validate event type
    // if (!querydata.hasOwnProperty("eventtype") || querydata.eventtype == "") {
    //   return helper.getErrorResponse(
    //     false,
    //     "error",
    //     "Event type missing. Please provide the event type (RFQ, RRFQ, QUOTATION, INVOICE, DC, PO)",
    //     "GET BINARY DATA FOR PDF",
    //     secret
    //   );
    // }

    // Query to get the file path from vprocesslist using vprocess_id (eventid) and process_name (eventtype)
    const sql = await db.query(
      `SELECT Process_filepath, process_name, vprocess_gen_id, vendor_name 
       FROM vprocesslist 
       WHERE vprocess_id = ? AND deleted_flag = 0`,
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
        `Event with ID ${querydata.eventid} and not found or no file associated`,
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
//   "querystring": "encrypted_data_containing_process_id"
// }
// Required querystring data:
// {
//   "processid": 1  // Required - vprocess_id from vendorprocessmaster to find related RFQ details
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
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "" || querydata.processid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process ID missing. Please provide the processid",
        "RRFQ PRELOADER",
        secret
      );
    }

    try {
      // Step 1: Get vprocess_gen_id directly from vendorprocessmaster using processid (vprocess_id)
      const processQuery = await db.query(
        `SELECT vprocess_id, vprocess_gen_id 
         FROM vendorprocessmaster 
         WHERE vprocess_id = ? AND deleted_flag = 0`,
        [querydata.processid]
      );

      if (processQuery.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Process not found for the given process ID",
          "RRFQ PRELOADER",
          secret
        );
      }

      const vprocessGenId = processQuery[0].vprocess_gen_id;

      // Step 2: Check if there's already an RRFQ process for this process ID
      const rrfqProcessQuery = await db.query(
        `SELECT vprocess_gen_id, process_name
         FROM vprocesslist 
         WHERE process_id = ? AND process_name = 'RRFQ' AND deleted_flag = 0
         ORDER BY vprocess_id DESC
         LIMIT 1`,
        [querydata.processid]
      );

      let rfqDetailsQuery;
      let searchRfqGenId;

      if (rrfqProcessQuery.length > 0) {
        // Step 2a: RRFQ exists, use its vprocess_gen_id to get RRFQ details from vendor_rrfq_details
        searchRfqGenId = rrfqProcessQuery[0].vprocess_gen_id;
        console.log(`Found existing RRFQ process with ID: ${searchRfqGenId}`);
        
        rfqDetailsQuery = await db.query(
          `SELECT 
            id,
            rrfqgenid as rfqgenid,
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
            rrfq_date as rfq_date,
            notes,
            products,
            row_updated_date,
            status,
            deleted_flag
           FROM vendor_rrfq_details 
           WHERE TRIM(LOWER(rrfqgenid)) = TRIM(LOWER(?)) AND deleted_flag = 0
           ORDER BY id DESC
           LIMIT 1`,
          [searchRfqGenId]
        );
      } else {
        // Step 2b: No RRFQ exists, use original RFQ data from vendor_rfq_details
        searchRfqGenId = vprocessGenId;
        console.log(`No RRFQ found, using original RFQ data with ID: ${searchRfqGenId}`);
        
        rfqDetailsQuery = await db.query(
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
           WHERE TRIM(LOWER(rfqgenid)) = TRIM(LOWER(?)) AND deleted_flag = 0
           ORDER BY id DESC
           LIMIT 1`,
          [searchRfqGenId]
        );
      }

      if (rfqDetailsQuery.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          `Vendor ${rrfqProcessQuery.length > 0 ? 'RRFQ' : 'RFQ'} details not found for the given process`,
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

      // Step 4: Parse JSON fields if they exist and are valid JSON strings
      let parsedNotes = [];
      let parsedProducts = [];

      // Handle notes parsing
      if (vendorRfqDetails.notes) {
        if (typeof vendorRfqDetails.notes === 'string') {
          try {
            // Only try to parse if it looks like JSON (starts with [ or {)
            if (vendorRfqDetails.notes.trim().startsWith('[') || vendorRfqDetails.notes.trim().startsWith('{')) {
              parsedNotes = JSON.parse(vendorRfqDetails.notes);
            } else {
              // It's a plain string, treat as single note
              parsedNotes = [vendorRfqDetails.notes];
            }
          } catch (notesError) {
            console.warn("Error parsing notes JSON:", notesError);
            // If parsing fails, treat as plain string
            parsedNotes = [vendorRfqDetails.notes];
          }
        } else if (Array.isArray(vendorRfqDetails.notes)) {
          // Already an array
          parsedNotes = vendorRfqDetails.notes;
        } else {
          // Some other type, convert to array
          parsedNotes = [vendorRfqDetails.notes];
        }
      }

      // Handle products parsing
      if (vendorRfqDetails.products) {
        if (typeof vendorRfqDetails.products === 'string') {
          try {
            // Only try to parse if it looks like JSON (starts with [ or {)
            if (vendorRfqDetails.products.trim().startsWith('[') || vendorRfqDetails.products.trim().startsWith('{')) {
              parsedProducts = JSON.parse(vendorRfqDetails.products);
            } else {
              // It's a plain string, treat as single product description
              parsedProducts = [{ description: vendorRfqDetails.products }];
            }
          } catch (productsError) {
            console.warn("Error parsing products JSON:", productsError);
            // If parsing fails, treat as plain string
            parsedProducts = [{ description: vendorRfqDetails.products }];
          }
        } else if (Array.isArray(vendorRfqDetails.products)) {
          // Already an array
          parsedProducts = vendorRfqDetails.products;
        } else if (typeof vendorRfqDetails.products === 'object') {
          // Single object, convert to array
          parsedProducts = [vendorRfqDetails.products];
        } else {
          // Some other type, convert to array
          parsedProducts = [{ description: vendorRfqDetails.products }];
        }
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

      // Update vendorprocessmaster with the RRFQ ID after successful vprocesslist insertion
      try {
        await db.query(
          `UPDATE vendorprocessmaster 
           SET vprocess_gen_id = ?, Row_updated_date = NOW() 
           WHERE vprocess_id = ?`,
          [rrfqGenId, querydata.processid]
        );
      } catch (updateError) {
        console.log("Warning: Could not update vendorprocessmaster with RRFQ ID:", updateError);
        // Continue execution even if update fails
      }

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
            "VENDORRFQ",
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

// Add these functions at the end of the file, before module.exports

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR GET VENDOR QUOTATION APPROVAL #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_event_id"
// }
// Required querystring data:
// {
//   "eventid": 33  // Required - vprocess_id from vprocesslist for the quotation
// }
//####################################################################### RESPONSE BODY FOR GET VENDOR QUOTATION APPROVAL #######################################################
// {
//   "code": true,
//   "message": "Vendor quotation approval request sent successfully",
//   "Value": {
//     "vprocess_id": 33,
//     "quotation_id": "995525",
//     "vendor_name": "Vendor Name",
//     "email_sent": true,
//     "whatsapp_sent": false
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function getVendorQuotationApproval(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "GET VENDOR QUOTATION APPROVAL",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET VENDOR QUOTATION APPROVAL",
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
        "GET VENDOR QUOTATION APPROVAL",
        secret
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "GET VENDOR QUOTATION APPROVAL",
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
        "GET VENDOR QUOTATION APPROVAL",
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
        "GET VENDOR QUOTATION APPROVAL",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("eventid") || querydata.eventid == "" || querydata.eventid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Event ID missing. Please provide the eventid (vprocess_id)",
        "GET VENDOR QUOTATION APPROVAL",
        secret
      );
    }

    try {
      // Get quotation details from vprocesslist
      const quotationDetails = await db.query(
        `SELECT vpl.vprocess_id, vpl.process_name, vpl.Process_filepath, vpl.Process_date, 
                vpl.Approved_status, vpl.status, vpl.deleted_flag, vpl.Row_updated_date, 
                vpl.Created_by, vpl.vprocess_gen_id, vpl.process_type, vpl.vendor_address, 
                vpl.vendor_name, vpl.feedback, vpl.process_id
         FROM vprocesslist vpl
         WHERE vpl.vprocess_id = ? AND vpl.process_name = 'QUOTATION' AND vpl.deleted_flag = 0`,
        [querydata.eventid]
      );

      if (quotationDetails.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Quotation not found for the given event ID",
          "GET VENDOR QUOTATION APPROVAL",
          secret
        );
      }

      const quotation = quotationDetails[0];

      // Check approval status
      // 0: null/not done anything (they will take it)
      // 1: approved
      // 2: mail sent but no action taken  
      // 3: rejected
      if (quotation.Approved_status === 1) {
        return helper.getErrorResponse(
          false,
          "error",
          "This quotation has already been approved",
          "GET VENDOR QUOTATION APPROVAL",
          secret
        );
      }

      if (quotation.Approved_status === 3) {
        return helper.getErrorResponse(
          false,
          "error",
          "This quotation has already been rejected",
          "GET VENDOR QUOTATION APPROVAL",
          secret
        );
      }

      if (quotation.Approved_status === 2) {
        return helper.getErrorResponse(
          false,
          "error",
          "Approval request has already been sent for this quotation. Please wait for admin action.",
          "GET VENDOR QUOTATION APPROVAL",
          secret
        );
      }

      // Get admin email addresses
      const adminDetails = await db.query(
        `SELECT u.Email_id, a.secret 
         FROM usermaster u 
         CROSS JOIN apikey a 
         WHERE u.user_design = 'Administrator' AND u.status = 1 AND a.status = 1`
      );

      // let adminEmail = "";
      let apikey = "15b97956-b296-11";

      // if (adminDetails.length > 0) {
      //   adminEmail = adminDetails.map((item) => item.Email_id).join(",");
      //   apikey = adminDetails[0].secret;
      // } else {
      //   adminEmail = "admin@sporadasecure.com";
      // }

      let adminEmail = "kishorekkumar34@gmail.com";

      // Prepare approval and rejection links
      const config = require("../config");
      const approveLink = `${config.apiserver}/vendor/approvequotation?eventid=${quotation.vprocess_id}&STOKEN=${apikey}&s=1&feedback=Approved`;
      const rejectLink = `${config.apiserver}/vendor/approvequotation?eventid=${quotation.vprocess_id}&STOKEN=${apikey}&s=0&feedback=Rejected`;

      // Send approval email
      const mailer = require("../mailer");
      const emailSent = await mailer.sendVendorQuotationApproval(
        "Administrator",
        adminEmail,
        `Action Required!!! Vendor Quotation Approval Request for ${quotation.vendor_name || 'Vendor'}`,
        "VENDORQUOTATIONAPPROVAL",
        quotation.Process_filepath,
        quotation.vprocess_gen_id || quotation.vprocess_id,
        quotation.feedback || "Please review the attached vendor quotation and take appropriate action.",
        "",
        approveLink,
        rejectLink
      );

      if (emailSent) {
        // Update quotation status to 2 (mail sent but no action taken)
        await db.query(
          `UPDATE vprocesslist SET Approved_status = 2, Row_updated_date = NOW()
           WHERE vprocess_id = ? AND process_name = 'QUOTATION'`,
          [quotation.vprocess_id]
        );

        // Store approval request in a tracking table (optional)
        await db.query(
          `INSERT INTO vendor_quotation_approval_requests 
           (vprocess_id, admin_email, request_date, status, created_by)
           VALUES (?, ?, NOW(), 'pending', ?)`,
          [quotation.vprocess_id, adminEmail, userid]
        );

        // MQTT notifications
        await mqttclient.publishMqttMessage(
          "Notification",
          `Vendor quotation approval request sent for ${quotation.vendor_name || 'Vendor'}`
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          `Vendor quotation approval request sent for event ID ${quotation.vprocess_id}`
        );

        return helper.getSuccessResponse(
          true,
          "success",
          "Vendor quotation approval request sent successfully to administrators",
          {
            vprocess_id: quotation.vprocess_id,
            quotation_id: quotation.vprocess_gen_id,
            vendor_name: quotation.vendor_name,
            email_sent: emailSent,
            whatsapp_sent: false
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Failed to send approval request email",
          "GET VENDOR QUOTATION APPROVAL",
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
//########################################### VENDOR QUOTATION APPROVAL ENDPOINT (GET REQUEST) #####################################################################################
// URL: /vendor/approvequotation?eventid=33&STOKEN=apikey&s=1&feedback=Approved
// Parameters:
// - eventid: vprocess_id from vprocesslist
// - STOKEN: API session token
// - s: 1 for approve, 0 for reject
// - feedback: approval/rejection feedback
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function approveVendorQuotation(req, res) {
  try {
    let vendorData = req.query;

    // Path to HTML files
    const htmlPath = path.resolve(__dirname, "..", "htmlresponse");

    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return res.sendFile(path.join(htmlPath, "error.html"));
    }

    var secret = vendorData.STOKEN.substring(0, 16);

    // Validate session token
    const result = await db.query(`SELECT secret FROM apikey WHERE secret = ?`, [
      vendorData.STOKEN
    ]);

    if (result.length === 0) {
      return res.sendFile(path.join(htmlPath, "invalid_token.html"));
    }

    // Validate required fields
    if (!vendorData.hasOwnProperty("eventid") || !vendorData.eventid) {
      return res.sendFile(path.join(htmlPath, "missing_quoteid.html"));
    }

    if (!vendorData.hasOwnProperty("s") || vendorData.s == undefined) {
      return res.sendFile(path.join(htmlPath, "internal_error.html"));
    }

    if (!vendorData.hasOwnProperty("feedback") || vendorData.feedback == "" || vendorData.feedback == undefined) {
      return res.sendFile(path.join(htmlPath, "internal_error.html"));
    }

    // Update the database with correct Approved_status values and process_type
    // 0: null/not done anything (they will take it)
    // 1: approved
    // 2: mail sent but no action taken  
    // 3: rejected
    const approvalStatus = vendorData.s == 1 ? 1 : 3; // 1 for approved, 3 for rejected
    const processType = vendorData.s == 1 ? 3.1 : 3.2; // 3.1 for approved, 3.2 for rejected
    
    await db.query(
      `UPDATE vprocesslist SET Approved_status = ?, feedback = ?, process_type = ?, Row_updated_date = NOW() 
       WHERE vprocess_id = ? AND process_name = 'QUOTATION'`,
      [approvalStatus, vendorData.feedback, processType, vendorData.eventid]
    );

    // Update tracking table
    await db.query(
      `UPDATE vendor_quotation_approval_requests 
       SET status = ?, approved_date = NOW(), approved_by = ?
       WHERE vprocess_id = ? AND status = 'pending'`,
      [vendorData.s == 1 ? 'approved' : 'rejected', 1, vendorData.eventid]
    );

    // Send the quotation if approved
    if (vendorData.s == 1) {
      // Get quotation details
      const quotationDetails = await db.query(
        `SELECT vpl.*, vm.email as vendor_email, vm.contact_person_phone 
         FROM vprocesslist vpl
         LEFT JOIN vendors vm ON vm.vendor_name = vpl.vendor_name
         WHERE vpl.vprocess_id = ? AND vpl.process_name = 'QUOTATION'`,
        [vendorData.eventid]
      );

      if (quotationDetails.length > 0) {
        const quotation = quotationDetails[0];
        
        // Get required modules
        const mailer = require("../mailer");
        const axios = require("axios");
        const config = require("../config");

        // Send email to vendor
        if (quotation.vendor_email) {
          await mailer.sendVendorRFQ(
            quotation.vendor_name,
            quotation.vendor_email,
            `Quotation Approved - ${quotation.vprocess_gen_id}`,
            "VENDORQUOTATION",
            quotation.Process_filepath,
            quotation.vprocess_gen_id,
            `Your quotation has been approved. Thank you for your submission.`,
            ""
          );
        }

        // Send WhatsApp if phone available
        if (quotation.contact_person_phone) {
          const phoneNumbers = quotation.contact_person_phone
            .split(",")
            .map((num) => num.trim())
            .filter((num) => num !== "");

          for (const number of phoneNumbers) {
            try {
              await axios.post(
                `${config.whatsappip}/billing/sendpdf`,
                {
                  phoneno: number,
                  feedback: `Your quotation has been approved. Thank you for your submission.`,
                  pdfpath: quotation.Process_filepath,
                }
              );
            } catch (error) {
              console.error(`WhatsApp Error for ${number}:`, error.message);
            }
          }
        }
      }

      await mqttclient.publishMqttMessage(
        "refresh",
        "Vendor quotation approved for event ID " + vendorData.eventid
      );
      await mqttclient.publishMqttMessage(
        "Notification",
        "Vendor quotation approved for event ID " + vendorData.eventid
      );
      return res.sendFile(path.join(htmlPath, "approved.html"));
    } else {
      await mqttclient.publishMqttMessage(
        "Notification",
        "Vendor quotation rejected for event ID " + vendorData.eventid
      );
      return res.sendFile(path.join(htmlPath, "rejected.html"));
    }
  } catch (er) {
    return res.sendFile(
      path.join(__dirname, "..", "htmlresponse", "internal_error.html")
    );
  }
}

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR PO PRELOADER #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_process_id"
// }
// Required querystring data:
// {
//   "processid": 38  // Required - vprocess_id from vendorprocessmaster to find related RFQ/RRFQ details
// }
//####################################################################### RESPONSE BODY FOR PO PRELOADER #######################################################
// {
//   "code": true,
//   "message": "PO preloader data fetched successfully",
//   "Value": {
//     "po_id": "SSIPL-PO/2507/01",
//     "rfq_details": {
//       "id": 15,
//       "rfqgenid": "SSIPL-RFQ/250401",
//       "vendor_id": 1,
//       "vendor_name": "JK Constructiond",
//       "gstin": "33AATFN1941J1Z0",
//       "pan": "NAEPK8086H",
//       "contact_person": "Ravi Kumar",
//       "vendor_address": "Chinnverampatti, Udumallai",
//       "title": "JK pandiyan",
//       "email_id": "jk@gmail.com",
//       "phone_no": "9344268155",
//       "cc_email": "",
//       "message_type": 3,
//       "feedback": "hello JK",
//       "rfq_date": "2025-07-09 11:00:17",
//       "notes": ["Client needs to provide Ethernet cable and UPS power supply to the point where the device is proposed to install."],
//       "products": [{"productsno": 1, "productname": "27-inch Monitor", "productquantity": 10}],
//       "row_updated_date": "2025-04-01 11:00:07",
//       "status": 1,
//       "deleted_flag": 0,
//       "quotations": [
//         {
//           "vprocess_id": 33,
//           "process_name": "QUOTATION",
//           "Process_filepath": "path/to/quotation.pdf",
//           "Process_date": "2025-07-09",
//           "Approved_status": 0,
//           "feedback": "995525"
//         }
//       ]
//     }
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function popreloader(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "PO PRELOADER",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "PO PRELOADER",
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
        "PO PRELOADER",
        secret
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "PO PRELOADER",
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
        "PO PRELOADER",
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
        "PO PRELOADER",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("processid") || querydata.processid == "" || querydata.processid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process ID missing. Please provide the processid",
        "PO PRELOADER",
        secret
      );
    }

    try {
      // Step 1: Generate PO ID using stored procedure
      let poId;
      try {
        const [poResult] = await db.spcall(
          `CALL Gen_vendor_poId(?, '/', @po_id); SELECT @po_id;`,
          [userid]
        );
        const objectValue = poResult[1][0];
        poId = objectValue["@po_id"];
        
        if (!poId) {
          return helper.getErrorResponse(
            false,
            "error",
            "Failed to generate PO ID using stored procedure",
            "PO PRELOADER",
            secret
          );
        }
      } catch (e) {
        return helper.getErrorResponse(
          false,
          "error",
          "Failed to generate PO ID using stored procedure",
          "PO PRELOADER",
          secret
        );
      }

      // Step 2: Get vprocess_gen_id from vendorprocessmaster using processid (vprocess_id)
      const processQuery = await db.query(
        `SELECT vprocess_id, vprocess_gen_id, vendor_name, Vendor_id
         FROM vendorprocessmaster 
         WHERE vprocess_id = ? AND deleted_flag = 0`,
        [querydata.processid]
      );

      if (processQuery.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Process not found for the given process ID",
          "PO PRELOADER",
          secret
        );
      }

      const processInfo = processQuery[0];
      const vprocessGenId = processInfo.vprocess_gen_id;

      // Step 3: Get the latest RFQ or RRFQ details for this process using unified view
      let rfqDetailsQuery = await db.query(
        `SELECT 
          id,
          genid as rfqgenid,
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
          date_created as rfq_date,
          notes,
          products,
          row_updated_date,
          status,
          deleted_flag,
          rfq_type,
          rfq_type as source_table
         FROM vendor_all_rfq_details 
         WHERE TRIM(LOWER(genid)) = TRIM(LOWER(?)) AND deleted_flag = 0
         ORDER BY row_updated_date DESC
         LIMIT 1`,
        [vprocessGenId]
      );

      if (rfqDetailsQuery.length === 0) {
        return helper.getErrorResponse(
          false,
          "error",
          "Vendor RFQ/RRFQ details not found for the given process",
          "PO PRELOADER",
          secret
        );
      }

      const rfqDetails = rfqDetailsQuery[0];

      // Step 4: Get approved quotations for this process
      const quotations = await db.query(
        `SELECT 
          vprocess_id,
          process_name,
          Process_filepath,
          Process_date,
          Approved_status,
          feedback,
          vprocess_gen_id
         FROM vprocesslist 
         WHERE process_id = ? AND process_name = 'QUOTATION' AND Approved_status = 1 AND deleted_flag = 0
         ORDER BY Row_updated_date DESC`,
        [querydata.processid]
      );

      // Step 5: Parse JSON fields if they exist and are valid JSON strings
      let parsedNotes = [];
      let parsedProducts = [];

      // Handle notes parsing
      if (rfqDetails.notes) {
        if (typeof rfqDetails.notes === 'string') {
          try {
            if (rfqDetails.notes.trim().startsWith('[') || rfqDetails.notes.trim().startsWith('{')) {
              parsedNotes = JSON.parse(rfqDetails.notes);
            } else {
              parsedNotes = [rfqDetails.notes];
            }
          } catch (notesError) {
            console.warn("Error parsing notes JSON:", notesError);
            parsedNotes = [rfqDetails.notes];
          }
        } else if (Array.isArray(rfqDetails.notes)) {
          parsedNotes = rfqDetails.notes;
        } else {
          parsedNotes = [rfqDetails.notes];
        }
      }

      // Handle products parsing
      if (rfqDetails.products) {
        if (typeof rfqDetails.products === 'string') {
          try {
            if (rfqDetails.products.trim().startsWith('[') || rfqDetails.products.trim().startsWith('{')) {
              parsedProducts = JSON.parse(rfqDetails.products);
            } else {
              parsedProducts = [{ description: rfqDetails.products }];
            }
          } catch (productsError) {
            console.warn("Error parsing products JSON:", productsError);
            parsedProducts = [{ description: rfqDetails.products }];
          }
        } else if (Array.isArray(rfqDetails.products)) {
          parsedProducts = rfqDetails.products;
        } else if (typeof rfqDetails.products === 'object') {
          parsedProducts = [rfqDetails.products];
        } else {
          parsedProducts = [{ description: rfqDetails.products }];
        }
      }

      // Step 6: Format the response
      
      // Create response with correct field names based on source
      let po_details_base = {
        genid: rfqDetails.genid,
        vendor_id: rfqDetails.vendor_id,
        vendor_name: rfqDetails.vendor_name,
        gstin: rfqDetails.gstin,
        pan: rfqDetails.pan,
        contact_person: rfqDetails.contact_person,
        vendor_address: rfqDetails.vendor_address,
        title: rfqDetails.title,
        email_id: rfqDetails.email_id,
        phone_no: rfqDetails.phone_no,
        cc_email: rfqDetails.cc_email,
        message_type: rfqDetails.message_type,
        feedback: rfqDetails.feedback,
        notes: parsedNotes,
        products: parsedProducts,
        row_updated_date: rfqDetails.row_updated_date,
        status: rfqDetails.status,
        deleted_flag: rfqDetails.deleted_flag,
        process_type: rfqDetails.rfq_type,
        source_table: rfqDetails.source_table,
        quotations: quotations || []
      };


      const responseData = {
        po_id: poId,
        po_details: po_details_base
      };

      return helper.getSuccessResponse(
        true,
        "success",
        "PO preloader data fetched successfully",
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
//########################################### REQUEST BODY FOR ADD INVOICE #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_process_id"
// }
// File upload in form-data with key "file"
// Required querystring data:
// {
//   "processid": 38,    // process_id from vendorprocessmaster (parent process)
//   "feedback": "Optional vendor feedback on invoice"
// }
//####################################################################### RESPONSE BODY FOR ADD INVOICE #######################################################
// {"code":true,"message":"Invoice Added Successfully","Value":{"vprocess_id": 37, "process_id": 38}}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function AddInvoice(req, res) {
  try {
    // Upload the PDF file first
    try {
      await uploadFile.uploadVendorInvoice(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "Please upload a PDF file!",
          "ADD INVOICE",
          "",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        `Could not upload the file. ${er.message}`,
        "ADD INVOICE",
        "",
        ""
      );
    }

    let invoice = req.body;

    // Check if the session token exists
    if (!invoice.STOKEN) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "ADD INVOICE",
        "",
        ""
      );
    }

    // Validate session token length
    if (invoice.STOKEN.length > 50 || invoice.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "ADD INVOICE",
        "",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [invoice.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ADD INVOICE",
        invoice.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!invoice.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD INVOICE",
        invoice.STOKEN.substring(0, 16)
      );
    }

    var secret = invoice.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(invoice.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD INVOICE",
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
        "ADD INVOICE",
        secret
      );
    }

    if (!querydata.processid || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "Process ID missing. Please provide the processid",
        "ADD INVOICE",
        secret
      );
    }

    try {
      // Get the file path from the uploaded file
      const filePath = req.file.path;
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD

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
          5,  // process_type for INVOICE
          'INVOICE',
          querydata.processid,
          querydata.feedback || null
        ]
      );

      // Get the inserted vprocess_id (auto-increment primary key)
      const vprocess_id = sql.insertId;
      
      if (vprocess_id != null && vprocess_id !== "") {
        // MQTT notifications for invoice upload
        await mqttclient.publishMqttMessage(
          "Notification",
          "Vendor Invoice Added Successfully"
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "Vendor Invoice Added Successfully"
        );
        
        return helper.getSuccessResponse(
          true,
          "success",
          "Invoice Added Successfully",
          {
            vprocess_id: vprocess_id,
            process_id: querydata.processid,
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "Error while adding the invoice.",
          "ADD INVOICE",
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
//########################################### REQUEST BODY FOR POST PO #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_po_details"
// }
// File upload in form-data with key "file"
// Required querystring data:
// {
//   "pogenid": "SSIPL-PO/2507/01",
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
//   "title": "Purchase Order for Steel Products",
//   "email_id": "vendor@example.com",
//   "phone_no": "9344268155",
//   "cc_email": "cc@example.com",
//   "message_type": 1,  // 1 = email only, 2 = WhatsApp only, 3 = both (default: 1)
//   "feedback": "Please provide delivery as per schedule",
//   "notes": ["Delivery instructions", "Quality requirements"],
//   "products": [{"productsno": 1, "productname": "Steel Rods", "productquantity": 100, "gstpercent": 18, "hsn": "7207", "price": 600}]
// }
//####################################################################### RESPONSE BODY FOR POST PO #######################################################
// {
//   "code": true,
//   "message": "PO Posted Successfully",
//   "Value": {
//     "vprocess_id": 6,
//     "po_details_id": 4,
//     "vendor_name": "JK Construction",
//     "pogenid": "SSIPL-PO/2507/01",
//     "emailsent": true,
//     "whatsappsent": false,
//     "messagetype": 1,
//     "products_mapped": 3
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function PostPO(req, res) {
  try {
    // Upload the PDF file first using dedicated PO upload function
    try {
      await uploadFile.uploadPostPO(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "Please upload a PDF file!",
          "POST PO",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        `Could not upload the file. ${er.message}`,
        "POST PO",
        ""
      );
    }

    let poData = req.body;

    // Check if the session token exists
    if (!poData || !("STOKEN" in poData) || poData.STOKEN === undefined) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "POST PO",
        ""
      );
    }

    // Validate session token length
    if (poData.STOKEN.length > 50 || poData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "POST PO",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [poData.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "POST PO",
        poData.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!poData || !("querystring" in poData) || poData.querystring === undefined) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "POST PO",
        poData && poData.STOKEN ? poData.STOKEN.substring(0, 16) : ""
      );
    }

    var secret = poData.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(poData.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "Querystring Invalid error. Please provide the valid querystring.",
        "POST PO",
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
        "POST PO",
        secret
      );
    }

    // Validate required fields
    if (!querydata || !("vendorid" in querydata) || querydata.vendorid === "" || querydata.vendorid === undefined) {
      return helper.getErrorResponse(
        false,
        "Vendor ID missing. Please provide the Vendor ID",
        "POST PO",
        secret
      );
    }

    if (!querydata || !("processid" in querydata) || querydata.processid === "" || querydata.processid === undefined) {
      return helper.getErrorResponse(
        false,
        "error",
        "Process ID missing. Please provide the Process ID (parent process)",
        "POST PO",
        secret
      );
    }

    // Validate messagetype if provided
    if (querydata && ("messagetype" in querydata) && ![1, 2, 3].includes(querydata.messagetype)) {
      return helper.getErrorResponse(
        false,
        "Invalid message type. Use 1 for email only, 2 for WhatsApp only, 3 for both",
        "POST PO",
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
          "POST PO",
          secret
        );
      }

      const vendor = vendorDetails[0];

      // Validate PO ID is provided (should come from popreloader endpoint)
      if (!querydata.pogenid || querydata.pogenid.trim() === '') {
        return helper.getErrorResponse(
          false,
          "PO ID missing. Please use popreloader endpoint to generate PO ID first",
          "POST PO",
          secret
        );
      }

      const poGenId = querydata.pogenid;
      const filePath = req.file.path;
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD

      // Insert vendor PO details into vendor_po_details table using querystring data
      const poDetailsResult = await db.query(
        `INSERT INTO vendor_po_details (
          pogenid,
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
          po_date,
          notes,
          products,
          row_updated_date,
          status,
          deleted_flag
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)`,
        [
          poGenId,
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

      // Insert/Update products in vendorproducts table
      let productsMappedendar = 0;
      if (querydata.product && Array.isArray(querydata.product) && querydata.product.length > 0) {
        for (const productItem of querydata.product) {
          try {
            // Extract product details
            const productName = productItem.productname || '';
            const gstPercent = productItem.gstpercent || 0;
            const hsn = productItem.hsn || '';
            const price = productItem.price || 0;

            // Skip empty products
            if (!productName.trim()) {
              continue;
            }

            // Check if product already exists for this vendor
            const existingProduct = await db.query(
              `SELECT id FROM vendorproducts 
               WHERE vendorid = ? AND TRIM(LOWER(productname)) = TRIM(LOWER(?))
               LIMIT 1`,
              [querydata.vendorid, productName]
            );

            if (existingProduct.length > 0) {
              // Update existing product with latest details
              await db.query(
                `UPDATE vendorproducts SET 
                  gstpercent = ?, 
                  hsn = ?, 
                  price = ?
                WHERE id = ?`,
                [gstPercent, hsn, price, existingProduct[0].id]
              );
            } else {
              // Insert new product
              await db.query(
                `INSERT INTO vendorproducts (
                  vendorid, 
                  productname, 
                  gstpercent, 
                  hsn, 
                  price
                ) VALUES (?, ?, ?, ?, ?)`,
                [querydata.vendorid, productName, gstPercent, hsn, price]
              );
            }
            productsMappedendar++;
          } catch (productError) {
            console.error('Error mapping product:', productError);
            // Continue processing other products even if one fails
          }
        }
      }

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

      // Insert into vprocesslist as a subprocess (no vendorprocessmaster entry for PO)
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
          'PO',
          filePath,
          formattedDate,
          0, // Approved_status
          1, // status
          0, // deleted_flag
          userid,
          poGenId,
          4, // process_type for PO
          querydata.vendoraddress || vendor.address || '',
          querydata.vendorname || vendor.vendor_name,
          querydata.processid // Parent process_id from vendorprocessmaster
        ]
      );

      const vprocess_id = processResult.insertId;

      // Initialize response flags
      let emailSent = false;
      let whatsappSent = false;

      // Update generatepoids status to 0 (mark as used) after successful vprocesslist insertion
      // This ensures the PO ID cannot be reused for another process
      try {
        await db.query(
          `UPDATE generatepoids SET status = 0, row_updated_date = NOW() 
           WHERE TRIM(LOWER(po_id)) = TRIM(LOWER(?))`,
          [poGenId]
        );
      } catch (updateError) {
        console.log("Warning: Could not update PO ID status:", updateError);
        // Continue execution even if update fails
      }

      // Get required modules
      const mailer = require("../mailer");
      const axios = require("axios");
      const config = require("../config");

      // Prepare email and WhatsApp data
      const vendorEmail = /*vendor.email ||*/ "kishorekkumar34@gmail.com"; // Fallback email
      const ccEmail = querydata.cc_email || "";
      const subject = `Purchase Order - ${poGenId}`;
      const notes = querydata.feedback || querydata.notes || "Please find the attached Purchase Order for your review and confirmation.";
      
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
          emailSent = await mailer.sendVendorPO(
            vendor.vendor_name,
            vendorEmail,
            subject,
            "VENDORPO", // module tag for email settings
            filePath, // file path for attachment
            poGenId, // PO ID
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
          mailer.sendVendorPO(
            vendor.vendor_name,
            vendorEmail,
            subject,
            "VENDORPO",
            filePath,
            poGenId,
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

      if (vprocess_id != null && poDetailsResult.insertId != null) {
        // MQTT notifications for PO posting
        await mqttclient.publishMqttMessage(
          "Notification",
          "PO Posted Successfully to " + vendor.vendor_name
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "PO Posted Successfully"
        );
        
        return helper.getSuccessResponse(
          true,
          "success",
          "PO Posted Successfully",
          {
            vprocess_id: vprocess_id,
            po_details_id: poDetailsResult.insertId,
            vendor_name: vendor.vendor_name,
            pogenid: poGenId,
            emailsent: emailSent,
            whatsappsent: whatsappSent,
            messagetype: messagetype,
            products_mapped: productsMappedendar
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "Error while posting the PO.",
          "POST PO",
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
//########################################### REQUEST BODY FOR ADD DC #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_process_id"
// }
// File upload in form-data with key "file"
// Required querystring data:
// {
//   "processid": 38,    // process_id from vendorprocessmaster (parent process)
//   "feedback": "Optional vendor feedback on delivery challan"
// }
//####################################################################### RESPONSE BODY FOR ADD DC #######################################################
// {"code":true,"message":"DC Added Successfully","Value":{"vprocess_id": 39, "process_id": 38}}
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function AddDC(req, res) {
  try {
    // Upload the PDF file first
    try {
      await uploadFile.uploadVendorDC(req, res);

      if (!req.file) {
        return helper.getErrorResponse(
          false,
          "Please upload a PDF file!",
          "ADD DC",
          "",
          ""
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        `Could not upload the file. ${er.message}`,
        "ADD DC",
        "",
        ""
      );
    }

    let dc = req.body;

    // Check if the session token exists
    if (!dc.STOKEN) {
      return helper.getErrorResponse(
        false,
        "Login session token missing. Please provide the Login session token",
        "ADD DC",
        "",
        ""
      );
    }

    // Validate session token length
    if (dc.STOKEN.length > 50 || dc.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "Login session token size invalid. Please provide the valid Session token",
        "ADD DC",
        "",
        ""
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [dc.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide the valid session token",
        "ADD DC",
        dc.STOKEN.substring(0, 16)
      );
    }

    // Check if querystring is provided
    if (!dc.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "ADD DC",
        dc.STOKEN.substring(0, 16)
      );
    }

    var secret = dc.STOKEN.substring(0, 16);
    var querydata;

    // Decrypt querystring
    try {
      querydata = await helper.decrypt(dc.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "Querystring Invalid error. Please provide the valid querystring.",
        "ADD DC",
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
        "ADD DC",
        secret
      );
    }

    if (!querydata.processid || querydata.processid == "") {
      return helper.getErrorResponse(
        false,
        "Process ID missing. Please provide the processid",
        "ADD DC",
        secret
      );
    }

    try {
      // Get the file path from the uploaded file
      const filePath = req.file.path;
      const currentDate = new Date();
      const formattedDate = currentDate.toISOString().slice(0, 10); // YYYY-MM-DD

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
          6,  // process_type for DC
          'DC',
          querydata.processid,
          querydata.feedback || null
        ]
      );

      // Get the inserted vprocess_id (auto-increment primary key)
      const vprocess_id = sql.insertId;
      
      if (vprocess_id != null && vprocess_id !== "") {
        // MQTT notifications for DC upload
        await mqttclient.publishMqttMessage(
          "Notification",
          "Vendor DC Added Successfully"
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "Vendor DC Added Successfully"
        );
        
        return helper.getSuccessResponse(
          true,
          "success",
          "DC Added Successfully",
          {
            vprocess_id: vprocess_id,
            process_id: querydata.processid,
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "Error while adding the DC.",
          "ADD DC",
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

// ...existing code...

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//########################################### REQUEST BODY FOR SHARE FORM LINK #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_contact_details"
// }
// Required querystring data:
// {
//   "phone_number": "9344268155",
//   "email_id": "vendor@example.com",
//   "message_type": 1  // 1 = email only, 2 = WhatsApp only, 3 = both (default: 1)
// }
// Optional querystring data:
// {
//   "notes": "Please complete the vendor registration form at your earliest convenience"
// }
//####################################################################### RESPONSE BODY FOR SHARE FORM LINK #######################################################
// {
//   "code": true,
//   "message": "Form link shared successfully",
//   "Value": {
//     "id": 1,
//     "phone_number": "9344268155",
//     "email_id": "vendor@example.com",
//     "form_link": "https://yourform.com/vendor-registration",
//     "email_sent": true,
//     "whatsapp_sent": false,
//     "message_type": 1,
//     "sent_by_user_id": 4
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function ShareFormLink(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "SHARE FORM LINK",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "SHARE FORM LINK",
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
        "SHARE FORM LINK",
        secret
      );
    }

    // Check if querystring is provided
    if (!vendorData.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "SHARE FORM LINK",
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
        "SHARE FORM LINK",
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
        "SHARE FORM LINK",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("phone_number") || querydata.phone_number === "" || querydata.phone_number === null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Phone number missing. Please provide the phone number",
        "SHARE FORM LINK",
        secret
      );
    }

    if (!querydata.hasOwnProperty("email_id") || querydata.email_id === "" || querydata.email_id === null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Email ID missing. Please provide the email ID",
        "SHARE FORM LINK",
        secret
      );
    }

    // Validate messagetype if provided
    if (querydata.hasOwnProperty("message_type") && ![1, 2, 3].includes(querydata.message_type)) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid message type. Use 1 for email only, 2 for WhatsApp only, 3 for both",
        "SHARE FORM LINK",
        secret
      );
    }

    // Set default messagetype to 1 (email only) if not provided
    const messagetype = querydata.message_type || 1;

    try {
      // Hardcoded form link (you can modify this as needed)
      const formLink = "https://forms.sporadasecure.com/vendor-registration";
      
      // Initialize response flags
      let emailSent = false;
      let whatsappSent = false;

      // Get required modules
      const mailer = require("../mailer");
      const axios = require("axios");
      const config = require("../config");

      // Prepare email and WhatsApp data
      const subject = "Vendor Registration Form - Sporada Secure";
      const notes = querydata.notes || "Please complete the vendor registration form to become our registered vendor.";
      
      // Process phone numbers (handle single or comma-separated numbers)
      const phoneNumbers = querydata.phone_number 
        ? querydata.phone_number
            .split(",")
            .map((num) => num.trim())
            .filter((num) => num !== "") // Remove empty values
        : [];

      // Send based on messagetype
      if (messagetype === 1) {
        // Send only email
        try {
          emailSent = await mailer.sendVendorFormLink(
            "Vendor", // recipient name
            querydata.email_id,
            subject,
            "FORMLINK", // module tag for email settings
            formLink,
            notes
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
                    `${config.whatsappip}/billing/sendmessage`,
                    {
                      phoneno: number,
                      message: `Dear Vendor,\n\nWe invite you to register with Sporada Secure. Please complete the vendor registration form:\n\n${formLink}\n\n${notes}\n\nBest regards,\nSporada Secure Procurement Team`,
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
          mailer.sendVendorFormLink(
            "Vendor",
            querydata.email_id,
            subject,
            "FORMLINK",
            formLink,
            notes
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
                    `${config.whatsappip}/billing/sendmessage`,
                    {
                      phoneno: number,
                      message: `Dear Vendor,\n\nWe invite you to register with Sporada Secure. Please complete the vendor registration form:\n\n${formLink}\n\n${notes}\n\nBest regards,\nSporada Secure Procurement Team`,
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

      // Insert the record into the database after successful sending
      const insertResult = await db.query(
        `INSERT INTO vendor_form_link_requests (
          phone_number,
          email_id,
          message_type,
          form_link,
          email_sent,
          whatsapp_sent,
          sent_by_user_id,
          sent_date,
          status,
          notes,
          row_updated_date
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), 1, ?, NOW())`,
        [
          querydata.phone_number,
          querydata.email_id,
          messagetype,
          formLink,
          emailSent ? 1 : 0,
          whatsappSent ? 1 : 0,
          userid,
          notes
        ]
      );

      const requestId = insertResult.insertId;

      if (requestId != null) {
        // MQTT notifications for form link sharing
        await mqttclient.publishMqttMessage(
          "Notification",
          `Form link shared successfully to ${querydata.email_id}`
        );
        await mqttclient.publishMqttMessage(
          "refresh",
          "Form link shared successfully"
        );
        
        return helper.getSuccessResponse(
          true,
          "success",
          "Form link shared successfully",
          {
            id: requestId,
            phone_number: querydata.phone_number,
            email_id: querydata.email_id,
            form_link: formLink,
            email_sent: emailSent,
            whatsapp_sent: whatsappSent,
            message_type: messagetype,
            sent_by_user_id: userid,
            notes: notes
          },
          secret
        );
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Error while saving form link request.",
          "SHARE FORM LINK",
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
//########################################### REQUEST BODY FOR GET FORM LINK REQUESTS #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_optional_filters"
// }
// Optional querystring data:
// {
//   "id": 1,                    // Optional - specific request ID
//   "email_id": "vendor@example.com",  // Optional - filter by email
//   "phone_number": "9344268155",      // Optional - filter by phone number
//   "message_type": 1,                 // Optional - filter by message type (1=email, 2=WhatsApp, 3=both)
//   "email_sent": 1,                   // Optional - filter by email sent status (0/1)
//   "whatsapp_sent": 0,                // Optional - filter by WhatsApp sent status (0/1)
//   "sent_by_user_id": 4,              // Optional - filter by user who sent the request
//   "limit": 50,                       // Optional - limit number of results (default: 100)
//   "offset": 0                        // Optional - offset for pagination (default: 0)
// }
//####################################################################### RESPONSE BODY FOR GET FORM LINK REQUESTS #######################################################
// {
//   "code": true,
//   "message": "Form link requests fetched successfully",
//   "Value": {
//     "total_count": 25,
//     "requests": [
//       {
//         "id": 1,
//         "phone_number": "9344268155",
//         "email_id": "vendor@example.com",
//         "message_type": 1,
//         "form_link": "https://forms.sporadasecure.com/vendor-registration",
//         "email_sent": 1,
//         "whatsapp_sent": 0,
//         "sent_by_user_id": 4,
//         "sent_by_username": "Admin User",
//         "sent_date": "2025-07-14 10:30:00",
//         "status": 1,
//         "notes": "Please complete registration at earliest",
//         "row_updated_date": "2025-07-14 10:30:00"
//       }
//     ]
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetFormLinkRequests(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "GET FORM LINK REQUESTS",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET FORM LINK REQUESTS",
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
        "GET FORM LINK REQUESTS",
        secret
      );
    }

    // Initialize querydata for optional filtering
    var querydata = {};

    // Check if querystring is provided (optional for this endpoint)
    if (vendorData.hasOwnProperty("querystring") && vendorData.querystring) {
      try {
        // Decrypt querystring
        const decryptedQuery = await helper.decrypt(vendorData.querystring, secret);
        querydata = JSON.parse(decryptedQuery);
      } catch (ex) {
        // If querystring is provided but invalid, return error
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide valid querystring or omit it for all records.",
          "GET FORM LINK REQUESTS",
          secret
        );
      }
    }

    try {
      // Build dynamic WHERE clause based on provided filters
      let whereConditions = [];
      let queryParams = [];

      // Optional filters
      if (querydata.id) {
        whereConditions.push("flr.id = ?");
        queryParams.push(querydata.id);
      }

      if (querydata.email_id) {
        whereConditions.push("flr.email_id LIKE ?");
        queryParams.push(`%${querydata.email_id}%`);
      }

      if (querydata.phone_number) {
        whereConditions.push("flr.phone_number LIKE ?");
        queryParams.push(`%${querydata.phone_number}%`);
      }

      if (querydata.message_type !== undefined) {
        whereConditions.push("flr.message_type = ?");
        queryParams.push(querydata.message_type);
      }

      if (querydata.email_sent !== undefined) {
        whereConditions.push("flr.email_sent = ?");
        queryParams.push(querydata.email_sent);
      }

      if (querydata.whatsapp_sent !== undefined) {
        whereConditions.push("flr.whatsapp_sent = ?");
        queryParams.push(querydata.whatsapp_sent);
      }

      if (querydata.sent_by_user_id) {
        whereConditions.push("flr.sent_by_user_id = ?");
        queryParams.push(querydata.sent_by_user_id);
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Pagination
      const limit = querydata.limit || 100;
      const offset = querydata.offset || 0;

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total_count
        FROM vendor_form_link_requests flr
        LEFT JOIN usermaster um ON flr.sent_by_user_id = um.userid
        ${whereClause}
      `;

      const countResult = await db.query(countQuery, queryParams);
      const totalCount = countResult[0].total_count;

      // Main query to get form link requests with user details
      const mainQuery = `
        SELECT 
          flr.id,
          flr.phone_number,
          flr.email_id,
          flr.message_type,
          flr.form_link,
          flr.email_sent,
          flr.whatsapp_sent,
          flr.sent_by_user_id,
          COALESCE(um.username, 'Unknown User') as sent_by_username,
          flr.sent_date,
          flr.status,
          flr.notes,
          flr.row_updated_date,
          CASE 
            WHEN flr.message_type = 1 THEN 'Email Only'
            WHEN flr.message_type = 2 THEN 'WhatsApp Only'
            WHEN flr.message_type = 3 THEN 'Email & WhatsApp'
            ELSE 'Unknown'
          END as message_type_description,
          CASE 
            WHEN flr.email_sent = 1 AND flr.whatsapp_sent = 1 THEN 'Both Sent'
            WHEN flr.email_sent = 1 THEN 'Email Sent'
            WHEN flr.whatsapp_sent = 1 THEN 'WhatsApp Sent'
            ELSE 'Not Sent'
          END as delivery_status
        FROM vendor_form_link_requests flr
        LEFT JOIN usermaster um ON flr.sent_by_user_id = um.userid
        ${whereClause}
        ORDER BY flr.sent_date DESC
        LIMIT ? OFFSET ?
      `;

      const mainParams = [...queryParams, limit, offset];
      const requests = await db.query(mainQuery, mainParams);

      // Format dates for better readability
      requests.forEach(request => {
        if (request.sent_date) {
          request.sent_date = new Date(request.sent_date).toISOString().slice(0, 19).replace('T', ' ');
        }
        if (request.row_updated_date) {
          request.row_updated_date = new Date(request.row_updated_date).toISOString().slice(0, 19).replace('T', ' ');
        }
      });

      return helper.getSuccessResponse(
        true,
        "success",
        "Form link requests fetched successfully",
        {
          total_count: totalCount,
          returned_count: requests.length,
          limit: limit,
          offset: offset,
          requests: requests
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
//########################################### REQUEST BODY FOR GET VENDOR DETAILS #####################################################################################
// {
//   "STOKEN": "your_session_token",
//   "querystring": "encrypted_data_containing_optional_filters"
// }
// Optional querystring data:
// {
//   "vendorid": 1,              // Optional - specific vendor ID
//   "vendor_name": "JK",        // Optional - filter by vendor name (partial match)
//   "email": "jk@gmail.com",    // Optional - filter by email (partial match)
//   "business_type": "Manufacturer", // Optional - filter by business type
//   "state": "Tamil Nadu",      // Optional - filter by state
//   "status": 1,                // Optional - filter by status (0/1)
//   "deleted_flag": 0,          // Optional - filter by deleted flag (0/1)
//   "limit": 50,                // Optional - limit number of results (default: 100)
//   "offset": 0                 // Optional - offset for pagination (default: 0)
// }
//####################################################################### RESPONSE BODY FOR GET VENDOR DETAILS #######################################################
// {
//   "code": true,
//   "message": "Vendor details fetched successfully",
//   "Value": {
//     "total_count": 25,
//     "returned_count": 10,
//     "limit": 10,
//     "offset": 0,
//     "vendors": [
//       {
//         "vendorid": 1,
//         "vendor_name": "JK Construction",
//         "address": "123 Main Street, Coimbatore",
//         "state": "Tamil Nadu",
//         "pincode": "641001",
//         "contact_person_name": "John Doe",
//         "contact_person_designation": "Manager",
//         "contact_person_phone": "9344268155",
//         "email": "jk@gmail.com",
//         "business_type": "Manufacturer",
//         "year_of_establishment": 2010,
//         "gst_number": "33ABCD43wsd123",
//         "pan_number": "ABCPD1234E",
//         "annual_turnover": 50000000.00,
//         "products_services": "Construction materials, cement, steel",
//         "hsn_sac_code": "2523,7207",
//         "description": "Leading manufacturer of construction materials",
//         "bank_name": "State Bank of India",
//         "branch_name": "Coimbatore Main",
//         "account_number": "1234567890",
//         "ifsc_code": "SBIN0001234",
//         "iso_certification": "ISO 9001:2015",
//         "other_certifications": "BIS certification for cement",
//         "registration_certificate_path": "/path/to/registration.pdf",
//         "pan_upload_path": "/path/to/pan.pdf",
//         "cancelled_cheque_path": "/path/to/cheque.pdf",
//         "logo_path": "/path/to/logo.png",
//         "created_at": "2025-07-14 10:30:00",
//         "updated_at": "2025-07-14 15:45:00",
//         "status": 1,
//         "deleted_flag": 0
//       }
//     ]
//   }
// }
//##################################################################################################################################################################################################
//##################################################################################################################################################################################################

async function GetVendorDetails(vendorData) {
  try {
    // Check if the session token exists
    if (!vendorData.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "GET VENDOR DETAILS",
        ""
      );
    }

    // Validate session token length
    if (vendorData.STOKEN.length > 50 || vendorData.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET VENDOR DETAILS",
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
        "GET VENDOR DETAILS",
        secret
      );
    }

    // Initialize querydata for optional filtering
    var querydata = {};

    // Check if querystring is provided (optional for this endpoint)
    if (vendorData.hasOwnProperty("querystring") && vendorData.querystring) {
      try {
        // Decrypt querystring
        const decryptedQuery = await helper.decrypt(vendorData.querystring, secret);
        querydata = JSON.parse(decryptedQuery);
      } catch (ex) {
        // If querystring is provided but invalid, return error
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide valid querystring or omit it for all records.",
          "GET VENDOR DETAILS",
          secret
        );
      }
    }

    try {
      // Build dynamic WHERE clause based on provided filters
      let whereConditions = [];
      let queryParams = [];

      // Optional filters
      if (querydata.vendorid) {
        whereConditions.push("vd.vendorid = ?");
        queryParams.push(querydata.vendorid);
      }

      if (querydata.vendor_name) {
        whereConditions.push("vd.vendor_name LIKE ?");
        queryParams.push(`%${querydata.vendor_name}%`);
      }

      if (querydata.email) {
        whereConditions.push("vd.email LIKE ?");
        queryParams.push(`%${querydata.email}%`);
      }

      if (querydata.business_type) {
        whereConditions.push("vd.business_type LIKE ?");
        queryParams.push(`%${querydata.business_type}%`);
      }

      if (querydata.state) {
        whereConditions.push("vd.state LIKE ?");
        queryParams.push(`%${querydata.state}%`);
      }

      if (querydata.status !== undefined) {
        whereConditions.push("vd.status = ?");
        queryParams.push(querydata.status);
      }

      if (querydata.deleted_flag !== undefined) {
        whereConditions.push("vd.deleted_flag = ?");
        queryParams.push(querydata.deleted_flag);
      }

      if (querydata.contact_person_phone) {
        whereConditions.push("vd.contact_person_phone LIKE ?");
        queryParams.push(`%${querydata.contact_person_phone}%`);
      }

      if (querydata.gst_number) {
        whereConditions.push("vd.gst_number LIKE ?");
        queryParams.push(`%${querydata.gst_number}%`);
      }

      if (querydata.pan_number) {
        whereConditions.push("vd.pan_number LIKE ?");
        queryParams.push(`%${querydata.pan_number}%`);
      }

      // Build WHERE clause
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Pagination
      const limit = querydata.limit || 100;
      const offset = querydata.offset || 0;

      // Get total count for pagination
      const countQuery = `
        SELECT COUNT(*) as total_count
        FROM vendor_details vd
        ${whereClause}
      `;

      const countResult = await db.query(countQuery, queryParams);
      const totalCount = countResult[0].total_count;

      // Main query to get vendor details
      const mainQuery = `
        SELECT 
          vd.vendorid,
          vd.vendor_name,
          vd.address,
          vd.state,
          vd.pincode,
          vd.contact_person_name,
          vd.contact_person_designation,
          vd.contact_person_phone,
          vd.email,
          vd.business_type,
          vd.year_of_establishment,
          vd.gst_number,
          vd.pan_number,
          vd.annual_turnover,
          vd.products_services,
          vd.hsn_sac_code,
          vd.description,
          vd.bank_name,
          vd.branch_name,
          vd.account_number,
          vd.ifsc_code,
          vd.iso_certification,
          vd.other_certifications,
          vd.registration_certificate_path,
          vd.pan_upload_path,
          vd.cancelled_cheque_path,
          vd.logo_path,
          vd.created_at,
          vd.updated_at,
          vd.status,
          vd.deleted_flag,
          CASE 
            WHEN vd.status = 1 THEN 'Active'
            WHEN vd.status = 0 THEN 'Inactive'
            ELSE 'Unknown'
          END as status_description,
          CASE 
            WHEN vd.deleted_flag = 0 THEN 'Not Deleted'
            WHEN vd.deleted_flag = 1 THEN 'Deleted'
            ELSE 'Unknown'
          END as delete_status_description
        FROM vendor_details vd
        ${whereClause}
        ORDER BY vd.created_at DESC
        LIMIT ? OFFSET ?
      `;

      const mainParams = [...queryParams, limit, offset];
      const vendors = await db.query(mainQuery, mainParams);

      // Format dates and numbers for better readability
      vendors.forEach(vendor => {
        // Format dates
        if (vendor.created_at) {
          vendor.created_at = new Date(vendor.created_at).toISOString().slice(0, 19).replace('T', ' ');
        }
        if (vendor.updated_at) {
          vendor.updated_at = new Date(vendor.updated_at).toISOString().slice(0, 19).replace('T', ' ');
        }
        
        // Format annual turnover
        if (vendor.annual_turnover) {
          vendor.annual_turnover = parseFloat(vendor.annual_turnover);
        }
        
        // Format year of establishment
        if (vendor.year_of_establishment) {
          vendor.year_of_establishment = parseInt(vendor.year_of_establishment);
        }
      });

      return helper.getSuccessResponse(
        true,
        "success",
        "Vendor details fetched successfully",
        {
          total_count: totalCount,
          returned_count: vendors.length,
          limit: limit,
          offset: offset,
          vendors: vendors
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

module.exports = {
  AddVendor,
  GetVendorWithFile,
  AddQuotation,
  vendorDetailsPreLoader,
  activevendors,
  PostRFQ,
  GetProducts,
  getNotes,
  GetAllProcessList,
  getBinaryFile,
  ArchiveProcess,
  DeleteProcess,
  rrfqpreloader,
  addFeedback,
  PostRRFQ,
  approveVendorQuotation,
  getVendorQuotationApproval,
  popreloader,
  GetVendor,
  AddInvoice,
  PostPO,
  AddDC,
  AddVendorResponse,
  ShareFormLink,
  GetFormLinkRequests,
  GetVendorDetails
};


//##################################################################################################################################################################################################
//##################################################################################################################################################################################################