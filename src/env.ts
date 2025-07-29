import { z } from 'zod'

const schema = z.object({
  PORT: z.coerce.number().default(3333),
  API_BASE_URL: z.coerce.string().min(1),
  AUTH_REDIRECT_URL: z.coerce.string().min(1),
  DATABASE_URL: z.coerce.string().min(1),
  JWT_SECRET_KEY: z.coerce.string().min(1),
})

export const env = schema.parse(process.env)
