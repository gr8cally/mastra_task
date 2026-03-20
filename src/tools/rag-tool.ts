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
      console.log(`[RAG Tool] Searching for: "${query}"...`);
      let results = await ragEngine.query(query);
      
      // Handle potential results structure variations from ChromaVector
      if (results && !Array.isArray(results) && (results as any).results) {
        results = (results as any).results;
      }
      
      if (!results || !Array.isArray(results) || results.length === 0) {
        return 'No relevant information found in the knowledge base.';
      }

      // Format results for the LLM
      const formattedResults = results
        .map((res: any, index: number) => {
          const source = res.metadata?.filename || res.metadata?.source || 'Unknown Source';
          const content = res.metadata?.text || res.document || 'No content available';
          return `Snippet ${index + 1} (from ${source}):\n${content}`;
        })
        .join('\n\n---\n\n');

      return `The following information was found in the documents:\n\n${formattedResults}`;
    },
  });
};
