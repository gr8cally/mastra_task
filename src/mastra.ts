import { Mastra } from '@mastra/core';
import { initializeAgent } from './agent.js';
import dotenv from 'dotenv';

dotenv.config();

export const initializeMastra = async () => {
  const agent = await initializeAgent();

  return new Mastra({
    agents: {
      assistant: agent,
    },
  });
};
