import { tool as createTool } from 'ai';
import { z } from 'zod';

export const getDefiCategoriesTool = createTool({
  description: 'Get the breakdown of DeFi categories on Stacks blockchain (DEX, Lending, Yield, etc.) with their respective TVL distribution. Use this when the user asks about DeFi category distribution, types of DeFi on Stacks, or market composition.',
  inputSchema: z.object({}),
  execute: async function () {
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
        });

      // Calculate total TVL
      const totalTVL = stacksProtocols.reduce((sum: number, p: any) => sum + (p.tvl || 0), 0);

      // Group protocols by category
      const categoriesMap: Record<string, { tvl: number; count: number; protocols: string[] }> = {};
      
      stacksProtocols.forEach((p: any) => {
        const category = p.category || 'Other';
        if (!categoriesMap[category]) {
          categoriesMap[category] = { tvl: 0, count: 0, protocols: [] };
        }
        categoriesMap[category].tvl += p.tvl || 0;
        categoriesMap[category].count += 1;
        categoriesMap[category].protocols.push(p.name);
      });

      // Convert to array and calculate percentages
      const categories = Object.entries(categoriesMap)
        .map(([name, data]) => ({
          name,
          tvl: data.tvl,
          count: data.count,
          percentage: totalTVL > 0 ? (data.tvl / totalTVL) * 100 : 0,
          protocols: data.protocols,
        }))
        .sort((a, b) => b.tvl - a.tvl);

      return {
        chain: 'Stacks',
        totalTVL,
        categories,
        categoryCount: categories.length,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch DeFi categories');
    }
  },
});






