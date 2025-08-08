import { invoicesItems } from './invoices-items/invoices-items'
import { invoices } from './invoices/invoices'
import { clients } from './clients/clients'
import { products } from './products/products'
import { user } from './users/users'
// For more information about this file see https://dove.feathersjs.com/guides/cli/application.html#configure-functions
import type { Application } from '../declarations'

export const services = (app: Application) => {
  app.configure(invoicesItems)
  app.configure(invoices)
  app.configure(clients)
  app.configure(products)
  app.configure(user)
  // All services will be registered here
}
