import mysql from "mysql2/promise";
export const pool = mysql.createPool({
  host:process.env.DB_HOST ?? "db",
  port:Number(process.env.DB_PORT ?? 3306),
  user:process.env.DB_USER ?? "cenalivre",
  password:process.env.DB_PASSWORD,
  database:process.env.DB_NAME ?? "cenalivre",
  waitForConnections:true,
  connectionLimit:8,
  timezone:"Z",
  dateStrings:true,
  decimalNumbers:true
});
