import { tool as createTool } from 'ai';
import { z } from 'zod';

export const getProtocolInfoTool = createTool({
  description: 'Get detailed information about a specific DeFi protocol on Stacks including TVL, historical data, and metrics. Use this when the user asks about a specific protocol like ALEX, Velar, Arkadiko, or wants details about a particular DeFi project.',
  inputSchema: z.object({
    protocolName: z.string().describe('Name or slug of the protocol (e.g., "alex", "velar", "arkadiko")'),
  }),
  execute: async function ({ protocolName }) {
    try {
      // Normalize protocol name for search
      const searchName = protocolName.toLowerCase().trim();
      
      // Fetch all protocols to find the specific one
      const protocolsResponse = await fetch('https://api.llama.fi/protocols');
      
      if (!protocolsResponse.ok) {
        throw new Error('Failed to fetch protocols data');
      }

      const allProtocols = await protocolsResponse.json();
      
      // Find the protocol (check both name and slug, and must be on Stacks)
      const protocol = allProtocols.find((p: any) => {
        const chains = p.chains || [];
        const isOnStacks = chains.includes('Stacks') || p.chain === 'Stacks';
        const nameMatch = p.name.toLowerCase().includes(searchName) || 
                         p.slug?.toLowerCase().includes(searchName);
        return isOnStacks && nameMatch;
      });

      if (!protocol) {
        throw new Error(`Protocol "${protocolName}" not found on Stacks blockchain`);
      }

      // Fetch detailed protocol data if available
      const slug = protocol.slug;
      let historicalTVL = [];
      
      try {
        const detailsResponse = await fetch(`https://api.llama.fi/protocol/${slug}`);
        if (detailsResponse.ok) {
          const details = await detailsResponse.json();
          
          // Filter for Stacks chain TVL if available
          if (details.chainTvls && details.chainTvls.Stacks) {
            historicalTVL = Object.entries(details.chainTvls.Stacks)
              .map(([timestamp, tvl]) => {
                const numericTvl = typeof tvl === 'number' ? tvl : parseFloat(String(tvl)) || 0;
                return {
                  date: parseInt(timestamp),
                  tvl: numericTvl,
                };
              })
              .filter((entry) => !isNaN(entry.date) && !isNaN(entry.tvl))
              .sort((a, b) => a.date - b.date);
          } else if (details.tvl) {
            // Fallback to overall TVL history
            historicalTVL = details.tvl
              .map((entry: any) => {
                const numericTvl = typeof entry.totalLiquidityUSD === 'number' 
                  ? entry.totalLiquidityUSD 
                  : parseFloat(String(entry.totalLiquidityUSD)) || 0;
                return {
                  date: entry.date,
                  tvl: numericTvl,
                };
              })
              .filter((entry: any) => !isNaN(entry.date) && !isNaN(entry.tvl));
          }
        }
      } catch (e) {
        console.error('Failed to fetch historical TVL data:', e);
        // Historical data not available, continue without it
      }

      // Helper function to ensure numeric values
      const toNumber = (value: any): number => {
        if (typeof value === 'number' && !isNaN(value)) return value;
        if (typeof value === 'string') {
          const parsed = parseFloat(value);
          return isNaN(parsed) ? 0 : parsed;
        }
        return 0;
      };

      return {
        name: protocol.name,
        slug: protocol.slug,
        category: protocol.category || 'Unknown',
        tvl: toNumber(protocol.tvl),
        change_1d: toNumber(protocol.change_1d),
        change_7d: toNumber(protocol.change_7d),
        change_1m: toNumber(protocol.change_1m),
        mcap: toNumber(protocol.mcap),
        logo: protocol.logo || null,
        url: protocol.url || null,
        description: protocol.description || '',
        twitter: protocol.twitter || null,
        historicalTVL,
        chains: protocol.chains || [],
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch protocol information');
    }
  },
});



