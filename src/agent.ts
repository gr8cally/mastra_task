import { Agent } from '@mastra/core/agent';
import { RAGEngine } from './utils/rag-engine.js';
import { createRagTool } from './tools/rag-tool.js';
import dotenv from 'dotenv';

dotenv.config();

export const initializeAgent = async () => {
  const ragEngine = new RAGEngine();
  
  // Initialize RAG engine (this will index files in data/ on startup)
  await ragEngine.init();

  const ragTool = createRagTool(ragEngine);

  const modelId = process.env.REASONING_MODEL_NAME || 'openai/gpt-4o';

  return new Agent({
    id: 'mastra-cli-assistant',
    name: 'Mastra Assistant',
    instructions: 'You are a helpful AI assistant powered by Mastra. You have access to a knowledge base through a RAG tool. Use it to provide accurate answers about the provided documents.',
    model: modelId as any,
    tools: {
      rag: ragTool,
    },
  });
};
