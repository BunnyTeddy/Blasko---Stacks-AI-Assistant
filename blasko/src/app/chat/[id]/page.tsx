'use client';

import { use } from 'react';
import AI_Chat from '@/components/ai-chat';

type ChatPageProps = {
  params: Promise<{ id: string }>;
};

export default function ChatPage({ params }: ChatPageProps) {
  const { id } = use(params);
  
  return <AI_Chat chatId={id} />;
}

