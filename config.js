require("dotenv").config();
const config = {
  db: {
    host: process.env.DB_HOST1,
    port: process.env.DB_PORT1,
    user: process.env.DB_USER1,
    password: process.env.DB_PASSWORD1,
    database: process.env.DB_NAME1,
    connectionLimit: 5000,
    multipleStatements: true,
    charset: "utf8mb4",
  },
  db1: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 5000,
    multipleStatements: true,
    charset: "utf8mb4",
  },
  db2: {
    host: process.env.DB_HOST2,
    port: process.env.DB_PORT2,
    user: process.env.DB_USER2,
    password: process.env.DB_PASSWORD2,
    database: process.env.DB_NAME2,
    connectionLimit: 5000,
    multipleStatements: true,
  },
  whatsappip: process.env.WHATSAPP_IP,
  filestorage: `\\\\192.168.0.156\\Backup_ganesh\\invoices`,
  printpath: `\\\\192.168.0.156\\Venkat\\Print\\New Invoices - print-june`,
  apiserver: `https://billing.ssipl.org`,
  apiserver1: `https://billing.ssipl.org`,
  serverurl: process.env.SERVER_URL,
  apikey: process.env.API_KEY,
};

module.exports = config;
