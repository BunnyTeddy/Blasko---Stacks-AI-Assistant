'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatRelativeTime, type ChatHistoryItem } from '@/lib/chat-storage';
import { cn } from '@/lib/utils';

type ChatHistoryItemProps = {
  chat: ChatHistoryItem;
  isActive: boolean;
  onRename: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function ChatHistoryItemComponent({
  chat,
  isActive,
  onRename,
  onDelete,
}: ChatHistoryItemProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    router.push(`/chat/${chat.id}`);
  };

  const handleRename = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRename(chat.id, chat.title);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(chat.id);
  };

  return (
    <div
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-all',
        'hover:bg-accent/50',
        isActive && 'bg-accent'
      )}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-medium truncate leading-tight">{chat.title}</h3>
          {(isHovered || isActive) && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleRename}
              >
                <Pencil className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-destructive hover:text-destructive"
                onClick={handleDelete}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground leading-tight">
          {formatRelativeTime(chat.updatedAt)}
        </p>
      </div>
    </div>
  );
}

