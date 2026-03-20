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
    instructions: `You are a helpful and conversational AI assistant.
    
    PERSONA:
    - You are knowledgeable, concise, and direct.
    - You always ensure the user gets a final natural language answer.
    
    TOOLS:
    - search_docs: Use this for ANY questions about the documents in your knowledge base.
    - get_flight: Use this for flight schedules.
    - get_hotel: Use this for hotel information.
    - convert_money: Use this for currency conversion.
    
    CRITICAL RULES:
    1. If you use a tool, read the results and then explain them to the user in a friendly way.
    2. NEVER stop after a tool call. You MUST provide a final summary or answer.
    3. If you are asked about your name or the user's name, use your memory.
    4. If no information is found in the documents, tell the user you couldn't find it but offer to help with something else.`,
    // Correctly typed model identifier
    model: modelId as any,
    tools: {
      search_docs: ragTool,
      get_flight: flightTool,
      get_hotel: hotelTool,
      convert_money: currencyTool,
    },
    // Maintain conversation memory as per task.md requirements
    memory: new Memory({
      storage,
    }),
  });
};
