import type { HookContext } from '@feathersjs/feathers'

export const stripId = async (context: HookContext ) => {
  if ('id' in context.data) {
    delete context.data.id
  }
  return context
}