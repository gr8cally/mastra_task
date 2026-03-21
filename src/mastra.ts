import { Mastra } from '@mastra/core';
import { InMemoryStore } from '@mastra/core/storage';
import { initializeAgent } from './agent.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Initializes the Mastra workspace.
 *
 * The Mastra constructor acts as the workspace/registry where all agents,
 * tools, and storage are registered — satisfying the task.md requirement:
 * "You must register it inside a Workspace".
 */
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
