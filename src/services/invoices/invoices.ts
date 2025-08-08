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
  invoicesDataResolver,
  invoicesPatchResolver,
  invoicesQueryResolver
} from './invoices.schema'

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
        schemaHooks.validateData(invoicesDataValidator),
        assignUserId,
        schemaHooks.resolveData(invoicesDataResolver)
      ],
      patch: [
        schemaHooks.validateData(invoicesPatchValidator),
        schemaHooks.resolveData(invoicesPatchResolver)
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
