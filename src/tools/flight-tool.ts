import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const flightTool = createTool({
  id: 'get-flight-schedule',
  description: 'Get flight schedule and price between two cities.',
  inputSchema: z.object({
    origin: z.string().describe('The city of origin'),
    destination: z.string().describe('The destination city'),
  }),
  execute: async ({ origin, destination }) => {
    return {
      origin,
      destination,
      flight_time_hours: 5.5,
      price_usd: 920,
    };
  },
});
