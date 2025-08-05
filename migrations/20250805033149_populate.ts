import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    knex('users').insert({ email: '1', password: '1' })
    .then(function(result) {
    console.log('Inserted data:', result); // result typically contains the ID of the inserted row
    })
    .catch(function(error) {
    console.error('Error inserting data:', error);
    });
}


export async function down(knex: Knex): Promise<void> {
}

