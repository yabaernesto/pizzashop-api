import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'
import Elysia, { type Context, type Static, t } from 'elysia'

import { env } from '../env'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export type AuthHelpers = {
  signUser: (payload: Static<typeof jwtPayload>) => Promise<void>
  signOut: () => void
  getCurrentUser: () => Promise<{ userId: string; restaurantId?: string }>
}

// Use este tipo nas rotas para garantir acesso aos helpers e ao contexto padrão
export type AuthContext = Context & AuthHelpers

export const auth = new Elysia()
  .use(
    jwt({
      secret: env.JWT_SECRET_KEY,
      schema: jwtPayload,
    })
  )
  .use(cookie())
  .derive(({ jwt: { sign, verify }, setCookie, removeCookie, cookie }) => ({
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

    getCurrentUser: async () => {
      const payload = await verify(cookie.auth)

      if (!payload) {
        throw new Error('Unauthorized!')
      }

      return {
        userId: payload.sub,
        restaurantId: payload.restaurantId,
      }
    },
  }))
