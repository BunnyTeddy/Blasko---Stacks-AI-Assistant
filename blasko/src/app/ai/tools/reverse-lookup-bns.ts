import { tool as createTool } from 'ai';
import { z } from 'zod';

export const reverseLookupBNSTool = createTool({
  description: 'Get the BNS (Bitcoin Name Service) name associated with a Stacks address. Use this when you want to find out what BNS name (like "alice.btc") is owned by a specific Stacks address. A principal can only own one name at a time.',
  inputSchema: z.object({
    address: z.string().describe('The Stacks address (SP... or ST...) to look up'),
  }),
  execute: async function ({ address }) {
    const API_KEY = process.env.HIRO_API_KEY;

    try {
      // Validate address format
      if (!address.match(/^(SP|ST)[0-9A-Z]{38,41}$/)) {
        return {
          address,
          bnsName: null,
          message: 'Invalid Stacks address format',
          error: 'invalid_address',
        };
      }

      // Try to get BNS names for this address
      const response = await fetch(`https://api.hiro.so/v1/addresses/stacks/${address}`, {
        headers: {
          'Accept': 'application/json',
          'x-api-key': API_KEY,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.names && data.names.length > 0) {
          const primaryName = data.names[0]; // First name is the primary/most recent
          return {
            address,
            bnsName: primaryName,
            allNames: data.names,
            message: `Found BNS name: ${primaryName}`,
          };
        } else {
          return {
            address,
            bnsName: null,
            allNames: [],
            message: 'No BNS names found for this address',
          };
        }
      } else if (response.status === 404) {
        return {
          address,
          bnsName: null,
          allNames: [],
          message: 'No BNS names found for this address',
        };
      } else {
        throw new Error(`Failed to lookup address: ${response.statusText}`);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to perform reverse BNS lookup');
    }
  },
});



