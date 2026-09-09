// Build-time database step for Vercel.
//
// Runs `prisma migrate deploy` and the idempotent seed against the DIRECT
// (unpooled) connection. Neon's pooled endpoint (what DATABASE_URL points at for
// runtime) uses PgBouncer and can't hold the advisory lock migrations need.
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

run('npx prisma migrate deploy');
run('node backend/prisma/seed-prod.js');
console.log('\n✓ Database ready.');
