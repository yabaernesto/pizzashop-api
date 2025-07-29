import { z } from 'zod'

const schema = z.object({
  API_BASE_URL: z.coerce.string().min(1),
  AUTH_REDIRECT_URL: z.coerce.string().min(1),
  DATABASE_URL: z.coerce.string().min(1),
})

export const env = schema.parse(process.env)
