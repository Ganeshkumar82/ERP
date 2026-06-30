const config = require("./config");
const admin = require("./services/admin");
const WebSocket = require("ws");
const cron = require("node-cron");
const db = require("./db");
const helper = require("./helper");
const { format } = require("date-fns");
let socket = null;
let isConnected = false;
let interval = null; // Store interval to prevent duplicate jobs

function connectWebSocket() {
  socket = new WebSocket("ws://192.168.0.111:9091");

  socket.on("open", () => {
    console.log("Connected to WebSocket server");
    // sendInvoice();
    isConnected = true;
  });

  socket.on("message", async (data) => {
    console.log(`Message from server: ${data}`);
    await admin.SendEmailWhatsapp(data);
  });

  socket.on("close", () => {
    // console.log("WebSocket disconnected, attempting to reconnect...");
    isConnected = false;
    reconnectWebSocket();
  });

  socket.on("error", (error) => {
    // console.error("WebSocket error:", error);
    isConnected = false;
  });
}

function reconnectWebSocket() {
  setTimeout(() => {
    if (!isConnected) {
      // console.log("Reconnecting WebSocket...");
      connectWebSocket();
    }
  }, 10000); // Retry connection every 5 seconds
}

async function sendInvoice() {
  if (isConnected) {
    const sql = await db.query(`
    WITH NumberedInvoices AS (
      SELECT
          sbm.*,
          ROW_NUMBER() OVER (
              PARTITION BY sbm.Branch_code, DATE_FORMAT(sbm.bill_date, '%Y-%m')
              ORDER BY sbm.subscription_billid
          ) AS invoice_sequence
      FROM subscriptionbillmaster sbm
      LEFT JOIN subscriptionbillgenerated sbg
          ON sbm.subscription_billid = sbg.subscription_billid
      WHERE sbm.Invoice_status = 0
        AND sbm.status = 1
        AND sbg.subscription_billid IS NULL
        AND sbm.bill_date = (
            SELECT MAX(bill_date)
            FROM subscriptionbillmaster sbm2
            WHERE sbm2.Site_list = sbm.Site_list
              AND sbm2.status = 1
        )
  )
  SELECT
  CONCAT(
    Branch_code, '/',
    DATE_FORMAT(
        CASE
            WHEN plantype = 'Prepaid' THEN bill_date
            WHEN plantype = 'Postpaid' THEN bill_date
            ELSE plantype
        END,
        '%y%m'
    ),
    LPAD(invoice_sequence, 2, '0')
  ) AS invoiceNo,
      bill_date ,
      IFNULL(gstPercent, 18) AS gstPercent,

      CASE
          WHEN EXISTS (
              SELECT 1
              FROM subscriptionbillmaster sbm2
              JOIN subscriptionbillgenerated sbg2
                ON sbm2.subscription_billid = sbg2.subscription_billid
              WHERE sbg2.payment_status IN(0,2) 
                AND sbm2.status = 1
                AND sbm2.subscription_billid <> sbm.subscription_billid
                AND sbm2.Site_list = sbm.Site_list
                AND DATE_FORMAT(sbm2.bill_date, '%Y-%m') < DATE_FORMAT(sbm.bill_date, '%Y-%m')
          ) THEN 1
          ELSE 0
      END AS isPending,
      JSON_OBJECT(
          'client_addressname', Client_addressname,
          'client_address', client_address,
          'billing_addressname', Billing_addressname,
          'billing_address', Billing_address
      ) AS address,
      JSON_OBJECT(
          'planname', Plan_name,
          'customertype', customer_type,
          'plancharges', plancharges,
          'internetcharges', Internet_charges,
          'billperiod', bill_Period,
          'billdate', bill_date,
          'duedate', Due_date,
          'plantype', plantype,
          'billmode', billmode,
          'subscription_billid', subscription_billid,
          'pendingpayments', pendingPayments,
          'amountpaid', paidamount,
          'showpending', Show_pending,
          'tdsdeductions', TDS_Detection
      ) AS billplandetails,

      JSON_OBJECT(
          'customerid', customer_id,
          'relationshipid', Relationshipid,
          'billnumber', billnumber,
          'customergstin', customer_GST,
          'hsncode', HSN_code,
          'customerpo', Customer_po,
          'contactperson', Contact_person,
          'contactnumber', Contact_number,
          'consolidate_email', Consolidate_email
      ) AS customeraccountdetails,
      Site_list AS sitesubscription,
      JSON_OBJECT(
          'emailid', Email_id,
          'phoneno', Contact_number,
          'ccemail', ccemail
      ) AS contactdetails,

      (
        SELECT JSON_ARRAYAGG(
          JSON_OBJECT(
            'invoiceid', sbg2.invoice_No,
            'duedate', sbm2.Due_date,
            'overduedays', DATEDIFF(NOW(), sbm2.Due_date),
            'charges', sbm2.plancharges,
            'paidamount', sbm2.paidamount,
            'pendingamount', sbm2.plancharges - sbm2.paidamount
          )
        )
        FROM subscriptionbillmaster sbm2
        JOIN subscriptionbillgenerated sbg2
          ON sbm2.subscription_billid = sbg2.subscription_billid
        WHERE sbg2.payment_status IN (0, 2)
          AND sbm2.status = 1
          AND sbm2.subscription_billid <> sbm.subscription_billid
          AND sbm2.Site_list = sbm.Site_list
          AND DATE_FORMAT(sbm2.bill_date, '%Y-%m') < DATE_FORMAT(sbm.bill_date, '%Y-%m')
      )
       AS previousPendingInvoices,
        (
          SELECT IFNULL(SUM(sbm2.plancharges - sbm2.paidamount), 0)
          FROM subscriptionbillmaster sbm2
          JOIN subscriptionbillgenerated sbg2
            ON sbm2.subscription_billid = sbg2.subscription_billid
          WHERE sbg2.payment_status IN (0, 2)
            AND sbm2.status = 1
            AND sbm2.subscription_billid <> sbm.subscription_billid
            AND sbm2.Site_list = sbm.Site_list
            AND DATE_FORMAT(sbm2.bill_date, '%Y-%m') < DATE_FORMAT(sbm.bill_date, '%Y-%m')
        ) AS totalPreviousPendingAmount

  FROM NumberedInvoices sbm;`);
    // for (let i = 0; i < sql.length; i++) {
    const formattedSql = sql.map((row) => ({
      ...row,
      date: format(new Date(row.bill_date), "yyyy-MM-dd"),
      billplandetails: {
        ...row.billplandetails,
        billdate: format(new Date(row.billplandetails.billdate), "yyyy-MM-dd"),
      },
    }));

    socket.send(JSON.stringify(formattedSql));
    console.log(
      "Invoice message sent to WebSocket server. " +
        JSON.stringify(formattedSql)
    );
    // socket.send(JSON.stringify(sql));
    // }
  } else {
    console.log("WebSocket not connected, skipping message.");
    reconnectWebSocket();
  }
}

// Cron job to start sending messages every minute after 03:14 AM
cron.schedule("42 16 * * *", () => {
  console.log("Cron job started at 07:16 PM");
  sendInvoice();
  // if (interval) {
  //   clearInterval(interval);
  // }

  // interval = setInterval(async () => {
  //   await sendInvoice();
  // }, 60 * 1000); // Send every 1 minute
});
connectWebSocket();

cron.schedule("04 16 * * *", () => {
  console.log("Cron for fetching job started at 18:45 PM");
  syncConsolidatedBills();
  syncIndividualBills();
});
async function syncIndividualBills() {
  try {
    const apikey = config.apikey;

    // Call stored procedure to get the secret
    const [sql] = await db.spcall2(
      `CALL SP_SECRET_CHECK(?,@g_apisecret); SELECT @g_apisecret;`,
      [apikey]
    );
    const objectvalue = sql[1][0];
    const secret = objectvalue["@g_apisecret"];

    if (!secret) {
      console.error("Invalid secret or API key!");
      return;
    }

    // Fetch data from source DB
    const rows = await db.query1(`
    SELECT
    JSON_ARRAYAGG(sct.branch_id) AS site_Ids,
    sct.clientaddress_name AS Client_addressname,
    sct.customer_address AS client_address,
    sct.billingaddress_name AS Billing_addressname,
    sct.billing_address AS Billing_address,
    sm.Subscription_name AS Plan_name,
    sct.customer_type,
    sct.from_date,
    sct.to_date,
    sct.Billing_Status,
    CASE
        WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE())
             AND MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
            DATEDIFF(sct.to_date, sct.from_date) + 1
        WHEN MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
            DATEDIFF(sct.to_date, DATE_FORMAT(CURDATE(), '%Y-%m-01')) + 1
        WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE()) THEN
            DATEDIFF(LAST_DAY(CURDATE()), sct.from_date) + 1
        ELSE
            DAY(LAST_DAY(CURDATE()))
    END AS plan_days,
ROUND(
    (sct.Amount)
) AS plancharges,

CASE 
WHEN MAX(sct.billing_plan) = 'Prepaid' THEN DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%m-%Y')
WHEN MAX(sct.billing_plan) = 'Postpaid' THEN DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%m-%Y')
END AS bill_date,

    CASE 
        WHEN MAX(sct.billing_plan) = 'Prepaid' THEN 
            DATE_FORMAT(DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 6 DAY), '%d-%m-%Y')
        WHEN MAX(sct.billing_plan) = 'Postpaid' THEN 
            DATE_FORMAT(DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 7 DAY), '%d-%m-%Y')
    END AS Due_date,
CONCAT(
    DATE_FORMAT(
        DATE(
            CASE
                WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE()) THEN sct.from_date
                WHEN MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN DATE_FORMAT(CURDATE(), '%Y-%m-01')
                ELSE DATE_FORMAT(CURDATE(), '%Y-%m-01')
            END
        ),
        '%d-%m-%Y'
    ),
    ' To ',
    DATE_FORMAT(
        DATE(
            CASE
                WHEN MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN sct.to_date
                WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE()) THEN LAST_DAY(CURDATE())
                ELSE LAST_DAY(CURDATE())
            END
        ),
        '%d-%m-%Y'
    )
) AS bill_period,
    CASE 
        WHEN MAX(sct.billing_plan) = 'Prepaid' THEN 
            CONCAT(DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%m-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%m-%Y'))
        WHEN MAX(sct.billing_plan) = 'Postpaid' THEN 
            CONCAT(DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%m-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%m-%Y'))
    END AS bill_Period,
    sct.Relationship_id,
    sct.billing_gst AS customer_GST,
    sct.hsncode AS HSN_code,
    sct.Customer_po AS Customer_po,
    sct.contactperson_name AS Contact_person,
    sct.Phoneno AS Contact_number,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'site_id', sct.branch_id,
            'site_name', bm.branch_name,
            'address', sct.customer_address,
            'customer_id', sct.customer_id,
            'monthly_charges', ROUND(
              (sct.Amount / DAY(LAST_DAY(CURDATE()))) *
              CASE
                WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE())
                     AND MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
                    DATEDIFF(sct.to_date, sct.from_date) + 1
                WHEN MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
                    DATEDIFF(sct.to_date, DATE_FORMAT(CURDATE(), '%Y-%m-01')) + 1
                WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE()) THEN
                    DATEDIFF(LAST_DAY(CURDATE()), sct.from_date) + 1
                ELSE
                    DAY(LAST_DAY(CURDATE()))
              END, 2
            ),
            'branchcode', sct.branchcode
        )
    ) AS Site_list,
    CURRENT_TIMESTAMP() AS Row_updated_date,
    1 AS Status, 
    0 AS Invoice_status, 
    0 AS Deleted_flag, 
    NULL AS Invoice_no, 
    18 AS gstPercent,
    sct.emailid AS Email_id,
    sct.ccmail,
    sct.Phoneno AS Phone_number,
    0 AS Internet_charges,
    sct.customer_id,
    sct.consolidate_email,
    sct.branchcode,
    sct.billing_plan,
    sct.bill_mode,
    sct.pending_amount,
    sct.paid_amount,
    sct.Show_pending,
    sct.TDS_Detection

FROM subscriptioncustomertrans sct
JOIN customermaster cm ON cm.customer_id = sct.customer_id
JOIN subscriptionmaster sm ON sm.subscription_id = sct.Subscription_ID
JOIN branchmaster bm ON bm.branch_id = sct.branch_id
WHERE sct.bill_type = 'Individual' AND sct.Billing_Status = 1 AND bm.Site_type = 0
GROUP BY sct.Relationship_id, sct.branch_id
HAVING (
  (MAX(sct.billing_plan) = 'Prepaid' AND DAY(CURDATE()) = 1)
  OR
  (MAX(sct.billing_plan) = 'Postpaid' AND CURDATE() = LAST_DAY(CURDATE()))
    );
    `);

    let insertedCount = 0;
    for (const row of rows) {
      try {
        const [existing] = await db.query(
          `SELECT 1 FROM subscriptionbillmaster 
           WHERE Branch_code = ? AND bill_period = ? 
           LIMIT 1`,
          [row.branchcode, row.bill_period]
        );

        if (!existing || existing.length === 0) {
          // Safe to insert
          await db.query(
            `INSERT INTO subscriptionbillmaster (
              site_Ids, Client_addressname, client_address, Billing_addressname,
              Billing_address, Plan_name, customer_type, plancharges,
              bill_date, Due_date, Relationshipid,
              customer_GST, HSN_code, Customer_po, Contact_person, Contact_number,
              Site_list, ccemail, Invoice_no, gstPercent, Email_id, Phone_number,
              Internet_charges, customer_id, consolidate_email, Branch_code, billmode,
              plantype, pendingPayments, paidamount, Show_pending, TDS_Detection,
              plan_days, bill_period
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )`,
            [
              row.site_Ids,
              row.Client_addressname,
              row.client_address,
              row.Billing_addressname,
              row.Billing_address,
              row.Plan_name,
              row.customer_type,
              row.plancharges,
              row.bill_date,
              row.Due_date,
              row.Relationship_id,
              row.customer_GST,
              row.HSN_code,
              row.Customer_po,
              row.Contact_person,
              row.Contact_number,
              row.Site_list,
              row.ccmail,
              row.Invoice_no,
              row.gstPercent,
              row.Email_id,
              row.Phone_number,
              row.Internet_charges,
              row.customer_id,
              row.consolidate_email,
              row.branchcode,
              row.bill_mode,
              row.billing_plan,
              row.pending_amount,
              row.paid_amount,
              row.Show_pending,
              row.TDS_Detection,
              row.plan_days,
              row.bill_period,
            ]
          );

          console.log(
            `Inserted bill for branch_code: ${row.branchcode} and period: ${row.bill_period} for individual bills`
          );
          insertedCount++;
        } else {
          // console.log(
          // `Skipping insert — already exists for branch_code: ${row.branchcode} and bill_period: ${row.bill_period} for individual bills`
          // );
        }
      } catch (rowErr) {
        console.error(
          `Failed for RelationshipId: ${row.Relationship_id} | Error: ${rowErr.message} for individual bills`
        );
      }
    }

    console.log(`${insertedCount} rows inserted for individual bills.`);
    await db.query1(
      `UPDATE subscriptioncustomertrans sct
    JOIN branchmaster bm ON sct.Branch_ID = bm.Branch_ID
    SET sct.Billing_Status = 1
    WHERE bm.Site_type = 0 AND bm.Status = 1;`
    );
    console.log(`Updated Billing_Status for individual bills.`);
    await db.query1(
      `UPDATE subscriptioncustomertrans sct
JOIN branchmaster bm ON sct.Branch_ID = bm.Branch_ID
SET sct.Billing_Status = 0
WHERE bm.Site_type = 0 AND bm.Status = 0;
`
    );
    console.log(`Updated Billing_Status for individual bills.`);
  } catch (error) {
    console.error("Error syncing data:", error.message);
  }
}

async function syncConsolidatedBills() {
  try {
    // Initialize the insertedCount variable
    let insertedCount = 0;

    // Fetch data from source DB
    const rows = await db.query1(`
      SELECT
    JSON_ARRAYAGG(sct.branch_id) AS site_Ids,
    sct.billingaddress_name AS Client_addressname,
    sct.billing_address AS client_address,
    sct.billingaddress_name AS Billing_addressname,
    sct.billing_address AS Billing_address,
    sm.Subscription_name AS Plan_name,
    sct.customer_type,
    sct.Billing_Status,
    SUM(ROUND(
          (sct.Amount / DAY(LAST_DAY(CURDATE()))) * 
          CASE
              WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE())
                   AND MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
                  DATEDIFF(sct.to_date, sct.from_date) + 1
              WHEN MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
                  DATEDIFF(sct.to_date, DATE_FORMAT(CURDATE(), '%Y-%m-01')) + 1
              WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE()) THEN
                  DATEDIFF(LAST_DAY(CURDATE()), sct.from_date) + 1
              ELSE
                  DAY(LAST_DAY(CURDATE()))
          END,
        2)) AS plancharges,
        CASE 
        WHEN MAX(sct.billing_plan) = 'Prepaid' THEN DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%m-%Y')
        WHEN MAX(sct.billing_plan) = 'Postpaid' THEN DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%m-%Y')
    END AS bill_date,
    CASE 
    WHEN MAX(sct.billing_plan) = 'Prepaid' THEN DATE_FORMAT(DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 6 DAY), '%d-%m-%Y')
    WHEN MAX(sct.billing_plan) = 'Postpaid' THEN DATE_FORMAT(DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 7 DAY), '%d-%m-%Y')
   END AS Due_date,
    CASE 
        WHEN MAX(sct.billing_plan) = 'Prepaid' THEN 
            CONCAT(DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%m-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%m-%Y'))
        WHEN MAX(sct.billing_plan) = 'Postpaid' THEN 
            CONCAT(DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%m-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%m-%Y'))
    END AS bill_Period,
 
    sct.Relationship_id,
    sct.billing_gst AS customer_GST,
    sct.hsncode AS HSN_code,
    sct.Customer_po AS Customer_po,
    sct.contactperson_name AS Contact_person,
    sct.Phoneno AS Contact_number,
 
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'site_id', sct.branch_id,
            'site_name', bm.branch_name,
            'address', sct.customer_address,
            'customer_id', sct.customer_id,
            'branchcode', sct.branchcode,
            'Amount', sct.Amount,
            'plan_days', CASE
              WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE())
                   AND MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
                  DATEDIFF(sct.to_date, sct.from_date) + 1
              WHEN MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
                  DATEDIFF(sct.to_date, DATE_FORMAT(CURDATE(), '%Y-%m-01')) + 1
              WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE()) THEN
                  DATEDIFF(LAST_DAY(CURDATE()), sct.from_date) + 1
              ELSE
                  DAY(LAST_DAY(CURDATE()))
            END,
            'from_date', DATE(sct.from_date),
            'to_date', DATE(sct.to_date),
            'monthly_charges', ROUND(
              (sct.Amount / DAY(LAST_DAY(CURDATE()))) *
              CASE
                WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE())
                     AND MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
                    DATEDIFF(sct.to_date, sct.from_date) + 1
                WHEN MONTH(sct.to_date) = MONTH(CURDATE()) AND YEAR(sct.to_date) = YEAR(CURDATE()) THEN
                    DATEDIFF(sct.to_date, DATE_FORMAT(CURDATE(), '%Y-%m-01')) + 1
                WHEN MONTH(sct.from_date) = MONTH(CURDATE()) AND YEAR(sct.from_date) = YEAR(CURDATE()) THEN
                    DATEDIFF(LAST_DAY(CURDATE()), sct.from_date) + 1
                ELSE
                    DAY(LAST_DAY(CURDATE()))
              END, 2
            )
          )
        ) AS Site_list,
    CURRENT_TIMESTAMP() AS Row_updated_date,
    1 AS Status, 0 AS Invoice_status, 0 AS Deleted_flag, NULL AS Invoice_no, 18 AS gstPercent,
    sct.emailid AS Email_id,
    sct.ccmail,
    sct.Phoneno AS Phone_number,
    0 AS Internet_charges,
    sct.customer_id,
    sct.consolidate_email,
    sct.branchcode,
    sct.billing_plan,
    sct.bill_mode,SUM(sct.pending_amount) AS pending_amount,
    SUM(sct.paid_amount) AS paid_amount,
    sct.Show_pending,
    sct.TDS_Detection
FROM subscriptioncustomertrans sct
JOIN customermaster cm ON cm.customer_id = sct.customer_id
JOIN subscriptionmaster sm ON sm.subscription_id = sct.Subscription_ID
JOIN branchmaster bm ON bm.branch_id = sct.branch_id
WHERE sct.bill_type = 'Consolidate' AND sct.Billing_Status = 1 AND bm.Site_type = 0
GROUP BY sct.Relationship_id, sct.customer_id
HAVING (
  (MAX(sct.billing_plan) = 'Prepaid' AND DAY(CURDATE()) = 1)
  OR
  (MAX(sct.billing_plan) = 'Postpaid' AND CURDATE() = LAST_DAY(CURDATE()))
);
    `);

    // Loop and insert into target DB
    for (const row of rows) {
      try {
        const result = await db.query(
          `SELECT 1 FROM subscriptionbillmaster
           WHERE Relationshipid = ? AND bill_Period = ? 
           LIMIT 1`,
          [row.Relationship_id, row.bill_Period]
        );

        if (!result || result.length === 0) {
          await db.query(
            `INSERT INTO subscriptionbillmaster (
              site_Ids, Client_addressname, client_address, Billing_addressname,
              Billing_address, Plan_name, customer_type, plancharges,
              bill_date, Due_date, Relationshipid,
              customer_GST, HSN_code, Customer_po, Contact_person, Contact_number,
              Site_list,ccemail,
              Invoice_no, gstPercent, Email_id, Phone_number, Internet_charges,
              customer_id, consolidate_email, branch_code,billmode,plantype,pendingPayments,paidamount,Show_pending,TDS_Detection,bill_period
            ) VALUES (
              ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?
            )
          `,
            [
              row.site_Ids,
              row.Client_addressname,
              row.client_address,
              row.Billing_addressname,
              row.Billing_address,
              row.Plan_name,
              row.customer_type,
              row.plancharges,
              row.bill_date,
              row.Due_date,
              row.Relationship_id,
              row.customer_GST,
              row.HSN_code,
              row.Customer_po,
              row.Contact_person,
              row.Contact_number,
              row.Site_list,
              row.ccmail,
              row.Invoice_no,
              row.gstPercent,
              row.Email_id,
              row.Phone_number,
              row.Internet_charges,
              row.customer_id,
              row.consolidate_email,
              row.Relationship_id.replace(/-/g, ""),
              row.bill_mode,
              row.billing_plan,
              row.pending_amount,
              row.paid_amount,
              row.Show_pending,
              row.TDS_Detection,
              row.bill_Period,
            ]
          );
          console.log(
            `Inserted bill for branch_code: ${row.Relationship_id} and period: ${row.bill_Period} for consolidated bills`
          );
          insertedCount++;
        } else {
          console.log(
            `Skipped (already exists) — branch_code: ${row.Relationship_id}, bill_Period: ${row.bill_Period} for consolidated bills`
          );
        }
        await db.query1(
          `UPDATE subscriptioncustomertrans sct
        JOIN branchmaster bm ON sct.Branch_ID = bm.Branch_ID
        SET sct.Billing_Status = 1
        WHERE bm.Site_type = 0 AND bm.Status = 1;`
        );
        console.log(`Updated Billing_Status for consolidated bills.`);
        await db.query1(
          `UPDATE subscriptioncustomertrans sct
        JOIN branchmaster bm ON sct.Branch_ID = bm.Branch_ID
        SET sct.Billing_Status = 0
        WHERE bm.Site_type = 0 AND bm.Status = 0;`
        );
        console.log(`Updated Billing_Status for consolidated bills.`);
      } catch (err) {
        console.error(
          `Insert error for RelationshipId: ${row.Relationship_id} for consolidated bills `,
          err.message
        );
      }
    }

    console.log(`${insertedCount} row(s) inserted for consolidated bills.`);
  } catch (error) {
    console.error("Error syncing consolidated bills:", error.message);
  }
}
module.exports = {
  startWebSocketClient: connectWebSocket,
};

// SELECT
// CONCAT(
//   Branch_code, '/',
//   DATE_FORMAT(
//       CASE
//           WHEN plantype = 'Prepaid' THEN bill_date
//           WHEN plantype = 'Postpaid' THEN bill_date
//           ELSE plantype
//       END,
//       '%y%m'
//   ),
//   LPAD(invoice_sequence, 2, '0')
// ) AS invoiceNo,

// SELECT
//   CONCAT(
//     Branch_code, '/2505',
//     LPAD(invoice_sequence, 2, '0')
//   ) AS invoiceNo,
