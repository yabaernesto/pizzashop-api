import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'
import Elysia, { type Static, t } from 'elysia'

import { env } from '../env'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export type AuthContext = {
  signUser: (payload: Static<typeof jwtPayload>) => Promise<void>
  signOut: () => void
}

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    })
  )
  .use(cookie())
  .derive<AuthContext>(({ jwt: { sign }, setCookie, removeCookie }) => ({
    signUser: async (payload: Static<typeof jwtPayload>) => {
      const token = await sign(payload)

      setCookie('auth', token, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
        sameSite: 'none',
        secure: true,
      })
    },
    signOut: () => {
      removeCookie('auth')
    },
  }))
