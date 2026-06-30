const hbs = require("nodemailer-express-handlebars");
const nodemailer = require("nodemailer");
const path = require("path");
const helper = require("./helper");

const config = require("./config");

async function sendPDF(
  senderName,
  senderEmail,
  subjectstr,
  emailtemplate,
  emailLink,
  moduletag,
  filepaths,
  pname,
  pbillingcycle,
  pfeatures
) {
  try {
    // initialize nodemailer
    var queryData;
    try {
      console.log("emailtemplate ->" + emailtemplate);
      console.log("moduletag=>", moduletag);
      const settingValue = await helper.getServerSetting(moduletag);
      queryData = JSON.stringify(settingValue);
      console.log("queryData=>" + queryData);
    } catch (ex) {
      console.log("ex=>", { ex });
      return helper.getErrorResponse(moduletag + "_ERROR");
    }
    const mstr = JSON.parse(queryData);
    const SettingValue = JSON.parse(mstr.SettingValue);

    console.log("queryData.SettingValue=>" + SettingValue);
    const qEmail = SettingValue.Email;
    console.log("qEmail=>" + qEmail);
    const qpassword = SettingValue.password;
    console.log("qpassword=>" + qpassword);
    console.log("senderEmail=>" + senderEmail);
    const qFromName = SettingValue.FromName;
    console.log("qFromName=>" + qFromName);
    const qTemplate = SettingValue.Template;
    console.log("qTemplate=>" + qTemplate);
    const qSMTPSecure = SettingValue.SMTPSecure;
    console.log("qSMTPSecure=>" + qSMTPSecure);
    const qHost = SettingValue.host;
    console.log("qHost=>" + qHost);
    const qPort = SettingValue.Port;
    console.log("qPort=>" + qPort);
    var bSSL = false;
    if (qSMTPSecure == "true") bSSL = true;

    var transporter = nodemailer.createTransport({
      host: qHost,
      port: qPort,
      secure: true, // upgrade later with STARTTLS
      auth: {
        user: qEmail,
        pass: qpassword,
      },
      debug: true,
    });

    // point to the template folder
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };

    const attachments = Array.isArray(filepaths)
      ? filepaths.map((filepath) => ({
          filename: path.basename(filepath),
          path: path.resolve(filepath), // For multiple files, map to attachment objects
        }))
      : [
          {
            filename: path.basename(filepaths),
            path: path.resolve(filepaths), // For a single file, create a single attachment object
          },
        ];
    // use a template file with nodemailer
    transporter.use("compile", hbs(handlebarOptions));

    var mailOptions = {
      from: '"' + qFromName + '" <' + qEmail + ">", // sender address
      to: senderEmail, // list of receivers
      subject: subjectstr,
      template: qTemplate, // the name of the template file i.e email.handlebars
      context: {
        subject: subjectstr,
        name: senderName, // replace {{name}} with Adebola
        link: emailLink, // replace {{name}} with Adebola
        product: pname, // replace {{name}} with Adebola
        billingcycle: pbillingcycle, // replace {{name}} with Adebola
        productfeatures: pfeatures,
      },
      attachments: attachments,
    };

    // trigger the sending of the E-mail
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Error sending email:", error);
          resolve(false);
        } else {
          console.log("Message sent: " + info.response);
          resolve(true);
        }
      });
    });
  } catch (er) {
    console.log(`error sending mail -> ${er}`);
    return false;
  }
}

async function sendEmail(
  senderName,
  senderEmail,
  subjectstr,
  emailtemplate,
  emailLink,
  moduletag,
  pname = "",
  pbillingcycle = "",
  pfeatures = ""
) {
  // initialize nodemailer
  var queryData;
  try {
    console.log("emailtemplate ->" + emailtemplate);
    console.log("moduletag=>", moduletag);
    const settingValue = await helper.getServerSetting(moduletag);
    queryData = JSON.stringify(settingValue);
    console.log("queryData=>" + queryData);
  } catch (ex) {
    console.log("ex=>", { ex });
    return helper.getErrorResponse(moduletag + "_ERROR");
  }
  const mstr = JSON.parse(queryData);
  const SettingValue = JSON.parse(mstr.SettingValue);

  console.log("queryData.SettingValue=>" + SettingValue);
  const qEmail = SettingValue.Email;
  console.log("qEmail=>" + qEmail);
  const qpassword = SettingValue.password;
  console.log("qpassword=>" + qpassword);
  console.log("senderEmail=>" + senderEmail);
  const qFromName = SettingValue.FromName;
  console.log("qFromName=>" + qFromName);
  const qTemplate = SettingValue.Template;
  console.log("qTemplate=>" + qTemplate);
  const qSMTPSecure = SettingValue.SMTPSecure;
  console.log("qSMTPSecure=>" + qSMTPSecure);
  const qHost = SettingValue.host;
  console.log("qHost=>" + qHost);
  const qPort = SettingValue.Port;
  console.log("qPort=>" + qPort);
  var bSSL = false;
  if (qSMTPSecure == "true") bSSL = true;

  var transporter = nodemailer.createTransport({
    host: qHost,
    port: qPort,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: qEmail,
      pass: qpassword,
    },
  });

  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views/"),
  };

  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));

  var mailOptions = {
    from: '"' + qFromName + '" <' + qEmail + ">", // sender address
    to: senderEmail, // list of receivers
    subject: subjectstr,
    template: qTemplate, // the name of the template file i.e email.handlebars
    context: {
      name: senderName, // replace {{name}} with Adebola
      otp: emailLink, // replace {{name}} with Adebola
      product: pname, // replace {{name}} with Adebola
      billingcycle: pbillingcycle, // replace {{name}} with Adebola
      productfeatures: pfeatures,
    },
  };

  // trigger the sending of the E-mail
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
        resolve(false);
      } else {
        console.log("Message sent: " + info.response);
        resolve(true);
      }
    });
  });
}

async function sendapprovequotation(
  senderName,
  senderEmail,
  subjectstr,
  emailtemplate,
  emailLink,
  moduletag,
  pname,
  pbillingcycle,
  RejectLink,
  filepaths,
  ccemail,
  pfeatures = ""
) {
  // initialize nodemailer
  var queryData;
  try {
    console.log("emailtemplate ->" + emailtemplate);
    console.log("moduletag=>", moduletag);
    const settingValue = await helper.getServerSetting(moduletag);
    queryData = JSON.stringify(settingValue);
    console.log("queryData=>" + queryData);
  } catch (ex) {
    console.log("ex=>", { ex });
    return helper.getErrorResponse(moduletag + "_ERROR");
  }
  const mstr = JSON.parse(queryData);
  const SettingValue = JSON.parse(mstr.SettingValue);

  console.log("queryData.SettingValue=>" + SettingValue);
  const qEmail = SettingValue.Email;
  console.log("qEmail=>" + qEmail);
  const qpassword = SettingValue.password;
  console.log("qpassword=>" + qpassword);
  console.log("senderEmail=>" + senderEmail);
  const qFromName = SettingValue.FromName;
  console.log("qFromName=>" + qFromName);
  const qTemplate = SettingValue.Template;
  console.log("qTemplate=>" + qTemplate);
  const qSMTPSecure = SettingValue.SMTPSecure;
  console.log("qSMTPSecure=>" + qSMTPSecure);
  const qHost = SettingValue.host;
  console.log("qHost=>" + qHost);
  const qPort = SettingValue.Port;
  console.log("qPort=>" + qPort);
  var bSSL = false;
  if (qSMTPSecure == "true") bSSL = true;

  var transporter = nodemailer.createTransport({
    host: qHost,
    port: qPort,
    secure: true, // upgrade later with STARTTLS
    auth: {
      user: qEmail,
      pass: qpassword,
    },
    debug: true,
  });

  // point to the template folder
  const handlebarOptions = {
    viewEngine: {
      partialsDir: path.resolve("./views/"),
      defaultLayout: false,
    },
    viewPath: path.resolve("./views/"),
  };
  const attachments = Array.isArray(filepaths)
    ? filepaths.map((filepath) => ({
        filename: path.basename(filepath),
        path: path.resolve(filepath), // For multiple files, map to attachment objects
      }))
    : [
        {
          filename: path.basename(filepaths),
          path: path.resolve(filepaths), // For a single file, create a single attachment object
        },
      ];

  // use a template file with nodemailer
  transporter.use("compile", hbs(handlebarOptions));

  var mailOptions = {
    from: '"' + qFromName + '" <' + qEmail + ">", // sender address
    to: senderEmail, // list of receivers
    cc: ccemail && ccemail.trim() !== "" ? ccemail : undefined,
    subject: subjectstr,
    template: qTemplate, // the name of the template file i.e email.handlebars
    context: {
      subject: subjectstr,
      name: senderName, // replace {{name}} with Adebola
      link: emailLink, // replace {{name}} with Adebola
      product: pname, // replace {{name}} with Adebola
      billingcycle: pbillingcycle, // replace {{name}} with Adebola
      productfeatures: pfeatures,
      link1: RejectLink,
    },
    attachments: attachments,
  };

  // trigger the sending of the E-mail
  return new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.error("Error sending email:", error);
        resolve(false);
      } else {
        console.log("Message sent: " + info.response);
        resolve(true);
      }
    });
  });
}

async function sendInvoice(
  senderName,
  senderEmail,
  subjectstr,
  emailtemplate,
  emailLink,
  moduletag,
  filepaths,
  invoice_number,
  invoice_date,
  invoice_amount,
  ccemail,
  feedback
) {
  try {
    // initialize nodemailer
    var queryData;
    try {
      console.log("emailtemplate ->" + emailtemplate);
      console.log("moduletag=>", moduletag);
      const settingValue = await helper.getServerSetting(moduletag);
      queryData = JSON.stringify(settingValue);
      console.log("queryData=>" + queryData);
    } catch (ex) {
      console.log("ex=>", { ex });
      return helper.getErrorResponse(moduletag + "_ERROR");
    }
    const mstr = JSON.parse(queryData);
    const SettingValue = JSON.parse(mstr.SettingValue);

    console.log("queryData.SettingValue=>" + SettingValue);
    const qEmail = SettingValue.Email;
    console.log("qEmail=>" + qEmail);
    const qpassword = SettingValue.password;
    console.log("qpassword=>" + qpassword);
    console.log("senderEmail=>" + senderEmail);
    const qFromName = SettingValue.FromName;
    console.log("qFromName=>" + qFromName);
    const qTemplate = SettingValue.Template;
    console.log("qTemplate=>" + qTemplate);
    const qSMTPSecure = SettingValue.SMTPSecure;
    console.log("qSMTPSecure=>" + qSMTPSecure);
    const qHost = SettingValue.host;
    console.log("qHost=>" + qHost);
    const qPort = SettingValue.Port;
    console.log("qPort=>" + qPort);
    var bSSL = false;
    if (qSMTPSecure == "true") bSSL = true;

    var transporter = nodemailer.createTransport({
      host: qHost,
      port: qPort,
      secure: true, // upgrade later with STARTTLS
      auth: {
        user: qEmail,
        pass: qpassword,
      },
      debug: true,
    });

    // point to the template folder
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };

    const normalizeFilePaths = (filepaths) => {
      if (Array.isArray(filepaths)) {
        return filepaths;
      }

      if (typeof filepaths === "string") {
        // Handle comma-separated strings
        if (filepaths.includes(",")) {
          return filepaths.split(",").map((p) => p.trim());
        }
        return [filepaths.trim()];
      }

      return []; // fallback if filepaths is undefined or not in expected format
    };

    const normalizedPaths = normalizeFilePaths(filepaths);

    const attachments = normalizedPaths.map((filepath) => ({
      filename: path.basename(filepath),
      path: path.resolve(filepath),
    }));
    // use a template file with nodemailer
    transporter.use("compile", hbs(handlebarOptions));

    var mailOptions = {
      from: '"' + qFromName + '" <' + qEmail + ">", // sender address
      to: senderEmail, // list of receivers
      subject: subjectstr,
      cc: ccemail && ccemail.trim() !== "" ? ccemail : undefined,
      template: qTemplate, // the name of the template file i.e email.handlebars
      context: {
        subject: subjectstr,
        name: senderName, // replace {{name}} with Adebola
        link: emailLink, // replace {{name}} with Adebola
        invoice_number: invoice_number, // replace {{name}} with Adebola
        invoice_date: invoice_date, // replace {{name}} with Adebola
        invoice_amount: invoice_amount,
        notes: feedback && feedback.trim() !== "" ? feedback : null,
      },
      attachments: attachments,
    };

    // trigger the sending of the E-mail
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Error sending email:", error);
          resolve(false);
        } else {
          console.log("Message sent: " + info.response);
          resolve(true);
        }
      });
    });
  } catch (er) {
    console.log(`error sending mail -> ${er}`);
    return false;
  }
}

async function sendRecurredInvoice(
  senderName,
  senderEmail,
  subjectstr,
  emailtemplate,
  emailLink,
  moduletag,
  filepaths,
  invoice_number,
  invoice_date,
  invoice_amount,
  ccemail,
  feedback,
  billperiod,
  duedate
) {
  try {
    // initialize nodemailer
    var queryData;
    try {
      // console.log("emailtemplate ->" + emailtemplate);
      // console.log("moduletag=>", moduletag);
      const settingValue = await helper.getServerSetting(moduletag);
      queryData = JSON.stringify(settingValue);
      // console.log("queryData=>" + queryData);
    } catch (ex) {
      console.log("ex=>", { ex });
      return helper.getErrorResponse(moduletag + "_ERROR");
    }
    const mstr = JSON.parse(queryData);
    const SettingValue = JSON.parse(mstr.SettingValue);

    // console.log("queryData.SettingValue=>" + SettingValue);
    const qEmail = SettingValue.Email;
    // console.log("qEmail=>" + qEmail);
    const qpassword = SettingValue.password;
    // console.log("qpassword=>" + qpassword);
    // console.log("senderEmail=>" + senderEmail);
    const qFromName = SettingValue.FromName;
    // console.log("qFromName=>" + qFromName);
    const qTemplate = SettingValue.Template;
    // console.log("qTemplate=>" + qTemplate);
    const qSMTPSecure = SettingValue.SMTPSecure;
    // console.log("qSMTPSecure=>" + qSMTPSecure);
    const qHost = SettingValue.host;
    // console.log("qHost=>" + qHost);
    const qPort = SettingValue.Port;
    // console.log("qPort=>" + qPort);
    var bSSL = false;
    if (qSMTPSecure == "true") bSSL = true;

    var transporter = nodemailer.createTransport({
      host: qHost,
      port: qPort,
      secure: true, // upgrade later with STARTTLS
      auth: {
        user: qEmail,
        pass: qpassword,
      },
      debug: true,
    });

    // point to the template folder
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };

    const normalizeFilePaths = (filepaths) => {
      if (Array.isArray(filepaths)) {
        return filepaths;
      }

      if (typeof filepaths === "string") {
        // Handle comma-separated strings
        if (filepaths.includes(",")) {
          return filepaths.split(",").map((p) => p.trim());
        }
        return [filepaths.trim()];
      }

      return []; // fallback if filepaths is undefined or not in expected format
    };

    const normalizedPaths = normalizeFilePaths(filepaths);

    const attachments = normalizedPaths.map((filepath) => ({
      filename: path.basename(filepath),
      path: path.resolve(filepath),
    }));
    // use a template file with nodemailer
    transporter.use("compile", hbs(handlebarOptions));

    var mailOptions = {
      from: '"' + qFromName + '" <' + qEmail + ">", // sender address
      to: "kishorekkumar34@gmail.com",
      // to: senderEmail, // list of receivers
      subject: subjectstr,
      // cc:
      //   ccemail && ccemail.trim() !== ""
      //     ? [ccemail.trim(), "sales@sporadasecure.com"]
      //     : ["sales@sporadasecure.com"],
      bcc: "kishorekkumar34@gmail.com",
      template: qTemplate, // the name of the template file i.e email.handlebars
      context: {
        subject: subjectstr,
        name: senderName, // replace {{name}} with Adebola
        link: emailLink, // replace {{name}} with Adebola
        invoice_number: invoice_number, // replace {{name}} with Adebola
        invoice_date: invoice_date, // replace {{name}} with Adebola
        invoice_amount: invoice_amount,
        billperiod: billperiod,
        duedate: duedate,
        notes: feedback && feedback.trim() !== "" ? feedback : null,
      },
      attachments: attachments,
    };

    // trigger the sending of the E-mail
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Error sending email:", error);
          resolve(false);
        } else {
          console.log("Message sent: " + info.response);
          resolve(true);
        }
      });
    });
  } catch (er) {
    console.log(`error sending mail -> ${er}`);
    return false;
  }
}

async function sendQuotation(
  senderName,
  senderEmail,
  subjectstr,
  emailtemplate,
  emailLink,
  moduletag,
  filepaths,
  feedback,
  ccemail,
  approvelink,
  rejectlink
) {
  try {
    // initialize nodemailer
    var queryData;
    try {
      console.log("emailtemplate ->" + emailtemplate);
      console.log("moduletag=>", moduletag);
      const settingValue = await helper.getServerSetting(moduletag);
      queryData = JSON.stringify(settingValue);
      console.log("queryData=>" + queryData);
    } catch (ex) {
      console.log("ex=>", { ex });
      return helper.getErrorResponse(moduletag + "_ERROR");
    }
    const mstr = JSON.parse(queryData);
    const SettingValue = JSON.parse(mstr.SettingValue);

    console.log("queryData.SettingValue=>" + SettingValue);
    const qEmail = SettingValue.Email;
    console.log("qEmail=>" + qEmail);
    const qpassword = SettingValue.password;
    console.log("qpassword=>" + qpassword);
    console.log("senderEmail=>" + senderEmail);
    const qFromName = SettingValue.FromName;
    console.log("qFromName=>" + qFromName);
    const qTemplate = SettingValue.Template;
    console.log("qTemplate=>" + qTemplate);
    const qSMTPSecure = SettingValue.SMTPSecure;
    console.log("qSMTPSecure=>" + qSMTPSecure);
    const qHost = SettingValue.host;
    console.log("qHost=>" + qHost);
    const qPort = SettingValue.Port;
    console.log("qPort=>" + qPort);
    var bSSL = false;
    if (qSMTPSecure == "true") bSSL = true;

    var transporter = nodemailer.createTransport({
      host: qHost,
      port: qPort,
      secure: true, // upgrade later with STARTTLS
      auth: {
        user: qEmail,
        pass: qpassword,
      },
      debug: true,
    });

    // point to the template folder
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };

    const attachments = Array.isArray(filepaths)
      ? filepaths.map((filepath) => ({
          filename: path.basename(filepath),
          path: path.resolve(filepath), // For multiple files, map to attachment objects
        }))
      : [
          {
            filename: path.basename(filepaths),
            path: path.resolve(filepaths), // For a single file, create a single attachment object
          },
        ];
    // use a template file with nodemailer
    transporter.use("compile", hbs(handlebarOptions));

    var mailOptions = {
      from: '"' + qFromName + '" <' + qEmail + ">", // sender address
      to: senderEmail, // list of receivers
      cc: ccemail && ccemail.trim() !== "" ? ccemail : undefined,
      bcc: "ganeshkumar.m@sporadasecure.com",
      subject: subjectstr,
      template: qTemplate, // the name of the template file i.e email.handlebars
      context: {
        subject: subjectstr,
        name: senderName, // replace {{name}} with Adebola
        link: approvelink, // replace {{name}} with Adebola
        link1: rejectlink,
        notes: feedback && feedback.trim() !== "" ? feedback : null,
      },
      attachments: attachments,
    };

    // trigger the sending of the E-mail
    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Error sending email:", error);
          resolve(false);
        } else {
          console.log("Message sent: " + info.response);
          resolve(true);
        }
      });
    });
  } catch (er) {
    console.log(`error sending mail -> ${er}`);
    return false;
  }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

async function sendDueActionEmail(
  recipientName,
  recipientEmail,
  subject,
  moduleTag, // <-- Pass 'DUE' or 'OVERDUE'
  invoiceNumber,
  dueDate,
  totalAmount,
  paidAmount,
  pendingAmount
) {
  try {
    // Fetch mail server settings using the module tag
    const settingValue = await helper.getServerSetting(moduleTag);
    const SettingValue = JSON.parse(
      JSON.parse(JSON.stringify(settingValue)).SettingValue
    );

    const transporter = nodemailer.createTransport({
      host: SettingValue.host,
      port: SettingValue.Port,
      secure: true,
      auth: {
        user: SettingValue.Email,
        pass: SettingValue.password,
      },
      debug: true,
    });

    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };

    transporter.use("compile", hbs(handlebarOptions));

    const mailOptions = {
      from: `"${SettingValue.FromName}" <${SettingValue.Email}>`,
      to: recipientEmail,
      subject: subject,
      template: SettingValue.Template.replace(".html", ""), // remove .html if needed
      context: {
        name: recipientName,
        product: invoiceNumber,
        productfeatures: [
          { label: "Total Amount", value: totalAmount },
          { label: "Paid Amount", value: paidAmount },
          { label: "Pending Amount", value: pendingAmount },
          { label: "Due Date", value: dueDate },
        ],
      },
    };

    return new Promise((resolve, reject) => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.error("Error sending due action email:", error);
          resolve(false);
        } else {
          console.log("Due action message sent: " + info.response);
          resolve(true);
        }
      });
    });
  } catch (er) {
    console.log(`error sending due action mail -> ${er}`);
    return false;
  }
}

async function sendVoucherClearedEmail(
  recipientName,
  recipientEmail,
  subject,
  invoiceNumber,
  clearedDate,
  totalAmount,
  tdsAmount,
  gstAmount,
  cgstAmount,
  sgstAmount,
  igstAmount,
  receipt_path
) {
  try {
    const settingValueRaw = await helper.getServerSetting("VOUCHERCLEARED");
    const settingValue = JSON.parse(settingValueRaw?.SettingValue || "{}");

    const transporter = nodemailer.createTransport({
      host: settingValue.host,
      port: settingValue.Port,
      secure: true,
      auth: {
        user: settingValue.Email,
        pass: settingValue.password,
      },
      debug: true,
    });

    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };

    transporter.use("compile", hbs(handlebarOptions));

    const mailOptions = {
      from: `"${settingValue.FromName}" <${settingValue.Email}>`,
      to: recipientEmail,
      subject,
      template: settingValue.Template?.replace(".html", ""),
      context: {
        name: recipientName,
        invoice_number: invoiceNumber,
        cleared_date: clearedDate,
        total_amount: totalAmount,
        tds_amount: tdsAmount,
        gst_amount: gstAmount,
        cgst_amount: cgstAmount,
        sgst_amount: sgstAmount,
        igst_amount: igstAmount,
        message: "Your voucher has been cleared successfully.",
      },
    };

    // Attach receipt if it exists
    if (receipt_path) {
      mailOptions.attachments = [
        {
          filename: path.basename(receipt_path),
          path: receipt_path,
        },
      ];
    }

    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending voucher cleared email:", error);
          resolve(false);
        } else {
          console.log("Voucher cleared message sent: " + info.response);
          resolve(true);
        }
      });
    });
  } catch (err) {
    console.error(`Error sending voucher cleared mail -> ${err}`);
    return false;
  }
}

async function sendConsolidatedClearedEmail(
  recipientName,
  recipientEmail,
  subject,
  invoiceNumbers,
  clearedDate,
  totalAmount,
  tdsAmount,
  igstAmount,
  cgstAmount,
  sgstAmount,
  receipt_path
) {
  try {
    const settingValue = await helper.getServerSetting("CONCLEARED");
    const SettingValue = JSON.parse(
      JSON.parse(JSON.stringify(settingValue)).SettingValue
    );

    const transporter = nodemailer.createTransport({
      host: SettingValue.host,
      port: SettingValue.Port,
      secure: true,
      auth: {
        user: SettingValue.Email,
        pass: SettingValue.password,
      },
      debug: true,
    });

    // Setup handlebars options
    const handlebarOptions = {
      viewEngine: {
        partialsDir: path.resolve("./views/"),
        defaultLayout: false,
      },
      viewPath: path.resolve("./views/"),
    };

    transporter.use("compile", hbs(handlebarOptions));

    const invoiceNums = Array.isArray(invoiceNumbers)
      ? invoiceNumbers
      : [invoiceNumbers];
    const totalGST = (igstAmount || 0) + (cgstAmount || 0) + (sgstAmount || 0);

    const mailOptions = {
      from: `"${SettingValue.FromName}" <${SettingValue.Email}>`,
      to: recipientEmail,
      subject: subject,
      template: SettingValue.Template.replace(".html", ""),
      context: {
        name: recipientName,
        email: recipientEmail,
        invoice_numbers: invoiceNums,
        cleared_date: clearedDate,
        total_amount: totalAmount,
        tds_amount: tdsAmount || 0,
        totalIGST: igstAmount || 0,
        totalCGST: cgstAmount || 0,
        totalSGST: sgstAmount || 0,
        totalGST,
        message: `Your consolidated voucher(s) for invoice(s) ${invoiceNums.join(
          ", "
        )} have been cleared on ${clearedDate}.`,
      },
      attachments: [],
    };

    if (receipt_path) {
      mailOptions.attachments.push({
        filename: path.basename(receipt_path),
        path: receipt_path,
      });
    }

    return new Promise((resolve) => {
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error("Error sending consolidated cleared email:", error);
          resolve(false);
        } else {
          console.log("Consolidated cleared message sent: " + info.response);
          resolve(true);
        }
      });
    });
  } catch (er) {
    console.log(`error sending consolidated cleared mail -> ${er}`);
    return false;
  }
}

module.exports = {
  sendPDF,
  sendEmail,
  sendapprovequotation,
  sendInvoice,
  sendRecurredInvoice,
  sendQuotation,
  sendVoucherClearedEmail,
  sendConsolidatedClearedEmail,
  sendDueActionEmail,
};
