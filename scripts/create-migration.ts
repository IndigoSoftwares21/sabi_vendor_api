// scripts/create-migration.ts
import * as fs from 'fs/promises';
import * as path from 'path';

async function createMigration() {
    console.log('Starting migration creation...'); // Add this line
    const migrationName = process.argv[2];
    if (!migrationName) {
        console.error('Please provide a migration name. Usage: npm run migrate:new -- <name>');
        process.exit(1);
    }

    const timestamp = new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 14);
    const fullName = `${timestamp}_${migrationName}`;

    const scriptsDir = path.resolve(__dirname, '../migrations/scripts');
    const queriesDir = path.resolve(__dirname, '../migrations/queries');
    const tsFile = path.join(scriptsDir, `${fullName}.ts`);
    const upSqlFile = path.join(queriesDir, `${fullName}.up.sql`);
    const downSqlFile = path.join(queriesDir, `${fullName}.down.sql`);

    await fs.mkdir(scriptsDir, { recursive: true });
    await fs.mkdir(queriesDir, { recursive: true });

    const tsContent = `import { Knex } from 'knex';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function up(knex: Knex): Promise<void> {
  const migrationName = path.basename(__filename, '.ts');
  const sqlPath = path.resolve(__dirname, '../queries', \`\${migrationName}.up.sql\`);
  const sql = await fs.readFile(sqlPath, 'utf8');
  await knex.raw(sql);
}

export async function down(knex: Knex): Promise<void> {
  const migrationName = path.basename(__filename, '.ts');
  const sqlPath = path.resolve(__dirname, '../queries', \`\${migrationName}.down.sql\`);
  const sql = await fs.readFile(sqlPath, 'utf8');
  await knex.raw(sql);
}`;

    const upSqlContent = `-- Up migration for ${migrationName}\n-- Write your SQL here\n`;
    const downSqlContent = `-- Down migration for ${migrationName}\n-- Write your SQL here\n`;

    try {
        await Promise.all([
            fs.writeFile(tsFile, tsContent.trim(), 'utf8'),
            fs.writeFile(upSqlFile, upSqlContent, 'utf8'),
            fs.writeFile(downSqlFile, downSqlContent, 'utf8'),
        ]);
        console.log(`Created migration: ${fullName}`);
        console.log(`- ${tsFile}`);
        console.log(`- ${upSqlFile}`);
        console.log(`- ${downSqlFile}`);
    } catch (err: any) {
        console.error('Failed to create migration files:', err.message);
        process.exit(1);
    }
}

createMigration();