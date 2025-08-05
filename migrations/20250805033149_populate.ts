import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    knex('users').insert({ email: '1', password: '1' })
    .returning(['id', 'email', 'password'])
    .then(rows => {
    console.log('Inserted user:', rows[0]);
  })
}


export async function down(knex: Knex): Promise<void> {
}

