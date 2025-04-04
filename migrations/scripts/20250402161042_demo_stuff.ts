import { Knex } from 'knex';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function up(knex: Knex): Promise<void> {
  const migrationName = path.basename(__filename, '.ts');
  const sqlPath = path.resolve(__dirname, '../queries', `${migrationName}.up.sql`);
  const sql = await fs.readFile(sqlPath, 'utf8');
  await knex.raw(sql);
}

export async function down(knex: Knex): Promise<void> {
  const migrationName = path.basename(__filename, '.ts');
  const sqlPath = path.resolve(__dirname, '../queries', `${migrationName}.down.sql`);
  const sql = await fs.readFile(sqlPath, 'utf8');
  await knex.raw(sql);
}