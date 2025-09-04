import { resolve } from '@feathersjs/schema'
import type { HookContext } from '@feathersjs/feathers'
import type { Clients, ClientsInput } from './clients.types'
import type { ClientsService } from './clients.class'

export const clientsDataResolver = resolve<Clients, HookContext<ClientsService>>({
  userId: async (_value, _product: Partial<ClientsInput>, context) => context.params.user?.id
})

export const clientsPatchResolver = resolve<Clients, HookContext<ClientsService>>({
  userId: async (_value, _product: Partial<ClientsInput>, context) => context.params.user?.id
})
