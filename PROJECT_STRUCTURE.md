# Project Structure Overview (SIMPLIFIED - Chatbox Focus)

## FOCUS: First 3 Core Features Only
1. **Twitter Sentiment & Trend Analysis**
2. **SUI Token Market Intelligence**
3. **AI Chat Interface** for insights

**UI Approach: Simple full-screen chatbox only - no navigation, headers, or complex layouts**

## Created Files and Their Purpose

### 📁 Core Configuration
- `IMPLEMENTATION_PLAN.md` - Detailed implementation roadmap with 35 numbered tasks
- `.env.example` - Environment variables template with all required API keys
- `PROJECT_STRUCTURE.md` - This file, documenting the project structure

### 📁 Type Definitions (`src/types/`)
- `index.ts` - Core TypeScript interfaces for the entire application

### 📁 Configuration (`src/lib/`)
- `config.ts` - Application configuration and environment variable validation

### 📁 State Management (`src/store/`)
- `atoms.ts` - Jotai atoms for all application state (chat, market data, alerts, wallet, UI)

### 📁 API Services (`src/lib/services/`)
- `twitter.ts` - Twitter API integration for sentiment analysis
- `coingecko.ts` - CoinGecko API for market data
- `ai.ts` - OpenAI and Grok AI service integration
- `sui.ts` - SUI blockchain RPC and wallet integration

### 📁 LangChain Tools (`src/lib/langchain/`)
- `tools.ts` - LangChain tool orchestration for AI workflows

### 📁 React Components (`src/components/`) - SIMPLIFIED
- `chat/ChatInterface.tsx` - **PRIORITY**: Simple full-screen AI chat interface
- `alerts/AlertSystem.tsx` - **DEFERRED**: Real-time alert notification system UI
- `market/TokenDisplay.tsx` - **DEFERRED**: Token data and market analysis display UI
- `swap/SwapInterface.tsx` - **DEFERRED**: Token swap functionality UI

**REMOVED** (not needed for simple chatbox approach):
- ~~`layout/MainLayout.tsx`~~ - No complex layout needed
- ~~`dashboard/Dashboard.tsx`~~ - No dashboard needed

### 📁 Custom Hooks (`src/hooks/`)
- `useRealTimeAlerts.ts` - SSE connection for real-time alerts
- `useWallet.ts` - SUI wallet connectivity and transaction handling
- `useMarketData.ts` - Market data fetching and caching

### 📁 API Routes (`app/api/`)
- `chat/route.ts` - AI chat processing endpoint
- `alerts/stream/route.ts` - Server-Sent Events for real-time alerts
- `market/route.ts` - Market intelligence analysis API
- `twitter/route.ts` - Twitter sentiment analysis API
- `swap/route.ts` - DEX integration and swap execution API

### 📁 Pages (`app/`)
- `page.tsx` - Main application page integrating all components

## Implementation Sequence

### Phase 1: Foundation (#TODO-1 to #TODO-5)
1. Initialize Next.js project with dependencies
2. Set up shadcn/ui and styling
3. Configure Jotai state management
4. Create project structure
5. Set up environment variables

### Phase 2: UI Components (#TODO-6 to #TODO-10)
6. Main layout with navigation
7. Dashboard component structure
8. Chat interface for AI interaction
9. Alert notification system UI
10. Token display and market data components

### Phase 3: API Integration (#TODO-11 to #TODO-15)
11. Twitter API integration
12. CoinGecko API integration
13. OpenAI/Grok AI service integration
14. SUI blockchain RPC integration
15. Server-Sent Events for real-time alerts

### Phase 4: AI Intelligence (#TODO-16 to #TODO-20)
16. Twitter sentiment analysis service
17. Market intelligence analysis system
18. Proactive alert classification system
19. LangChain tool orchestration
20. AI-powered recommendation engine

### Phase 5: Blockchain Integration (#TODO-21 to #TODO-25)
21. SUI wallet connectivity
22. DEX integration for price aggregation
23. Token swap functionality
24. Transaction simulation and execution
25. Portfolio tracking

### Phase 6: Real-time Features (#TODO-26 to #TODO-30)
26. Background monitoring system
27. Real-time alert streaming
28. Notification management system
29. Data refresh and caching system
30. Error handling and retry logic

### Phase 7: Integration & Polish (#TODO-31 to #TODO-35)
31. Connect all components and test data flow
32. Responsive design and mobile optimization
33. Loading states and error boundaries
34. User preferences and settings
35. Final testing and bug fixes

## Key Features Ready for Implementation

1. **Chat Interface**: Text-only AI interaction for simplicity
2. **Real-time Alerts**: SSE-based notification system
3. **Market Analysis**: AI-powered token and sentiment analysis
4. **Swap Integration**: DEX aggregation for token trading
5. **Dashboard**: Comprehensive overview of market and portfolio

## Next Steps

1. Follow the numbered TODO sequence in `IMPLEMENTATION_PLAN.md`
2. Each file contains specific TODO comments for implementation
3. Start with #TODO-1 (project initialization) and proceed sequentially
4. Use the environment variables template to configure API access
5. Focus on core functionality first, polish later

## Development Notes

- All files are created with empty implementations and TODO comments
- Each TODO is numbered for systematic execution
- Project structure follows Next.js 14 App Router conventions
- State management uses Jotai for atomic state updates
- Real-time features use SSE instead of WebSockets for simplicity
- Hackathon focus: speed over perfection, core features only
