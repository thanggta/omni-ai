# 🛠️ Tool Implementation Guide

## 📋 **Current Tool Implementations & Use Cases**

### **1. 📊 Market Analysis Tool** (`market_intelligence`)
**Purpose**: Display trending tokens and market data in interactive table format

**Use Cases**:
- ✅ "Find trending SUI tokens"
- ✅ "Show me trending tokens"
- ✅ "What tokens are trending?"
- ✅ "Top tokens"
- ✅ "Market analysis"
- ✅ "SUI market overview"
- ✅ "Price movements"

**Returns**: Interactive TrendingTokensUI component with clickable chart dialogs

**Keywords**: trending, market, analysis, top tokens, price movements

---

### **2. 💼 Portfolio Analysis Tool** (`portfolio_analysis`)
**Purpose**: Analyze specific wallet's personal token holdings and balances

**Use Cases**:
- ✅ "Analyze my portfolio"
- ✅ "Show my wallet"
- ✅ "My holdings"
- ✅ "My token balances"
- ✅ "Portfolio analysis"
- ✅ "Wallet balance"

**Returns**: Interactive PortfolioUI component with allocation charts

**Keywords**: my portfolio, my wallet, my holdings, analyze my

---

### **3. 🔄 Swap Execution Tool** (`swap_execution`)
**Purpose**: Prepare token swap transactions for frontend execution

**Use Cases**:
- ✅ "Swap 10 SUI to USDC"
- ✅ "Exchange 50 DEEP for SUI"
- ✅ "Trade 100 SUI for USDT"
- ✅ "Convert SUI to USDC"

**Returns**: Structured swap data for frontend wallet integration

**Keywords**: swap, exchange, trade, convert

---

### **4. 🏦 LP Deposit Tool** (`depositLP`)
**Purpose**: Prepare LP deposit actions for vault investments

**Use Cases**:
- ✅ "Deposit 5 SUI into LP vault"
- ✅ "Add liquidity to SUI vault"
- ✅ "Deposit into my SUI Vault LP"

**Returns**: Structured deposit data for frontend execution

**Keywords**: deposit + (LP OR vault)

---

### **5. 🏦 LP Info Tool** (`getLPInfo`)
**Purpose**: Display detailed LP position information

**Use Cases**:
- ✅ "Show my LP positions"
- ✅ "LP info"
- ✅ "Vault positions"
- ✅ "Yield farming positions"

**Returns**: LP position data with APR/APY and TVL information

**Keywords**: LP positions, vault info, yield farming

---

### **6. 🐦 Twitter Analysis Tool** (`twitter_sentiment_analysis`)
**Purpose**: Analyze social sentiment and trending posts

**Use Cases**:
- ✅ "Twitter sentiment for SUI"
- ✅ "Social media trends"
- ✅ "Community sentiment"

**Returns**: Social sentiment analysis with source citations

**Keywords**: twitter, sentiment, social, community

---

## 🎯 **Tool Selection Logic**

### **Priority Order**:
1. **Swap Execution** (highest priority for trading actions)
2. **LP Deposit** (high priority for DeFi actions)
3. **Twitter Analysis** (social sentiment)
4. **Market Analysis** (trending tokens & market data)
5. **Portfolio Analysis** (personal wallet data)
6. **LP Info** (LP position details)

### **Disambiguation Rules**:
- **"trending tokens"** → Always use `market_intelligence`
- **"my portfolio"** → Always use `portfolio_analysis`
- **"swap/trade"** → Always use `swap_execution`
- **"deposit LP"** → Always use `depositLP`

---

## 🔧 **Recent Fixes Applied**

### **Issue**: "Find trending SUI tokens" was triggering portfolio tool
### **Solution**:
1. **Enhanced Market Tool Description**: Added explicit "TRENDING TOKENS" emphasis
2. **Clarified Portfolio Tool**: Added "SPECIFIC WALLET'S portfolio" emphasis
3. **Updated System Prompt**: Added clear tool selection rules
4. **Improved Regex Pattern**: Made portfolio detection more specific
5. **Added Cross-References**: Tools now explicitly mention what NOT to use them for

### **Updated Descriptions**:
- **Market Tool**: "CRITICAL: Use this tool for ANY request about TRENDING TOKENS..."
- **Portfolio Tool**: "CRITICAL: Use this tool ONLY for analyzing a SPECIFIC WALLET'S portfolio..."

---

## 🧪 **Testing Scenarios**

### **Should Use Market Analysis Tool**:
- "Find trending SUI tokens" ✅
- "Show me trending tokens" ✅
- "What tokens are trending?" ✅
- "Top performing tokens" ✅
- "Market analysis" ✅

### **Should Use Portfolio Analysis Tool**:
- "Analyze my portfolio" ✅
- "Show my wallet balance" ✅
- "My token holdings" ✅
- "Portfolio overview" ✅

### **Should Use Swap Tool**:
- "Swap 10 SUI to USDC" ✅
- "Trade SUI for DEEP" ✅
- "Exchange tokens" ✅

---

## 📊 **UI Components Returned**

### **Market Analysis** → `TrendingTokensUI`
- Interactive table with 8 trending tokens
- Clickable rows with chart dialogs
- CoinGecko + DEX Screener chart integration
- Real-time price data and volume

### **Portfolio Analysis** → `PortfolioUI`
- Token allocation pie charts
- Holdings breakdown
- Total portfolio value
- LP positions (if any)

### **Swap Execution** → `SwapUI`
- Swap confirmation interface
- Price quotes and slippage
- Transaction preparation

---

## 🚀 **Implementation Status**

- ✅ **All Tools Implemented**
- ✅ **Chart Dialog Integration**
- ✅ **Tool Descriptions Updated**
- ✅ **System Prompt Enhanced**
- ✅ **Disambiguation Logic Added**
- ✅ **UI Components Ready**

The system should now correctly route "Find trending SUI tokens" to the Market Analysis Tool, which will display the interactive TrendingTokensUI component with clickable chart functionality.
