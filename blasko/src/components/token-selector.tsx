'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, ChevronDown } from 'lucide-react';

type Token = {
  symbol: string;
  name: string;
  contractAddress: string;
  decimals: number;
};

type TokenSelectorProps = {
  tokens: Token[];
  selectedToken: string;
  onSelectToken: (symbol: string) => void;
  disabled?: boolean;
  label?: string;
};

export function TokenSelector({ 
  tokens, 
  selectedToken, 
  onSelectToken, 
  disabled = false,
  label = 'Select Token'
}: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tokens based on search query
  const filteredTokens = tokens.filter((token) => {
    const query = searchQuery.toLowerCase();
    return (
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query)
    );
  });

  const handleSelectToken = (symbol: string) => {
    onSelectToken(symbol);
    setIsOpen(false);
    setSearchQuery(''); // Clear search on selection
  };

  // Handle keyboard Enter to select first result
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && filteredTokens.length > 0) {
      handleSelectToken(filteredTokens[0].symbol);
    }
  };

  const selectedTokenInfo = tokens.find((t) => t.symbol === selectedToken);

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setIsOpen(true)}
        disabled={disabled}
        className="w-32 justify-between"
      >
        <span>{selectedToken || 'Select'}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{label}</DialogTitle>
          </DialogHeader>

          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by symbol or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Token List */}
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-1">
              {filteredTokens.length > 0 ? (
                filteredTokens.map((token) => (
                  <button
                    key={token.symbol}
                    onClick={() => handleSelectToken(token.symbol)}
                    className={`w-full text-left p-3 rounded-lg hover:bg-accent transition-colors ${
                      token.symbol === selectedToken ? 'bg-accent border border-primary' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{token.symbol}</span>
                        <span className="text-xs text-muted-foreground">{token.name}</span>
                      </div>
                      {token.symbol === selectedToken && (
                        <div className="text-primary text-xs font-medium">Selected</div>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  No tokens found for "{searchQuery}"
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Results count */}
          <div className="text-xs text-muted-foreground text-center">
            {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''} available
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

