import { Pool, type QueryResultRow } from "pg";

function normalizeDatabaseUrl(rawUrl: string) {
  const url = new URL(rawUrl);
  const sslMode = url.searchParams.get("sslmode");

  if (sslMode === "require" || sslMode === "prefer" || sslMode === "verify-ca") {
    url.searchParams.set("sslmode", "verify-full");
  }

  return url.toString();
}

const rawConnectionString = process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("Missing DATABASE_URL in environment");
}

const connectionString = normalizeDatabaseUrl(rawConnectionString);

// Neon requires SSL. Normalize legacy sslmode values so pg does not emit warnings.
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
