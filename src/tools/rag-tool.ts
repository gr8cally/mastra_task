import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { RAGEngine } from '../utils/rag-engine.js';

export const createRagTool = (ragEngine: RAGEngine) => {
  return createTool({
    id: 'rag-tool',
    description: 'Retrieve relevant information from the knowledge base to answer user questions.',
    inputSchema: z.object({
      query: z.string().describe('The search query to find relevant information.'),
    }),
    execute: async ({ query }) => {
      console.log(`\n[RAG Tool] Searching for: "${query}"...`);
      let results = await ragEngine.query(query);
      
      if (process.env.DEBUG === 'true') console.log(`[RAG Tool] Raw results count:`, results?.length || 0);
      
      // Handle potential results structure variations from ChromaVector
      if (results && !Array.isArray(results) && (results as any).results) {
        results = (results as any).results;
      }
      
      if (!results || !Array.isArray(results) || results.length === 0) {
        if (process.env.DEBUG === 'true') console.log(`[RAG Tool] No results found.`);
        return 'No relevant information found in the documents.';
      }

      // Format results for the LLM
      const formattedResults = results
        .map((res: any, index: number) => {
          const content = res.metadata?.text || res.document || 'No content available';
          const source = res.metadata?.filename || 'unknown file';
          return `[DOCUMENT SNIPPET ${index + 1} (from ${source})]: ${content}`;
        })
        .join('\n\n');

      if (process.env.DEBUG === 'true') console.log(`[RAG Tool] Formatted results length:`, formattedResults.length);

      return `FOUND INFORMATION:\n${formattedResults}`;
    },
  });
};
