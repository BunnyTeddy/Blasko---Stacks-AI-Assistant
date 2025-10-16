import { tool as createTool } from 'ai';
import { z } from 'zod';

const API_KEY = process.env.HIRO_API_KEY;

export const getContractTool = createTool({
  description: 'Get information about a smart contract on the Stacks blockchain including its source code, interface, and status. Use this when the user asks about a contract, wants to see contract code, or check contract details.',
  inputSchema: z.object({
    contractAddress: z.string().describe('The contract address (format: SP...ADDRESS or ST...ADDRESS)'),
    contractName: z.string().describe('The contract name'),
  }),
  execute: async function ({ contractAddress, contractName }) {
    try {
      // Fetch contract info
      const infoResponse = await fetch(
        `https://api.hiro.so/extended/v1/contract/${contractAddress}.${contractName}`,
        {
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      if (!infoResponse.ok) {
        throw new Error(`Failed to fetch contract: ${infoResponse.statusText}`);
      }

      const contractInfo = await infoResponse.json();

      // Fetch contract source code
      const sourceResponse = await fetch(
        `https://api.hiro.so/extended/v1/contract/${contractAddress}.${contractName}/source`,
        {
          headers: {
            'Accept': 'application/json',
            'x-api-key': API_KEY,
          },
        }
      );

      let sourceCode = null;
      if (sourceResponse.ok) {
        const sourceData = await sourceResponse.json();
        sourceCode = sourceData.source;
      }

      return {
        ...contractInfo,
        source_code: sourceCode,
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch contract data');
    }
  },
});

