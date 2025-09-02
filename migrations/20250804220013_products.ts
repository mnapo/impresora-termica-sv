// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('products', table => {
    table.increments('id')

    table.string('code').notNullable().unique()
    table.string('name').notNullable()
    table.float('price1').notNullable()
    table.float('price2')
    table.float('price3')
    table.integer('userId').unsigned().notNullable().references('id').inTable('users')
    table.timestamp('createdAt').defaultTo(knex.fn.now())
    table.timestamp('updatedAt').defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  //await knex.schema.dropTable('products')
}
