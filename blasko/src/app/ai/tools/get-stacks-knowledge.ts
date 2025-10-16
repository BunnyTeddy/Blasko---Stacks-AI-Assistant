import { tool as createTool } from 'ai';
import { z } from 'zod';
import * as cheerio from 'cheerio';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

// Documentation pages index
const DOCS_PAGES = [
  {
    "url": "https://docs.stacks.co/concepts/sbtc/clarity-contracts",
    "title": "Clarity Contracts | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/guides-and-tutorials/sbtc/how-to-use-the-sbtc-bridge",
    "title": "How to Use the sBTC Bridge | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals/network",
    "title": "Network Basics | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/guides-and-tutorials/stack-stx/stack-with-a-pool",
    "title": "Stack with a Pool | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/stacks-101/proof-of-transfer",
    "title": "Proof of Transfer | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/guides-and-tutorials/bitcoin-integration/verifying-a-bitcoin-transaction",
    "title": "Verifying a Bitcoin Transaction | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co",
    "title": "Start Here | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals/technical-specifications",
    "title": "Technical Specifications | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/guides-and-tutorials/sbtc/earn-sbtc-rewards",
    "title": "Earn sBTC Rewards | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/sbtc/sbtc-faq",
    "title": "sBTC FAQ | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/sbtc",
    "title": "sBTC | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/stacks-101/bitcoin-connection",
    "title": "Bitcoin Connection | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/stacks-101/financial-incentive-and-security-budget",
    "title": "Financial Incentive and Security Budget | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals/authentication",
    "title": "Authentication | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/sbtc/auxiliary-features/fee-sponsorship",
    "title": "Transaction Fee Sponsorship | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/example-contracts/stacking",
    "title": "Stacking | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/block-production/mining",
    "title": "Mining | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/block-production/stacking",
    "title": "Stacking | Stacks Documentation"
  },
  {
    "url": "https://docs.stacks.co/concepts/stacks-101",
    "title": "Stacks 101",
    "description": "Stacks 101. Stacks has a very unique technical model in the blockchain world. This section will help you get a high-level overview of the ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/stacks-101/what-is-stacks",
    "title": "What Is Stacks?",
    "description": "So Stacks is a Bitcoin layer 2 with some unique properties, like having its own token, that acts as an incentive mechanism to maintain a ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/stacks-101/stacks-among-other-layers",
    "title": "Stacks Among Other Layers",
    "description": "Recently, we have seen a flurry of new \"Bitcoin layers\" popping up across the ecosystem as the market has finally woken up to the idea."
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals",
    "title": "Network Fundamentals",
    "description": "Now that you have a high-level understanding of what Stacks is and how it works, let's dive into some more details of all of the components that ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals/mainnet-and-testnets",
    "title": "Mainnet and Testnets",
    "description": "Stacks mainnet is directly connected to Bitcoin mainnet and is the network where tokens have actual monetary worth."
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals/accounts",
    "title": "Accounts",
    "description": "An account is generated from a 24-word mnemonic phrase. This is often referred to as the seed phrase. The seed phrase provides access to Stacks ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals/bitcoin-name-system",
    "title": "Bitcoin Name System",
    "description": "Bitcoin Name System (BNS) is a network system that binds Stacks usernames to off-chain state without relying on any central points of control."
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals/sips",
    "title": "SIPs",
    "description": "The SIPs are located in the stacksgov/sips repository as part of the Stacks Community Governance organization . Anyone in the Stacks community ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/network-fundamentals/technical-specifications/audits",
    "title": "Audits",
    "description": "All 'high' or 'critical' issues listed in audits have either been mitigated or otherwise made obsolete, even if the report states otherwise."
  },
  {
    "url": "https://docs.stacks.co/concepts/block-production",
    "title": "Block Production",
    "description": "Block production is a key concept to understand in order to understand how Stacks operates under the hood. This section will walk you ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/block-production/stackers-and-signing",
    "title": "Signing",
    "description": "Stackers play an essential role in the Nakamoto system that had previously been the responsibility of miners. Before, miners both decided ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/block-production/bitcoin-finality",
    "title": "Bitcoin Finality",
    "description": "The concept of 100% Bitcoin finality is crucial to the design of Stacks. This is what turns Stacks into a true Bitcoin L2 and allows it to ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/block-production/bitcoin-reorgs",
    "title": "Bitcoin Reorgs",
    "description": "Transactions on Stacks that got reorganized due to a Bitcoin fork behave just as reorganized Bitcoin transactions do."
  },
  {
    "url": "https://docs.stacks.co/concepts/transactions",
    "title": "Transactions",
    "description": "Concepts. Transactions. Transactions are a key component of the Stacks chain and are the primary way users will interact with it."
  },
  {
    "url": "https://docs.stacks.co/concepts/transactions/transactions",
    "title": "How Transactions Work",
    "description": "Introduction. Transactions are the fundamental unit of execution in the Stacks blockchain. Each transaction is originated from a Stacks account, ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/transactions/post-conditions",
    "title": "Post Conditions",
    "description": "Post conditions are conditions that are set on the client side to ensure that a smart contract does not perform any unexpected behavior. Let's ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/clarity",
    "title": "Clarity",
    "description": "Clarity is the smart contract language that Stacks uses. It has been built from the ground up to make it easier for developers to write safe, ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/clarity/overview",
    "title": "Overview | Stacks Documentation",
    "description": "Overview. Clarity is a decidable smart contract language that optimizes for predictability and security, designed for the Stacks blockchain."
  },
  {
    "url": "https://docs.stacks.co/concepts/clarity/decidability",
    "title": "Decidability",
    "description": "A problem is decidable if there exists an algorithm that can always determine whether a given input has a particular property or not in a finite ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/sbtc/core-features",
    "title": "Core Features",
    "description": "Each sBTC token is backed by an equivalent amount of Bitcoin in the peg wallet. This ensures that sBTC maintains a stable value relative to BTC."
  },
  {
    "url": "https://docs.stacks.co/concepts/sbtc/operations",
    "title": "sBTC Operations",
    "description": "Withdrawal: Converting sBTC back to BTC. These operations form the core functionality of sBTC, allowing users to move value between the Bitcoin ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/sbtc/operations/deposit",
    "title": "Deposit",
    "description": "This call triggers the Emily API, which plays a crucial role by relaying deposit information to the sBTC Signers. These signers are responsible ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/sbtc/operations/withdrawal",
    "title": "Withdrawal",
    "description": "This call triggers a series of events that culminate in the user receiving BTC in their specified Bitcoin address. The process requires six ..."
  },
  {
    "url": "https://docs.stacks.co/concepts/sbtc/operations/deposit-withdrawal-times",
    "title": "Deposit vs Withdrawal Times",
    "description": "sBTC allows users to use their BTC on the Stacks L2 by using a wrapped token called sBTC. Moving sBTC onto the Stacks L2 can take as little ..."
  },
  {
    "url": "https://docs.stacks.co/guides-and-tutorials/stack-stx",
    "title": "Stack STX",
    "description": "Stacking is an essential component of Stacks. There are three different ways you can potentially stack your STX tokens and we have a ..."
  },
  {
    "url": "https://docs.stacks.co/guides-and-tutorials/stack-stx/stacking-flow",
    "title": "Solo Stack",
    "description": "This doc assumes you are familiar with stacking at a conceptual level. If not, you may want to read the Stacking concept guide."
  },
  {
    "url": "https://docs.stacks.co/nakamoto-upgrade/nakamoto-rollout-plan/nakamoto-for-stackers",
    "title": "Nakamoto for Stackers",
    "description": "Learn how you can earn a BTC yield by locking your STX and supporting network consensus."
  }
];

/**
 * Find relevant documentation pages based on the user's question
 */
function findRelevantPages(question: string): typeof DOCS_PAGES {
  const questionLower = question.toLowerCase();
  const keywords = questionLower.split(/\s+/).filter(w => w.length > 2);
  
  const scored = DOCS_PAGES.map(page => {
    let score = 0;
    const titleLower = (page.title || '').toLowerCase();
    const descLower = (page.description || '').toLowerCase();
    const urlLower = page.url.toLowerCase();
    
    // Check for exact phrase matches
    if (titleLower.includes(questionLower)) score += 100;
    if (descLower.includes(questionLower)) score += 50;
    
    // Check for keyword matches
    keywords.forEach(keyword => {
      if (titleLower.includes(keyword)) score += 10;
      if (descLower.includes(keyword)) score += 5;
      if (urlLower.includes(keyword)) score += 3;
    });
    
    return { ...page, score };
  });
  
  // Return top 5 relevant pages
  return scored
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
}

/**
 * Fetch and parse content from a documentation page
 */
async function fetchPageContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BlaskoBot/1.0)',
      },
    });
    
    if (!response.ok) {
      return '';
    }
    
    const html = await response.text();
    const $ = cheerio.load(html);
    
    // Remove script, style, nav, footer elements
    $('script, style, nav, footer, header, .sidebar, .navigation').remove();
    
    // Extract main content (adjust selectors based on docs.stacks.co structure)
    const mainContent = $('main, article, .content, .markdown-body').first();
    
    if (mainContent.length > 0) {
      return mainContent.text()
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 5000); // Limit content length
    }
    
    // Fallback to body
    return $('body').text()
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    return '';
  }
}

export const getStacksKnowledgeTool = createTool({
  description: 'Search official Stacks documentation and provide a synthesized answer to questions about Stacks blockchain, stacking, sBTC, Clarity, mining, BNS, transactions, and other concepts. The tool automatically fetches relevant docs, synthesizes the answer using AI, and displays it in a formatted card with source references.',
  inputSchema: z.object({
    question: z.string().describe('The user\'s question about Stacks (e.g., "How can I stack STX?", "What is sBTC?", "How do I deploy a smart contract?")'),
  }),
  execute: async function ({ question }) {
    try {
      // Find relevant pages
      const relevantPages = findRelevantPages(question);
      
      if (relevantPages.length === 0) {
        return {
          question,
          answer: "I couldn't find specific documentation for your question. Could you rephrase or ask about Stacks blockchain, stacking, sBTC, Clarity smart contracts, or other Stacks features?",
          sources: [],
        };
      }
      
      // Fetch content from top pages (limit to 3 for performance)
      const contentPromises = relevantPages.slice(0, 3).map(async (page) => ({
        title: page.title,
        url: page.url,
        content: await fetchPageContent(page.url),
      }));
      
      const fetchedPages = await Promise.all(contentPromises);
      
      // Combine content for context
      const combinedContent = fetchedPages
        .filter(p => p.content.length > 0)
        .map(p => `### ${p.title}\n${p.content}`)
        .join('\n\n');
      
      if (!combinedContent || combinedContent.trim().length === 0) {
        return {
          question,
          answer: "I couldn't fetch detailed content from the documentation pages. However, based on general knowledge of Stacks: " + 
                  "Please check the sources below for official information.",
          rawContent: "",
          sources: relevantPages.slice(0, 3).map(p => ({ title: p.title || 'Stacks Documentation', url: p.url })),
        };
      }
      
      // Use AI to synthesize an answer from the documentation
      const synthesisPrompt = `You are a helpful Stacks blockchain expert. Based on the following documentation content, provide a clear, concise answer to the user's question.

USER QUESTION: ${question}

DOCUMENTATION CONTENT:
${combinedContent}

INSTRUCTIONS:
- Provide a direct, well-structured answer
- Include specific details: numbers, requirements, steps, contract names
- Use bullet points or numbered lists when appropriate
- Keep it concise but informative (aim for 200-400 words)
- Don't mention that you're reading from documentation - just answer naturally
- Format with markdown for readability

YOUR ANSWER:`;

      const { text } = await generateText({
        model: google('gemini-2.0-flash-exp'),
        prompt: synthesisPrompt,
      });
      
      // Return data with synthesized answer
      return {
        question,
        answer: text,
        rawContent: combinedContent,
        sources: fetchedPages
          .filter(p => p.content.length > 0)
          .map(p => ({ title: p.title, url: p.url })),
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to fetch Stacks documentation');
    }
  },
});

