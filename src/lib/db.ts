import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;
const sslMode = process.env.SSL_MODE;

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
        ca: readFileSync(
          resolve(
            /* turbopackIgnore: true */ process.cwd(),
            "certs/db-cacert.pem",
          ),
          "utf8",
        ),
        rejectUnauthorized: true,
      }
    : false;

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
