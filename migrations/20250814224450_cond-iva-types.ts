// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'
import { app } from '../src/app'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('cond-iva-types', table => {
    table.increments('id')

    table.string('name').notNullable()
  });
  await app.service('cond-iva-types').create({ name: 'Responsable Inscripto' });
  await app.service('cond-iva-types').create({ name: 'IVA Excento' });
  await app.service('cond-iva-types').create({ name: 'Monotributista' });
}

export async function down(knex: Knex): Promise<void> {
  //await knex.schema.dropTable('cond-iva-types')
}
