import { UIMessage } from 'ai';

export type ChatHistoryItem = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: UIMessage[];
};

const STORAGE_KEY = 'chat_history';

// Generate unique chat ID
export function generateChatId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 9);
  return `${timestamp}-${random}`;
}

// Generate chat title from first user message
export function generateChatTitle(messages: UIMessage[]): string {
  const firstUserMessage = messages.find((msg) => msg.role === 'user');
  if (!firstUserMessage) return 'New Chat';

  // Get text from first text part
  const textPart = firstUserMessage.parts.find((part) => part.type === 'text');
  if (!textPart || !('text' in textPart)) return 'New Chat';

  const text = textPart.text.trim();
  return text.length > 50 ? text.substring(0, 50) + '...' : text;
}

// Load all chats from storage
export function loadChatsFromStorage(): ChatHistoryItem[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    
    const chats = JSON.parse(stored) as ChatHistoryItem[];
    // Sort by updatedAt descending (newest first)
    return chats.sort((a, b) => b.updatedAt - a.updatedAt);
  } catch (error) {
    console.error('Error loading chats from storage:', error);
    return [];
  }
}

// Load specific chat by ID
export function loadChatById(id: string): ChatHistoryItem | null {
  const chats = loadChatsFromStorage();
  return chats.find((chat) => chat.id === id) || null;
}

// Save or update chat in storage
export function saveChatToStorage(
  id: string,
  messages: UIMessage[],
  title?: string
): void {
  if (typeof window === 'undefined') return;

  try {
    const chats = loadChatsFromStorage();
    const existingIndex = chats.findIndex((chat) => chat.id === id);

    const chatTitle = title || generateChatTitle(messages);
    const now = Date.now();

    if (existingIndex >= 0) {
      // Update existing chat
      chats[existingIndex] = {
        ...chats[existingIndex],
        title: chatTitle,
        messages,
        updatedAt: now,
      };
    } else {
      // Create new chat
      chats.push({
        id,
        title: chatTitle,
        messages,
        createdAt: now,
        updatedAt: now,
      });
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
  } catch (error) {
    console.error('Error saving chat to storage:', error);
  }
}

// Delete chat from storage
export function deleteChatFromStorage(id: string): void {
  if (typeof window === 'undefined') return;

  try {
    const chats = loadChatsFromStorage();
    const filtered = chats.filter((chat) => chat.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting chat from storage:', error);
  }
}

// Rename chat in storage
export function renameChatInStorage(id: string, newTitle: string): void {
  if (typeof window === 'undefined') return;

  try {
    const chats = loadChatsFromStorage();
    const chatIndex = chats.findIndex((chat) => chat.id === id);

    if (chatIndex >= 0) {
      chats[chatIndex].title = newTitle;
      chats[chatIndex].updatedAt = Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    }
  } catch (error) {
    console.error('Error renaming chat in storage:', error);
  }
}

// Format relative time
export function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const week = 7 * day;
  const month = 30 * day;

  if (diff < minute) return 'Just now';
  if (diff < hour) return `${Math.floor(diff / minute)}m ago`;
  if (diff < day) return `${Math.floor(diff / hour)}h ago`;
  if (diff < week) return `${Math.floor(diff / day)}d ago`;
  if (diff < month) return `${Math.floor(diff / week)}w ago`;
  return `${Math.floor(diff / month)}mo ago`;
}

