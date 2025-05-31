// #TODO-6: Create simple chat interface as main page (NO navigation, header, or complex layout)

import { ChatInterface } from "@/src/components/chat";

export default function Home() {
  // #TODO-6.1: Simple main page with only chatbox
  // TODO: Focus on core chat functionality:
  // - Full-screen chat interface
  // - No navigation or header
  // - Simple, clean design
  // - Focus on AI interaction for first 3 features:
  //   1. Twitter sentiment analysis
  //   2. Market intelligence
  //   3. Chat-based insights

  return (
    <div className="min-h-screen bg-background">
      {/* #TODO-6.2: Full-screen chat interface */}
      <ChatInterface />
    </div>
  );
}
