import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

function mongoApiPlugin(): Plugin {
  return {
    name: 'mongo-api-plugin',
    configureServer(server) {
      server.middlewares.use('/api', async (req: any, res: any, next) => {
        try {
          const module = await import('./api/index.js');
          const handler = module.default;

          // Helper to polyfill express-like res.status().json()
          res.status = (code: number) => {
            res.statusCode = code;
            return res;
          };
          res.json = (data: any) => {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(data));
          };

          if (['POST', 'PUT', 'PATCH'].includes(req.method || '')) {
            let body = '';
            req.on('data', (chunk: any) => { body += chunk; });
            req.on('end', async () => {
              try {
                req.body = body ? JSON.parse(body) : {};
              } catch {
                req.body = {};
              }
              await handler(req, res);
            });
          } else {
            req.body = {};
            await handler(req, res);
          }
        } catch (err: any) {
          console.error('Vite Mongo API Middleware Error:', err);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: err.message }));
        }
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), mongoApiPlugin()],
});
