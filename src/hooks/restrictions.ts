import { Forbidden, BadRequest } from '@feathersjs/errors'
import type { HookContext } from '@feathersjs/feathers'

export const restrictToOwnerOrAdmin = async (context: HookContext) => {
  const { user } = context.params
  const id = context.id
  if (!user) {
    throw new Forbidden('Unauthenticated')
  }

  if (!id) {
    throw new BadRequest('Id not specified')
  }

  if (user.role === 'admin') {
    return context
  }

  if (context.result.userId !== user.id) {
    throw new Forbidden('Forbidden resource')
  }

  return context
}