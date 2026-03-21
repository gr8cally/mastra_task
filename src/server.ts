import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Mastra } from '@mastra/core';

const SERVER_PORT = parseInt(process.env.MASTRA_SERVER_PORT || '4111', 10);

/**
 * Starts a lightweight HTTP server that exposes the Mastra agent over REST.
 *
 * Endpoints:
 *   GET  /api/health                → { status: 'ok' }
 */
export const startServer = (mastra: Mastra): Promise<ReturnType<typeof createServer>> => {
  return new Promise((resolve, reject) => {
    const server = createServer(async (req: IncomingMessage, res: ServerResponse) => {
      try {
        // --- Health check ---
        if (req.method === 'GET' && req.url === '/api/health') {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ status: 'ok' }));
          return;
        }
      } catch (error) {
        console.error('[Server Error]', (error as Error).message);
        if (!res.headersSent) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
        }
        res.end(JSON.stringify({ error: (error as Error).message }));
      }
    });

    server.on('error', reject);

    server.listen(SERVER_PORT, () => {
      console.log(`Mastra server listening on http://localhost:${SERVER_PORT}`);
      console.log(`  Health:   GET  http://localhost:${SERVER_PORT}/api/health`);
      resolve(server);
    });
  });
};
