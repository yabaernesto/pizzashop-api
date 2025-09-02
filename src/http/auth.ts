import { cookie } from '@elysiajs/cookie'
import jwt from '@elysiajs/jwt'
import { type Elysia, type Static, t } from 'elysia'

import { env } from '../env'
import { NotAManagerError } from './errors/not-a-manager-error'
import { UnauthorizedError } from './errors/unauthorized-error'

const jwtPayloadSchema = t.Object({
  sub: t.String(),
  restaurantId: t.Optional(t.String()),
})

export const auth = (app: Elysia) => {
  return app
    .error({
      UNAUTHORIZED: UnauthorizedError,
      NOT_A_MANAGER: NotAManagerError,
    })
    .onError(({ code, error, set }) => {
      switch (code) {
        case 'UNAUTHORIZED':
          set.status = 401
          return { code, message: error.message }
        case 'NOT_A_MANAGER':
          set.status = 401
          return { code, message: error.message }
      }
    })
    .use(cookie())
    .use(
      jwt({
        secret: env.JWT_SECRET_KEY,
        schema: jwtPayloadSchema,
      })
    )
    .derive(({ jwt, cookie, setCookie, removeCookie }) => {
      return {
        signUser: async (payload: Static<typeof jwtPayloadSchema>) => {
          setCookie('auth', await jwt.sign(payload), {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7 days
            path: '/',
          })
        },

        getCurrentUser: async () => {
          const payload = await jwt.verify(cookie.auth)

          if (!payload) {
            throw new UnauthorizedError()
          }

          return {
            userId: payload.sub,
            restaurantId: payload.restaurantId,
          }
        },

        signOut: () => {
          removeCookie('auth')
        },
      }
    })
    .derive(({ getCurrentUser }) => {
      return {
        getManagedRestaurantId: async () => {
          const { restaurantId } = await getCurrentUser()

          if (!restaurantId) {
            throw new NotAManagerError()
          }

          return restaurantId
        },
      }
    })
}
