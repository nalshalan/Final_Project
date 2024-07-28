// Import mysql package
import mysql from "mysql2";

// Import dotnev package so we can configure our environment variables
import dotenv from "dotenv";
// Tell JS to place the environment variables on the process
dotenv.config();

// Create the connection between the server and the database
const connection = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database : process.env.DB_SCHEMA,
});

connection.query("SELECT * FROM scores;", (err, results) => {
    if (err) console.error(err);
    else console.log(results);
});

// Create a query function that we can re-use more easily
function query(sqlString, values) {
    return new Promise((res, rej) => {
        connection.query(sqlString, values, (err, results) => {
            if (err) rej(err);
            else res(results);
        });
    });
}

export default query;