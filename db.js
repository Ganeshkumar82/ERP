const config = require("./config");
const mysql = require("mysql2/promise");
const pool = mysql.createPool(config.db);

const pool1 = mysql.createPool(config.db1);
const pool2 = mysql.createPool(config.db2);

<<<<<<< HEAD
async function setCollation(connection) {
  await connection.query(`
    SET NAMES utf8mb4
    COLLATE utf8mb4_unicode_ci
  `);

  await connection.query(`
    SET collation_connection = 'utf8mb4_unicode_ci'
  `);
}

async function query(sql, params) {
  const connection = await pool.getConnection();
  try {
    await setCollation(connection);
=======
async function query(sql, params) {
  const connection = await pool.getConnection();
  try {
>>>>>>> kishore
    const [result] = await connection.execute(sql, params);
    return result;
  } catch (er) {
    console.log(`Error while executing the query ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

async function spcall(sql, params) {
  const connection = await pool.getConnection();
  try {
<<<<<<< HEAD
    await setCollation(connection);
=======
>>>>>>> kishore
    const result = await connection.query(sql, params);
    return result;
  } catch (er) {
    console.log(`Error ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

async function query1(sql, params) {
  const connection = await pool1.getConnection();
  try {
<<<<<<< HEAD
    await setCollation(connection);
=======
>>>>>>> kishore
    const [result] = await connection.execute(sql, params);
    return result;
  } catch (er) {
    console.log(`Error while executing the query ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

async function spcall1(sql, params) {
  const connection = await pool1.getConnection();
  try {
<<<<<<< HEAD
    await setCollation(connection);
=======
>>>>>>> kishore
    const result = await connection.query(sql, params);
    return result;
  } catch (er) {
    console.log(`Error ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

async function spcall2(sql, params) {
  const connection = await pool2.getConnection();
  try {
    const result = await connection.query(sql, params);
    return result;
  } catch (er) {
    console.log(`Error ${er}`);
    throw er;
  } finally {
    connection.release();
  }
}

module.exports = {
  query,
  spcall,
  query1,
  spcall1,
  spcall2,
};
