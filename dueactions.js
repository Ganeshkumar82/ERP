const cron = require("node-cron");
const db = require("./db");
const mailer = require("./mailer");

const testEmail = "kishorekkumar34@gmail.com"; // Use your real email here

// Fetch vouchers by a dynamic condition
async function getVouchers(condition) {
  const query = `
    SELECT 
      voucher_id, invoice_number, voucher_type, name, email_id, Phone_number,
      client_name, Client_address, billdetails, pending_amount, fully_cleared,
      partially_cleared, status, Row_updated_date, gstnumber, Total_amount,
      sub_total, IGST, CGST, SGST, created_at, invoice_type, Customer_id,
      payment_details, Cleared_date, paid_amount, Description, Due_date
    FROM clientvouchermaster
    WHERE ${condition}
  `;
  return db.query(query);
}

// Send mail with correct formatting
async function sendVoucherEmail(voucher, type) {
  if (voucher.fully_cleared == 1) return;

  const pendingAmount = voucher.partially_cleared == 1
    ? voucher.Total_amount - voucher.paid_amount
    : voucher.Total_amount;

  let subject = "";
  let tag = "";

  switch (type) {
    case "REM":
      subject = `Payment Reminder: Invoice ${voucher.invoice_number} due in 3 days`;
      tag = "REM";
      break;
    case "DUE":
      subject = `Payment Due Today: ${voucher.invoice_number}`;
      tag = "DUE";
      break;
    case "OVERDUE":
      subject = `Payment Overdue: ${voucher.invoice_number}`;
      tag = "OVERDUE";
      break;
  }

  try {
    const result = await mailer.sendDueActionEmail(
      voucher.name,
      testEmail,
      subject,
      tag,
      voucher.invoice_number,
      voucher.Due_date ? voucher.Due_date.toISOString().slice(0, 10) : "",
      voucher.Total_amount,
      voucher.paid_amount || 0,
      pendingAmount
    );
    console.log(`[${tag}] Email sent for ${voucher.invoice_number}:`, result);
  } catch (err) {
    console.error(`[${tag}] Failed to send email for ${voucher.invoice_number}:`, err);
  }
}

// Core processor
async function processVouchers(condition, type) {
  const vouchers = await getVouchers(condition);
  console.log(`[${type}] Vouchers found: ${vouchers.length}`);

  if (vouchers.length === 0) {
    console.log(`[${type}] No vouchers to process.`);
    return;
  }

  for (const voucher of vouchers) {
    await sendVoucherEmail(voucher, type);
  }

  console.log(`[${type}] Done processing ${vouchers.length} vouchers.`);
}

// Date helpers
function getTodayStr(offset = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

// // --- Run immediately ---
// (async () => {
//   await processVouchers(
//     `DATE(Due_date) = '${getTodayStr(3)}' AND fully_cleared = 0`,
//     "REM"
//   );
//   await processVouchers(
//     `DATE(Due_date) = '${getTodayStr()}' AND fully_cleared = 0`,
//     "DUE"
//   );
//   await processVouchers(
//     `DATE(Due_date) < '${getTodayStr()}' AND fully_cleared = 0`,
//     "OVERDUE"
//   );
// })();

// --- CRON: 10:00 AM Daily - 3 Days Before (REM) ---
cron.schedule("0 10 * * *", async () => {
  await processVouchers(
    `DATE(Due_date) = '${getTodayStr(3)}' AND fully_cleared = 0`,
    "REM"
  );
});

// --- CRON: 10:00 AM Daily - Due Today ---
cron.schedule("0 10 * * *", async () => {
  await processVouchers(
    `DATE(Due_date) = '${getTodayStr()}' AND fully_cleared = 0`,
    "DUE"
  );
});

// --- CRON: 10:05 AM Daily - Overdue ---
cron.schedule("5 10 * * *", async () => {
  await processVouchers(
    `DATE(Due_date) < '${getTodayStr()}' AND fully_cleared = 0`,
    "OVERDUE"
  );
});

module.exports = {};
