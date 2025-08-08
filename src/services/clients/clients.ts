import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import { BadRequest } from '@feathersjs/errors'
import { restrictToOwnerOrAdmin } from '../../hooks/restrictions'

import {
  clientsDataValidator,
  clientsPatchValidator,
  clientsQueryValidator,
  clientsResolver,
  clientsExternalResolver,
  clientsDataResolver,
  clientsPatchResolver,
  clientsQueryResolver
} from './clients.schema'

import type { Application } from '../../declarations'
import type { HookContext } from '@feathersjs/feathers'
import { ClientsService, getOptions } from './clients.class'

export const clientsPath = 'clients'
export const clientsMethods: Array<keyof ClientsService> = ['find', 'get', 'create', 'patch', 'remove']

export * from './clients.class'
export * from './clients.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const clients = (app: Application) => {
  // Register our service on the Feathers application
  app.use(clientsPath, new ClientsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: clientsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })

  const assignUserId = async (context: HookContext) => {
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

  // Initialize hooks
  app.service(clientsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(clientsExternalResolver),
        schemaHooks.resolveResult(clientsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(clientsQueryValidator), schemaHooks.resolveQuery(clientsQueryResolver)],
      find: [
        async (context: HookContext) => {
          const { user } = context.params
          if (user.role !== "admin") {
            context.params.query = {
              ...context.params.query,
              userId: user.id
            }
          }
          return context
        }
      ],
      get: [],
      create: [
        schemaHooks.validateData(clientsDataValidator),
        assignUserId,
        schemaHooks.resolveData(clientsDataResolver)
      ],
      patch: [schemaHooks.validateData(clientsPatchValidator), schemaHooks.resolveData(clientsPatchResolver)],
      remove: []
    },
    after: {
      all: [],
      get: [
        restrictToOwnerOrAdmin
      ],
    },
    error: {
      all: []
    }
  })
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [clientsPath]: ClientsService
  }
}
