# Blasko - AI-Powered DeFi Assistant for Stacks

An AI agent that makes blockchain interaction as simple as conversation. Built for the Stacks Vibe Coding Hackathon.

## The Problem

Blockchain has three critical barriers preventing mainstream adoption:

### First: Complexity

ICODA Research found **89% of new users abandon DeFi** because it's too complicated. Sending crypto means:
- Copying 42-character wallet addresses without making a single mistake
- Calculating gas fees in "gwei"—a term that means nothing to normal people
- Understanding "slippage tolerance"
- Selecting the right network or risk losing funds

This is not user-friendly. This is gatekeeping.

### Second: Fragmentation

Users juggle 5+ different platforms:
- One website to check balance
- Another to swap tokens
- Another for NFTs
- Another for transaction history
- Another to learn how things work

Different interfaces, different logins. It's exhausting and insecure.

### Third: Phishing

In January 2023, tech investor Kevin Rose lost **$1.1 million in NFTs** to a phishing link. Chainalysis reports phishing attacks increased **400% from 2022 to 2024**. If experts get scammed, regular users don't stand a chance.

### Campus Survey Validation

To validate this problem, I conducted a 6-question survey in Vietnamese among **67 students** in our Computer Science program.

**Results:**
- Only **13 responded** (19% response rate)
- **53.8%** said DeFi interfaces are too complex
- **46.2%** are worried about security and losing money
- **23.1%** tried DeFi once or twice, then gave up
- Only **7.7%** (1 student) uses DeFi regularly
- **69.3%** said an AI assistant using natural language would help

The demand is real.

## The Solution

Blasko is an AI agent that lets you interact with blockchain through natural conversation.

### How It Works

Instead of copying addresses across multiple websites, you simply chat:

```
You: "Resolve alice.btc"
Blasko: "alice.btc resolves to SP2J6ZY... [shows address]"

You: "Send 10 STX there"
Blasko: "Here's your transaction ready to sign [shows form]"
```

Natural language. One interface. No technical jargon.

### 18 Specialized Tools

Blasko isn't a chatbot that talks *about* blockchain—it's an AI agent that *operates* blockchain:

**Transaction Tools:**
- `sendToken` - Send STX or fungible tokens
- `multiSend` - Bulk send to 200 recipients in ONE transaction
- `swapToken` - DEX integration via ALEX
- `bridgeToken` - BTC ↔ sBTC bridge
- `stackStx` - Lock STX to earn Bitcoin rewards

**Query Tools:**
- `getAccount` - Fetch balances and transaction history
- `getTransaction` - Detailed transaction info
- `getContract` - View smart contract source code
- `getNftGallery` - Display NFT collection

**BNS (Identity) Tools:**
- `resolveBNS` - Convert names to addresses
- `reverseLookupBNS` - Convert addresses to names
- `registerBNS` - Check availability and register names

**DeFi Analytics Tools:**
- `getStacksTVL` - Total Value Locked charts
- `getTopProtocols` - Ranked DeFi protocols
- `getDefiCategories` - DeFi category breakdown
- `getProtocolInfo` - Detailed protocol information

**Knowledge Tool:**
- `getStacksKnowledge` - RAG-powered documentation search with AI synthesis

### Safety Advantages

Blasko addresses the phishing epidemic:

✅ **Single Trusted Interface** - No clicking suspicious links  
✅ **Automatic Name Resolution** - No copy-paste errors  
✅ **Clear Transaction Previews** - No hidden fees  
✅ **Verified Documentation** - No fake websites  

## Tech Stack

- **Frontend:** Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **AI:** Vercel AI SDK + Google Gemini 2.5 Flash (chat) + Gemini 2.0 Flash (RAG)
- **Blockchain:** Stacks SDK, Hiro API, ALEX DEX, BNS v2
- **Tools:** 18 Zod-validated functions with TypeScript
- **RAG:** Cheerio (web scraping) + 200+ indexed docs

## Getting Started

### Prerequisites

- Node.js 20+
- npm or pnpm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/blasko.git
cd blasko
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Hiro API Key for Stacks blockchain
HIRO_API_KEY=your_hiro_api_key_here

# Google Generative AI API Key for Gemini
GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Connect Your Wallet:** Click "Connect Wallet" in the sidebar
2. **Start Chatting:** Type natural language requests like:
   - "What's my balance?"
   - "Send 10 STX to alice.btc"
   - "Swap 5 STX for USDA"
   - "Show me my NFTs"
   - "What is stacking?"
3. **Review & Confirm:** Blasko generates transaction forms for you to review
4. **Sign with Wallet:** Approve transactions in your Stacks wallet

## Project Structure

```
blasko/
├── src/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── tools/          # 18 AI tools
│   │   │   └── tool.ts         # Tool registry
│   │   ├── api/
│   │   │   └── chat/           # Chat API endpoint
│   │   └── chat/[id]/          # Dynamic chat routes
│   ├── components/
│   │   ├── ai-elements/        # AI UI components
│   │   ├── ui/                 # shadcn/ui components
│   │   └── *.tsx               # Generative UI components
│   └── lib/
│       └── chat-storage.ts     # localStorage utilities
├── public/                     # Static assets
└── README.md
```

## Research & Sources

### Academic Sources

1. **ICODA Research (2024):** ["How to Fix DeFi's $2 Trillion User Problem"](https://icoda.io/blog/defi-user-problem-research-solutions)
   - 89% of new users find DeFi too complicated
   - 67% experienced unexpected fees
   - 78% concerned about unpredictable liquidations

2. **Chainalysis (2024):** Crypto Crime Report
   - 400% increase in phishing attacks (2022-2024)
   - $2.6B lost to phishing in 2024

3. **Kevin Rose NFT Theft (January 2023):**
   - $1.1 million worth of NFTs lost to phishing attack

### Campus Survey Data

**Methodology:**
- **Sample:** 67 Computer Science students
- **Responses:** 13 (19% response rate)
- **Language:** Vietnamese
- **Date:** October 2024
- **Questions:** 6 questions covering DeFi experience, challenges, AI solution interest, feature preferences

**Full Survey Questions:**

1. What is your level of experience with DeFi?
2. What are your BIGGEST challenges when trying to use DeFi? (Select all that apply)
3. Would an AI chatbot that lets you interact with DeFi using natural language help make DeFi easier for you?
4. Which features would you use the most? (Select top 3)
5. If you could "talk" to your wallet or blockchain, what would you ask first?
6. Are you part of the Stacks ecosystem?

**Detailed Results:** [See survey responses chart in `/docs`]

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Contact

Built by [Your Name] for Stacks Vibe Coding Hackathon

---

**Making blockchain accessible to the 95% who've been left behind.** 🚀
