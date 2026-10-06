const mysql = require("mysql2");

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "YOUR_LOCAL_PASSWORD",
    database: process.env.DB_NAME || "student_attendance"
});

db.connect((err) => {

    if (err) {
        console.log("Database connection failed:", err);
    } else {
        console.log("Database connected");
    }

});

module.exports = db;