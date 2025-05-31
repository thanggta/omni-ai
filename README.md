# SUI Daily Assistant AI Agent

An intelligent AI agent designed to serve as a comprehensive daily companion for active users of the SUI blockchain ecosystem.

## 🚀 Project Status

This is a hackathon project with a structured implementation plan. The project is currently in the **scaffolding phase** with all files created and TODO comments in place for systematic implementation.

## 📋 Implementation Progress

- [x] Project structure created
- [x] TODO comments added for all tasks
- [ ] Core foundation implementation (#TODO-1 to #TODO-5)
- [ ] UI components implementation (#TODO-6 to #TODO-10)
- [ ] API integration layer (#TODO-11 to #TODO-15)
- [ ] AI intelligence layer (#TODO-16 to #TODO-20)
- [ ] Blockchain integration (#TODO-21 to #TODO-25)
- [ ] Real-time features (#TODO-26 to #TODO-30)
- [ ] Integration & polish (#TODO-31 to #TODO-35)

## 🏗️ Project Structure

```
sui-hackathon/
├── src/
│   ├── components/          # React components
│   │   ├── layout/         # Layout components
│   │   ├── dashboard/      # Dashboard components
│   │   ├── chat/          # Chat interface
│   │   ├── alerts/        # Alert system
│   │   ├── market/        # Market data display
│   │   └── swap/          # Swap interface
│   ├── lib/
│   │   ├── services/      # API service layers
│   │   └── langchain/     # LangChain tools
│   ├── hooks/             # Custom React hooks
│   ├── store/             # Jotai atoms
│   └── types/             # TypeScript definitions
├── app/
│   ├── api/               # Next.js API routes
│   │   ├── chat/         # AI chat endpoint
│   │   ├── alerts/       # Real-time alerts
│   │   ├── market/       # Market data
│   │   ├── twitter/      # Twitter sentiment
│   │   └── swap/         # Swap execution
│   └── page.tsx          # Main page
└── docs/                 # Documentation
```

## 🛠️ Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **UI**: shadcn/ui + Tailwind CSS
- **State Management**: Jotai
- **AI**: OpenAI GPT-4 + Grok AI
- **Blockchain**: SUI SDK
- **Real-time**: Server-Sent Events (SSE)

## 🚀 Getting Started

1. **Clone and install dependencies**:
```bash
git clone <repository-url>
cd sui-hackathon
pnpm install
```

2. **Set up environment variables**:
```bash
cp .env.example .env.local
# Edit .env.local with your API keys
```

3. **Start development server**:
```bash
pnpm dev
```

4. **Follow the implementation plan**:
   - See `IMPLEMENTATION_PLAN.md` for detailed task breakdown
   - Each file contains TODO comments with specific implementation steps
   - Follow the numbered TODO sequence for systematic development

## 📝 Implementation Guide

### Phase 1: Foundation (#TODO-1 to #TODO-5)
- Set up dependencies and configuration
- Configure environment variables
- Set up TypeScript types

### Phase 2: UI Components (#TODO-6 to #TODO-8) - SIMPLIFIED
- Create simple full-screen chat interface (NO navigation/headers)
- Build message display and input components
- Implement chat state management
- DEFER: Alert system UI and token display UI

### Phase 3: API Integration (#TODO-11 to #TODO-15)
- Twitter API integration
- CoinGecko API setup
- AI service integration
- SUI blockchain connection
- Real-time SSE setup

### Phase 4: Intelligence Layer (#TODO-16 to #TODO-20)
- Twitter sentiment analysis
- Market intelligence
- Alert classification
- LangChain orchestration
- AI recommendations

### Phase 5: Blockchain Features (#TODO-21 to #TODO-25)
- Wallet connectivity
- DEX integration
- Swap functionality
- Transaction handling
- Portfolio tracking

### Phase 6: Real-time & Polish (#TODO-26 to #TODO-35)
- Background monitoring
- Real-time alerts
- Error handling
- Mobile optimization
- Final integration

## 🔑 Required API Keys

- **Twitter API**: twitterapi.io account
- **OpenAI**: GPT-4 API access
- **Grok AI**: Grok API access
- **CoinGecko**: API key (optional, has free tier)

## 🎯 Core Features (Phase 1 - First 3 Only)

**SIMPLIFIED UI: Chatbox interface only - no navigation, headers, or complex layouts**

1. **Twitter Sentiment Analysis**: Real-time SUI community sentiment tracking
2. **Market Intelligence**: AI-powered token analysis and recommendations
3. **Chat Interface**: Natural language interaction with AI assistant for insights

**DEFERRED (implement after core features):**
- Proactive Alerts UI
- Token Display UI
- Swap Interface UI

## 📱 Usage

Once implemented, users can:
- Get morning briefings on SUI ecosystem developments
- Receive real-time alerts for market opportunities
- Chat with AI for market analysis and recommendations
- Execute token swaps directly through the interface
- Track portfolio performance and get optimization suggestions

## 🔧 Development Notes

- This is a hackathon project focused on speed over perfection
- No testing/security/auditing implemented initially
- Text-only interaction for simplicity
- All TODO comments are numbered for sequential execution
- Use the implementation plan as a roadmap

## 📚 Documentation

- `PRD.md`: Complete product requirements document
- `IMPLEMENTATION_PLAN.md`: Detailed implementation roadmap
- Each file contains inline TODO comments with specific tasks

## 🤝 Contributing

Follow the TODO sequence in the implementation plan. Each task is designed to build upon the previous ones for efficient development.
