// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  invoicesDataValidator,
  invoicesPatchValidator,
  invoicesQueryValidator,
  invoicesResolver,
  invoicesExternalResolver,
  invoicesDataResolver,
  invoicesPatchResolver,
  invoicesQueryResolver
} from './invoices.schema'

import type { Application } from '../../declarations'
import { InvoicesService, getOptions } from './invoices.class'

export const invoicesPath = 'invoices'
export const invoicesMethods: Array<keyof InvoicesService> = ['find', 'get', 'create', 'patch', 'remove']

export * from './invoices.class'
export * from './invoices.schema'

// A configure function that registers the service and its hooks via `app.configure`
export const invoices = (app: Application) => {
  // Register our service on the Feathers application
  app.use(invoicesPath, new InvoicesService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: invoicesMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(invoicesPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(invoicesExternalResolver),
        schemaHooks.resolveResult(invoicesResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(invoicesQueryValidator),
        schemaHooks.resolveQuery(invoicesQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(invoicesDataValidator),
        schemaHooks.resolveData(invoicesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(invoicesPatchValidator),
        schemaHooks.resolveData(invoicesPatchResolver)
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
    [invoicesPath]: InvoicesService
  }
}
