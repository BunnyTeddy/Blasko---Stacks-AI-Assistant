import { tool as createTool } from 'ai';
import { z } from 'zod';

export const getStacksTVLTool = createTool({
  description: 'Get Total Value Locked (TVL) data for the Stacks blockchain with historical chart data. Use this when the user asks about Stacks TVL, total value locked, or DeFi liquidity trends over time.',
  inputSchema: z.object({
    timeframe: z.string().optional().describe('Timeframe for historical data: "7d", "30d", "90d", "1y", "all". Defaults to "30d"'),
  }),
  execute: async function ({ timeframe = '30d' }) {
    try {
      // Fetch historical TVL for Stacks chain
      const tvlResponse = await fetch('https://api.llama.fi/v2/historicalChainTvl/Stacks');
      
      if (!tvlResponse.ok) {
        throw new Error('Failed to fetch Stacks TVL data');
      }

      const tvlData = await tvlResponse.json();

      // Filter TVL data based on timeframe
      const now = Date.now() / 1000;
      let cutoffTime = now;
      
      switch (timeframe) {
        case '7d':
          cutoffTime = now - (7 * 24 * 60 * 60);
          break;
        case '30d':
          cutoffTime = now - (30 * 24 * 60 * 60);
          break;
        case '90d':
          cutoffTime = now - (90 * 24 * 60 * 60);
          break;
        case '1y':
          cutoffTime = now - (365 * 24 * 60 * 60);
          break;
        case 'all':
          cutoffTime = 0;
          break;
      }

      const filteredTVL = tvlData.filter((entry: any) => entry.date >= cutoffTime);

      // Calculate current TVL and changes
      const currentTVL = filteredTVL[filteredTVL.length - 1]?.tvl || 0;
      const previousTVL = filteredTVL[0]?.tvl || 0;
      const tvlChange = previousTVL > 0 ? ((currentTVL - previousTVL) / previousTVL) * 100 : 0;

      // Calculate 24h change
      const oneDayAgo = now - (24 * 60 * 60);
      const oneDayAgoEntry = filteredTVL.find((entry: any) => entry.date >= oneDayAgo) || filteredTVL[filteredTVL.length - 2];
      const tvlChange24h = oneDayAgoEntry ? ((currentTVL - oneDayAgoEntry.tvl) / oneDayAgoEntry.tvl) * 100 : 0;

      return {
        chain: 'Stacks',
        currentTVL,
        tvlChange,
        tvlChange24h,
        timeframe,
        historicalTVL: filteredTVL,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch Stacks TVL data');
    }
  },
});






