import { Forbidden, BadRequest } from '@feathersjs/errors'
import type { HookContext } from '@feathersjs/feathers'

export const restrictToAdmin = async (context: HookContext) => {
  const { user } = context.params
  const id = context.id
  if (!user) {
    throw new Forbidden('Unauthenticated')
  }

  if (!id) {
    throw new BadRequest('Id not specified')
  }

  if (user.role !== 'admin') {
    throw new Forbidden('Forbidden resource')
  }

  return context
}

export const restrictToOwner = async (context: HookContext) => {
  const { user } = context.params

  if (context.result.userId !== user.id) {
    throw new Forbidden('No tienes acceso a este producto')
  }

  return context
}