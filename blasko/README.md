# **Blasko - AI-Powered DeFi Assistant for Stacks**

An intelligent blockchain assistant that transforms complex DeFi interactions into natural conversations. Built for the Stacks Vibe Coding Hackathon.

---

## **The Problem**

Blockchain has three critical barriers preventing mainstream adoption:

### **1. Overwhelming Complexity**
ICODA Research found **89% of new users abandon DeFi** because it's too complicated. Sending crypto requires:
- Copying 42-character wallet addresses without errors
- Calculating gas fees in "gwei"
- Understanding "slippage tolerance"
- Selecting the correct network

My grandmother uses Venmo with one tap. This is gatekeeping.

### **2. Fragmented Experience**
Users must juggle 5+ different platforms:
- One website to check balance
- Another to swap tokens
- Another for NFTs
- Another for transaction history
- Another to learn

Each with different interfaces, terminology, and login processes. It's exhausting and insecure.

### **3. The Phishing Epidemic**
In January 2023, tech investor **Kevin Rose lost $1.1 million in NFTs** to a phishing link. Chainalysis reports phishing attacks increased **400% from 2022 to 2024**. If experts get scammed, regular users don't stand a chance.

### **Campus Survey Validation**
I surveyed **67 Computer Science students** (technical users who should find blockchain easier):
- Only **13 responded** (19% response rate)
- **53.8%** said DeFi interfaces are too complex
- **46.2%** worried about security and losing money
- **23.1%** tried DeFi once or twice, then gave up
- Only **7.7%** (1 student) uses DeFi regularly
- **69.3%** said an AI assistant would help

The complexity is real. The fear is real. The demand for a better way is real.

---

## **The Solution**

Blasko is an AI agent that lets you interact with blockchain through natural conversation.

### **How It Works**
Instead of copying addresses across multiple websites, you simply chat:

```
You: "Resolve alice.btc"
Blasko: "alice.btc resolves to SP2J6ZY..."

You: "Send 10 STX there"
Blasko: "Here's your transaction ready to sign [shows form]"

You: "What's my balance?"
Blasko: [Shows all tokens in clean card]
```

Natural language. One interface. No technical jargon.

### **18 Specialized Blockchain Tools**

**Transaction Tools:**
- `sendToken` - Send STX or fungible tokens
- `multiSend` - Bulk send to 200 recipients in ONE transaction
- `swapToken` - DEX integration with ALEX
- `bridgeToken` - BTC ↔ sBTC bridge
- `stackStx` - Lock STX to earn Bitcoin rewards

**Query Tools:**
- `getAccount` - Balances and transaction history
- `getTransaction` - Detailed transaction info
- `getContract` - Smart contract source code
- `getNftGallery` - NFT collection viewer

**BNS Tools:**
- `resolveBNS` - Convert names to addresses
- `reverseLookupBNS` - Address to name lookup
- `registerBNS` - Check availability and register

**DeFi Analytics Tools:**
- `getStacksTVL` - Total Value Locked charts
- `getTopProtocols` - Protocol rankings by TVL
- `getDefiCategories` - Category breakdown
- `getProtocolInfo` - Detailed protocol data

**Knowledge Tool:**
- `getStacksKnowledge` - RAG-powered documentation search

### **Safety Advantages**

Remember Kevin Rose's $1.1M phishing loss? Blasko solves this:
- ✅ **Single trusted interface** - No clicking suspicious links
- ✅ **Automatic name resolution** - No copy-paste errors
- ✅ **Clear transaction previews** - No hidden fees
- ✅ **Verified documentation** - No fake websites

---

## **Tech Stack**

- **Frontend**: Next.js 15, React 19, Tailwind CSS 4, shadcn/ui
- **AI**: Vercel AI SDK + Google Gemini 2.5 Flash
- **Blockchain**: Stacks SDK, Hiro API, ALEX DEX, BNS v2
- **Tools**: 18 custom Zod-validated functions
- **RAG**: Cheerio (web scraping) + AI synthesis

---

## **Getting Started**

### Prerequisites
- Node.js 20+
- npm or pnpm
- Stacks wallet (Leather or Xverse)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/blasko.git
cd blasko

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Add your API keys:
# HIRO_API_KEY=your_hiro_api_key
# GOOGLE_GENERATIVE_AI_API_KEY=your_google_api_key

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see Blasko in action.

### Build for Production

```bash
npm run build
npm run start
```

---

## **Project Structure**

```
blasko/
├── src/
│   ├── app/
│   │   ├── ai/
│   │   │   ├── tools/          # 18 AI tools
│   │   │   └── tool.ts         # Tool registry
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts    # Chat API endpoint
│   │   └── chat/[id]/
│   │       └── page.tsx        # Chat interface
│   └── components/
│       ├── ai-chat.tsx         # Main chat component
│       ├── ai-elements/        # AI UI components
│       └── [tool-uis]/         # Generative UI components
└── README.md
```

---

## **Key Features**

✅ Natural language blockchain interactions  
✅ 18 specialized tools for Stacks blockchain  
✅ Generative UI - dynamic React components  
✅ Context-aware (remembers your wallet)  
✅ RAG-powered documentation search  
✅ Phishing protection through single interface  
✅ Type-safe tool execution with Zod schemas  
✅ Real-time streaming AI responses  
✅ Chat history with localStorage  
✅ Production-ready architecture  

---

## **Sources & Research**

### Research Citations
1. **ICODA Research (2024)**: ["How to Fix DeFi's $2 Trillion User Problem"](https://icoda.io/blog/defi-user-problem-research-solutions)
   - 89% of new users find DeFi too complicated
   - 67% experienced unexpected fees
   - 78% concerned about liquidations

2. **Chainalysis (2024)**: 400% increase in phishing attacks from 2022 to 2024

3. **Kevin Rose NFT Theft (January 2023)**: $1.1M loss to phishing

### Campus Survey Data
- **Sample**: 67 Computer Science students
- **Responses**: 13 (19% response rate)
- **Survey**: 6 questions in Vietnamese
- **Results**: [See survey section above]

---

## **Contributing**

This project was built for the Stacks Vibe Coding Hackathon. Contributions, issues, and feature requests are welcome!

---

## **License**

MIT License - feel free to use this project for learning and development.

---

## **Acknowledgments**

- Stacks Foundation for the hackathon
- Vercel AI SDK team
- ICODA Research for the DeFi user study
- All survey participants from our Computer Science program

---

**Built with ❤️ for the Stacks community**
