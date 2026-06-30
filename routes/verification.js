const express = require("express");
const router = express.Router();
const db = require("../db");

router.get("/", async function (req, res, next) {
  try {
    const actoken = req.query.token;
    const email = req.query.email;
    if (!actoken) {
      return res.status(400).json({ error: "Missing or empty token" });
    }
    if (!email) {
      return res.status(400).json({ error: "Missing or empty email" });
    }

    const [result] = await db.spcall(
      "CALL SP_OTP_CHECK(?,?,?,@result);select @result;",
      [0, email, actoken]
    );
    const data = result[1][0];
    console.log("otp check ->" + data["@result"]);
    const otpresult = data["@result"];
    if (otpresult == 1) {
      const user = await db.query(
        `Update usermaster Set status =1 where email_id = '${email}'`
      );
      if (user.affectedRows) {
        res.status(200).json({ success: "Verification successful" });
      } else {
        res
          .status(400)
          .json({ error: "Error in verification. Please try again." });
      }
    } else {
      res
        .status(400)
        .json({ error: "Error in verification. Please try again." });
    }
  } catch (er) {
    console.error(er);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
