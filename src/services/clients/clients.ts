import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import { BadRequest } from '@feathersjs/errors'
import { restrictToOwnerOrAdmin } from '../../hooks/restrictions'
import { validateUnique } from "../../hooks/validate-unique"
import { stripId } from '../../hooks/strip-id'
import {
  clientsDataValidator,
  clientsPatchValidator,
  clientsQueryValidator,
  clientsResolver,
  clientsExternalResolver,
  clientsQueryResolver
} from './clients.schema'
import { clientsDataResolver, clientsPatchResolver } from './clients.resolvers'
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

  // Initialize hooks
  app.service(clientsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(clientsExternalResolver),
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(clientsQueryValidator), schemaHooks.resolveQuery(clientsQueryResolver)],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(clientsDataValidator),
        validateUnique("cuit"),
        schemaHooks.resolveData(clientsDataResolver as any),
      ],
      patch: [
        schemaHooks.validateData(clientsPatchValidator),
        validateUnique("cuit"),
        schemaHooks.resolveData(clientsPatchResolver as any),
      ],
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
