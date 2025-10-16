import { tool as createTool } from 'ai';
import { z } from 'zod';

export const swapTokenTool = createTool({
  description: 'Swap tokens on Stacks DEX (ALEX). Use this when the user wants to swap, exchange, or trade tokens for other tokens (e.g., "swap 10 STX for USDA", "exchange sBTC for WELSH").',
  inputSchema: z.object({
    fromToken: z.string().optional().describe('The token to swap from (e.g., "STX", "USDA", "sBTC", "WELSH")'),
    toToken: z.string().optional().describe('The token to swap to (e.g., "STX", "USDA", "sBTC", "WELSH")'),
    amount: z.string().optional().describe('The amount to swap (e.g., "1", "0.5", "100")'),
  }),
  execute: async function ({ fromToken, toToken, amount }) {
    // Return the extracted data - the UI component will handle the quote and swap
    return {
      fromToken: fromToken || '',
      toToken: toToken || '',
      amount: amount || '',
    };
  },
});

