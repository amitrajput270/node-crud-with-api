import mysql from "mysql2";

const connection = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "QAZwsx@123",
    database: "mynodedb"
});

export default connection.promise();
