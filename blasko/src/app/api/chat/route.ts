import { streamText, UIMessage, convertToModelMessages } from 'ai';
import { google } from '@ai-sdk/google';
import { tools } from '@/app/ai/tool';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const {
    messages,
    walletAddress,
  }: { 
    messages: UIMessage[]; 
    model?: string; 
    webSearch?: boolean;
    walletAddress?: string;
  } = await req.json();

  // Build system prompt with wallet info if available
  let systemPrompt = 'You are a helpful assistant that can answer questions and help with tasks on the Stacks blockchain.';
  
  systemPrompt += `\n\n📚 KNOWLEDGE TOOL:`;
  systemPrompt += `\n- When users ask "how to", "what is", or conceptual questions about Stacks, use the getStacksKnowledge tool`;
  systemPrompt += `\n- The tool will automatically fetch documentation, synthesize an answer, and display it in a card`;
  systemPrompt += `\n- You don't need to provide additional explanation - just call the tool and let it handle the response`;
  systemPrompt += `\n- The tool covers: stacking, sBTC, Clarity, mining, transactions, BNS, and more`;
  
  if (walletAddress) {
    systemPrompt += `\n\n🔐 CONNECTED WALLET: ${walletAddress}`;
    systemPrompt += `\n\nWALLET INSTRUCTIONS:`;
    systemPrompt += `\n- When the user says "my wallet", "my balance", "my account", or refers to themselves, they mean this address: ${walletAddress}`;
    systemPrompt += `\n- You MUST pass "${walletAddress}" as the address parameter to the getAccount tool`;
    systemPrompt += `\n- DO NOT ask the user for their address - you already have it`;
    systemPrompt += `\n- Example: If user says "show my balance", immediately call getAccount with address="${walletAddress}"`;
  }

  const result = streamText({
    model: google('gemini-2.5-flash'),
    messages: convertToModelMessages(messages),
    system: systemPrompt,
    tools,
  });

  // send sources and reasoning back to the client
  return result.toUIMessageStreamResponse({
    sendSources: true,
    sendReasoning: true,
  });
}