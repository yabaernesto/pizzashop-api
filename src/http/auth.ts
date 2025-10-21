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
  return (
    app
      .error({
        UNAUTHORIZED: UnauthorizedError,
        NOT_A_MANAGER: NotAManagerError,
      })
      .onError(({ code, error, set }) => {
        switch (code) {
          case 'UNAUTHORIZED':
          case 'NOT_A_MANAGER':
            set.status = 401
            return { code, message: error.message }
        }
      })
      // Plugins necessários
      .use(cookie())
      .use(
        jwt({
          secret: env.JWT_SECRET_KEY,
          schema: jwtPayloadSchema,
        })
      )

      // 🔐 Helpers que acessam cookies e JWT corretamente
      .onBeforeHandle(({ jwt, setCookie, cookie, removeCookie }) => ({
        signUser: async (payload: Static<typeof jwtPayloadSchema>) => {
          const token = await jwt.sign(payload)

          setCookie('auth', token, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 7, // 7 dias
            path: '/',
          })
        },

        getCurrentUser: async () => {
          const token = cookie.auth
          if (!token) throw new UnauthorizedError()

          const payload = await jwt.verify(token)
          if (!payload) throw new UnauthorizedError()

          return {
            userId: payload.sub,
            restaurantId: payload.restaurantId,
          }
        },

        signOut: () => {
          removeCookie('auth')
        },
      }))

      // 🚀 Helper adicional
      .derive(({ getCurrentUser }) => ({
        getManagedRestaurantId: async () => {
          const { restaurantId } = await getCurrentUser()

          if (!restaurantId) {
            throw new NotAManagerError()
          }

          return restaurantId
        },
      }))
  )
}
