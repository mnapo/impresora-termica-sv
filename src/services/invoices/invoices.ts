import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import { BadRequest } from '@feathersjs/errors'
import { restrictToOwnerOrAdmin } from '../../hooks/restrictions'

import {
  invoicesDataValidator,
  invoicesPatchValidator,
  invoicesQueryValidator,
  invoicesResolver,
  invoicesExternalResolver,
  invoicesQueryResolver
} from './invoices.schema'
import { invoicesDataResolver, invoicesPatchResolver } from './invoices.resolvers'
import type { Application } from '../../declarations'
import type { HookContext } from '@feathersjs/feathers'
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
        schemaHooks.resolveData(invoicesDataResolver as any)
      ],
      patch: [
        schemaHooks.validateData(invoicesPatchValidator),
        schemaHooks.resolveData(invoicesPatchResolver as any)
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
    [invoicesPath]: InvoicesService
  }
}
