require("dotenv").config();
import { Pool } from "pg";

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_URL,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: 5432,
  connectionTimeoutMillis: 5000,
});

export const connectDb = async () => {
  let client;
  try {
    client = await pool.connect();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
  console.log("Postgres connected to", client.database);
  client.release();
};

export const disconnectDb = () => pool.close();

//export default { query: pool.query };
export default { query: (text, params, callback) => {
		return pool.query(text, params, callback)} };

