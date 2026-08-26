const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config(); // .env file se variables load karne ke liye

async function importDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'jns-mysql-db-jnseducation.i.aivencloud.com',
      port: Number(process.env.DB_PORT) || 28423,
      user: process.env.DB_USER || 'avnadmin',
      password: process.env.DB_PASSWORD, // Yeh ab securely .env se uthayega
      database: process.env.DB_NAME || 'defaultdb',
      ssl: { rejectUnauthorized: false },
      multipleStatements: true
    });

    console.log('Connected to Aiven MySQL database successfully!');

    // Primary key requirement ko disable karne ke liye yeh line add ki hai
    await connection.query('SET sql_require_primary_key = OFF;');

    const sqlFile = fs.readFileSync('D:/VS Code Projects/jnsedu-db.sql', 'utf8');
    
    console.log('Importing database tables...');
    await connection.query(sqlFile);
    
    console.log('Database imported successfully!');
    await connection.end();
  } catch (error) {
    console.error('Import error:', error);
  }
}

importDatabase();