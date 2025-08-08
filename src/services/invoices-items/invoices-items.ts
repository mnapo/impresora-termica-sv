// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  invoicesItemsDataValidator,
  invoicesItemsPatchValidator,
  invoicesItemsQueryValidator,
  invoicesItemsResolver,
  invoicesItemsExternalResolver,
  invoicesItemsDataResolver,
  invoicesItemsPatchResolver,
  invoicesItemsQueryResolver
} from './invoices-items.schema'

import type { Application } from '../../declarations'
import { InvoicesItemsService, getOptions } from './invoices-items.class'

export const invoicesItemsPath = 'invoices-items'
export const invoicesItemsMethods: Array<keyof InvoicesItemsService> = [
  'find',
  'get',
  'create',
  'patch',
  'remove'
]

export * from './invoices-items.class'
export * from './invoices-items.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const invoicesItems = (app: Application) => {
  // Register our service on the Feathers application
  app.use(invoicesItemsPath, new InvoicesItemsService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: invoicesItemsMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(invoicesItemsPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(invoicesItemsExternalResolver),
        schemaHooks.resolveResult(invoicesItemsResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(invoicesItemsQueryValidator),
        schemaHooks.resolveQuery(invoicesItemsQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(invoicesItemsDataValidator),
        schemaHooks.resolveData(invoicesItemsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(invoicesItemsPatchValidator),
        schemaHooks.resolveData(invoicesItemsPatchResolver)
      ],
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
    [invoicesItemsPath]: InvoicesItemsService
  }
}
