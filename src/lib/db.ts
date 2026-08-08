import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const sslMode = process.env.SSL_MODE;
const databaseCaCert = process.env.DATABASE_CA_CERT;

if (!connectionString) {
  throw new Error("DATABASE_URL is not configured.");
}

if (sslMode !== "disable" && sslMode !== "verify-full") {
  throw new Error('SSL_MODE must be either "disable" or "verify-full".');
}

const poolConnectionString = new URL(connectionString);
const loopbackHosts = new Set(["localhost", "127.0.0.1", "::1"]);

poolConnectionString.searchParams.delete("sslmode");
poolConnectionString.searchParams.delete("sslcert");
poolConnectionString.searchParams.delete("sslkey");
poolConnectionString.searchParams.delete("sslrootcert");

if (sslMode === "disable" && !loopbackHosts.has(poolConnectionString.hostname)) {
  throw new Error("SSL_MODE=disable is only permitted for loopback databases.");
}

const ssl =
  sslMode === "verify-full"
    ? {
        ca: getDatabaseCaCert(),
        rejectUnauthorized: true,
      }
    : false;

function getDatabaseCaCert() {
  if (!databaseCaCert) {
    throw new Error(
      "DATABASE_CA_CERT is required.",
    );
  }

  return databaseCaCert.replace(/\\n/g, "\n");
}

const globalForPg = globalThis as typeof globalThis & {
  pgPool?: Pool;
};

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: poolConnectionString.toString(),
    max: Number(process.env.DATABASE_POOL_MAX ?? 5),
    ssl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPg.pgPool = pool;
}
