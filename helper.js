const crypto = require("crypto");
const db = require("./db");
const fs = require("fs");

async function encrypt(text, secret) {
  const cipher = crypto.createCipheriv("aes-128-cbc", secret, secret);
  let encrypted = cipher.update(text, "utf8", "base64");
  encrypted += cipher.final("base64");
  return encrypted;
}

async function decrypt(encrypted, secret) {
  const decipher = crypto.createDecipheriv("aes-128-cbc", secret, secret);
  let decrypted = decipher.update(encrypted, "base64", "utf8");
  return decrypted + decipher.final("utf8");
}

async function getFinancialYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1; // 0-based in JS

  if (month >= 4) {
    // April to December
    return `${year}-${year + 1}`;
  } else {
    // January to March
    return `${year - 1}-${year}`;
  }
}

async function getSuccessResponse(code, status, message, data, secret) {
  try {
    if (secret != null && secret != "") {
      const returnstr = JSON.stringify({ code, status, message, data });
      encryptedResponse = await encrypt(returnstr, secret);
      return { encryptedResponse };
    } else if (data == null && data == "") {
      if (secret != null && secret != "") {
        const returnstr = JSON.stringify({ code, status, message });
        encryptedResponse = await encrypt(returnstr, secret);
        return { encryptedResponse };
      } else {
        return { code, status, message };
      }
    } else {
      return { code, status, message, data };
    }
  } catch (er) {
    return { code, status, message, data };
  }
}

async function getErrorResponse(code, status, message, data, secret) {
  try {
    if (secret != null && secret != "") {
      var encryptedResponse = JSON.stringify({ code, status, message, data });
      encryptedResponse = await encrypt(encryptedResponse, secret);
      return { encryptedResponse };
    } else {
      return { code, status, message, data };
    }
  } catch (er) {
    return { code, status, message, data };
  }
}

async function checkAPIKey(apikey, apisecret) {
  const [result1] = await db.spcall(
    "CALL SP_API_CHECK(?,?,@isValid);select @isValid;",
    [apikey, apisecret]
  );
  const objectValue = result1[1][0];

  if (objectValue["@isValid"] == null) {
    const IsValidAPI = JSON.stringify(0);
    return { IsValidAPI };
  } else {
    const IsValidAPI = JSON.stringify(1);
    return { IsValidAPI };
  }
}

async function getServerSetting(moduletag) {
  try {
    const result = await db.query(
      "SELECT setting_value FROM serversettings WHERE setting_name = ?;",
      [moduletag]
    );

    // console.log("helper->getServerSetting->", result[0]?.setting_value);

    if (result[0]) {
      const SettingValueStr = result[0].setting_value;

      const SettingValue = await decrypt(SettingValueStr, "SporadaSecure@23");
      // console.log("SettingValue after decrypt =>", SettingValue);

      return { SettingValue };
    } else {
      const errormessage =
        "Error occurred in modulename. No Error description.";
      return { errorcode: "500", errormessage };
    }
  } catch (error) {
    console.error("Error in getServerSetting:", error);
    throw error;
  }
}

async function phonenumber(phonener) {
  var phonePattern1 = /^[0-9]{10}$/; // Matches 10-digit phone numbers.
  var phonePattern2 = /^\+\d{1,3}\s?\d{10}$/;
  if (phonePattern1.test(phonener) || phonePattern2.test(phonener)) {
    return true;
  } else {
    return false;
  }
}

async function convertFileToBinary(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function formatDateToSQL(dateString) {
  const date = new Date(dateString);
  return date.toISOString().slice(0, 19).replace("T", " ");
}
module.exports = {
  encrypt,
  decrypt,
  getSuccessResponse,
  getErrorResponse,
  checkAPIKey,
  getServerSetting,
  phonenumber,
  convertFileToBinary,
  formatDateToSQL,
  getFinancialYear,
};
