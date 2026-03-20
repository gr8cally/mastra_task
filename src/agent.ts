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
  console.log(`Initializing Agent with model: ${modelId}`);

  return new Agent({
    id: 'mastra-cli-assistant',
    name: 'Mastra Assistant',
    instructions: `You are a helpful AI assistant. 
    1. Use the "rag-tool" to search the knowledge base for any questions about Mastra or the provided documents.
    2. Use "get-flight-schedule", "get-hotel-schedule", and "convert-currency" for travel-related queries.
    3. IMPORTANT: After using any tool or performing reasoning, you MUST provide a final, natural language response to the user. Do not just stop after the tool output.
    4. If you are asked "what is my name", use your memory of previous messages to answer.
    5. If you don't find information in the knowledge base, state that clearly.`,
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
