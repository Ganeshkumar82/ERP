const db = require("../db");
const uploadFile = require("../middleware");
// const config = require('../config');
const helper = require("../helper");
const config = require("../config");
const mailer = require("../mailer");
const axios = require("axios");
const { query } = require("express");
const passwordValidator = require("password-validator");
// const smsClient = require("../smsclient");

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function GetCustomerDetails(admin) {
  try {
    if (!admin?.customerid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Customer id missing.",
        "GET CUSTOMER DETAILS",
        ""
      );
    }
    const sql = await db.spcall(
      `select * from customermaster where customer_id = ?`,
      [admin.customerid]
    );
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Details Fetched Successfully.",
        sql,
        ""
      );
    } else {
      return helper.getErrorResponse(false, "error", sql, "");
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

//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function Login(admin, clientIp) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "USER LOGIN",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "USER LOGIN",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "LOGIN",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "USER LOGIN",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "USER LOGIN",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "USER LOGIN",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("username") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "USER LOGIN",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("password") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "USER LOGIN",
        admin.Secret
      );
    }
    var utype = 3;
    var isEmailID = false;
    var isphone = false;
    if (
      querydata.username.indexOf(".") !== -1 ||
      querydata.username.indexOf("@") !== -1
    ) {
      utype = 1;
      isEmailID = true;
    } else {
      // Example regular expressions for checking phone numbers:
      var phonePattern1 = /^[0-9]{10}$/; // Matches 10-digit phone numbers.
      var phonePattern2 = /^\+\d{1,3}\s?\d{10}$/; // Matches international phone numbers like +123 456789012.

      if (
        phonePattern1.test(querydata.username) ||
        phonePattern2.test(querydata.username)
      ) {
        isphone = true;
        utype = 0;
      } else {
        utype = 2;
        isEmailID = false;
      }
    }
    //End of Validation RULE 3. Check if the inout is email id or user name
    //Begin Validation:- 3a. Email/username is entered,less than 5 char length
    if (querydata.username.length < 5) {
      if (isEmailID == false)
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid credentials. Please verify your username.",
          "LOGIN",
          user.Secret
        );
      else
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid email. Please verify your email address and try again.",
          "LOGIN",
          user.Secret
        );
    }
    if (querydata.password.length < 5 || querydata.password.length > 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid password. Please check your password and try again.",
        "LOGIN",
        admin.Secret
      );
    }

    var userid;
    //Validation RULE 4. Check if the username & Password is matched
    const [result3] = await db.spcall(
      "CALL SP_USER_EP_EXIST(?,?,@result);select @result;",
      [querydata.username, utype]
    );
    const objectValue3 = result3[1][0];
    // console.log("Login, objectValue->"+objectValue3["@result"]);
    if (objectValue3["@result"] == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "User does not exist. Please register or verify your credentials.",
        "LOGIN",
        admin.Secret
      );
    } else {
      userid = objectValue3["@result"];
    }

    const [result1] = await db.spcall(
      "CALL SP_USER_EXIST(?,?,?,@result);select @result;",
      [querydata.username, querydata.password, utype]
    );
    const objectValue = result1[1][0];
    if (objectValue["@result"] == null || objectValue["@result"] == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "Incorrect username or password. Please verify your username/password and try again.",
        "LOGIN",
        admin.Secret
      );
    } else {
      const [result2] = await db.spcall(
        "CALL SP_USER_LOGIN(?,?,@result);select @result;",
        [objectValue["@result"], clientIp]
      );
      const objectValue1 = result2[1][0];
      const SESSIONTOKEN = objectValue1["@result"];
      try {
        const returnstr = JSON.stringify({
          code: true,
          status: "success",
          message: "Login successfull",
          data: { userid: objectValue["@result"], SESSIONTOKEN: SESSIONTOKEN },
          // userid: objectValue["@result"],
          // SESSIONTOKEN,
        });
        if (admin.Secret != "") {
          const encryptedResponse = await helper.encrypt(
            returnstr,
            admin.Secret
          );
          // console.log("returnstr=>"+JSON.stringify(encryptedResponse));
          return { encryptedResponse };
        } else {
          return {
            code: true,
            status: "success",
            message: "Login successfull",
            data: {
              userid: objectValue["@result"],
              SESSIONTOKEN: SESSIONTOKEN,
            },
            // userid: objectValue["@result"],
            // SESSIONTOKEN,
          };
        }
      } catch (Ex) {
        return {
          code: true,
          status: "success",
          message: "Login successfull",
          data: { userid: objectValue["@result"], SESSIONTOKEN: SESSIONTOKEN },
          // userid: objectValue["@result"],
          // SESSIONTOKEN,
        };
      }
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      admin.Secret
    );
  }
}

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function ForgotPassword(admin, clientIp) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "USER FORGOT PASSWORD",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "USER FORGOT PASSWORD",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("username") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    }
    var utype = 3;
    var isEmailID = false;
    var isphone = false;
    if (
      querydata.username.indexOf(".") !== -1 ||
      querydata.username.indexOf("@") !== -1
    ) {
      utype = 1;
      isEmailID = true;
    } else {
      // Example regular expressions for checking phone numbers:
      var phonePattern1 = /^[0-9]{10}$/; // Matches 10-digit phone numbers.
      var phonePattern2 = /^\+\d{1,3}\s?\d{10}$/; // Matches international phone numbers like +123 456789012.

      if (
        phonePattern1.test(querydata.username) ||
        phonePattern2.test(querydata.username)
      ) {
        isphone = true;
        utype = 0;
      } else {
        utype = 2;
        isEmailID = false;
      }
    }
    //End of Validation RULE 3. Check if the inout is email id or user name
    //Begin Validation:- 3a. Email/username is entered,less than 5 char length
    if (querydata.username.length < 5) {
      if (isEmailID == false)
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid credentials. Please verify your username.",
          "USER FORGOT PASSWORD ",
          admin.Secret
        );
      else
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid email. Please verify your email address and try again.",
          "USER FORGOT PASSWORD",
          admin.Secret
        );
    }

    var userid;
    const [result3] = await db.spcall(
      "CALL SP_USER_EP_EXIST(?,?,@result);select @result;",
      [querydata.username, utype]
    );
    const objectValue3 = result3[1][0];
    // console.log("Login, objectValue->"+objectValue3["@result"]);
    if (objectValue3["@result"] == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "User does not exist. Please register or verify your credentials.",
        "USER FORGOT PASSWORD",
        admin.Secret
      );
    } else {
      userid = objectValue3["@result"];
      if (isEmailID == true) {
        const [result] = await db.spcall(
          "CALL SP_OTP_VERIFY(?,?,@result);select @result;",
          ["0", querydata.username]
        );
        const objectvalue = result[1][0];
        const otpText = objectvalue["@result"];
        console.log("otp email->" + otpText);
        if (otpText != null) {
          EmailSent = await mailer.sendEmail(
            "User",
            querydata.username,
            "Forgot password",
            "sendotp.html",
            otpText,
            "LOGIN_FORGET_PASSWORD"
          );
          return helper.getSuccessResponse(
            true,
            "success",
            "Forgot Password OTP sent successfully to your email.",
            otpText,
            admin.Secret
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Error while sending OTP. Please try again.",
            "USER FORGOT PASSWORD",
            admin.Secret
          );
        }
      } else if (isphone == true) {
        const [result] = await db.spcall(
          "CALL SP_OTP_VERIFY(?,?,@result);select @result;",
          ["1", querydata.username]
        );
        const objectvalue = result[1][0];
        const otpText = objectvalue["@result"];
        console.log("otp mobile->" + otpText);
        if (otpText != null) {
          console.log("phone no ->" + querydata.username);
          // smsClient.sendSMS("sporad", querydata.username, "2", otpText);
          return helper.getSuccessResponse(
            true,
            "success",
            "Forgot password OTP sent Successfully to your Phone.",
            otpText,
            admin.Secret
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Error while sending the OTP. Please try again",
            "USER FORGOT PASSWORD",
            admin.Secret
          );
        }
      } else {
        const sql = await db.query(
          `select Email_id from usermaster where username = '${querydata.username}' and status = 1`
        );
        if (sql.length > 0) {
          const emailid = sql[0].Email_id;
          const [result] = await db.spcall(
            "CALL SP_OTP_VERIFY(?,?,@result);select @result;",
            ["0", emailid]
          );
          const objectvalue = result[1][0];
          const otpText = objectvalue["@result"];
          console.log("otp email->" + otpText);
          if (otpText != null) {
            EmailSent = await mailer.sendEmail(
              "User",
              emailid,
              "Forgot password",
              "sendotp.html",
              otpText,
              "LOGIN_FORGET_PASSWORD"
            );
            return helper.getSuccessResponse(
              true,
              "success",
              "Forgot Password OTP sent successfully to your email.",
              otpText,
              admin.Secret
            );
          } else {
            return helper.getErrorResponse(
              false,
              "error",
              "Error while sending OTP. Please try again.",
              "USER FORGOT PASSWORD",
              admin.Secret
            );
          }
        }
      }
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "Internal error. Please contact Administration",
      er,
      admin.Secret
    );
  }
}

//###########################################################################################################################################################################################
//##################################################################################################################################################################################
async function verifyOTP(admin) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "VERIFY USER OTP",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "VERIFY USER OTP",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "VERIFY USER OTP",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "VERIFY USER OTP",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "VERIFY USER OTP",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "VERIFY USER OTP",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("username") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "VERIFY USER OTP",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("OTP") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "OTP missing. Please provide the OTP",
        "VERIFY USER OTP",
        admin.Secret
      );
    }
    var utype = 3;
    var isEmailID = false;
    var isphone = false;
    var otpresult = 0;
    if (
      querydata.username.indexOf(".") !== -1 ||
      querydata.username.indexOf("@") !== -1
    ) {
      utype = 1;
      isEmailID = true;
    } else {
      // Example regular expressions for checking phone numbers:
      var phonePattern1 = /^[0-9]{10}$/; // Matches 10-digit phone numbers.
      var phonePattern2 = /^\+\d{1,3}\s?\d{10}$/; // Matches international phone numbers like +123 456789012.

      if (
        phonePattern1.test(querydata.username) ||
        phonePattern2.test(querydata.username)
      ) {
        isphone = true;
        utype = 0;
      } else {
        utype = 2;
        isEmailID = false;
      }
    }
    //End of Validation RULE 3. Check if the inout is email id or user name
    //Begin Validation:- 3a. Email/username is entered,less than 5 char length
    if (querydata.username.length < 5) {
      if (isEmailID == false)
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid credentials. Please verify your username.",
          "VERIFY USER OTP",
          admin.Secret
        );
      else
        return helper.getErrorResponse(
          false,
          "error",
          "Invalid email. Please verify your email address and try again.",
          "VERIFY USER OTP",
          admin.Secret
        );
    }

    var userid;
    const [result3] = await db.spcall(
      "CALL SP_USER_EP_EXIST(?,?,@result);select @result;",
      [querydata.username, utype]
    );
    const objectValue3 = result3[1][0];
    // console.log("Login, objectValue->"+objectValue3["@result"]);
    if (objectValue3["@result"] == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "User does not exist. Please register or verify your credentials.",
        "VERIFY USER OTP",
        admin.Secret
      );
    } else {
      userid = objectValue3["@result"];
      if (isEmailID == true) {
        const [result] = await db.spcall(
          "CALL SP_OTP_CHECK(?,?,?,@result);select @result;",
          [0, querydata.username, querydata.OTP]
        );
        const data = result[1][0];
        console.log("otp check ->" + data["@result"]);
        otpresult = data["@result"];
      } else if (isphone == true) {
        const [result] = await db.spcall(
          "CALL SP_OTP_CHECK(?,?,?,@result);select @result;",
          [1, querydata.username, querydata.OTP]
        );
        const data = result[1][0];
        console.log("otp check ->" + data["@result"]);
        otpresult = data["@result"];
      } else {
        const sql = await db.query(
          `select Email_id from usermaster where username = '${querydata.username}' and status = 1`
        );
        if (sql.length > 0) {
          const [result] = await db.spcall(
            "CALL SP_OTP_CHECK(?,?,?,@result);select @result;",
            [0, sql[0].Email_id, querydata.OTP]
          );
          const data = result[1][0];
          console.log("otp check ->" + data["@result"]);
          otpresult = data["@result"];
        }
      }
    }
    if (otpresult == 1) {
      return helper.getSuccessResponse(
        true,
        "success",
        "OTP Verified Successfully",
        otpresult,
        admin.Secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid OTP",
        otpresult,
        admin.Secret
      );
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er,
      admin.Secret
    );
  }
}

//###########################################################################################################################################################################################
//##################################################################################################################################################################################
async function changepassword(admin) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "CHANGE NEW PASSWORD",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "CHANGE NEW PASSWORD",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("username") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("password") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "CHANGE NEW PASSWORD",
        admin.Secret
      );
    }

    if (querydata.username != null) {
      const resultAPI = await db.query(
        `select user_id,email_id,phone from usermaster where username= '${querydata.username}' OR Email_id= '${querydata.username}' OR phone= '${querydata.username}' and status=1`
      );

      if (resultAPI[0].email_id != null) {
        const user_id = resultAPI[0].user_id;
        const [result] = await db.spcall(
          `CALL SP_UPDATE_PASSWORD(?,?,@result); select @result;`,
          [querydata.password, user_id]
        );
        const object = result[1][0];
        console.log("password status ->" + object["@result"]);

        if (object["@result"] == 1) {
          return helper.getSuccessResponse(
            true,
            "success",
            "The New password was updated successfully",
            object["@result"],
            admin.Secret
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Error while updating the password",
            object["@result"],
            admin.Secret
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Please provide the Valid Username.",
          querydata.username,
          admin.Secret
        );
      }
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er.message,
      admin.Secret
    );
  }
}

////#############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//##############################################################################################################################################################################################

async function SendEmailWhatsapp(admin) {
  try {
    if (admin.hasOwnProperty("phoneno") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Phone number missing. Please provide the Phone number.",
        "SEND MAIL OR WHATSAPP",
        ""
      );
    }
    if (admin.hasOwnProperty("emailid") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Emailid missing. Pleae provide the email id",
        "SEND EMAIL AND WHATSAPP",
        ""
      );
    }
    if (admin.hasOwnProperty("pdfpath") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "PDF File path missing. Please provide the PDF File path",
        "SEND EMAIL AND WHATSAPP",
        ""
      );
    }
    if (admin.hasOwnProperty("feedback") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Feedback missing. Please provide the feddback",
        "SEND EMAIL AND WHATSAPP",
        ""
      );
    }
    if (admin.hasOwnProperty("documenttype") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Document type missing. Please provide the Document type",
        "SEND EMAIL AND WHATSAPP",
        ""
      );
    }
    const mail = await mailer.sendPDF(
      "customer",
      admin.emailid,
      admin.documenttype,
      "sendpdf.html",
      admin.feedback,
      "SITE_ALARM_CONF",
      admin.pdfpath
    );
    const whatsapp = await axios.post(`${config.whatsappip}/billing/sendpdf`, {
      phoneno: admin.phoneno, // Add the required parameters
      feedback: admin.feedback,
      pdfpath: admin.pdfpath,
    });
    console.log("API call successful:", whatsapp.data.code);
    if (mail == true && whatsapp.data.code == true) {
      return helper.getErrorResponse(
        true,
        "success",
        "Mail and whatsapp sended successfully",
        "",
        ""
      );
    } else if (mail == true) {
      return helper.getErrorResponse(true, "Mail sended successfully", "", "");
    } else if (whatsapp.data.code == true) {
      return helper.getErrorResponse(
        true,
        "success",
        "Whatsapp sended successfully",
        whatsapp.data.code,
        ""
      );
    } else {
      return helper.getErrorResponse(
        true,
        "success",
        "Error sending both whatsapp and email",
        "",
        ""
      );
    }
  } catch (er) {
    console.log(er);
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration",
      er,
      ""
    );
  }
}

//##############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//#############################################################################################################################################################################################
async function Register(admin) {
  try {
    //CHECK IF THE APIKEY IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("APIkey") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key missing. Please provide the API key",
        "USER REGISTER",
        ""
      );
    }
    //CHECK IF THE SECRET IS GIVEN AS INPUT OR NOT
    if (admin.hasOwnProperty("Secret") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Secret key missing. Please provide the Secret key.",
        "USER REGISTER",
        ""
      );
    }
    const ApiCheck = helper.checkAPIKey(admin.APIkey, admin.Secret);

    var isValid = 0;
    await ApiCheck.then(
      function (value) {
        isValid = value.IsValidAPI;
      },
      function (error) {
        isValid = 0;
      }
    );
    if (isValid == 0) {
      return helper.getErrorResponse(
        false,
        "error",
        "API key Invalid. Please provide the valid API key",
        "REGISTER",
        admin.Secret
      );
    }

    // CHECK IF THE QUERYSTRING IS GIVEN AS AN INPUT
    if (admin.hasOwnProperty("querystring") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "USER REGISTER",
        admin.Secret
      );
    }

    var querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, admin.Secret);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        `Querystring Invalid error. Please provide the valid querystring.`,
        "USER REGISTER",
        admin.Secret
      );
    }

    try {
      querydata = JSON.parse(querydata);
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring JSON error. Please provide the valid JSON",
        "USER REGISTER",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("name") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Username missing. Please provide the username",
        "USER REGISTER",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("password") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "USER REGISTER",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("emailid") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "USER REGISTER",
        admin.Secret
      );
    }
    if (querydata.hasOwnProperty("phoneno") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password missing. Please provide the password",
        "USER REGISTER",
        admin.Secret
      );
    }

    if (querydata.name.length > 100) {
      return helper.getErrorResponse(
        false,
        "error",
        "Please provide a name with the appropriate size.",
        "REGISTER",
        admin.Secret
      );
    }

    if (
      querydata.emailid.indexOf(".") == -1 ||
      querydata.emailid.indexOf("@") == -1
    ) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid email format. Please provide a valid email address.",
        "REGISTER",
        admin.Secret
      );
    }
    if (helper.phonenumber(querydata.phoneno)) {
      console.log("Valid");
    } else {
      console.log("Invalid");
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid phone number. Please provide a valid phone number.",
        "REGISTER",
        admin.Secret
      );
    }

    //Begin Validation:- 5. Password should have minimum 8 characters and maximum 15 characters with mix of uppercase, lowercase, numeric and special character.
    if (querydata.password.length > 40 || querydata.password.length < 5) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password must be of valid size. Please provide a password with appropriate length.",
        "REGISTER",
        admin.Secret
      );
    }
    var schema = new passwordValidator();
    schema
      .is()
      .min(5) // Minimum length 5
      .is()
      .max(100) // Maximum length 100
      .has()
      .uppercase() // Must have uppercase letters
      .has()
      .lowercase() // Must have lowercase letters
      .has()
      .digits(1) // Must have at least 1 digits
      .has()
      .not()
      .spaces();
    if (schema.validate(querydata.password) == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Password does not meet the required guidelines.",
        "REGISTER",
        admin.Secret
      );
    }
    try {
      const [sql] = await db.spcall(
        `CALL SP_ADD_USER(?,?,?,?,@userid); select @userid`,
        [
          querydata.name,
          querydata.emailid,
          querydata.phoneno,
          querydata.password,
        ]
      );
      const objectvalue = sql[1][0];
      const userid = objectvalue["@userid"];

      if (userid != null) {
        const [result] = await db.spcall(
          "CALL SP_OTP_VERIFY(?,?,@result);select @result;",
          ["0", querydata.emailid]
        );
        const objectvalue = result[1][0];
        const otpText = objectvalue["@result"];
        console.log("otp email->" + otpText);
        if (otpText != null) {
          EmailSent = await mailer.sendEmail(
            querydata.name,
            querydata.emailid,
            "User registration",
            "registerotp.html",
            `${config.serverurl}/verification?email=${querydata.emailid}&token=${otpText}`,
            "REGISTER_OTP_SEND"
          );
        }
        if (EmailSent == true) {
          return helper.getSuccessResponse(
            true,
            "success",
            "Email sent successfully. Please Verify your account.",
            "REGISTER",
            admin.Secret
          );
        } else {
          return helper.getErrorResponse(
            false,
            "error",
            "Error sending the Email. Please try again later.",
            "REGISTER",
            admin.Secret
          );
        }
      } else {
        return helper.getErrorResponse(
          false,
          "error",
          "Error in adding user",
          "REGISTER",
          admin.Secret
        );
      }
    } catch (er) {
      return helper.getErrorResponse(
        false,
        "error",
        "User already exists",
        er.message,
        admin.Secret
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

//###########################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function OrganizationList(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH ORGANIZATION",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH ORGANIZATION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH ORGANIZATION",
        secret
      );
    }
    var sql = [],
      sql1 = [];
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH ORGANIZATION",
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
          "FETCH ORGANIZATION",
          secret
        );
      }
      if (querydata.hasOwnProperty("organizationid") == false) {
        return helper.getSuccessResponse(
          true,
          "error",
          `Organization id missing. Please provide the Organization id`,
          "FETCH ORGANIZATION CUSTOMERS",
          secret
        );
      }
      sql = await db.query1(
        `SELECT Organization_id,Email_id,Organization_Name,orgcode, Organization_Logo,Address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,contact_no contactno,orgcode from organizations where status = 1 and deleted_flag =0 and Organization_type =2 and site_type = 0 and organization_id in (?)`,
        [querydata.organizationid]
      );
      sql1 = await db.query1(
        `SELECT Organization_id,Email_id,Organization_Name,orgcode, Organization_Logo,Address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,contact_no contactno,orgcode from organizations where status = 1 and deleted_flag =0 and Organization_type =2 and site_type = 1 and organization_id in (?)`,
        [querydata.organizationid]
      );
    } else {
      sql = await db.query1(
        `SELECT Organization_id,Email_id,Organization_Name,orgcode, Organization_Logo,Address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,contact_no contactno,orgcode from organizations where status = 1 and deleted_flag =0 and Organization_type =2 and site_type = 0`
      );
      sql1 = await db.query1(
        `SELECT Organization_id,Email_id,Organization_Name,orgcode, Organization_Logo,Address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,contact_no contactno,orgcode from organizations where status = 1 and deleted_flag =0 and Organization_type =2 and site_type = 1`
      );
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Organization Fetched Successfully",
        { Live: sql, Demo: sql1 },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Organization Fetched Successfully",
        { Live: sql, Demo: sql1 },
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
//###########################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function OrgList(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH ORGANIZATION",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH ORGANIZATION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH ORGANIZATION",
        secret
      );
    }
    var sql = [],
      sql1 = [];
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH ORGANIZATION",
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
          "FETCH ORGANIZATION",
          secret
        );
      }
      if (querydata.hasOwnProperty("organizationid") == false) {
        return helper.getSuccessResponse(
          true,
          "error",
          `Organization id missing. Please provide the Organization id`,
          "FETCH ORGANIZATION CUSTOMERS",
          secret
        );
      }
      sql = await db.query1(
        `SELECT Organization_id,Organization_name,orgcode from organizations where status = 1 and deleted_flag =0 `
      );
      sql = await db.query1(
        `SELECT Organization_id,Organization_name,orgcode from organizations where status = 1 and deleted_flag =0 `
      );
    } else {
      sql = await db.query1(
        `SELECT Organization_id,Organization_name,orgcode from organizations where status = 1 and deleted_flag =0 `
      );
      sql = await db.query1(
        `SELECT Organization_id,Organization_name,orgcode from organizations where status = 1 and deleted_flag =0 `
      );
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Organization Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Organization Fetched Successfully",
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

async function CompanyList(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH COMPANY LIST",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH COMPANY LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken.",
        "FETCH COMPANY LIST",
        secret
      );
    }
    var sql = [],
      sql1 = [];
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH COMPANY LIST",
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
          "FETCH COMPANY LIST",
          secret
        );
      }
      if (
        querydata.hasOwnProperty("organizationid") == false &&
        querydata.organizationid != 0
      ) {
        sql = await db.query1(
          `SELECT Customer_id,Organization_id,Customer_name,ccode,Email_id,Customer_Logo,address,billing_address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,Contact_no contactpersonno,customer_cin,customer_pan,ccode customercode,customer_type from customermaster where status = 1 and deleted_flag =0 and site_type = 0`
        );
        sql1 = await db.query1(
          `SELECT Customer_id,Organization_id,Customer_name,ccode,Email_id,Customer_Logo,address,billing_address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,Contact_no contactpersonno,customer_cin,customer_pan,ccode customercode,customer_type from customermaster where status = 1 and deleted_flag =0 and site_type = 1`
        );
      }
      sql = await db.query1(
        `SELECT Customer_id,Organization_id,Customer_name,ccode,Email_id,Customer_Logo,address,billing_address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,Contact_no contactpersonno,customer_cin,customer_pan,ccode customercode,customer_type from customermaster where site_type = 0 and status = 1 and deleted_flag =0 and Customer_type In(1,2) and Organization_id = ?`,
        [querydata.organizationid]
      );
      sql1 = await db.query1(
        `SELECT Customer_id,Organization_id,Customer_name,ccode,Email_id,Customer_Logo,address,billing_address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,Contact_no contactpersonno,customer_cin,customer_pan,ccode customercode,customer_type from customermaster where site_type = 1 and status = 1 and deleted_flag =0 and Customer_type In(1,2) and Organization_id = ?`,
        [querydata.organizationid]
      );
    } else {
      sql = await db.query1(
        `SELECT Customer_id,Organization_id,Customer_name,ccode,Email_id,Customer_Logo,address,billing_address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,Contact_no contactpersonno,customer_cin,customer_pan,ccode customercode,customer_type from customermaster where status = 1 and deleted_flag =0 and site_type = 0`
      );
      sql1 = await db.query1(
        `SELECT Customer_id,Organization_id,Customer_name,ccode,Email_id,Customer_Logo,address,billing_address,CASE WHEN Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,Admin_username contactperson,Contact_no contactpersonno,customer_cin,customer_pan,ccode customercode,customer_type from customermaster where status = 1 and deleted_flag =0 and site_type = 1`
      );
    }
    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Fetched Successfully",
        { Live: sql, Demo: sql1 },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Fetched Successfully",
        { Live: sql, Demo: sql1 },
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

async function GetCompany(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH COMPANY LIST",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH COMPANY LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken.",
        "FETCH COMPANY LIST",
        secret
      );
    }
    var sql = [],
      sql1 = [];
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH COMPANY LIST",
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
          "FETCH COMPANY LIST",
          secret
        );
      }
      if (
        querydata.hasOwnProperty("organizationid") == false &&
        querydata.organizationid != 0
      ) {
        sql = await db.query1(
          `select customer_id companyid,customer_name companyname,Email_id emailid,customer_name client_addressname,address client_address,customer_name billing_addressname,billing_address, contact_no contactnumber,gst_number from customermaster where status =1 and deleted_flag =0`
        );
      }
      sql = await db.query1(
        `select customer_id companyid,customer_name companyname,Email_id emailid,customer_name client_addressname,address client_address,customer_name billing_addressname,billing_address, contact_no contactnumber,gst_number from customermaster where status =1 and deleted_flag =0 and Organization_id = ?`,
        [querydata.organizationid]
      );
    } else {
      sql = await db.query1(
        `select customer_id companyid,customer_name companyname,Email_id emailid,customer_name client_addressname,address client_address,customer_name billing_addressname,billing_address, contact_no contactnumber,gst_number from customermaster where status =1 and deleted_flag =0`
      );
    }

    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Customer Fetched Successfully",
        { Live: sql, Demo: sql1 },
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
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

// async function BranchList(admin) {
//   try {
//     // Check if the session token exists
//     if (!admin.hasOwnProperty("STOKEN")) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken missing. Please provide the Login sessiontoken",
//         "FETCH BRANCH LIST",
//         ""
//       );
//     }
//     var secret = admin.STOKEN.substring(0, 16);
//     var querydata;

//     // Validate session token length
//     if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login session token size invalid. Please provide the valid Session token",
//         "FETCH BRANCH LIST",
//         secret
//       );
//     }
//     // Validate session token
//     const [result] = await db.spcall(
//       "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
//       [admin.STOKEN]
//     );
//     const objectvalue = result[1][0];
//     const userid = objectvalue["@result"];

//     if (userid == null) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Login sessiontoken Invalid. Please provide the valid sessiontoken",
//         "FETCH BRANCH LIST",
//         secret
//       );
//     }
//     var sql = [],
//       sql1 = [];
//     if (admin.hasOwnProperty("querystring")) {
//       try {
//         querydata = await helper.decrypt(admin.querystring, secret);
//       } catch (ex) {
//         return helper.getErrorResponse(
//           false,
//           "error",
//           "Querystring Invalid error. Please provide the valid querystring.",
//           "FETCH BRANCH LIST",
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
//           "FETCH BRANCH LIST",
//           secret
//         );
//       }
//       if (querydata.hasOwnProperty("companyid") && querydata.companyid != 0) {
//         sql = await db.query1(
//           `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, bm.branch_name AS client_addressname, bm.address AS clientaddress,
//                 bm.gstno AS gst_number, cm.Email_id AS emailid, cm.Contact_no AS contact_number, cm.billing_address,
//                 cm.Customer_name AS billing_addressname,
//                 CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,
//                 bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode, cst.from_date, cst.to_date, cst.Amount, cst.billingperiod
//             FROM branchmaster bm
//             JOIN customermaster cm ON cm.customer_id = bm.customer_id
//             LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id
//             WHERE bm.site_type = 0 AND bm.status = 1 AND bm.deleted_flag = 0 AND bm.Customer_id = ?`,
//           [querydata.companyid]
//         );

//         sql1 = await db.query1(
//           `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, bm.branch_name AS client_addressname, bm.address AS clientaddress,
//                 bm.gstno AS gst_number, cm.Email_id AS emailid, cm.Contact_no AS contact_number, cm.billing_address,
//                 cm.Customer_name AS billing_addressname,
//                 CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,
//                 bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode, cst.from_date, cst.to_date, cst.Amount, cst.billingperiod
//             FROM branchmaster bm
//             JOIN customermaster cm ON cm.customer_id = bm.customer_id
//             LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id
//             WHERE bm.site_type = 1 AND bm.status = 1 AND bm.deleted_flag = 0 AND bm.Customer_id = ?`,
//           [querydata.companyid]
//         );
//       } else if (
//         querydata.hasOwnProperty("organizationid") &&
//         querydata.organizationid != 0
//       ) {
//         sql = await db.query1(
//           `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, bm.branch_name AS client_addressname, bm.address AS clientaddress,
//                 bm.gstno AS gst_number, cm.Email_id AS emailid, cm.Contact_no AS contact_number, cm.billing_address,
//                 cm.Customer_name AS billing_addressname,
//                 CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,
//                 bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode, cst.from_date, cst.to_date, cst.Amount, cst.billingperiod
//             FROM branchmaster bm
//             JOIN customermaster cm ON cm.customer_id = bm.customer_id
//             LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id
//             WHERE bm.site_type = 0 AND bm.status = 1 AND bm.deleted_flag = 0
//             AND bm.Customer_id IN (SELECT customer_id FROM customermaster WHERE organization_id = ?)`,
//           [querydata.organizationid]
//         );

//         sql1 = await db.query1(
//           `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, bm.branch_name AS client_addressname, bm.address AS clientaddress,
//                 bm.gstno AS gst_number, cm.Email_id AS emailid, cm.Contact_no AS contact_number, cm.billing_address,
//                 cm.Customer_name AS billing_addressname,
//                 CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,
//                 bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode, cst.from_date, cst.to_date, cst.Amount, cst.billingperiod
//             FROM branchmaster bm
//             JOIN customermaster cm ON cm.customer_id = bm.customer_id
//             LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id
//             WHERE bm.site_type = 1 AND bm.status = 1 AND bm.deleted_flag = 0
//             AND bm.Customer_id IN (SELECT customer_id FROM customermaster WHERE organization_id = ?)`,
//           [querydata.organizationid]
//         );
//       }
//     } else {
//       sql = await db.query1(
//         `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, bm.branch_name AS client_addressname, bm.address AS clientaddress,
//                 bm.gstno AS gst_number, cm.Email_id AS emailid, cm.Contact_no AS contact_number, cm.billing_address,
//                 cm.Customer_name AS billing_addressname,
//                 CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,
//                 bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode, cst.from_date, cst.to_date, cst.Amount, cst.billingperiod
//             FROM branchmaster bm
//             JOIN customermaster cm ON cm.customer_id = bm.customer_id
//             LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id
//             WHERE bm.site_type = 0 AND bm.status = 1 AND bm.deleted_flag = 0`
//       );

//       sql1 = await db.query1(
//         `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, bm.branch_name AS client_addressname, bm.address AS clientaddress,
//                 bm.gstno AS gst_number, cm.Email_id AS emailid, cm.Contact_no AS contact_number, cm.billing_address,
//                 cm.Customer_name AS billing_addressname,
//                 CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type,
//                 bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode, cst.from_date, cst.to_date, cst.Amount, cst.billingperiod
//             FROM branchmaster bm
//             JOIN customermaster cm ON cm.customer_id = bm.customer_id
//             LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id
//             WHERE bm.site_type = 1 AND bm.status = 1 AND bm.deleted_flag = 0`
//       );
//     }

//     if (sql[0]) {
//       return helper.getSuccessResponse(
//         true,
//         "success",
//         "Branch list Fetched Successfully",
//         { Live: sql, Demo: sql1 },
//         secret
//       );
//     } else {
//       return helper.getSuccessResponse(
//         true,
//         "success",
//         "Branch list Fetched Successfully",
//         { Live: sql, Demo: sql1 },
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
async function BranchList(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH BRANCH LIST",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH BRANCH LIST",
        secret
      );
    }
    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH BRANCH LIST",
        secret
      );
    }
    var sql = [],
      sql1 = [];
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH BRANCH LIST",
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
          "FETCH BRANCH LIST",
          secret
        );
      }
      if (querydata.hasOwnProperty("companyid") && querydata.companyid != 0) {
        sql = await db.query1(
          `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, cst.clientaddress_name AS client_addressname, cst.customer_address AS clientaddress, 
          cst.billing_gst AS gst_number,cst.contactperson_name contact_person,cst.emailid AS emailid, cst.Phoneno AS contact_number, cst.billing_address, 
          cst.billingaddress_name AS billing_addressname, 
                CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type, 
                bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode,DATE_FORMAT(DATE(cst.from_date), '%Y-%m-%d') AS from_date, 
                DATE_FORMAT(DATE(cst.to_date), '%Y-%m-%d') AS to_date, cst.Amount, cst.billingperiod 
            FROM branchmaster bm 
            LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id 
            WHERE bm.site_type = 0 AND bm.status = 1 AND bm.deleted_flag = 0 AND bm.Customer_id = ?`,
          [querydata.companyid]
        );

        sql1 = await db.query1(
          `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code,  cst.clientaddress_name AS client_addressname, cst.customer_address AS clientaddress, 
          cst.billing_gst AS gst_number,cst.contactperson_name contact_person,cst.emailid AS emailid, cst.Phoneno AS contact_number, cst.billing_address, 
          cst.billingaddress_name AS billing_addressname, 
          CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type, 
          bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode,DATE_FORMAT(DATE(cst.from_date), '%Y-%m-%d') AS from_date, 
          DATE_FORMAT(DATE(cst.to_date), '%Y-%m-%d') AS to_date, cst.Amount, cst.billingperiod 
            FROM branchmaster bm 
            LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id 
            WHERE bm.site_type = 1 AND bm.status = 1 AND bm.deleted_flag = 0 AND bm.Customer_id = ?`,
          [querydata.companyid]
        );
      } else if (
        querydata.hasOwnProperty("organizationid") &&
        querydata.organizationid != 0
      ) {
        sql = await db.query1(
          `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code,  cst.clientaddress_name AS client_addressname, cst.customer_address AS clientaddress, 
          cst.billing_gst AS gst_number,cst.contactperson_name contact_person,cst.emailid AS emailid, cst.Phoneno AS contact_number, cst.billing_address, 
          cst.billingaddress_name AS billing_addressname, 
          CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type, 
          bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode ,DATE_FORMAT(DATE(cst.from_date), '%Y-%m-%d') AS from_date, 
          DATE_FORMAT(DATE(cst.to_date), '%Y-%m-%d') AS to_date, cst.Amount, cst.Amount, cst.billingperiod 
            FROM branchmaster bm 
            LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id 
            WHERE bm.site_type = 0 AND bm.status = 1 AND bm.deleted_flag = 0 
            AND bm.Customer_id IN (SELECT customer_id FROM customermaster WHERE organization_id = ?)`,
          [querydata.organizationid]
        );

        sql1 = await db.query1(
          `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, cst.clientaddress_name AS client_addressname, cst.customer_address AS clientaddress, 
          cst.billing_gst AS gst_number,cst.contactperson_name contact_person,cst.emailid AS emailid, cst.Phoneno AS contact_number, cst.billing_address, 
          cst.billingaddress_name AS billing_addressname,  
          CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type, 
          bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode, DATE_FORMAT(DATE(cst.from_date), '%Y-%m-%d') AS from_date, 
          DATE_FORMAT(DATE(cst.to_date), '%Y-%m-%d') AS to_date, cst.Amount, cst.Amount, cst.billingperiod 
            FROM branchmaster bm 
            LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id 
            WHERE bm.site_type = 1 AND bm.status = 1 AND bm.deleted_flag = 0 
            AND bm.Customer_id IN (SELECT customer_id FROM customermaster WHERE organization_id = ?)`,
          [querydata.organizationid]
        );
      }
    } else {
      sql = await db.query1(
        `SELECT bm.Branch_id, bm.Branch_name, cst.branchcode Branch_code, cst.clientaddress_name AS client_addressname, cst.customer_address AS clientaddress, 
        cst.billing_gst AS gst_number,cst.contactperson_name contact_person,cst.emailid AS emailid, cst.Phoneno AS contact_number, cst.billing_address, 
        cst.billingaddress_name AS billing_addressname, 
        CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type, 
        bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode,DATE_FORMAT(DATE(cst.from_date), '%Y-%m-%d') AS from_date, 
        DATE_FORMAT(DATE(cst.to_date), '%Y-%m-%d') AS to_date, cst.Amount, cst.Amount, cst.billingperiod 
            FROM branchmaster bm 
            LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id 
            WHERE bm.site_type = 0 AND bm.status = 1 AND bm.deleted_flag = 0`
      );

      sql1 = await db.query1(
        `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, cst.clientaddress_name AS client_addressname, cst.customer_address AS clientaddress, 
        cst.billing_gst AS gst_number,cst.contactperson_name contact_person, cst.emailid AS emailid, cst.Phoneno AS contact_number, cst.billing_address, 
        cst.billingaddress_name AS billing_addressname, 
        CASE WHEN bm.Site_type = 0 THEN 'live' ELSE 'demo' END AS site_type, 
        bm.Branch_Logo, cst.Subscription_ID, cst.billing_plan, cst.Bill_mode, DATE_FORMAT(DATE(cst.from_date), '%Y-%m-%d') AS from_date, 
        DATE_FORMAT(DATE(cst.to_date), '%Y-%m-%d') AS to_date, cst.Amount, cst.billingperiod 
            FROM branchmaster bm 
            LEFT JOIN subscriptioncustomertrans cst ON cst.branch_id = bm.Branch_id 
            WHERE bm.site_type = 1 AND bm.status = 1 AND bm.deleted_flag = 0`
      );
    }

    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Branch list Fetched Successfully",
        { Live: sql, Demo: sql1 },
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Branch list Fetched Successfully",
        { Live: sql, Demo: sql1 },
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
async function GetBranchList(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "FETCH BRANCH LIST",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "FETCH BRANCH LIST",
        secret
      );
    }
    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "FETCH BRANCH LIST",
        secret
      );
    }
    var sql = [],
      sql1 = [];
    if (admin.hasOwnProperty("querystring")) {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "FETCH BRANCH LIST",
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
          "FETCH BRANCH LIST",
          secret
        );
      }
      if (querydata.hasOwnProperty("companyid") && querydata.companyid != 0) {
        sql = await db.query1(
          `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, sct.clientaddress_name AS clientaddress_name, sct.customer_address AS clientaddress, 
                sct.billing_gst AS gst_number,sct.contactperson_name contact_person, sct.Emailid AS emailid, sct.phoneno AS contact_number, sct.billing_address, 
                sct.Billingaddress_name AS billing_addressname FROM branchmaster bm JOIN subscriptioncustomertrans sct ON bm.branch_id = sct.branch_id 
                WHERE bm.site_type = 0 AND bm.status = 1 AND bm.deleted_flag = 0 AND bm.Customer_id = ?`,
          [querydata.companyid]
        );
      }
    } else {
      sql = await db.query1(
        `SELECT bm.Branch_id, bm.Branch_name, bm.Branch_code, sct.clientaddress_name AS clientaddress_name, sct.customer_address AS clientaddress, 
        sct.billing_gst AS gst_number,sct.contactperson_name contact_person, sct.Emailid AS emailid, sct.phoneno AS contact_number, sct.billing_address, 
        sct.Billingaddress_name AS billing_addressname FROM branchmaster bm JOIN subscriptioncustomertrans sct ON bm.branch_id = sct.branch_id 
        WHERE bm.site_type = 0 AND bm.status = 1 AND bm.deleted_flag = 0`
      );
    }

    if (sql[0]) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Branch list Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Branch list Fetched Successfully",
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

// async function UploadLogo(admin) {
//   try {
//     if (admin.hasOwnProperty("logotype") == false) {
//       return helper.getErrorResponse(
//         false,
//         "error",
//         "Logo type missing. Please provide the Logo",
//         "LOGO TYPE MISSING"
//       );
//     }
//     if (admin.hasOwnProperty("id") == false) {
//       return helper.getErrorResponse(
//         false,
//         "Id missing",
//         "Please provide the Id",
//         "ID MISSING"
//       );
//     }
//     if (admin.hasOwnProperty("image") == false) {
//       return helper.getErrorResponse(
//         false,
//         "Image missing",
//         "Please provide the Image",
//         "IMAGE MISSING"
//       );
//     }
//     var sql;
//     const imageBuffer = Buffer.from(admin.image, "base64");
//     if (admin.logotype == "branch") {
//       sql = await db.query1(
//         `update branchmaster set Branch_logo = ? where branch_id = ?`,
//         [imageBuffer, admin.id]
//       );
//     } else if (admin.logotype == "company") {
//       sql = await db.query1(
//         `update customermaster set Customer_logo = ? where customer_id = ?`,
//         [imageBuffer, admin.id]
//       );
//     } else if (admin.logotype == "organization") {
//       sql = await db.query1(
//         `update organizations set Organization_logo = ? where Organization_id = ?`,
//         [imageBuffer, admin.id]
//       );
//     } else {
//       sql = await db.query1(
//         `update organizations set Organization_logo = ? where Organization_id = ?`,
//         [imageBuffer, admin.id]
//       );
//       sql = await db.query1(
//         `update customermaster set Customer_logo = ? where customer_id = ?`,
//         [imageBuffer, admin.id]
//       );
//       sql = await db.query1(
//         `update branchmaster set Branch_logo = ? where branch_id = ?`,
//         [imageBuffer, admin.id]
//       );
//     }
//     if (sql.affectedRows > 0) {
//       return helper.getSuccessResponse(
//         true,
//         "success",
//         "Image Upload Successfully",
//         sql
//       );
//     } else {
//       return helper.getSuccessResponse(
//         false,
//         "error",
//         "Error Uploading the Image",
//         sql
//       );
//     }
//   } catch (er) {
//     return helper.getErrorResponse(
//       false,
//       "error",
//       "Internal error. Please contact Administration",
//       er.message
//     );
//   }
// }

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
async function CustomSendPdf(req, res) {
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

async function UploadLogo(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "UPLOAD LOGO",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPLOAD LOGO",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "UPLOAD LOGO",
        secret
      );
    }
    if (!admin.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPLOAD LOGO",
        secret
      );
    }
    try {
      querydata = await helper.decrypt(admin.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPLOAD LOGO",
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
        "UPLOAD LOGO",
        secret
      );
    }
    if (querydata.hasOwnProperty("logotype") == false) {
      return helper.getErrorResponse(
        false,
        "error",
        "Logo type missing. Please provide the Logo",
        "UPLOAD LOGO",
        secret
      );
    }
    if (querydata.hasOwnProperty("id") == false) {
      return helper.getErrorResponse(
        false,
        "Id missing",
        "Please provide the Id",
        "UPLOAD LOGO",
        secret
      );
    }
    if (querydata.hasOwnProperty("image") == false) {
      return helper.getErrorResponse(
        false,
        "Image missing",
        "Please provide the Image",
        "UPLOAD LOGO",
        secret
      );
    }

    var sql;
    const imageBuffer = Buffer.from(querydata.image, "base64");
    if (querydata.logotype == "branch") {
      sql = await db.query1(
        `update branchmaster set Branch_logo = ? where branch_id = ?`,
        [imageBuffer, querydata.id]
      );
    } else if (querydata.logotype == "company") {
      sql = await db.query1(
        `update customermaster set Customer_logo = ? where customer_id = ?`,
        [imageBuffer, querydata.id]
      );
    } else if (admin.logotype == "organization") {
      sql = await db.query1(
        `update organizations set Organization_logo = ? where Organization_id = ?`,
        [imageBuffer, querydata.id]
      );
    } else {
      sql = await db.query1(
        `update organizations set Organization_logo = ? where Organization_id = ?`,
        [imageBuffer, querydata.id]
      );
      sql = await db.query1(
        `update customermaster set Customer_logo = ? where customer_id = ?`,
        [imageBuffer, querydata.id]
      );
      sql = await db.query1(
        `update branchmaster set Branch_logo = ? where branch_id = ?`,
        [imageBuffer, querydata.id]
      );
    }
    if (sql.affectedRows > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Image Upload Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        false,
        "error",
        "Error Uploading the Image",
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
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function CreateSubscription(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "CREATE NEW SUBSCRIPTION",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "CREATE NEW SUBSCRIPTION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "CREATE NEW SUBSCRIPTION",
        secret
      );
    }
    var sql;
    if (!admin.hasOwnProperty("querystring") && admin.querystring == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "CREATE NEW SUBSCRIPTION",
        admin.Secret
      );
    }
    try {
      querydata = await helper.decrypt(admin.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "CREATE NEW SUBSCRIPTION",
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
        "CREATE NEW SUBSCRIPTION",
        secret
      );
    }
    const requiredFields = [
      { field: "subscriptionName", message: "Subscription name missing." },
      { field: "noOfDevice", message: " Number of devices missing." },
      { field: "noOfCameras", message: "Number of Cameras missing." },
      {
        field: "AdditionalCameraCharges",
        message: "Additional Camera charges missing.",
      },
      { field: "amount", message: "Subscription amount missing." },
      { field: "gstpercentage", message: "GST percentage missing." },
      { field: "hsnno", message: "Subscription HSN number missing." },
      {
        field: "productDescription",
        message: "Product description missing.",
      },
      { field: "clientId", message: "Client id missing." },
      {
        field: "customerType",
        message: "Customer type missing.",
      },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "CREATE NEW SUBSCRIPTION",
          secret
        );
      }
    }
    var sql;
    if (querydata.customerType == "organization") {
      sql = await db.query1(
        `INSERT INTO subscriptionmaster(customerbased_type,Subscription_type,Subscription_Name,No_of_Devices,No_of_Cameras,Addl_cameras,Amount,product_desc,Created_by,organization_id,gst_percentage,hsnno) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          querydata.customerType,
          0,
          querydata.subscriptionName,
          querydata.noOfDevice,
          querydata.noOfCameras,
          querydata.AdditionalCameraCharges,
          querydata.amount,
          querydata.productDescription,
          userid,
          querydata.clientId,
          querydata.gstpercentage,
          querydata.hsnno,
        ]
      );
    } else if (querydata.customerType == "company") {
      sql = await db.query1(
        `INSERT INTO subscriptionmaster(customerbased_type, customerbased_id,Subscription_type,Subscription_Name,No_of_Devices,No_of_Cameras,Addl_cameras,Amount,product_desc,Created_by,gst_percentage,hsnno) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          querydata.customerType,
          querydata.clientId,
          0,
          querydata.subscriptionName,
          querydata.noOfDevice,
          querydata.noOfCameras,
          querydata.AdditionalCameraCharges,
          querydata.amount,
          querydata.productDescription,
          userid,
          querydata.gstpercentage,
          querydata.hsnno,
        ]
      );
    } else if (querydata.customerType == "site") {
      sql = await db.query1(
        `INSERT INTO subscriptionmaster(customerbased_type,Subscription_type,Subscription_Name,No_of_Devices,No_of_Cameras,Addl_cameras,Amount,product_desc,Created_by,site_id,gst_percentage,hsnno) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          querydata.customerType,
          0,
          querydata.subscriptionName,
          querydata.noOfDevice,
          querydata.noOfCameras,
          querydata.AdditionalCameraCharges,
          querydata.amount,
          querydata.productDescription,
          userid,
          querydata.clientId,
          querydata.gstpercentage,
          querydata.hsnno,
        ]
      );
    } else {
      sql = await db.query1(
        `INSERT INTO subscriptionmaster(customerbased_type,Subscription_type,Subscription_Name,No_of_Devices,No_of_Cameras,Addl_cameras,Amount,product_desc,Created_by) VALUES (?,?,?,?,?,?,?,?,?)`,
        [
          querydata.customerType,
          1,
          querydata.subscriptionName,
          querydata.noOfDevice,
          querydata.noOfCameras,
          querydata.AdditionalCameraCharges,
          querydata.amount,
          querydata.productDescription,
          userid,
        ]
      );
    }
    if (sql.affectedRows > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription created Successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error in creating subscription",
        sql,
        secret
      );
    }
  } catch (er) {
    if (er.code == "ER_DUP_ENTRY") {
      return helper.getErrorResponse(
        false,
        "error",
        "Subscription name already exists",
        sql,
        secret
      );
    }
    console.log(JSON.stringify(er));
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
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function GetSubscription(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "GET THE SUBSCRIPTION LIST",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "GET THE SUBSCRIPTION LIST",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "GET THE SUBSCRIPTION LIST",
        secret
      );
    }
    var sql;
    if (!admin.hasOwnProperty("querystring") && admin.querystring == "") {
      sql = await db.query1(
        `SELECT DISTINCT Subscription_ID,Subscription_Name,No_of_Devices, No_of_Cameras, Addl_cameras, Addl_patrol, 
         Patrol_hours, Valid_Months, Valid_Years, Valid_Days, No_of_Analytics,Cloud_Storage, Amount, product_desc FROM subscriptionmaster WHERE Subscription_type = 1 and status =1 and deleted_flag = 0`
      );
    } else {
      try {
        querydata = await helper.decrypt(admin.querystring, secret);
      } catch (ex) {
        return helper.getErrorResponse(
          false,
          "error",
          "Querystring Invalid error. Please provide the valid querystring.",
          "GET THE SUBSCRIPTION LIST",
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
          "GET THE SUBSCRIPTION LIST",
          secret
        );
      }
      // const requiredFields = [
      //   {
      //     field: "siteid",
      //     message: "Site id missing. Please provide the valid site id",
      //   },
      // ];

      // for (const { field, message } of requiredFields) {
      //   if (!querydata.hasOwnProperty(field)) {
      //     return helper.getErrorResponse(
      //       false,
      //       "error",
      //       message,
      //       "GET THE SUBSCRIPTION LIST",
      //       secret
      //     );
      //   }
      // // }
      // var organizationid = 0,
      //   companyid = 0,
      sql = [];
      // const result1 = await db.query(
      //   `SELECT o.Organization_id, c.Customer_id FROM organizations o JOIN customermaster c ON o.Organization_id = c.Organization_id JOIN branchmaster b ON c.customer_id = b.customer_id where b.branch_id = ${querydata.siteid}`
      // );
      // if (result1.length > 0) {
      //   organizationid = result1[0].Organization_id;
      //   companyid = result1[0].Customer_id;
      if (querydata.siteid != 0 && querydata.siteid) {
        sql = await db.query1(
          `SELECT DISTINCT Subscription_ID,Subscription_Name, No_of_Devices, No_of_Cameras, Addl_cameras, Addl_patrol, 
         Patrol_hours, Valid_Months, Valid_Years, Valid_Days, No_of_Analytics,Cloud_Storage, Amount, product_desc FROM subscriptionmaster WHERE Subscription_type = 1 OR (site_id = ? AND site_id != 0) and status =1 and deleted_flag = 0;`,
          [querydata.siteid]
        );
      } else if (querydata.companyid != 0 && querydata.companyid) {
        sql = await db.query1(
          `SELECT DISTINCT Subscription_ID,Subscription_Name, No_of_Devices, No_of_Cameras, Addl_cameras, Addl_patrol, 
         Patrol_hours, Valid_Months, Valid_Years, Valid_Days, No_of_Analytics,Cloud_Storage, Amount, product_desc FROM subscriptionmaster WHERE Subscription_type = 1 OR (enquiry_cust = ? AND enquiry_cust != 0)  and status =1 and deleted_flag = 0;`,
          [querydata.companyid]
        );
      } else if (querydata.customerid != 0 && querydata.customerid) {
        sql = await db.query1(
          `SELECT DISTINCT Subscription_ID,Subscription_Name, No_of_Devices, No_of_Cameras, Addl_cameras, Addl_patrol, 
         Patrol_hours, Valid_Months, Valid_Years, Valid_Days, No_of_Analytics,Cloud_Storage, Amount, product_desc FROM subscriptionmaster WHERE Subscription_type = 1 OR (customerbased_id = ? AND customerbased_id != 0)  and status =1 and deleted_flag = 0;`,
          [querydata.customerid]
        );
      } else if (querydata.organizationid != 0 && querydata.organizationid) {
        sql = await db.query1(
          `SELECT DISTINCT Subscription_ID,Subscription_Name, No_of_Devices, No_of_Cameras, Addl_cameras, Addl_patrol, 
         Patrol_hours, Valid_Months, Valid_Years, Valid_Days, No_of_Analytics,Cloud_Storage, Amount, product_desc FROM subscriptionmaster WHERE Subscription_type = 1 OR (organization_id = ? AND organization_id != 0) and status =1 and deleted_flag = 0;`,
          [querydata.organizationid]
        );
      } else {
        sql = await db.query1(
          `SELECT DISTINCT Subscription_ID,Subscription_Name,No_of_Devices, No_of_Cameras, Addl_cameras, Addl_patrol, 
         Patrol_hours, Valid_Months, Valid_Years, Valid_Days, No_of_Analytics,Cloud_Storage, Amount, product_desc FROM subscriptionmaster WHERE Subscription_type = 1 and status =1 and deleted_flag = 0`
        );
      }
    }

    if (sql.length > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription Fetched Successfully",
        sql,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription Fetched Successfully",
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

//##############################################################################################################################################################################################################
//##############################################################################################################################################################################################################
async function AddUpdateCompany(admin) {
  var secret = "";
  try {
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "UPDATE COMPANY",
        ""
      );
    }

    secret = admin.STOKEN.substring(0, 16);
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE COMPANY",
        secret
      );
    }

    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const userid = result[1][0]["@result"];
    if (!userid) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide a valid sessiontoken",
        "UPDATE COMPANY",
        secret
      );
    }

    if (!admin.hasOwnProperty("querystring") || !admin.querystring) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE COMPANY",
        secret
      );
    }

    let querydata;
    try {
      querydata = await helper.decrypt(admin.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid or JSON error. Please provide valid encrypted data",
        "UPDATE COMPANY",
        secret
      );
    }

    const companies = Array.isArray(querydata) ? querydata : [querydata];
    let results = [];

    for (const company of companies) {
      const validationError = validateCompany(company);
      if (validationError) {
        return helper.getErrorResponse(
          false,
          "error",
          validationError.message,
          validationError.id,
          secret
        );
      }
      var sitetype = 0;
      if (company.sitetype == "live") {
        sitetype = 0;
      } else {
        sitetype = 1;
      }
      try {
        const [spResult] = await db.spcall1(
          "CALL SP_COMPANY_ADD(?,?,?,?,?,?,?,?,?,?,?,?,?,?,@cid); SELECT @cid;",
          [
            company.organizationid,
            company.companyid,
            company.organizationid == 0 || company.organizationid === ""
              ? 1
              : 2,
            capitalizeFirstLetter(company.companyname),
            company.contactperson,
            company.pannumber,
            company.cinno,
            company.customercode,
            company.contactemail,
            company.contactpersonno,
            company.address,
            company.billingaddress,
            0,
            sitetype,
          ]
        );

        const mcustID = spResult[1][0]["@cid"];
        if (!mcustID) {
          return helper.getErrorResponse(
            false,
            "error",
            "Error while Adding/Updating company. Please try again",
            company.companyid,
            secret
          );
        } else {
          return helper.getSuccessResponse(
            true,
            "success",
            "Company has been added/updated successfully.",
            mcustID,
            secret
          );
        }
      } catch (ex) {
        const errorMsg =
          ex.sqlMessage === "Wrong phone number"
            ? "Invalid phone number. Please provide a valid phone number."
            : ex.sqlMessage === "Wrong Email"
            ? "Invalid Email address. Please provide a valid email address."
            : ex.message;
        return helper.getErrorResponse(
          false,
          "error",
          errorMsg,
          company.companyid,
          secret
        );
      }
    }
  } catch (er) {
    return helper.getErrorResponse(
      false,
      "error",
      "Internal error. Please contact Administration.",
      "UPDATE COMPANY",
      secret
    );
  }
}

function validateCompany(company) {
  if (!company.companyid) return { message: "Company ID is missing.", id: 0 };
  if (!company.companyname)
    return { message: "Company name is missing.", id: company.companyid };
  if (!company.sitetype)
    return { message: "Site type missing.", id: company.companyid };
  if (!company.organizationid)
    return { message: "Organization ID is missing.", id: company.companyid };
  if (!company.contactperson)
    return { message: "Contact person missing.", id: company.companyid };
  if (!company.contactpersonno)
    return {
      message: "Contact person's number missing.",
      id: company.companyid,
    };
  if (
    !company.contactemail ||
    !company.contactemail.includes("@") ||
    !company.contactemail.includes(".")
  ) {
    return { message: "Invalid email address.", id: company.companyid };
  }
  if (!company.address)
    return { message: "Address missing.", id: company.companyid };
  if (!company.billingaddress)
    return { message: "Billing address missing.", id: company.companyid };
  if (!company.pannumber)
    return { message: "PAN number missing.", id: company.companyid };
  if (!company.cinno)
    return { message: "CIN number missing.", id: company.companyid };
  if (!company.customercode)
    return { message: "Customer code missing.", id: company.companyid };
  if (
    company.contactpersonno.length < 8 ||
    company.contactpersonno.length > 15
  ) {
    return { message: "Invalid phone number length.", id: company.companyid };
  }
  if (!helper.phonenumber(company.contactpersonno)) {
    return { message: "Invalid phone number.", id: company.companyid };
  }
  return null;
}

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//##########################################################################################################################################################################################
//###########################################################################################################################################################################################

async function UpdateOrganization(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "UPDATE ORGANIZATION",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE ORGANIZATION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "UPDATE ORGANIZATION",
        secret
      );
    }
    var sql;
    if (!admin.hasOwnProperty("querystring") && admin.querystring == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE ORGANIZATION",
        admin.Secret
      );
    }
    try {
      querydata = await helper.decrypt(admin.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE ORGANIZATION",
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
        "UPDATE ORGANIZATION",
        secret
      );
    }
    const requiredFields = [
      { field: "organizationid", message: "Organization id missing." },
      { field: "organizationname", message: " Organization name missing." },
      { field: "emailid", message: "Email id missing." },
      {
        field: "contactno",
        message: "Contact number missing.",
      },
      { field: "address", message: "Address missing." },
      {
        field: "contactperson",
        message: "contact person name missing.",
      },
      { field: "orgcode", message: "Organization code missing." },
      { field: "sitetype", message: "site type missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "UPDATE ORGANIZATION",
          secret
        );
      }
    }
    var stype = 0;
    if (querydata.sitetype == "live") {
      stype = 0;
    } else {
      stype = 1;
    }
    const [sql1] = await db.spcall1(
      `CALL SP_ORGANIZATION_UPDATE(?,?,?,?,?,?,?,?,?,?,@oid); select @oid;`,
      [
        2, // Assuming this is a constant value in your call
        querydata.organizationname,
        querydata.emailid,
        querydata.contactperson,
        querydata.contactno,
        querydata.address,
        userid, // Another constant value
        stype,
        querydata.organizationid,
        querydata.orgcode,
      ]
    );

    // Extract organization_id from the result
    const objectvalue1 = sql1[1][0];
    const organization_id = objectvalue1["@oid"];

    if (
      organization_id != null &&
      organization_id != undefined &&
      organization_id != 0
    ) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Organization updated successfully",
        organization_id,
        secret
      );
    } else {
      return helper.getSuccessResponse(
        true,
        "error",
        "Error updating the Organization",
        organization_id,
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
//##############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function UpdateBranch(admin) {
  try {
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "UPDATE BRANCH",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide a valid Session token",
        "UPDATE BRANCH",
        secret
      );
    }

    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token Invalid. Please provide a valid session token.",
        "UPDATE BRANCH",
        secret
      );
    }

    if (!admin.hasOwnProperty("querystring")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring.",
        "UPDATE BRANCH",
        secret
      );
    }

    try {
      querydata = await helper.decrypt(admin.querystring, secret);
      querydata = JSON.parse(querydata);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid querystring format. Please provide valid JSON",
        "UPDATE BRANCH",
        secret
      );
    }
    const requiredFields = [
      { field: "branchid", message: "Branch id missing." },
      { field: "branchname", message: "Branch name missing." },
      { field: "emailid", message: "Email id missing." },
      {
        field: "contactno",
        message: "Contact number missing.",
      },
      { field: "clientaddressname", message: "Client Address name missing." },
      { field: "address", message: "Address missing." },
      { field: "gstno", message: "Gst number missing." },
      { field: "billingaddressname", message: "Billing address name missing" },
      { field: "billingaddress", message: "Billing address missing" },
      {
        field: "contactperson",
        message: "contact person name missing.",
      },
      { field: "branchcode", message: "Branch code missing." },
      { field: "sitetype", message: "site type missing." },
      { field: "billingplan", message: "Billing plan missing." },
      { field: "billmode", message: "Billing mode missing." },
      { field: "startdate", message: "Start date misssing." },
      { field: "enddate", message: "End date missing." },
      { field: "amount", message: "Amount missing." },
      { field: "billingperiod", message: "Billing period missing." },
      { field: "subscriptionid", message: "Subscription id missing" },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "UPDATE ORGANIZATION",
          secret
        );
      }
    }
    var stype = 0;
    if (querydata.sitetype == "live") {
      stype = 0;
    } else {
      stype = 1;
    }
    const sql = await db.query1(
      `
  UPDATE branchmaster
  SET
    Branch_name = ?,
    Branch_code = ?,
    address = ?,
    Billing_address = ?,
    Billingaddress_name = ?,
    gstno = ?,
    Site_type = ?,
    Email_id = ?,
    Contact_no = ?
  WHERE Branch_id = ?
`,
      [
        querydata.branchname,
        querydata.branchcode,
        querydata.address,
        querydata.billingaddress,
        querydata.billingaddressname,
        querydata.gstno,
        stype,
        querydata.emailid,
        querydata.contactno,
        querydata.branchid,
      ]
    );
    // console.log(sql1);
    const startDate = await helper.formatDateToSQL(querydata.startdate);
    const endDate = await helper.formatDateToSQL(querydata.enddate);
    if (querydata.hasOwnProperty("subscriptionid")) {
      const sql = await db.query1(
        `
  UPDATE subscriptioncustomertrans
  SET
    billing_plan          = ?,
    Bill_mode             = ?,
    from_date             = ?,   -- DATETIME as string or JS Date
    to_date               = ?,
    Amount                = ?,
    billingperiod         = ?,
    Subscription_ID       = ?,
    customer_address      = ?,
    clientaddress_name    = ?,
    billing_address       = ?,
    billingaddress_name   = ?,   -- wrap text fields consistently
    billing_gst           = ?,
    branchcode            = ?
  WHERE Branch_id = ?
`,
        [
          querydata.billingplan,
          querydata.billmode,
          startDate, // e.g. '2025-06-01 00:00:00' or Date object
          endDate, // e.g. '2025-06-30 00:00:00'
          querydata.amount,
          querydata.billingperiod,
          querydata.subscriptionid,
          querydata.address,
          querydata.clientaddressname,
          querydata.billingaddress,
          querydata.billingaddressname,
          querydata.gstno,
          querydata.branchcode,
          querydata.branchid,
        ]
      );
    }
    return helper.getSuccessResponse(
      true,
      "success",
      "Company details updated successfully",
      querydata.branchid,
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
async function SendPdf(admin) {
  try {
    var secret;

    // Check if the session token exists
    if (!admin.STOKEN) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token missing. Please provide the Login session token",
        "SEND PDF",
        ""
      );
    }
    secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
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
      [admin.STOKEN]
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
    if (!admin.querystring) {
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
      querydata = await helper.decrypt(admin.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "SEND PDF",
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
        pdfpath,
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
                pdfpath: pdfpath,
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
          pdfpath,
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
                  pdfpath: pdfpath,
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

//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################

async function UpdateSubscription(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "UPDATE SUBSCRIPTION",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "UPDATE SUBSCRIPTION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "UPDATE SUBSCRIPTION",
        secret
      );
    }
    var sql;
    if (!admin.hasOwnProperty("querystring") && admin.querystring == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "UPDATE SUBSCRIPTION",
        admin.Secret
      );
    }
    try {
      querydata = await helper.decrypt(admin.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "UPDATE SUBSCRIPTION",
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
        "UPDATE SUBSCRIPTION",
        secret
      );
    }
    const requiredFields = [
      { field: "subscriptionName", message: "Subscription name missing." },
      { field: "noOfDevice", message: " Number of devices missing." },
      { field: "noOfCameras", message: "Number of Cameras missing." },
      {
        field: "AdditionalCameraCharges",
        message: "Additional Camera charges missing.",
      },
      { field: "amount", message: "Subscription amount missing." },
      {
        field: "productDescription",
        message: "Product description missing.",
      },
      { field: "subId", message: "Subscription ID missing." },
    ];

    for (const { field, message } of requiredFields) {
      if (!querydata.hasOwnProperty(field)) {
        return helper.getErrorResponse(
          false,
          "error",
          message,
          "UPDATE SUBSCRIPTION",
          secret
        );
      }
    }
    sql = await db.query1(
      `UPDATE subscriptionmaster
         SET
           Subscription_Name = ?,
           No_of_Devices = ?,
           No_of_Cameras = ?,
           Addl_cameras = ?,
           Amount = ?,
           product_desc = ?,
           Created_by = ?
         WHERE Subscription_ID = ?`,
      [
        querydata.subscriptionName,
        querydata.noOfDevice,
        querydata.noOfCameras,
        querydata.AdditionalCameraCharges,
        querydata.amount,
        querydata.productDescription,
        userid,
        querydata.subId,
      ]
    );

    if (sql.affectedRows > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription updated Successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Error in updating subscription",
        sql,
        secret
      );
    }
  } catch (er) {
    console.log(JSON.stringify(er));
    if (er.code == "ER_DUP_ENTRY") {
      return helper.getErrorResponse(
        false,
        "error",
        "Package name already exists",
        sql,
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
//###############################################################################################################################################################################################
//###############################################################################################################################################################################################
async function DeleteSubscription(admin) {
  try {
    // Check if the session token exists
    if (!admin.hasOwnProperty("STOKEN")) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken missing. Please provide the Login sessiontoken",
        "DELETE SUBSCRIPTION",
        ""
      );
    }
    var secret = admin.STOKEN.substring(0, 16);
    var querydata;

    // Validate session token length
    if (admin.STOKEN.length > 50 || admin.STOKEN.length < 30) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login session token size invalid. Please provide the valid Session token",
        "DELETE SUBSCRIPTION",
        secret
      );
    }

    // Validate session token
    const [result] = await db.spcall(
      "CALL SP_STOKEN_CHECK(?,@result); SELECT @result;",
      [admin.STOKEN]
    );
    const objectvalue = result[1][0];
    const userid = objectvalue["@result"];

    if (userid == null) {
      return helper.getErrorResponse(
        false,
        "error",
        "Login sessiontoken Invalid. Please provide the valid sessiontoken",
        "DELETE SUBSCRIPTION",
        secret
      );
    }

    if (!admin.hasOwnProperty("querystring") && admin.querystring == "") {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring missing. Please provide the querystring",
        "DELETE SUBSCRIPTION",
        admin.Secret
      );
    }
    try {
      querydata = await helper.decrypt(admin.querystring, secret);
    } catch (ex) {
      return helper.getErrorResponse(
        false,
        "error",
        "Querystring Invalid error. Please provide the valid querystring.",
        "DELETE SUBSCRIPTION",
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
        "DELETE SUBSCRIPTION",
        secret
      );
    }

    // Validate required fields
    if (!querydata.hasOwnProperty("subId") || !querydata.subId) {
      return helper.getErrorResponse(
        false,
        "error",
        "Subscription ID(s) missing. Please provide a valid ID or array of IDs.",
        "DELETE SUBSCRIPTIONS",
        secret
      );
    }

    // Ensure subId is always an array, even if a single ID is provided
    const subIdArray = Array.isArray(querydata.subId)
      ? querydata.subId
      : [querydata.subId];

    // Format list of IDs for SQL query
    const subIdList = subIdArray.map((id) => `'${id}'`).join(",");

    const sql = await db.query1(
      `DELETE FROM subscriptionmaster WHERE Subscription_ID IN (${subIdList})`
    );

    if (sql.affectedRows > 0) {
      return helper.getSuccessResponse(
        true,
        "success",
        "Subscription deleted Successfully",
        sql,
        secret
      );
    } else {
      return helper.getErrorResponse(
        false,
        "error",
        "Invalid subscription ID",
        sql,
        secret
      );
    }
  } catch (er) {
    console.log(JSON.stringify(er));
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
  GetCustomerDetails,
  Login,
  SendEmailWhatsapp,
  ForgotPassword,
  verifyOTP,
  changepassword,
  Register,
  OrganizationList,
  OrgList,
  CompanyList,
  GetCompany,
  BranchList,
  GetBranchList,
  UploadLogo,
  CustomSendPdf,
  CreateSubscription,
  GetSubscription,
  AddUpdateCompany,
  UpdateOrganization,
  UpdateBranch,
  SendPdf,
  UpdateSubscription,
  DeleteSubscription,
};
