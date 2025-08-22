// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('invoices', table => {
    table.increments('id')

    table.string('type').notNullable()
    table.string('cuit')
    table.string('companyName')
    table.string('address')
    table.float('total').notNullable()
    table.integer('condIvaTypeId').unsigned().references('id').inTable('cond-iva-types')
    table.integer('userId').unsigned().notNullable().references('id').inTable('users')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  //await knex.schema.dropTable('invoices')
}
