import { Mastra } from '@mastra/core';
import { InMemoryStore } from '@mastra/core/storage';
import { initializeAgent } from './agent.js';
import dotenv from 'dotenv';

dotenv.config();

export const initializeMastra = async () => {
  const storage = new InMemoryStore();

  const agent = await initializeAgent(storage);

  return new Mastra({
    storage,
    agents: {
      assistant: agent,
    },
  });
};
