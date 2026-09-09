// Build-time database step for Vercel.
//
// Uses `prisma db push` (schema-driven) rather than `migrate deploy`: the
// committed migration history under prisma/migrations was generated for SQLite
// (INTEGER PRIMARY KEY AUTOINCREMENT, REAL, ...) and is not valid Postgres.
// schema.prisma itself is valid Postgres, so db push builds the schema straight
// from it. Then runs the idempotent seed.
//
// Both steps run against the DIRECT (unpooled) connection — Neon's pooled
// endpoint (what DATABASE_URL points at for runtime) uses PgBouncer and can't
// hold the advisory lock DDL needs.
import { execSync } from 'node:child_process';

const directUrl =
  process.env.DATABASE_URL_UNPOOLED ||
  process.env.POSTGRES_URL_NON_POOLING ||
  process.env.DATABASE_URL;

if (!directUrl) {
  console.error('✗ No database URL found (DATABASE_URL / DATABASE_URL_UNPOOLED).');
  process.exit(1);
}

const env = { ...process.env, DATABASE_URL: directUrl };
const run = (cmd) => {
  console.log(`\n▶ ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env });
};

run('npx prisma db push --skip-generate --accept-data-loss');
run('node backend/prisma/seed-prod.js');
console.log('\n✓ Database ready.');
