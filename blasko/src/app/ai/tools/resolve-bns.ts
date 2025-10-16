import { tool as createTool } from 'ai';
import { z } from 'zod';

export const resolveBNSTool = createTool({
  description: 'Resolve a BNS (Bitcoin Name Service) name to a Stacks address, or validate a Stacks address. Use this when the user provides a BNS name like "alice.btc" or "bob.id" and you need to get the corresponding Stacks address. Also use this to validate if an input is a valid address or BNS name.',
  inputSchema: z.object({
    input: z.string().describe('The BNS name (e.g., "alice.btc", "bob.id") or Stacks address (SP... or ST...) to resolve/validate'),
  }),
  execute: async function ({ input }) {
    const API_KEY = process.env.HIRO_API_KEY;

    try {
      // Check if input is a Stacks address (starts with SP or ST)
      if (input.match(/^(SP|ST)[0-9A-Z]{38,41}$/)) {
        // It's an address, return as-is
        return {
          type: 'address',
          input,
          address: input,
          bnsName: null,
          message: 'Valid Stacks address',
        };
      }

      // Check if input looks like a BNS name (contains a dot)
      if (input.includes('.')) {
        const [name, namespace] = input.split('.');
        
        // Try to resolve the BNS name using Hiro API
        const response = await fetch(`https://api.hiro.so/v1/names/${input}`, {
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY,
          },
        });

        if (response.ok) {
          const data = await response.json();
          return {
            type: 'bns',
            input,
            bnsName: input,
            address: data.address,
            owner: data.address,
            namespace,
            name,
            zonefile: data.zonefile,
            message: `Resolved ${input} to ${data.address}`,
          };
        } else if (response.status === 404) {
          return {
            type: 'bns',
            input,
            bnsName: input,
            address: null,
            message: `BNS name "${input}" not found or not registered`,
            error: 'not_found',
          };
        } else {
          throw new Error(`Failed to resolve BNS name: ${response.statusText}`);
        }
      }

      // If it doesn't look like an address or BNS name
      return {
        type: 'unknown',
        input,
        address: null,
        bnsName: null,
        message: 'Input is neither a valid Stacks address nor a BNS name',
        error: 'invalid_format',
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to resolve BNS name');
    }
  },
});



