'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateChatId } from '@/lib/chat-storage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Create new chat and redirect
    const newChatId = generateChatId();
    router.push(`/chat/${newChatId}`);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}
