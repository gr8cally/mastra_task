import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { MastraCompositeStore } from '@mastra/core/storage';
import { RAGEngine } from './utils/rag-engine.js';
import { createRagTool, flightTool, hotelTool, currencyTool } from './tools/index.js';
import dotenv from 'dotenv';

dotenv.config();

export const initializeAgent = async (storage?: MastraCompositeStore) => {
  const ragEngine = new RAGEngine();
  
  // Initialize RAG engine (this will index files in data/ on startup)
  await ragEngine.init();

  const ragTool = createRagTool(ragEngine);

  // Use MODEL_NAME env variable as per task.md requirements
  let modelId = process.env.MODEL_NAME || 'nvidia/nemotron-3-nano-30b-a3b:free';

  // Ensure OpenRouter models are correctly prefixed to avoid ambiguity with native providers
  if (!modelId.startsWith('openrouter/') && (modelId.includes(':free') || modelId.startsWith('nvidia/'))) {
    console.log(`Note: Prefixing model "${modelId}" with "openrouter/" for correct routing.`);
    modelId = `openrouter/${modelId}`;
  }

  return new Agent({
    id: 'mastra-cli-assistant',
    name: 'Mastra Assistant',
    instructions: 'You are a helpful AI assistant powered by Mastra. You have access to a knowledge base through a RAG tool. Use it to provide accurate answers about the provided documents. You also have tools for flight schedules, hotel information, and currency conversion.',
    // Correctly typed model identifier
    model: modelId as any,
    tools: {
      rag: ragTool,
      flight: flightTool,
      hotel: hotelTool,
      currency: currencyTool,
    },
    // Maintain conversation memory as per task.md requirements
    memory: new Memory({
      storage,
    }),
  });
};
