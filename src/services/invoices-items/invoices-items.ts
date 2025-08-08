import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import { BadRequest } from '@feathersjs/errors'
import { restrictToOwnerOrAdmin } from '../../hooks/restrictions'

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
import type { HookContext } from '@feathersjs/feathers'
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
        schemaHooks.validateData(invoicesItemsDataValidator),
        assignUserId,
        schemaHooks.resolveData(invoicesItemsDataResolver)
      ],
      patch: [
        schemaHooks.validateData(invoicesItemsPatchValidator),
        schemaHooks.resolveData(invoicesItemsPatchResolver)
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
    [invoicesItemsPath]: InvoicesItemsService
  }
}
