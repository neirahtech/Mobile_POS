const mysql = require('mysql2/promise');
require('dotenv').config(); 
const db = mysql.createPool({

  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
 
});

db.getConnection().then((connection) => {
    console.log('Database connected successfully!');
    connection.release(); // Release the connection back to the pool
    }).catch((err) => {console.error('Database connection failed:', err);});

    module.exports = db;