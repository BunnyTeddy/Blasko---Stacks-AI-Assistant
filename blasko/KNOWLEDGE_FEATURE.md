# Knowledge Feature Documentation

## Overview

The Knowledge Feature enables the AI assistant to intelligently search and answer questions about Stacks blockchain by fetching and synthesizing information from the official Stacks documentation.

## How It Works

### 1. **User Experience Flow**

```
User asks: "How can I stack STX?"
         ↓
AI calls getStacksKnowledge tool
         ↓
Tool finds relevant docs (stacking guides, concepts, etc.)
         ↓
Tool fetches and parses page content
         ↓
AI receives rawContent + sources
         ↓
AI synthesizes clear, direct answer
         ↓
User sees: AI answer + Knowledge card with sources
```

### 2. **Key Features**

- **Intelligent Search**: Automatically finds relevant documentation pages based on user's question
- **Content Extraction**: Fetches and parses HTML content from documentation
- **Smart Synthesis**: AI reads through documentation and provides direct answers with specific details
- **Source References**: Shows clickable links to source documentation
- **Clean UI**: Simple, informative card design

## Architecture

### Files Created/Modified

1. **`src/app/ai/tools/get-stacks-knowledge.ts`** (NEW)
   - AI tool definition
   - Documentation page index (50+ pages)
   - Relevance scoring algorithm
   - HTML content fetching & parsing with cheerio

2. **`src/components/stacks-knowledge.tsx`** (NEW)
   - UI component to display knowledge card
   - Shows reference sources with external links
   - Clean, minimal design as requested

3. **`src/app/ai/tools/index.ts`** (MODIFIED)
   - Added export for `getStacksKnowledgeTool`
   - Added to tools object

4. **`src/components/ai-chat.tsx`** (MODIFIED)
   - Added import for `StacksKnowledge` component
   - Added tool case handler for `tool-getStacksKnowledge`
   - Updated suggestions with knowledge queries

5. **`src/app/api/chat/route.ts`** (MODIFIED)
   - Enhanced system prompt with knowledge tool instructions
   - Guides AI to synthesize answers instead of listing articles

## Technical Details

### Documentation Index

The tool includes an index of 50+ documentation pages covering:
- Stacking (solo, pool, operations)
- sBTC (operations, FAQ, guides)
- Clarity smart contracts
- Network fundamentals
- Bitcoin integration
- Mining and signing
- Transactions and accounts
- BNS (Bitcoin Name System)
- Nakamoto upgrade
- And more...

### Relevance Algorithm

The tool scores pages based on:
1. **Exact phrase match** in title/description (highest score)
2. **Keyword matches** in title (10 points)
3. **Keyword matches** in description (5 points)
4. **Keyword matches** in URL (3 points)

Returns top 5 most relevant pages.

### Content Extraction

Uses `cheerio` to:
- Parse HTML from documentation pages
- Remove navigation, scripts, styles
- Extract main content (up to 5000 chars per page)
- Fetch from top 3 most relevant pages

### AI Instructions

The system prompt instructs the AI to:
- Use the knowledge tool for "how to", "what is", conceptual questions
- READ and SYNTHESIZE the rawContent
- Provide clear, direct answers with specific details
- NOT just list articles
- Include numbers, requirements, steps when relevant

## Example Usage

### User Queries That Trigger Knowledge Tool:

- "How can I stack STX?"
- "What is sBTC?"
- "How do I deploy a smart contract?"
- "What is Proof of Transfer?"
- "How does Bitcoin finality work?"
- "What are post conditions?"

### Example Response:

**User**: "How can I stack STX?"

**AI Response** (synthesized from docs):
"You can stack STX tokens to earn Bitcoin rewards through Proof-of-Transfer (PoX). There are two main ways:

**Solo Stacking**: Requires a minimum of 125,000 STX. You lock your STX for a set number of reward cycles (each about two weeks) and provide a Bitcoin address to receive rewards.

**Delegated Stacking (Pool)**: If you have less than 125,000 STX, you can delegate to a stacking pool. The pool operator handles the technical aspects, and you receive a share of rewards.

The stacking functionality is implemented as the `pox-4` smart contract on the Stacks blockchain."

**Knowledge Card** (shown below AI response):
```
✅ 📖 Found information in documentation

📚 References:
↗ Stacking | Stacks Documentation
↗ Stack with a Pool | Stacks Documentation
↗ Solo Stack | Stacks Documentation

💡 Answer synthesized from official Stacks documentation
```

## Design Philosophy

### Why This Approach?

1. **No Article Dumping**: AI doesn't throw links at users - it reads and answers
2. **Specific Information**: Includes exact numbers, steps, requirements
3. **Source Transparency**: Users can verify information via source links
4. **Clean UI**: Simple card design as requested
5. **Fast & Efficient**: Only fetches top 3 most relevant pages

### Benefits

- **Better UX**: Users get direct answers, not homework assignments
- **Accurate**: Pulls from official documentation
- **Verifiable**: Source links allow fact-checking
- **Scalable**: Easy to add more documentation pages
- **Maintainable**: Clear separation of concerns

## Testing

### Manual Testing

1. Start the dev server:
   ```bash
   cd /Users/banghoang/Blasko/blasko
   npm run dev
   ```

2. Navigate to the chat interface

3. Try example questions:
   - "How can I stack STX?"
   - "What is sBTC?"
   - "How do Bitcoin finality work on Stacks?"
   - "What are post conditions in Clarity?"

4. Verify:
   - AI calls the knowledge tool (loading indicator appears)
   - Knowledge card displays with sources
   - AI provides a synthesized answer (not just links)
   - Source links are clickable and work

## Future Enhancements

Potential improvements:
1. Add caching for fetched documentation
2. Implement vector embeddings for better relevance
3. Add more documentation sources (API docs, tutorials)
4. Include code examples in responses
5. Add "Related Topics" suggestions
6. Implement feedback mechanism for answer quality

## Dependencies

- **cheerio**: HTML parsing and content extraction
- **zod**: Schema validation for tool inputs
- **ai SDK**: Tool definition and AI integration

## Maintenance

### Adding New Documentation Pages

Edit `DOCS_PAGES` array in `get-stacks-knowledge.ts`:

```typescript
{
  "url": "https://docs.stacks.co/your-new-page",
  "title": "Page Title",
  "description": "Optional description for better relevance scoring"
}
```

### Updating Content Extraction

Modify the `fetchPageContent` function to adjust:
- Content selectors
- Character limits
- Cleanup rules

---

**Status**: ✅ Complete and Ready for Testing

**Last Updated**: October 16, 2025

