import { tool as createTool } from 'ai';
import { z } from 'zod';

export const getTopProtocolsTool = createTool({
  description: 'Get the top DeFi protocols on the Stacks blockchain ranked by Total Value Locked (TVL). Use this when the user asks about top Stacks protocols, which DeFi apps are on Stacks, protocol rankings, or wants to see a list of DeFi projects.',
  inputSchema: z.object({
    limit: z.number().optional().describe('Number of top protocols to return (1-20). Defaults to 10'),
  }),
  execute: async function ({ limit = 10 }) {
    try {
      // Fetch all protocols
      const protocolsResponse = await fetch('https://api.llama.fi/protocols');
      
      if (!protocolsResponse.ok) {
        throw new Error('Failed to fetch protocols data');
      }

      const allProtocols = await protocolsResponse.json();
      
      // Filter Stacks protocols
      const stacksProtocols = allProtocols
        .filter((p: any) => {
          const chains = p.chains || [];
          return chains.includes('Stacks') || p.chain === 'Stacks';
        })
        .map((p: any) => ({
          name: p.name,
          tvl: p.tvl || 0,
          category: p.category || 'Unknown',
          change_1d: p.change_1d || 0,
          change_7d: p.change_7d || 0,
          change_1m: p.change_1m || 0,
          mcap: p.mcap || 0,
          slug: p.slug,
          logo: p.logo || null,
          url: p.url || null,
        }))
        .sort((a: any, b: any) => b.tvl - a.tvl)
        .slice(0, Math.min(Math.max(limit, 1), 20)); // Limit between 1-20

      return {
        chain: 'Stacks',
        protocols: stacksProtocols,
        count: stacksProtocols.length,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch top protocols');
    }
  },
});






