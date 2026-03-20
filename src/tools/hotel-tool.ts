import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const hotelTool = createTool({
  id: 'get-hotel-schedule',
  description: 'Get hotel options and prices for a specific city.',
  inputSchema: z.object({
    city: z.string().describe('The city to search for hotels in'),
  }),
  execute: async ({ city }) => {
    return {
      city,
      hotels: [
        { name: 'Nairobi Serena', price_usd: 250 },
        { name: 'Radisson Blu', price_usd: 200 },
      ],
    };
  },
});
