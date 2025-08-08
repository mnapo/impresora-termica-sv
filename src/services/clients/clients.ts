// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

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
        schemaHooks.resolveResult(clientsResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(clientsQueryValidator), schemaHooks.resolveQuery(clientsQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(clientsDataValidator), schemaHooks.resolveData(clientsDataResolver)],
      patch: [schemaHooks.validateData(clientsPatchValidator), schemaHooks.resolveData(clientsPatchResolver)],
      remove: []
    },
    after: {
      all: []
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
