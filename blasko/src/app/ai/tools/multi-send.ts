import { tool as createTool } from 'ai';
import { z } from 'zod';

export const multiSendTool = createTool({
  description: 'Send STX tokens to multiple recipients in a single transaction. Use this when the user wants to send tokens to multiple addresses at once, either by providing a list of addresses and amounts, or by uploading a CSV file. This is more efficient and cheaper than sending individual transactions.',
  inputSchema: z.object({
    recipients: z.array(
      z.object({
        address: z.string().describe('The recipient Stacks address (e.g., SP2MF04VAGYHGAZWGTEDW5VYCPDWWSY08Z1QFNDSN)'),
        amount: z.string().describe('The amount of STX to send to this recipient (e.g., "1.5" for 1.5 STX)'),
        memo: z.string().optional().describe('Optional memo for this recipient'),
      })
    ).describe('Array of recipients, each with address, amount, and optional memo. Maximum 200 recipients.'),
  }),
  execute: async function ({ recipients }) {
    // Validate recipient count
    if (recipients.length === 0) {
      throw new Error('At least one recipient is required');
    }
    if (recipients.length > 200) {
      throw new Error('Maximum 200 recipients allowed per transaction');
    }

    // Validate addresses format
    for (const recipient of recipients) {
      if (!recipient.address.startsWith('SP') && !recipient.address.startsWith('ST')) {
        throw new Error(`Invalid Stacks address: ${recipient.address}`);
      }
    }

    // Calculate total amount
    const totalAmount = recipients.reduce((sum, r) => {
      const amount = parseFloat(r.amount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error(`Invalid amount for ${r.address}: ${r.amount}`);
      }
      return sum + amount;
    }, 0);

    // Convert amounts to microSTX
    const recipientsWithMicroSTX = recipients.map(r => ({
      address: r.address,
      amount: r.amount,
      amountMicroSTX: (parseFloat(r.amount) * 1_000_000).toString(),
      memo: r.memo || '',
    }));

    return {
      recipients: recipientsWithMicroSTX,
      totalAmount: totalAmount.toString(),
      totalAmountMicroSTX: (totalAmount * 1_000_000).toString(),
      recipientCount: recipients.length,
      // Contract details for the multisend - using verified send-many contract
      contractAddress: 'SP3FBR2AGK5H9QBDH3EEN6DF8EK8JY7RX8QJ5SVTE',
      contractName: 'send-many',
      functionName: 'send-many',
    };
  },
});


