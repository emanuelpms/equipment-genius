import express from 'express';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { existsSync, readFileSync } from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static files from dist/server/assets
const assetsDir = join(__dirname, 'dist', 'server', 'assets');
app.use('/assets', express.static(assetsDir));

// Serve the main HTML for all routes (SPA)
app.get('*', (req, res) => {
  // Try to find index.html in dist/server
  const indexPath = join(__dirname, 'dist', 'server', 'index.html');
  if (existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    // Build a minimal HTML that loads the app
    res.send(`<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Equipment Genius</title>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/assets/router-vSqeJ6v8.js"></script>
</body>
</html>`);
  }
});

const server = createServer(app);
server.listen(PORT, '0.0.0.0', () => {
  console.log(`Equipment Genius rodando em http://0.0.0.0:${PORT}`);
});
