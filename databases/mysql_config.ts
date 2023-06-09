import mysql from "mysql";
import { info } from "../ansi-colors-config";

export const MySQLConnection = mysql.createPool({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    //Enable multiple statements in command
    multipleStatements: true
  });
  
  MySQLConnection.getConnection((err) => {
    if (err) throw err;
    console.log(info("MYSQL DB Connected!"));
  });