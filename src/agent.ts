import { Agent } from '@mastra/core/agent';
import { Memory } from '@mastra/memory';
import { RAGEngine } from './utils/rag-engine.js';
import { createRagTool, flightTool, hotelTool, currencyTool } from './tools/index.js';
import dotenv from 'dotenv';

dotenv.config();

export const initializeAgent = async () => {
  const ragEngine = new RAGEngine();
  
  // Initialize RAG engine (this will index files in data/ on startup)
  await ragEngine.init();

  const ragTool = createRagTool(ragEngine);

  // Use MODEL_NAME env variable as per task.md requirements
  const modelId = process.env.MODEL_NAME || 'nvidia/nemotron-3-nano-30b-a3b:free';

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
    memory: new Memory(),
  });
};
