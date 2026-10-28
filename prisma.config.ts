import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Migrasi memakai koneksi langsung (non-pooled); aplikasi memakai DATABASE_URL lewat adapter Neon.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: env("DIRECT_URL") },
});
