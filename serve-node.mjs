/**
 * Servidor de produção para Equipment Genius
 * Serve o shell HTML + assets estáticos, deixando React hidratar no cliente
 */
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 8080;

const MIME_TYPES = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webp': 'image/webp',
  '.map': 'application/json',
};

const clientDir = join(__dirname, 'dist', 'client');

// Gerar o HTML shell da aplicação
// Lemos os assets do index.js para incluir no HTML
const assetsDir = join(clientDir, 'assets');

// Encontrar os arquivos principais
function findAsset(pattern) {
  try {
    const files = readFileSync(assetsDir, 'utf-8');
    // Não é possível ler diretório assim, usar fs.readdirSync
  } catch(e) {}
  return null;
}

import { readdirSync } from 'node:fs';

const assetFiles = readdirSync(assetsDir);
const mainJs = assetFiles.find(f => f.match(/^index-[A-Za-z0-9]+\.js$/) && !f.includes('admin') && !f.includes('showcase'));
const mainCss = assetFiles.find(f => f.match(/^styles-[A-Za-z0-9]+\.css$/));

console.log('Assets encontrados:', { mainJs, mainCss });

// HTML shell da aplicação (sem SSR)
const HTML_SHELL = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Catálogo Pro · Equipamentos</title>
  <meta name="description" content="Catálogo profissional de equipamentos com comparação dinâmica." />
  <meta property="og:title" content="Catálogo Pro · Equipamentos" />
  <meta property="og:description" content="Catálogo profissional de equipamentos com comparação dinâmica." />
  <meta property="og:type" content="website" />
  ${mainCss ? `<link rel="stylesheet" href="/assets/${mainCss}" />` : ''}
  ${mainJs ? `<link rel="modulepreload" href="/assets/${mainJs}" />` : ''}
</head>
<body>
  <div id="root"></div>
  ${mainJs ? `<script type="module" src="/assets/${mainJs}"></script>` : ''}
</body>
</html>`;

const server = createServer(async (req, res) => {
  try {
    const urlPath = req.url.split('?')[0];
    
    // Servir todos os arquivos estáticos do dist/client diretamente
    const staticFilePath = join(clientDir, urlPath);
    if (existsSync(staticFilePath)) {
      try {
        const stat = statSync(staticFilePath);
        if (stat.isFile()) {
          const ext = extname(staticFilePath);
          const mime = MIME_TYPES[ext] || 'application/octet-stream';
          const content = readFileSync(staticFilePath);
          res.writeHead(200, { 
            'Content-Type': mime,
            'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
            'Content-Length': content.length
          });
          res.end(content);
          return;
        }
      } catch (e) {
        // Continua
      }
    }

    // Para todas as rotas da SPA, servir o HTML shell
    res.writeHead(200, { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-cache'
    });
    res.end(HTML_SHELL);

  } catch (err) {
    console.error('Erro no servidor:', err.message);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error: ' + err.message);
  }
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Equipment Genius rodando em http://0.0.0.0:${PORT}`);
  console.log(`   HTML Shell: ${mainJs ? 'OK' : 'ERRO - JS não encontrado'}`);
});
