// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('invoices-items', table => {
    table.increments('id')

    table.string('name').notNullable()
    table.float('price').notNullable()
    table.integer('quantity').notNullable()    
    table.integer('userId').unsigned().notNullable().references('id').inTable('users')
    table.integer('invoiceId').unsigned().notNullable().references('id').inTable('invoices')})
}

export async function down(knex: Knex): Promise<void> {
  //await knex.schema.dropTable('invoices-items')
}
