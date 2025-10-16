import { tool as createTool } from 'ai';
import { z } from 'zod';

export const bridgeTokenTool = createTool({
  description: 'Bridge Bitcoin (BTC) to Stacks as sBTC or withdraw sBTC back to Bitcoin. Use this when the user wants to bridge, deposit, or withdraw between Bitcoin and Stacks networks.',
  inputSchema: z.object({
    direction: z.enum(['deposit', 'withdraw']).describe('Bridge direction: "deposit" to convert BTC to sBTC, "withdraw" to convert sBTC back to BTC'),
    amount: z.string().optional().describe('Amount to bridge (e.g., "0.1" for 0.1 BTC or 0.1 sBTC)'),
    recipient: z.string().optional().describe('For deposits: Stacks address (SP...) to receive sBTC. For withdrawals: Bitcoin address to receive BTC'),
    maxFee: z.string().optional().describe('For withdrawals: Maximum fee willing to pay for the Bitcoin transaction (in sats)'),
  }),
  execute: async function ({ direction, amount, recipient, maxFee }) {
    return {
      direction: direction || 'deposit',
      amount: amount || '',
      recipient: recipient || '',
      maxFee: maxFee || '',
    };
  },
});


