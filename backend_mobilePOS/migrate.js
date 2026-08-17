const fs = require('fs');
const path = require('path');
const db = require('./db');

const MIGRATIONS_TABLE = 'migrations';

async function ensureMigrationsTable() {
  await db.query(
    `CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      run_on TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;`
  );
}

function listMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) return [];
  return fs.readdirSync(migrationsDir)
    .filter(f => f.match(/\.(js|sql)$/))
    .sort();
}

async function hasMigrationRun(name) {
  const [rows] = await db.query(
    `SELECT 1 FROM ${MIGRATIONS_TABLE} WHERE name = ? LIMIT 1`,
    [name]
  );
  return rows.length > 0;
}

async function markMigrationRun(name) {
  await db.query(
    `INSERT INTO ${MIGRATIONS_TABLE} (name) VALUES (?)`,
    [name]
  );
}

async function runJsMigration(filePath) {
  const migration = require(filePath);
  if (typeof migration.up === 'function') {
    await migration.up();
  } else if (typeof migration === 'function') {
    await migration();
  } else {
    throw new Error(`No up() function exported in ${filePath}`);
  }
}

async function runSqlMigration(filePath) {
  const sql = fs.readFileSync(filePath, 'utf8');
  // split on ; that ends a statement. Keep simple: run whole file as one query.
  await db.query(sql);
}

async function runMigrations() {
  await ensureMigrationsTable();

  const files = listMigrationFiles();
  for (const file of files) {
    const name = file;
    const fullPath = path.join(__dirname, 'migrations', file);
    try {
      const already = await hasMigrationRun(name);
      if (already) continue;

      console.log('Running migration:', name);
      if (file.endsWith('.js')) {
        // require with absolute path
        await runJsMigration(fullPath);
      } else if (file.endsWith('.sql')) {
        await runSqlMigration(fullPath);
      }

      await markMigrationRun(name);
      console.log('Migration completed:', name);
    } catch (err) {
      console.error('Migration failed:', name, err);
      throw err;
    }
  }
}

module.exports = runMigrations;

if (require.main === module) {
  // CLI mode
  runMigrations()
    .then(() => {
      console.log('All migrations finished');
      process.exit(0);
    })
    .catch(err => {
      console.error('Migrations error', err);
      process.exit(1);
    });
}
