import { z } from 'zod'

const schema = z.object({
  DATABASE_URL: z.coerce.string().min(1),
})

export const env = schema.parse(process.env)
