import { drizzle } from "drizzle-orm/node-postgres"
import { type Pool, Pool as PostgresPool } from "pg"

import { env } from "~/env"
import * as schema from "./schema"

const globalForDb = globalThis as unknown as {
  pool: Pool | undefined
}

export const pool =
  globalForDb.pool ??
  new PostgresPool({
    connectionString: env.DATABASE_URL,
  })
if (env.NODE_ENV !== "production") globalForDb.pool = pool

export const db = drizzle(pool, { schema })
