import dotenv from "dotenv";
dotenv.config();
import pkg from "pg";
const { Pool } = pkg;

const connectionString = `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?options=--search_path%3Dpublic`;

export const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});