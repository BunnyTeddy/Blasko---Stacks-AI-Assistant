import { tool as createTool } from 'ai';
import { z } from 'zod';

export const registerBNSTool = createTool({
  description: 'Check BNS (Bitcoin Name Service) name availability and help with registration using BNSv2. Use this when the user wants to register a BNS name like "alice.btc" or check if a name is available. Returns availability status, pricing, and registration instructions.',
  inputSchema: z.object({
    name: z.string().describe('The BNS name to check or register (e.g., "alice" for alice.btc)'),
    namespace: z.string().optional().describe('The namespace (e.g., "btc", "id", "stx"). Defaults to "btc"'),
  }),
  execute: async function ({ name, namespace = 'btc' }) {
    const fullName = `${name}.${namespace}`;

    try {
      // Check if the name is already registered using BNSv2 API
      const checkResponse = await fetch(`https://api.bnsv2.com/names/${fullName}`);

      if (checkResponse.ok) {
        // Name is already registered
        const data = await checkResponse.json();
        
        return {
          name,
          namespace,
          fullName,
          available: false,
          registered: true,
          owner: data.owner || data.address,
          expiresAt: data.expire_block,
          renewalHeight: data.renewal_height,
          status: data.status,
          message: `${fullName} is already registered and owned by ${data.owner || data.address}`,
        };
      } else if (checkResponse.status === 404) {
        // Name is not registered - it's available!
        // Calculate price estimate based on name length
        const nameLength = name.length;
        let estimatedPrice = 0;

        // BNSv2 pricing (simplified estimate)
        if (nameLength === 1) estimatedPrice = 400000000000; // 4000 STX
        else if (nameLength === 2) estimatedPrice = 100000000000; // 1000 STX
        else if (nameLength === 3) estimatedPrice = 40000000000; // 400 STX
        else if (nameLength === 4) estimatedPrice = 16000000000; // 160 STX
        else if (nameLength === 5) estimatedPrice = 6400000000; // 64 STX
        else if (nameLength >= 6) estimatedPrice = 2560000000; // 25.6 STX

        const priceInfo = {
          estimatedPriceMicroSTX: estimatedPrice,
          estimatedPriceSTX: estimatedPrice / 1000000,
          note: 'Price is an estimate. Actual price will be calculated when registering.',
        };

        return {
          name,
          namespace,
          fullName,
          available: true,
          registered: false,
          priceInfo,
          message: `${fullName} is available for registration!`,
          registrationMethods: [
            {
              method: 'fast',
              title: 'Fast Claim (Instant)',
              description: 'Register immediately in one transaction',
              warning: '⚠️ Vulnerable to front-running. Others can see and snipe your name.',
              steps: ['Pay the registration fee', 'Name is yours immediately'],
            },
            {
              method: 'safe',
              title: 'Safe Registration (Recommended)',
              description: 'Two-step process that prevents sniping',
              warning: null,
              steps: [
                '1. Preorder: Submit a hashed commitment',
                '2. Wait: 10 minutes for confirmation',
                '3. Register: Reveal and claim your name',
              ],
            },
          ],
        };
      } else {
        throw new Error(`Failed to check name availability: ${checkResponse.statusText}`);
      }
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to check BNS name availability');
    }
  },
});

