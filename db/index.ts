import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const globalDb = globalThis as unknown as { postgresClient?: ReturnType<typeof postgres> };

function getClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error("DATABASE_URL is not configured");
  if (!globalDb.postgresClient) {
    globalDb.postgresClient = postgres(connectionString, {
      max: process.env.NODE_ENV === "production" ? 10 : 1,
      idle_timeout: 20,
      connect_timeout: 15,
      prepare: false,
      ssl: connectionString.includes("localhost") ? false : "require",
    });
  }
  return globalDb.postgresClient;
}

export function getDb() {
  return drizzle(getClient(), { schema });
}
