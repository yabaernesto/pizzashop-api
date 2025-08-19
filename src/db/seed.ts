import { faker } from '@faker-js/faker'
import chalk from 'chalk'

import { db } from './connection'
import { restaurants, users } from './schema'

/**
 * Reset database
 */
await db.delete(users)
await db.delete(restaurants)

// biome-ignore lint/suspicious/noConsole: show
console.log(chalk.yellow('✔️ Database reset!'))

/**
 * Create customer
 */
await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
    {
      name: faker.person.fullName(),
      email: faker.internet.email(),
      role: 'customer',
    },
  ])
  .returning()

// biome-ignore lint/suspicious/noConsole: show
console.log(chalk.yellow('✔️ Created customer!'))

/**
 * Create manager
 */
const [manager] = await db
  .insert(users)
  .values([
    {
      name: faker.person.fullName(),
      email: 'admin@admin.com',
      role: 'manager',
    },
  ])
  .returning({
    id: users.id,
  })

// biome-ignore lint/suspicious/noConsole: show
console.log(chalk.yellow('✔️ Created manager!'))

/**
 * Create restaurant
 */
await db
  .insert(restaurants)
  .values([
    {
      name: faker.company.name(),
      description: faker.lorem.paragraph(),
      managerId: manager.id,
    },
  ])
  .returning()

// biome-ignore lint/suspicious/noConsole: show
console.log(chalk.yellow('✔️ Created manager!'))

// biome-ignore lint/suspicious/noConsole: show
console.log(chalk.greenBright('Database seeded successfully 📦!'))

process.exit()
