import { tool as createTool } from 'ai';
import { z } from 'zod';

export const stackStxTool = createTool({
  description: 'Stack STX tokens to earn Bitcoin rewards through Proof-of-Transfer (PoX). Users can stack solo (requires 125K+ STX) or delegate to a pool (any amount). Use this when users want to stake, stack, earn rewards, or participate in PoX.',
  inputSchema: z.object({
    mode: z.enum(['solo', 'pool', 'dashboard']).describe('Stacking mode: "solo" for direct stacking, "pool" for delegated stacking, "dashboard" to view current position'),
    amount: z.string().optional().describe('Amount of STX to stack or delegate (e.g., "150000")'),
    lockPeriod: z.number().optional().describe('Number of reward cycles to lock STX (1-12 cycles, ~2 weeks each)'),
    btcAddress: z.string().optional().describe('Bitcoin address to receive PoX rewards (for solo stacking)'),
    poolAddress: z.string().optional().describe('Pool operator address to delegate to (for pool stacking)'),
  }),
  execute: async function ({ mode, amount, lockPeriod, btcAddress, poolAddress }) {
    // Fetch current PoX information from Hiro API
    try {
      const poxResponse = await fetch('https://api.hiro.so/v2/pox');
      const poxInfo = await poxResponse.json();

      return {
        mode: mode || 'dashboard',
        amount: amount || '',
        lockPeriod: lockPeriod || 3,
        btcAddress: btcAddress || '',
        poolAddress: poolAddress || '',
        poxInfo,
      };
    } catch (error) {
      console.error('Failed to fetch PoX info:', error);
      return {
        mode: mode || 'dashboard',
        amount: amount || '',
        lockPeriod: lockPeriod || 3,
        btcAddress: btcAddress || '',
        poolAddress: poolAddress || '',
        poxInfo: null,
      };
    }
  },
});



