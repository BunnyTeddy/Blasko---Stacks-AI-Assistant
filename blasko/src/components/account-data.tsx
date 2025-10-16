'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ExternalLink, Coins, Image as ImageIcon, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

type AccountDataProps = {
  address: string;
  balances: {
    stx: {
      balance: string;
      total_sent: string;
      total_received: string;
      locked: string;
    };
    fungible_tokens?: Record<string, { balance: string; total_sent: string; total_received: string }>;
    non_fungible_tokens?: Record<string, { count: string; total_sent: string; total_received: string }>;
  };
  recentTransactions: Record<string, unknown>[];
};

export function AccountData({ address, balances, recentTransactions }: AccountDataProps) {
  const [isFungibleOpen, setIsFungibleOpen] = useState(false);

  const formatSTX = (microStx: string) => {
    return (parseInt(microStx) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatTokenBalance = (balance: string, decimals: number = 6) => {
    const divisor = Math.pow(10, decimals);
    return (parseInt(balance) / divisor).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const extractTokenName = (contractId: string): string => {
    // Extract readable token name from contract ID
    // Format: SP...::token-name
    const parts = contractId.split('::');
    if (parts.length > 1) {
      return parts[1].split('-').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(' ');
    }
    return contractId;
  };

  const fungibleTokensCount = balances.fungible_tokens 
    ? Object.keys(balances.fungible_tokens).length 
    : 0;
  
  const nftCollectionsCount = balances.non_fungible_tokens 
    ? Object.keys(balances.non_fungible_tokens).length 
    : 0;

  const totalNFTs = balances.non_fungible_tokens
    ? Object.values(balances.non_fungible_tokens).reduce((sum, nft) => sum + parseInt(nft.count), 0)
    : 0;

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-primary" />
          Account Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Address</label>
          <code className="text-xs bg-muted p-2 rounded block break-all">
            {address}
          </code>
        </div>

        {/* STX Balance */}
        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-muted-foreground">STX Balance</span>
            <TrendingUp className="h-5 w-5 text-purple-600" />
          </div>
          <p className="text-4xl font-bold mb-3">{formatSTX(balances.stx.balance)} STX</p>
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-muted-foreground mb-1">Received</p>
              <p className="font-mono font-medium">{formatSTX(balances.stx.total_received)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Sent</p>
              <p className="font-mono font-medium">{formatSTX(balances.stx.total_sent)}</p>
            </div>
          </div>
          {parseInt(balances.stx.locked) > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-800">
              <p className="text-xs text-muted-foreground mb-1">Locked</p>
              <p className="font-mono font-medium text-orange-600">{formatSTX(balances.stx.locked)} STX</p>
            </div>
          )}
        </div>

        {/* Tokens and NFTs Row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Fungible Tokens Summary */}
          {fungibleTokensCount > 0 && (
            <div className="p-4 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="flex flex-col items-center text-center">
                <Coins className="h-6 w-6 text-amber-600 mb-2" />
                <span className="text-xs font-medium text-muted-foreground mb-1">Fungible Tokens</span>
                <p className="text-3xl font-bold">{fungibleTokensCount}</p>
              </div>
            </div>
          )}

          {/* NFTs Summary */}
          {nftCollectionsCount > 0 && (
            <div className="p-4 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-xl border border-pink-200 dark:border-pink-800">
              <div className="flex flex-col items-center text-center">
                <ImageIcon className="h-6 w-6 text-pink-600 mb-2" />
                <span className="text-xs font-medium text-muted-foreground mb-1">NFT Collections</span>
                <p className="text-3xl font-bold">{nftCollectionsCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{totalNFTs} total NFTs</p>
              </div>
            </div>
          )}
        </div>

        {/* Fungible Tokens Details - Collapsible */}
        {fungibleTokensCount > 0 && balances.fungible_tokens && (
          <Collapsible open={isFungibleOpen} onOpenChange={setIsFungibleOpen}>
            <div className="border border-amber-200 dark:border-amber-800 rounded-xl overflow-hidden">
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/5 to-orange-500/5 hover:from-amber-500/10 hover:to-orange-500/10 transition-colors">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-amber-600" />
                    <span className="font-medium text-sm">Fungible Tokens Details</span>
                    <span className="text-xs text-muted-foreground">({fungibleTokensCount} tokens)</span>
                  </div>
                  {isFungibleOpen ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-4 space-y-3 bg-gradient-to-br from-amber-500/5 to-orange-500/5">
                  {Object.entries(balances.fungible_tokens).map(([contractId, tokenData]) => (
                    <div 
                      key={contractId} 
                      className="p-3 bg-background rounded-lg border border-border hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <p className="font-medium text-sm mb-1">{extractTokenName(contractId)}</p>
                          <code className="text-xs text-muted-foreground break-all">{contractId}</code>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-border">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Balance</p>
                          <p className="font-mono text-sm font-medium text-amber-600 dark:text-amber-500">
                            {formatTokenBalance(tokenData.balance)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Received</p>
                          <p className="font-mono text-xs">{formatTokenBalance(tokenData.total_received)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Sent</p>
                          <p className="font-mono text-xs">{formatTokenBalance(tokenData.total_sent)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        )}

        {/* View Full Account on Explorer */}
        <div className="pt-2">
          <Button
            variant="default"
            className="w-full"
            onClick={() => window.open(`https://explorer.stacks.co/address/${address}?chain=mainnet`, '_blank')}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View Full Account on Explorer
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

