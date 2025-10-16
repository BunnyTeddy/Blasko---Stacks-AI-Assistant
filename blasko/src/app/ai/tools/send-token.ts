import { tool as createTool } from 'ai';
import { z } from 'zod';

export const sendTokenTool = createTool({
  description: 'Send STX or fungible tokens on the Stacks blockchain to another address. Use this when the user wants to send, transfer, or pay tokens (STX, USDA, sBTC, WELSH, etc.) to someone.',
  inputSchema: z.object({
    token: z.string().optional().describe('The token to send. Can be "STX" for Stacks tokens, or token symbol like "USDA", "sBTC", "WELSH". If not specified, defaults to STX.'),
    amount: z.string().optional().describe('The amount of tokens to send (e.g., "1", "0.5", "100")'),
    recipient: z.string().optional().describe('The recipient Stacks address (starts with SP or ST)'),
    memo: z.string().optional().describe('Optional memo/note for the transfer'),
    contractAddress: z.string().optional().describe('Full contract address for the token (e.g., "SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.token-name")'),
  }),
  execute: async function ({ token, amount, recipient, memo, contractAddress }) {
    // Return the extracted data - the UI component will handle the actual transaction
    return {
      token: token || 'STX',
      amount: amount || '',
      recipient: recipient || '',
      memo: memo || '',
      contractAddress: contractAddress || '',
    };
  },
});

