import mysql from 'mysql2';

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'dev_yash2025',
  database: 'db_shirpur_market'
});

console.log('Testing MySQL connection...');

db.connect((err) => {
  if (err) {
    console.error('❌ MySQL Connection Failed:', err.message);
    console.log('Make sure MySQL server is running and database exists');
  } else {
    console.log('✅ MySQL Connected Successfully');
    
    // Test products table
    db.query('SELECT COUNT(*) as count FROM products', (err, results) => {
      if (err) {
        console.error('❌ Products table error:', err.message);
      } else {
        console.log(`✅ Products table has ${results[0].count} records`);
      }
      db.end();
    });
  }
});