import { defineConfig } from 'prisma/config';
import { config } from 'dotenv';
import { resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

// Load .env từ root workspace (2 cấp lên từ packages/database)
config({ path: resolve(__dirname, '../../.env') });
// Fallback: load .env local nếu có
config({ path: resolve(__dirname, '.env') });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    url: databaseUrl,
  },
});
