import { Pool, type QueryResultRow } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("Missing DATABASE_URL in environment");
}

// Neon requires SSL; DATABASE_URL already includes sslmode=require
export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: Array<unknown>,
) {
  const result = await pool.query<T>(text, params);
  return result;
}
