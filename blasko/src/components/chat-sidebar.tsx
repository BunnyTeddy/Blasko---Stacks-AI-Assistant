'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Plus, Search, Wallet } from 'lucide-react';
import { connect, disconnect, isConnected, getLocalStorage } from '@stacks/connect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatHistoryItemComponent } from '@/components/chat-history-item';
import { RenameDialog } from '@/components/rename-dialog';
import { DeleteDialog } from '@/components/delete-dialog';
import {
  loadChatsFromStorage,
  deleteChatFromStorage,
  renameChatInStorage,
  generateChatId,
  type ChatHistoryItem,
} from '@/lib/chat-storage';

export function ChatSidebar() {
  const router = useRouter();
  const params = useParams();
  const currentChatId = params?.id as string | undefined;

  const [chats, setChats] = useState<ChatHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');

  // Check if wallet is already connected on mount
  useEffect(() => {
    if (isConnected()) {
      const userData = getLocalStorage();
      // Get the first STX address from the stored data
      const stxAddress = userData?.addresses?.stx?.[0]?.address;
      if (stxAddress) {
        setWalletAddress(stxAddress);
        setWalletConnected(true);
      }
    }
  }, []);

  // Real Stacks wallet connection
  const handleConnectWallet = async () => {
    try {
      const response = await connect();
      
      // Find the STX address from the addresses array
      const stxAddress = response?.addresses?.find((addr) => addr.address.startsWith('SP') || addr.address.startsWith('ST'));
      
      if (stxAddress?.address) {
        setWalletAddress(stxAddress.address);
        setWalletConnected(true);
        console.log('✅ Wallet connected:', stxAddress.address);
      }
    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
    }
  };

  const handleDisconnectWallet = () => {
    disconnect();
    setWalletConnected(false);
    setWalletAddress('');
    console.log('🔌 Wallet disconnected');
  };

  const formatWalletAddress = (address: string) => {
    if (address.length <= 12) return address;
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  // Load chats from storage
  useEffect(() => {
    const loadChats = () => {
      const loaded = loadChatsFromStorage();
      setChats(loaded);
    };

    loadChats();

    // Listen for storage changes
    const handleStorageChange = () => {
      loadChats();
    };

    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener('chats-updated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('chats-updated', handleStorageChange);
    };
  }, []);

  // Filter chats based on search query
  const filteredChats = useMemo(() => {
    if (!searchQuery.trim()) return chats;

    const query = searchQuery.toLowerCase();
    return chats.filter((chat) =>
      chat.title.toLowerCase().includes(query)
    );
  }, [chats, searchQuery]);

  const handleNewChat = () => {
    const newChatId = generateChatId();
    router.push(`/chat/${newChatId}`);
  };

  const handleRename = (id: string, currentTitle: string) => {
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      setSelectedChat(chat);
      setRenameDialogOpen(true);
    }
  };

  const handleRenameConfirm = (newTitle: string) => {
    if (selectedChat) {
      renameChatInStorage(selectedChat.id, newTitle);
      setChats(loadChatsFromStorage());
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new Event('chats-updated'));
    }
  };

  const handleDelete = (id: string) => {
    const chat = chats.find((c) => c.id === id);
    if (chat) {
      setSelectedChat(chat);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = () => {
    if (selectedChat) {
      deleteChatFromStorage(selectedChat.id);
      setChats(loadChatsFromStorage());
      // Trigger custom event for same-tab updates
      window.dispatchEvent(new Event('chats-updated'));

      // If deleting current chat, navigate to new chat
      if (selectedChat.id === currentChatId) {
        const newChatId = generateChatId();
        router.push(`/chat/${newChatId}`);
      }
    }
  };

  return (
    <>
      {/* Sidebar */}
      <aside
        className="fixed top-0 left-0 h-full w-64 bg-background/95 backdrop-blur-sm border-r z-40"
      >
        <div className="flex flex-col h-full pt-6 px-4">
          {/* New Chat Button */}
          <Button onClick={handleNewChat} className="w-full mb-4 flex-shrink-0">
            <Plus className="h-4 w-4 mr-2" />
            New Chat
          </Button>

          {/* Search Input */}
          <div className="relative mb-4 flex-shrink-0">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Chat History List - Scrollable area that takes remaining space */}
          <ScrollArea className="flex-1 min-h-0">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                {searchQuery ? 'No chats found' : 'No chats yet'}
              </div>
            ) : (
              <div className="space-y-1 pb-4">
                {(() => {
                  const currentChat = filteredChats.find((chat) => chat.id === currentChatId);
                  const otherChats = filteredChats.filter((chat) => chat.id !== currentChatId);

                  return (
                    <>
                      {/* Current Chat Section */}
                      {currentChat && (
                        <>
                          <div className="mb-2 pt-1">
                            <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-1">
                              Current Chat
                            </h3>
                          </div>
                          <ChatHistoryItemComponent
                            key={currentChat.id}
                            chat={currentChat}
                            isActive={true}
                            onRename={handleRename}
                            onDelete={handleDelete}
                          />
                          
                          {/* Divider */}
                          {otherChats.length > 0 && (
                            <div className="my-4 border-t border-border/30" />
                          )}
                        </>
                      )}

                      {/* Other Chats Section */}
                      {otherChats.length > 0 && (
                        <>
                          <div className="mb-2">
                            <h3 className="text-xs font-medium text-muted-foreground/70 uppercase tracking-wider px-1">
                              Recent Chats
                            </h3>
                          </div>
                          {otherChats.map((chat) => (
                            <ChatHistoryItemComponent
                              key={chat.id}
                              chat={chat}
                              isActive={false}
                              onRename={handleRename}
                              onDelete={handleDelete}
                            />
                          ))}
                        </>
                      )}
                    </>
                  );
                })()}
              </div>
            )}
          </ScrollArea>

          {/* Divider */}
          <div className="border-t border-border/40 my-4 flex-shrink-0" />

          {/* Wallet Section - Fixed at bottom */}
          <div className="flex-shrink-0 pb-4">
            {!walletConnected ? (
              <Button
                onClick={handleConnectWallet}
                variant="outline"
                className="w-full justify-start"
              >
                <Wallet className="h-4 w-4 mr-2" />
                Connect Wallet
              </Button>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between p-2 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-2 min-w-0">
                    <Wallet className="h-4 w-4 text-primary flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-muted-foreground">Stacks Wallet</p>
                      <p className="text-sm font-mono truncate" title={walletAddress}>
                        {formatWalletAddress(walletAddress)}
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  onClick={handleDisconnectWallet}
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs"
                >
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Dialogs */}
      {selectedChat && (
        <>
          <RenameDialog
            open={renameDialogOpen}
            onOpenChange={setRenameDialogOpen}
            currentTitle={selectedChat.title}
            onRename={handleRenameConfirm}
          />
          <DeleteDialog
            open={deleteDialogOpen}
            onOpenChange={setDeleteDialogOpen}
            chatTitle={selectedChat.title}
            onDelete={handleDeleteConfirm}
          />
        </>
      )}
    </>
  );
}
