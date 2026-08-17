import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.server.ts",
  out: "./server/database/migrations",
  dbCredentials: {
    url: process.env["DATABASE_URL"] ?? "",
  },
  strict: true,
  verbose: true,
});
