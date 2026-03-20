import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const currencyTool = createTool({
  id: 'convert-currency',
  description: 'Convert an amount from one currency to another.',
  inputSchema: z.object({
    amount: z.number().describe('The amount to convert'),
    from_currency: z.string().describe('The source currency code (e.g., USD)'),
    to_currency: z.string().describe('The target currency code (e.g., NGN)'),
  }),
  execute: async ({ amount, from_currency, to_currency }) => {
    const rates: Record<string, number> = { USD_NGN: 925 };
    const key = `${from_currency}_${to_currency}`;
    const rate = rates[key];

    if (!rate) {
      throw new Error(`Exchange rate for ${key} not found. Currently only USD to NGN is supported.`);
    }

    return {
      amount_converted: amount * rate,
      currency: to_currency,
    };
  },
});
