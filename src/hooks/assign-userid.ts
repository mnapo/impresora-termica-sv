import { Forbidden, BadRequest } from '@feathersjs/errors'
import type { HookContext } from '@feathersjs/feathers'

export const assignUserId = async (context: HookContext) => {
    const user = context.params.user

    if (!user?.id) {
        throw new BadRequest('Not authenticated')
    }

    context.data = {
        ...context.data,
        userId: user.id
    }

    return context
}