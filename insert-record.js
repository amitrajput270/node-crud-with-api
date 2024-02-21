const mysql = require('mysql');
// connection configurations
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "QAZwsx@123",
    database: "mynodedb"
});

// connect to database
connection.connect(function (err) {
    if (err) throw err
    console.log('You are now connected with mysql database...')
});
