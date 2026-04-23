/**
 * Servidor de produção para Equipment Genius
 * Usa Miniflare para rodar o worker do TanStack Start localmente
 */
import { Miniflare } from 'miniflare';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

const mf = new Miniflare({
  scriptPath: join(__dirname, 'dist/server/index.js'),
  modules: true,
  compatibilityDate: '2025-09-24',
  compatibilityFlags: ['nodejs_compat'],
  assets: {
    directory: join(__dirname, 'dist/client'),
  },
  port: PORT,
  host: '0.0.0.0',
});

await mf.ready;
console.log(`Equipment Genius rodando em http://0.0.0.0:${PORT}`);
