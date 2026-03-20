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
      const results = await ragEngine.query(query);
      
      if (!results || results.length === 0) {
        return {
          text: 'No relevant information found in the knowledge base.',
        };
      }

      // Format results for the LLM
      const formattedResults = results
        .map((res, index) => {
          const source = res.metadata?.filename || res.metadata?.source || 'Unknown Source';
          const content = res.metadata?.text || res.document || 'No content available';
          return `[Source ${index + 1}: ${source}]\n${content}`;
        })
        .join('\n\n---\n\n');

      return {
        text: `Found the following relevant information:\n\n${formattedResults}`,
      };
    },
  });
};
