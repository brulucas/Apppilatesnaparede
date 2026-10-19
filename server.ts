import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  // Explicit route handlers for clean URLs
  app.get('/cadastro', (req, res) => {
    const file = isProd
      ? path.resolve(__dirname, 'dist', 'cadastro.html')
      : path.resolve(__dirname, 'cadastro.html');
    res.sendFile(file);
  });

  app.get('/login', (req, res) => {
    const file = isProd
      ? path.resolve(__dirname, 'dist', 'login.html')
      : path.resolve(__dirname, 'login.html');
    res.sendFile(file);
  });

  app.get('/recuperar', (req, res) => {
    const file = isProd
      ? path.resolve(__dirname, 'dist', 'recuperar.html')
      : path.resolve(__dirname, 'recuperar.html');
    res.sendFile(file);
  });

  app.get('/nova-senha', (req, res) => {
    const file = isProd
      ? path.resolve(__dirname, 'dist', 'nova-senha.html')
      : path.resolve(__dirname, 'nova-senha.html');
    res.sendFile(file);
  });

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
