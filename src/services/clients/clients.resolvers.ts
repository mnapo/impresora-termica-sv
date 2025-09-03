import { resolve } from '@feathersjs/schema'
import type { HookContext } from '@feathersjs/feathers'
import type { Clients, ClientsService } from './clients.class'

export const clientsDataResolver = resolve<Clients, HookContext<ClientsService>>({
  userId: async (_value, _client, context) => context.params.user?.id
})

export const clientsPatchResolver = resolve<Clients, HookContext<ClientsService>>({
  userId: async (_value, _client, context) => context.params.user?.id
})