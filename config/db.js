const mysql = require('mysql');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'e-commerece-saas-project'
  });
db.connect((err) => {
    if (err) {
      throw err;
    }
    console.log('MySQL Connected...id ' + db.threadId);
  });

global.db = db;

module.exports = db;


