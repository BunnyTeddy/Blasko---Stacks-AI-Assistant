import { tool as createTool } from 'ai';
import { z } from 'zod';

const API_KEY = process.env.HIRO_API_KEY;

export const getTransactionTool = createTool({
  description: 'Get detailed information about a Stacks blockchain transaction by its transaction ID. Use this when the user asks about a specific transaction, wants to check transaction status, or view transaction details.',
  inputSchema: z.object({
    txId: z.string().describe('The transaction ID (starts with 0x)'),
  }),
  execute: async function ({ txId }) {
    try {
      const response = await fetch(`https://api.hiro.so/extended/v1/tx/${txId}`, {
        headers: {
          'Accept': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch transaction: ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch transaction data');
    }
  },
});

