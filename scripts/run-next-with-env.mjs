import { createRequire } from "node:module";
import { loadEnvFile } from "node:process";

const [, , envFile, ...nextArgs] = process.argv;

if (!envFile || nextArgs.length === 0) {
  throw new Error("Usage: run-next-with-env.mjs <env-file> <next-command>");
}

loadEnvFile(envFile);

const require = createRequire(import.meta.url);
const nextBin = require.resolve("next/dist/bin/next");

process.argv = [process.execPath, nextBin, ...nextArgs];
require(nextBin);
