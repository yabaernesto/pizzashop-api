import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '../env'

// biome-ignore lint/performance/noNamespaceImport: schema
import * as schema from './schema'

const connection = postgres(env.DATABASE_URL)
export const db = drizzle({ client: connection, schema })
