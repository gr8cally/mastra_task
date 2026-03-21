import { createServer, IncomingMessage, ServerResponse } from 'http';
import { Mastra } from '@mastra/core';

const SERVER_PORT = parseInt(process.env.MASTRA_SERVER_PORT || '4111', 10);

/**
 * Starts a lightweight HTTP server that exposes the Mastra agent over REST.
 *
 * Endpoints:
 *   GET  /api/health                → { status: 'ok' }
 *   POST /api/agents/:agentId/generate → streams agent response (NDJSON)
 *
 * This satisfies the task.md requirement: "You must start a Mastra Server".
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

        // --- Agent generate (streaming) ---
        const agentMatch = req.url?.match(/^\/api\/agents\/([^/]+)\/generate$/);
        if (req.method === 'POST' && agentMatch) {
          const agentId = agentMatch[1];

          let agent;
          try {
            agent = mastra.getAgent(agentId);
          } catch {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Agent "${agentId}" not found` }));
            return;
          }

          // Read request body
          const body = await new Promise<string>((resolve) => {
            let data = '';
            req.on('data', (chunk: Buffer) => { data += chunk.toString(); });
            req.on('end', () => resolve(data));
          });

          const { messages } = JSON.parse(body) as { messages: string };

          // Stream the response as newline-delimited JSON
          res.writeHead(200, {
            'Content-Type': 'application/x-ndjson',
            'Transfer-Encoding': 'chunked',
            'Cache-Control': 'no-cache',
          });

          const result = await agent.stream(messages, { maxSteps: 5 });

          for await (const chunk of result.fullStream) {
            res.write(JSON.stringify(chunk) + '\n');
          }

          res.end();
          return;
        }

        // --- Fallback: 404 ---
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not found' }));
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
      console.log(`  Agent:    POST http://localhost:${SERVER_PORT}/api/agents/assistant/generate`);
      resolve(server);
    });
  });
};
