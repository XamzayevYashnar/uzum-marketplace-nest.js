import "dotenv/config";
import { defineConfig } from "prisma/config";
import { env } from "./src/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env.DB_URI
  },
});
