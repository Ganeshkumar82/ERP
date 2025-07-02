const db = require("../db");
const helper = require("../helper");

//##################################################################################################################################################################################################
//##################################################################################################################################################################################################
//####################################################################### REQUEST BODY  ##############################################################################################################
// {
//   "vendorname":"JK constructiond",
//   "vendormailid":"jk@gmail.com",
//   "vendorphoneno":"8393923242",
//   "vendoraddress":"chinnverampatti,udumallai",
//   "vendorgst":"33ABCD43wsd123"
//   }
//####################################################################### RESPONSE BODY  ##############################################################################################################
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
      const [sql] = await db.spcall(
        `CALL SP_VENDOR_ADD(?,?,?,?,?,?,@vendorid); select @vendorid;`,
        [
          querydata.vendorname,
          querydata.vendormailid,
          querydata.vendorphoneno,
          querydata.vendoraddress,
          querydata.vendorgst,
          userid,
        ]
      );
      const objectvalue = sql[1][0];
      const vendorid = objectvalue["@vendorid"];
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
//####################################################################### REQUEST BODY  ##############################################################################################################
// {
// "vendorid":1
// }
//OR
// empty body - For fetching all the vendor list
//####################################################################### RESPONSE BODY  ##############################################################################################################
// {"code":true,"message":"Vendor Fethced Successfully","Value":[{"vendor_name":"JK constructiond","vendor_mail":"jk@gmail.com","vendor_phoneno":"8393923242","vendor_gstno":"33ABCD43wsd123","vendor_address":"chinnverampatti,udumallai"}]}
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
      // Convert Logo_path to binary if available
      for (let i = 0; i < sql.length; i++) {
        if (sql[i].Logo_path) {
          try {
            const binaryData = await helper.convertFileToBinary(
              sql[i].Logo_path
            );
            sql[i].Logo_path = binaryData;
          } catch (error) {
            console.error("Error reading file:", sql[i].Logo_path, error);
            sql[i].Logo_path = null; // Set to null if file is not found
          }
        }
      }
      if (sql[0]) {
        return helper.getSuccessResponse(
          true,
          "success",
          "Vendor Fethced Successfully",
          sql,
          secret
        );
      } else {
        return helper.getSuccessResponse(
          true,
          "success",
          "Vendor Fethced Successfully",
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
  AddVendor,
  GetVendor,
};
