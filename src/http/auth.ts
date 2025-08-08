import cookie from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'
import Elysia, { type Context, type Static, t } from 'elysia'

import { env } from '../env'
import { UnauthorizedError } from './errors/unauthorized-error'

const jwtPayload = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export type AuthHelpers = {
  signUser: (payload: Static<typeof jwtPayload>) => Promise<void>
  signOut: () => void
  getCurrentUser: () => Promise<{ userId: string; restaurantId?: string }>
}

export type AuthContext = Context & AuthHelpers

export const auth = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case 'UNAUTHORIZED': {
        set.status = 401
        return { code, message: error.message }
      }
      default: {
        set.status = 400
      }
    }
  })
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
        throw new UnauthorizedError()
      }

      return {
        userId: payload.sub,
        restaurantId: payload.restaurantId,
      }
    },
  }))
