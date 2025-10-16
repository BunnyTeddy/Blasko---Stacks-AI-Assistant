'use client';

import { ChatSidebar } from '@/components/chat-sidebar';

type ChatLayoutProps = {
  children: React.ReactNode;
};

export function ChatLayout({ children }: ChatLayoutProps) {
  return (
    <div className="relative h-screen overflow-hidden">
      <ChatSidebar />
      <main className="h-full ml-64">
        {children}
      </main>
    </div>
  );
}

