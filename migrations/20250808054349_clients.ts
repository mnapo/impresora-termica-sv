// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('clients', table => {
    table.increments('id')

    table.string('cuit').notNullable()
    table.string('companyName').notNullable()
    table.string('condIvaType').unsigned().notNullable().references('id').inTable('cond-iva-types')
    table.string('address')
    table.integer('userId').unsigned().notNullable().references('id').inTable('users')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  //await knex.schema.dropTable('clients')
}
