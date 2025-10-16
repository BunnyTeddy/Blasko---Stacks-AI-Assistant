import { tool as createTool } from 'ai';
import { z } from 'zod';

const API_KEY = process.env.HIRO_API_KEY;

export const getAccountTool = createTool({
  description: 'Get account information including STX balance, token balances, transaction history, and NFT holdings for a Stacks address. Use this when the user asks about "my balance", "my wallet", "my account", or wants to check a specific address. IMPORTANT: When the user refers to their own wallet, you MUST use the wallet address from the system prompt.',
  inputSchema: z.object({
    address: z.string().describe('The Stacks address (starts with SP or ST). REQUIRED. Use the connected wallet address from the system prompt when user asks about their own wallet.'),
  }),
  execute: async function ({ address }) {
    if (!address) {
      throw new Error('No wallet address provided. Please connect your wallet first or provide a Stacks address.');
    }
    
    const targetAddress = address;
    try {
      // Fetch account balance and info
      const balanceResponse = await fetch(
        `https://api.hiro.so/extended/v1/address/${targetAddress}/balances`,
        {
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY || '',
          },
        }
      );

      if (!balanceResponse.ok) {
        throw new Error(`Failed to fetch account: ${balanceResponse.statusText}`);
      }

      const balanceData = await balanceResponse.json();

      // Fetch recent transactions
      const txResponse = await fetch(
        `https://api.hiro.so/extended/v1/address/${targetAddress}/transactions?limit=10`,
        {
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY || '',
          },
        }
      );

      let recentTransactions = [];
      if (txResponse.ok) {
        const txData = await txResponse.json();
        recentTransactions = txData.results || [];
      }

      return {
        address: targetAddress,
        balances: balanceData,
        recentTransactions,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch account data');
    }
  },
});

