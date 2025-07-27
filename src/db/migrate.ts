import chalk from 'chalk'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import { env } from '../env'
import { schema } from './schema'

const connection = postgres(env.DATABASE_URL, { max: 1 })
export const db = drizzle(connection, {
  schema,
  casing: 'snake_case',
})

// biome-ignore lint/suspicious/noConsole: show
console.log(chalk.greenBright('Migrations applied successfully!'))

await connection.end()

process.exit()
