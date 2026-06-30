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
  socket = new WebSocket("ws://192.168.0.111:8081");

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
      pendingAmount,

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
      date: format(new Date(row.bill_date), "yyyy-MM-dd"), // Format the 'date' field
      billplandetails: {
        ...row.billplandetails,
        billdate: format(new Date(row.billplandetails.billdate), "yyyy-MM-dd"), // Format the billdate inside billplandetails
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
    // console.log("WebSocket not connected, skipping message.");
    reconnectWebSocket();
  }
}

// Cron job to start sending messages every minute after 03:14 AM
cron.schedule("00 19 * * *", () => {
  console.log("Cron job started at 07:16 PM");
  sendInvoice();
});
connectWebSocket();

cron.schedule("56 1 * * *", () => {
  console.log("Cron for fetching job started at 18:45 PM");
  syncConsolidatedBills();
  syncIndividualBills();
});

async function syncIndividualBills() {
  try {
    const apikey = config.apikey;
    const [sql] = await db.spcall2(
      `CALL SP_SECRET_CHECK(?,@g_apisecret); select @g_apisecret;`,
      [apikey]
    );
    const objectvalue = sql[1][0];
    const secret = objectvalue["@g_apisecret"];
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
    SUM(sct.Amount) AS plancharges,
    CASE 
    WHEN MAX(sct.billing_plan) = 'Prepaid' THEN DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%m-%Y')
    WHEN MAX(sct.billing_plan) = 'Postpaid' THEN DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%m-%Y')
END AS bill_date
    CASE 
    WHEN MAX(sct.billing_plan) = 'Prepaid' THEN DATE_FORMAT(DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 6 DAY), '%d-%m-%Y')
    WHEN MAX(sct.billing_plan) = 'Postpaid' THEN DATE_FORMAT(DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 7 DAY), '%d-%m-%Y')
    END AS Due_date,
    CASE 
        WHEN MAX(sct.billing_plan) = 'Prepaid' 
        THEN CONCAT(DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%b-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%b-%Y'))
        WHEN MAX(sct.billing_plan) = 'Postpaid' 
        THEN CONCAT(DATE_FORMAT(DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01'), '%d-%b-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE() - INTERVAL 1 MONTH), '%d-%b-%Y'))
    END AS bill_Period,
    sct.Relationship_id,
    sct.billing_gst AS customer_GST,
    sct.hsncode AS HSN_code,
    'SSIPL_INV' AS Customer_po,
    sct.contactperson_name AS Contact_person,
    sct.Phoneno AS Contact_number,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'site_id', sct.branch_id,
            'site_name', bm.branch_name,
            'address', sct.customer_address,
            'customer_id', sct.customer_id,
            'monthly_charges', sct.Amount,
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
WHERE sct.bill_type = 'Individual'
GROUP BY sct.Relationship_id, sct.branch_id
HAVING (
    (MAX(sct.billing_plan) = 'Prepaid' AND DAY(CURDATE()) = 6)
    OR
    (MAX(sct.billing_plan) = 'Postpaid' AND CURDATE() = LAST_DAY(CURDATE()))
);`);

    // Loop and insert into target DB
    // Loop and insert into target DB
    for (const row of rows) {
      try {
        // const encryptedClientAddress = await helper.encrypt(
        //   row.client_address,
        //   secret
        // );
        // const encryptedBillingAddressName = await helper.encrypt(
        //   row.Billing_addressname,
        //   secret
        // );
        // const encryptedBillingAddress = await helper.encrypt(
        //   row.Billing_address,
        //   secret
        // );
        // const encryptedPlanName = await helper.encrypt(row.Plan_name, secret);
        // const encryptedPlanCharges = await helper.encrypt(
        //   String(row.plancharges),
        //   secret
        // );

        // const encryptedCustomerGST = await helper.encrypt(
        //   row.customer_GST,
        //   secret
        // );

        // const encryptedGSTPercent = await helper.encrypt(
        //   String(row.gstPercent),
        //   secret
        // );
        // const encryptedContactNumber = await helper.encrypt(
        //   String(row.Contact_number),
        //   secret
        // );
        // const encryptedPhoneNumber = await helper.encrypt(
        //   String(row.Phone_number),
        //   secret
        // );

        // const encryptedEmailId = await helper.encrypt(row.Email_id, secret);

        await db.query(
          `INSERT INTO subscriptionbillmaster (
        site_Ids, Client_addressname, client_address, Billing_addressname,
        Billing_address, Plan_name, customer_type, plancharges,
        bill_date, Due_date, bill_Period, Relationshipid,
        customer_GST, HSN_code, Customer_po, Contact_person, Contact_number,
        Site_list,ccemail,
        Invoice_no, gstPercent, Email_id, Phone_number, Internet_charges,
        customer_id, consolidate_email, branch_code,billmode,plantype,pendingPayments,paidamount,Show_pending,TDS_Detection
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
            row.bill_Period,
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
          ]
        );
      } catch (er) {
        console.error(
          `Failed to insert row for RelationshipId: ${row.Relationship_id}`,
          er.message
        );
      }
    }

    console.log(`${rows.length} rows inserted to target database.`);
  } catch (error) {
    console.error("Error syncing data:", error.message);
  }
}

async function syncConsolidatedBills() {
  try {
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
    SUM(sct.Amount) AS plancharges,
    CASE 
    WHEN MAX(sct.billing_plan) = 'Prepaid' THEN DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%m-%Y')
    WHEN MAX(sct.billing_plan) = 'Postpaid' THEN DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%m-%Y')
END AS bill_date,
    CASE 
    WHEN MAX(sct.billing_plan) = 'Prepaid' THEN DATE_FORMAT(DATE_ADD(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 6 DAY), '%d-%m-%Y')
    WHEN MAX(sct.billing_plan) = 'Postpaid' THEN DATE_FORMAT(DATE_ADD(LAST_DAY(CURDATE()), INTERVAL 7 DAY), '%d-%m-%Y')
   END AS Due_date,
    CASE 
        WHEN MAX(sct.billing_plan) = 'Prepaid' THEN CONCAT(
            DATE_FORMAT(DATE_FORMAT(CURDATE(), '%Y-%m-01'), '%d-%b-%Y'), ' To ', DATE_FORMAT(LAST_DAY(CURDATE()), '%d-%b-%Y')
        )
        WHEN MAX(sct.billing_plan) = 'Postpaid' THEN CONCAT(
            DATE_FORMAT(DATE_FORMAT(CURDATE() - INTERVAL 1 MONTH, '%Y-%m-01'), '%d-%b-%Y'), ' To ',
            DATE_FORMAT(LAST_DAY(CURDATE() - INTERVAL 1 MONTH), '%d-%b-%Y')
        )
    END AS bill_Period,

    sct.Relationship_id,
    CONCAT('BILL-', sct.Relationship_id, '-', DATE_FORMAT(CURDATE(), '%Y%m')) AS billnumber,
    sct.billing_gst AS customer_GST,
    sct.hsncode AS HSN_code,
    'SSIPL_INV' AS Customer_po,
    sct.contactperson_name AS Contact_person,
    sct.Phoneno AS Contact_number,

    JSON_ARRAYAGG(
        JSON_OBJECT(
            'site_id', sct.branch_id,
            'site_name', bm.branch_name,
            'address', sct.customer_address,
            'customer_id', sct.customer_id,
            'monthly_charges', sct.Amount,
            'branchcode',sct.branchcode
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
WHERE sct.bill_type = 'Consolidate'
GROUP BY sct.Relationship_id, sct.customer_id
HAVING (
    (MAX(sct.billing_plan) = 'Prepaid' AND DAY(CURDATE()) = 6)
    OR
    (MAX(sct.billing_plan) = 'Postpaid' AND CURDATE() = LAST_DAY(CURDATE()))
);`);

    // Loop and insert into target DB
    for (const row of rows) {
      try {
        await db.query(
          `
        INSERT INTO subscriptionbillmaster (
          site_Ids, Client_addressname, client_address, Billing_addressname,
          Billing_address, Plan_name, customer_type, plancharges,
          bill_date, Due_date, bill_Period, Relationshipid, billnumber,
          customer_GST, HSN_code, Customer_po, Contact_person, Contact_number,
          Site_list,ccemail,
          Invoice_no, gstPercent, Email_id, Phone_number, Internet_charges,
          customer_id, consolidate_email, branch_code,billmode,plantype,pendingPayments,paidamount,Show_pending,TDS_Detection
        ) VALUES (
          ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,?,?,?,?,?,?,?
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
            row.bill_Period,
            row.Relationship_id,
            row.billnumber,
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
          ]
        );
      } catch (er) {
        console.error(
          `Failed to insert row for RelationshipId: ${row.Relationship_id}`,
          err.message
        );
      }
    }
    console.log(`${rows.length} rows inserted to target database.`);
  } catch (error) {
    console.error("Error syncing data:", error.message);
  }
}
module.exports = {
  startWebSocketClient: connectWebSocket,
};
