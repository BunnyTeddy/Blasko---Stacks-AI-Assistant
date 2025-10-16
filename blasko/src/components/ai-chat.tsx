'use client';

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ai-elements/conversation';
import { Message, MessageContent } from '@/components/ai-elements/message';
import {
  PromptInput,
  PromptInputActionAddAttachments,
  PromptInputActionMenu,
  PromptInputActionMenuContent,
  PromptInputActionMenuTrigger,
  PromptInputAttachment,
  PromptInputAttachments,
  PromptInputBody,
  type PromptInputMessage,
  PromptInputSubmit,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputTools,
} from '@/components/ai-elements/prompt-input';
import { Action, Actions } from '@/components/ai-elements/actions';
import { Fragment, useState, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { Response } from '@/components/ai-elements/response';
import { CopyIcon, RefreshCcwIcon } from 'lucide-react';
import { getLocalStorage } from '@stacks/connect';
import {
  Source,
  Sources,
  SourcesContent,
  SourcesTrigger,
} from '@/components/ai-elements/sources';
import {
  Reasoning,
  ReasoningContent,
  ReasoningTrigger,
} from '@/components/ai-elements/reasoning';
import { Loader } from '@/components/ai-elements/loader';
import { SendToken } from '@/components/send-token';
import { MultiSend } from '@/components/multi-send';
import { SwapToken } from '@/components/swap-token';
import { BridgeToken } from '@/components/bridge-token';
import { StackStx } from '@/components/stack-stx';
import { TransactionData } from '@/components/transaction-data';
import { ContractData } from '@/components/contract-data';
import { AccountData } from '@/components/account-data';
import { NftGallery } from '@/components/nft-gallery';
import { BNSResolver } from '@/components/bns-resolver';
import { ReverseLookup } from '@/components/reverse-lookup';
import { RegisterBNS } from '@/components/register-bns';
import { StacksTVL } from '@/components/stacks-tvl';
import { TopProtocols } from '@/components/top-protocols';
import { DefiCategories } from '@/components/defi-categories';
import { ProtocolInfo } from '@/components/protocol-info';
import { StacksKnowledge } from '@/components/stacks-knowledge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { VerticalCutReveal } from '@/components/ui/vertical-cut-reveal';
import { Suggestion, Suggestions } from '@/components/ai-elements/suggestion';
import { loadChatById, saveChatToStorage } from '@/lib/chat-storage';

type ChatBotDemoProps = {
  chatId: string;
};

const ChatBotDemo = ({ chatId }: ChatBotDemoProps) => {
  const [input, setInput] = useState('');
  const [model] = useState<string>('gemini-2.5-flash');
  const [webSearch] = useState(false);
  const { messages, sendMessage, status, regenerate, setMessages } = useChat();

  // Load messages from storage on mount or when chatId changes
  useEffect(() => {
    const chat = loadChatById(chatId);
    if (chat && chat.messages.length > 0) {
      setMessages(chat.messages);
    } else {
      setMessages([]);
    }
  }, [chatId, setMessages]);

  // Save messages to storage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      saveChatToStorage(chatId, messages);
      // Trigger custom event for sidebar updates
      window.dispatchEvent(new Event('chats-updated'));
    }
  }, [messages, chatId]);

  const handleSubmit = (message: PromptInputMessage) => {
    const hasText = Boolean(message.text);
    const hasAttachments = Boolean(message.files?.length);

    if (!(hasText || hasAttachments)) {
      return;
    }

    // Get connected wallet address if available
    let walletAddress: string | undefined;
    try {
      const userData = getLocalStorage();
      walletAddress = userData?.addresses?.stx?.[0]?.address;
    } catch {
      // Ignore if wallet not connected
    }

    sendMessage(
      { 
        text: message.text || 'Sent with attachments',
        files: message.files 
      },
      {
        body: {
          model: model,
          webSearch: webSearch,
          walletAddress: walletAddress,
        },
      },
    );
    setInput('');
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage({ text: suggestion }, {
      body: {
        model: model,
        webSearch: webSearch,
      },
    });
  };

  return (
    <div className="w-full p-6 relative size-full h-screen">
      <div className="flex flex-col h-full max-w-6xl mx-auto">
        <Conversation className="h-full">
          <ConversationContent>
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full space-y-8 px-4">
                {/* Animated Greeting */}
                <div className="text-center space-y-8 max-w-5xl">
                  <div className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-black tracking-tight">
                    <VerticalCutReveal
                      splitBy="characters"
                      staggerDuration={0.025}
                      staggerFrom="first"
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 21,
                      }}
                      containerClassName="text-black dark:text-white"
                    >
                      {`WELCOME 🥳`}
                    </VerticalCutReveal>
                  </div>
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight">
                    <VerticalCutReveal
                      splitBy="characters"
                      staggerDuration={0.025}
                      staggerFrom="last"
                      reverse={true}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 21,
                        delay: 0.6,
                      }}
                      containerClassName="text-black dark:text-white"
                    >
                      {`TO BLASKO! 😍`}
                    </VerticalCutReveal>
                  </div>
                  <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold">
                    <VerticalCutReveal
                      splitBy="words"
                      staggerDuration={0.08}
                      staggerFrom="center"
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 21,
                        delay: 1.2,
                      }}
                      containerClassName="text-black dark:text-white"
                    >
                      {`Your AI-Powered DeFi Assistant 🚀`}
                    </VerticalCutReveal>
                  </div>
                  <div className="text-lg sm:text-xl md:text-2xl font-semibold">
                    <VerticalCutReveal
                      splitBy="characters"
                      staggerDuration={0.02}
                      staggerFrom="center"
                      reverse={true}
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 21,
                        delay: 1.8,
                      }}
                      containerClassName="text-black dark:text-white"
                    >
                      {`Built for Stacks Blockchain 🫡 Let's Go! 🆗`}
                    </VerticalCutReveal>
                  </div>
                  <div className="text-base sm:text-lg md:text-xl font-medium pt-4">
                    <VerticalCutReveal
                      splitBy="words"
                      staggerDuration={0.06}
                      staggerFrom="first"
                      transition={{
                        type: "spring",
                        stiffness: 200,
                        damping: 21,
                        delay: 2.4,
                      }}
                      containerClassName="text-black/80 dark:text-white/80"
                    >
                      {`Send tokens • Check balances • Explore NFTs • Swap on DEX • Bridge assets 😊`}
                    </VerticalCutReveal>
                  </div>
                </div>
              </div>
            )}

            {messages.map((message) => (
              <div key={message.id}>
                {message.role === 'assistant' && message.parts.filter((part) => part.type === 'source-url').length > 0 && (
                  <Sources>
                    <SourcesTrigger
                      count={
                        message.parts.filter(
                          (part) => part.type === 'source-url',
                        ).length
                      }
                    />
                    {message.parts.filter((part) => part.type === 'source-url').map((part, i) => (
                      <SourcesContent key={`${message.id}-${i}`}>
                        <Source
                          key={`${message.id}-${i}`}
                          href={part.url}
                          title={part.url}
                        />
                      </SourcesContent>
                    ))}
                  </Sources>
                )}
                {message.parts.map((part, i) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <Fragment key={`${message.id}-${i}`}>
                          <Message from={message.role}>
                            <MessageContent>
                              <Response>
                                {part.text}
                              </Response>
                            </MessageContent>
                          </Message>
                          {message.role === 'assistant' && i === messages.length - 1 && (
                            <Actions className="mt-2">
                              <Action
                                onClick={() => regenerate()}
                                label="Retry"
                              >
                                <RefreshCcwIcon className="size-3" />
                              </Action>
                              <Action
                                onClick={() =>
                                  navigator.clipboard.writeText(part.text)
                                }
                                label="Copy"
                              >
                                <CopyIcon className="size-3" />
                              </Action>
                            </Actions>
                          )}
                        </Fragment>
                      );
                    case 'reasoning':
                      return (
                        <Reasoning
                          key={`${message.id}-${i}`}
                          className="w-full"
                          isStreaming={status === 'streaming' && i === message.parts.length - 1 && message.id === messages.at(-1)?.id}
                        >
                          <ReasoningTrigger />
                          <ReasoningContent>{part.text}</ReasoningContent>
                        </Reasoning>
                      );
                    case 'tool-sendToken':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Preparing transfer...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <SendToken {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-multiSend':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Preparing multi-send...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <MultiSend {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getTransaction':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Fetching transaction data...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <TransactionData {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getContract':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Fetching contract data...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <ContractData {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getAccount':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Fetching account data...</span>
                                  </div>
                                );
                              case 'output-available':
                                return (
                                  <ScrollArea className="max-h-[600px] w-full">
                                    <AccountData {...(part.output as Record<string, unknown>)} />
                                  </ScrollArea>
                                );
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-swapToken':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Preparing swap...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <SwapToken {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-bridgeToken':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Preparing bridge...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <BridgeToken {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-stackStx':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Loading stacking info...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <StackStx {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getNftGallery':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Loading your NFT collection...</span>
                                  </div>
                                );
                              case 'output-available':
                                return (
                                  <ScrollArea className="max-h-[600px] w-full">
                                    <NftGallery {...(part.output as Record<string, unknown>)} />
                                  </ScrollArea>
                                );
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-resolveBNS':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Resolving BNS name...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <BNSResolver {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-reverseLookupBNS':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Looking up BNS name...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <ReverseLookup {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-registerBNS':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Checking availability...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <RegisterBNS {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getStacksTVL':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Fetching TVL data...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <StacksTVL {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getTopProtocols':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Fetching top protocols...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <TopProtocols {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getDefiCategories':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Fetching DeFi categories...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <DefiCategories {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getProtocolInfo':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Fetching protocol info...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <ProtocolInfo {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    case 'tool-getStacksKnowledge':
                      return (
                        <div key={`${message.id}-${i}`} className="my-4">
                          {(() => {
                            switch (part.state) {
                              case 'input-available':
                                return (
                                  <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader />
                                    <span>Searching documentation...</span>
                                  </div>
                                );
                              case 'output-available':
                                return <StacksKnowledge {...(part.output as Record<string, unknown>)} />;
                              case 'output-error':
                                return (
                                  <div className="text-red-500 text-sm">
                                    Error: {part.errorText}
                                  </div>
                                );
                              default:
                                return null;
                            }
                          })()}
                        </div>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            ))}
            {status === 'submitted' && <Loader />}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>

        {/* Suggestions - shown above input when chat is empty */}
        {messages.length === 0 && (
          <div className="mb-4">
            <Suggestions>
              <Suggestion 
                onClick={handleSuggestionClick} 
                suggestion="Send 10 STX to an address" 
              />
              <Suggestion 
                onClick={handleSuggestionClick} 
                suggestion="What's my account balance?" 
              />
              <Suggestion 
                onClick={handleSuggestionClick} 
                suggestion="Show me my NFT collection" 
              />
              <Suggestion 
                onClick={handleSuggestionClick} 
                suggestion="How can I stack STX?" 
              />
              <Suggestion 
                onClick={handleSuggestionClick} 
                suggestion="Swap 5 STX for USDA" 
              />
              <Suggestion 
                onClick={handleSuggestionClick} 
                suggestion="What is sBTC?" 
              />
            </Suggestions>
          </div>
        )}

        <PromptInput onSubmit={handleSubmit} className="mt-4" globalDrop multiple>
          <PromptInputBody>
            <PromptInputAttachments>
              {(attachment) => <PromptInputAttachment data={attachment} />}
            </PromptInputAttachments>
            <PromptInputTextarea
              onChange={(e) => setInput(e.target.value)}
              value={input}
            />
          </PromptInputBody>
          <PromptInputToolbar>
            <PromptInputTools>
              <PromptInputActionMenu>
                <PromptInputActionMenuTrigger />
                <PromptInputActionMenuContent>
                  <PromptInputActionAddAttachments />
                </PromptInputActionMenuContent>
              </PromptInputActionMenu>
            </PromptInputTools>
            <PromptInputSubmit disabled={!input && !status} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
};

export default ChatBotDemo;