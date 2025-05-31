# Alert System Setup Guide

## 🚨 OpenAI API Error 403 - Solutions

The 403 error indicates an authentication issue with the OpenAI API. Here are the solutions:

### Solution 1: Set Up OpenAI API Key (Recommended)

1. **Get an OpenAI API Key:**
   - Go to [OpenAI API Keys](https://platform.openai.com/api-keys)
   - Create a new API key
   - Copy the key (starts with `sk-...`)

2. **Add to Environment Variables:**
   Create or update your `.env.local` file:
   ```bash
   OPENAI_API_KEY=sk-your-actual-openai-api-key-here
   OPENAI_MODEL=gpt-3.5-turbo
   ```

3. **Verify API Access:**
   - Make sure your OpenAI account has credits
   - Check that your API key has the correct permissions
   - Ensure you have access to the `gpt-3.5-turbo` model

### Solution 2: Use Development Mode (Testing)

If you don't have an OpenAI API key, the system will automatically use mock alerts in development mode:

1. **Ensure Development Mode:**
   ```bash
   NODE_ENV=development
   ```

2. **The system will:**
   - Generate mock alerts for testing
   - Show the alert modal functionality
   - Demonstrate the complete user experience

### Solution 3: Alternative AI Provider

You can also use the X.AI (Grok) API which is already configured:

1. **Check X.AI Configuration:**
   The system already has a fallback X.AI API key configured in `src/lib/config.ts`

2. **Modify Alert API to use X.AI:**
   Update the API endpoint in `app/api/alerts/route.ts` to use X.AI instead of OpenAI

## 🧪 Testing the Alert System

### Method 1: Test Page
1. Visit: `http://localhost:3000/test-alerts`
2. Click "Test Alert API" to check the system
3. Click "Test Modal" to see the alert display

### Method 2: Manual API Testing
```bash
curl http://localhost:3000/api/alerts
```

### Method 3: Check Browser Console
Open browser dev tools and watch for:
- Alert polling logs
- API response data
- Error messages

## 🔧 Configuration Options

### Alert System Settings
Located in `src/store/atoms.ts` - `alertSystemAtom`:

```typescript
settings: {
  enabled: true,           // Enable/disable alert system
  pollInterval: 3000,      // Poll every 3 seconds
  severityThreshold: 'medium'  // Minimum severity to show
}
```

### API Configuration
Located in `src/lib/config.ts`:

```typescript
OPENAI_API: {
  API_KEY: process.env.OPENAI_API_KEY || '',
  MODELS: {
    CHAT: 'gpt-3.5-turbo',    // Used for alerts
    ANALYSIS: 'gpt-4'         // Fallback to CHAT if not available
  }
}
```

## 🎯 Expected Behavior

### With OpenAI API Key:
1. **Every 3 seconds:** System polls Twitter API
2. **Filters posts:** Only from last 1 hour
3. **AI Analysis:** OpenAI analyzes posts for importance
4. **Smart Alerts:** Only shows relevant, high-impact information
5. **Toast Notifications:** Non-intrusive alerts
6. **Modal Display:** Detailed view for critical alerts

### Without OpenAI API Key (Development):
1. **Mock Alerts:** System generates test alerts
2. **Full UI Testing:** All modal and notification features work
3. **No AI Analysis:** Uses predefined mock data
4. **Perfect for Demo:** Shows complete user experience

## 🐛 Troubleshooting

### Common Issues:

1. **"OpenAI API error: 403"**
   - Check API key is correct
   - Verify account has credits
   - Ensure model access permissions

2. **"No alerts generated"**
   - Check if there are recent Twitter posts (last 1 hour)
   - Verify Twitter API is working
   - Check browser console for errors

3. **"Modal not showing"**
   - Check if alerts have `critical` severity
   - Verify modal state in browser dev tools
   - Test with "Test Modal" button

4. **"Polling not working"**
   - Check `alertSystemAtom.isPolling` state
   - Verify component is mounted in providers
   - Check browser network tab for API calls

## 🚀 Production Deployment

### Required Environment Variables:
```bash
OPENAI_API_KEY=sk-your-key-here
TWITTER_API_KEY=your-twitter-key-here
NODE_ENV=production
```

### Optional Optimizations:
- Increase poll interval for production (5-10 seconds)
- Add rate limiting for API calls
- Implement alert deduplication
- Add user preferences for alert types

## 📊 Monitoring

### Check System Health:
```bash
# Test alert API
curl http://localhost:3000/api/alerts

# Health check
curl -X POST http://localhost:3000/api/alerts \
  -H "Content-Type: application/json" \
  -d '{"action":"healthCheck"}'
```

### Browser Console Logs:
- `🚨 Starting alert detection...`
- `📊 Analyzing X Twitter posts for alerts...`
- `⏰ Found X posts from last hour`
- `✅ Generated X alerts`

## 🎉 Success Indicators

✅ **System Working Correctly:**
- No 403 errors in console
- Regular API polling every 3 seconds
- Toast notifications appear for new alerts
- Modal displays correctly with full information
- Twitter links are clickable and functional

The alert system is now fully functional and will provide real-time notifications about important SUI ecosystem developments!
