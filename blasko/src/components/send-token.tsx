'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowRight, Send, Loader2, ExternalLink, AlertCircle, X } from 'lucide-react';
import { request, getLocalStorage } from '@stacks/connect';
import { Cl } from '@stacks/transactions';

type PopularToken = {
  symbol: string;
  name: string;
  contractAddress: string;
  decimals: number;
};

// Popular tokens on Stacks blockchain
const POPULAR_TOKENS: PopularToken[] = [
  { symbol: 'STX', name: 'Stacks', contractAddress: '', decimals: 6 },
  { symbol: 'USDA', name: 'USDA Stablecoin', contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token', decimals: 6 },
  { symbol: 'sBTC', name: 'Stacks BTC', contractAddress: 'SM3KNVZS30WM7F89SXKVVFY4SN9RMPZZ9FX929N0V.sbtc-token', decimals: 8 },
  { symbol: 'WELSH', name: 'WELSH Token', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', decimals: 6 },
  { symbol: 'ALEX', name: 'ALEX Token', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token', decimals: 8 },
];

type SendTokenProps = {
  token?: string;
  amount?: string;
  recipient?: string;
  memo?: string;
  contractAddress?: string;
};

export function SendToken({ 
  token: initialToken, 
  amount: initialAmount, 
  recipient: initialRecipient, 
  memo: initialMemo,
  contractAddress: initialContractAddress 
}: SendTokenProps) {
  // If contractAddress is provided but token is not specified or not in popular list, use CUSTOM
  const determineInitialToken = () => {
    if (initialContractAddress && initialContractAddress.trim() !== '') {
      // Check if the contract matches any popular token
      const matchingToken = POPULAR_TOKENS.find(
        (t) => t.contractAddress.toLowerCase() === initialContractAddress.toLowerCase()
      );
      if (matchingToken) {
        return matchingToken.symbol;
      }
      return 'CUSTOM';
    }
    return initialToken || 'STX';
  };

  const [selectedToken, setSelectedToken] = useState(determineInitialToken());
  const [customContract, setCustomContract] = useState(initialContractAddress || '');
  const [amount, setAmount] = useState(initialAmount || '');
  const [recipient, setRecipient] = useState(initialRecipient || '');
  const [memo, setMemo] = useState(initialMemo || '');
  const [loading, setLoading] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [senderAddress, setSenderAddress] = useState<string>('');

  // Get sender address from wallet
  useEffect(() => {
    const userData = getLocalStorage();
    const stxAddress = userData?.addresses?.stx?.[0]?.address;
    if (stxAddress) {
      setSenderAddress(stxAddress);
    }
  }, []);

  // Auto-dismiss cancellation messages after 5 seconds
  useEffect(() => {
    if (error && error.includes('cancelled')) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getTokenInfo = () => {
    if (selectedToken === 'CUSTOM') {
      return { symbol: 'TOKEN', contractAddress: customContract, decimals: 6 };
    }
    const token = POPULAR_TOKENS.find((t) => t.symbol === selectedToken);
    return token || POPULAR_TOKENS[0];
  };

  const handleSend = async () => {
    if (!amount || !recipient) {
      setError('Please fill in all required fields');
      return;
    }

    if (!senderAddress) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const tokenInfo = getTokenInfo();

      if (selectedToken === 'STX') {
        // Send STX using stx_transferStx
        const amountInMicroStx = Math.floor(parseFloat(amount) * 1_000_000).toString();
        
        const response = await request('stx_transferStx', {
          amount: amountInMicroStx,
          recipient: recipient,
          memo: memo || undefined,
        });

        setTxId(response.txid || null);
        console.log('✅ STX transfer successful:', response.txid);
      } else {
        // Send fungible token using stx_callContract
        const [contractAddr, contractName] = tokenInfo.contractAddress.split('.');
        
        if (!contractAddr || !contractName) {
          throw new Error('Invalid contract address');
        }

        // Convert amount to token units (considering decimals)
        const amountInUnits = Math.floor(parseFloat(amount) * Math.pow(10, tokenInfo.decimals));

        const response = await request('stx_callContract', {
          contract: tokenInfo.contractAddress as `${string}.${string}`, // Use combined format ADDRESS.CONTRACT_NAME
          functionName: 'transfer',
          functionArgs: [
            Cl.uint(amountInUnits),
            Cl.principal(senderAddress),
            Cl.principal(recipient),
            memo ? Cl.some(Cl.bufferFromUtf8(memo)) : Cl.none(),
          ],
          postConditionMode: 'allow',
          network: 'mainnet',
        });

        setTxId(response.txid || null);
        console.log('✅ Token transfer successful:', response.txid);
      }
    } catch (err) {
      console.error('❌ Transfer failed:', err);
      
      // Handle user rejection gracefully
      const errorMessage = err instanceof Error ? err.message : 'Transaction failed';
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user');
      } else if (errorMessage.includes('Insufficient balance')) {
        setError('Insufficient balance to complete this transaction');
      } else if (errorMessage.includes('Invalid address')) {
        setError('Invalid recipient address');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (txId) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <Send className="h-5 w-5" />
            Transfer Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <p className="text-sm text-muted-foreground mb-2">Transaction ID:</p>
            <p className="text-xs font-mono break-all mb-3">{txId}</p>
            <a
              href={`https://explorer.stacks.co/txid/${txId}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              View in Explorer
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Button onClick={() => setTxId(null)} variant="outline" className="w-full">
            Send Another Transaction
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="h-5 w-5 text-primary" />
          Send Token
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Token Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Token</label>
          <Select value={selectedToken} onValueChange={setSelectedToken}>
            <SelectTrigger>
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              {POPULAR_TOKENS.map((token) => (
                <SelectItem key={token.symbol} value={token.symbol}>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{token.symbol}</span>
                    <span className="text-xs text-muted-foreground">- {token.name}</span>
                  </div>
                </SelectItem>
              ))}
              <SelectItem value="CUSTOM">
                <span className="text-muted-foreground">Custom Contract...</span>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom Contract Address */}
        {selectedToken === 'CUSTOM' && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Contract Address</label>
            <Input
              placeholder="SP...contract-name"
              value={customContract}
              onChange={(e) => setCustomContract(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Format: SP...ADDRESS.contract-name
            </p>
          </div>
        )}

        {/* Amount */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Amount</label>
          <Input
            type="number"
            step="0.000001"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Recipient */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Recipient Address</label>
          <Input
            placeholder="SP... or ST..."
            value={recipient}
            onChange={(e) => setRecipient(e.target.value)}
          />
        </div>

        {/* Memo (Optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Memo (Optional)</label>
          <Input
            placeholder="Add a note..."
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={34}
          />
        </div>

        {/* Summary */}
        <div className="p-3 bg-accent/30 rounded-lg space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sending</span>
            <span className="font-medium">{amount || '0'} {getTokenInfo().symbol}</span>
          </div>
          <div className="flex items-center justify-center py-1">
            <ArrowRight className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To</span>
            <span className="font-mono text-xs truncate max-w-[200px]">{recipient || 'Not set'}</span>
          </div>
          {selectedToken !== 'STX' && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">Network Fee: ~0.01 STX</p>
            </div>
          )}
        </div>

        {/* Error/Info Message */}
        {error && (
          <div className={`p-3 rounded-lg flex items-start gap-2 ${
            error.includes('cancelled') 
              ? 'bg-muted border border-border' 
              : 'bg-destructive/10 border border-destructive/20'
          }`}>
            <AlertCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
              error.includes('cancelled') ? 'text-muted-foreground' : 'text-destructive'
            }`} />
            <p className={`text-sm flex-1 ${
              error.includes('cancelled') ? 'text-muted-foreground' : 'text-destructive'
            }`}>
              {error}
            </p>
            <button
              onClick={() => setError(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Send Button */}
        <Button
          onClick={handleSend}
          disabled={loading || !amount || !recipient || !senderAddress}
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Confirm & Send
            </>
          )}
        </Button>

        {!senderAddress && (
          <p className="text-xs text-center text-muted-foreground">
            Connect your wallet to send tokens
          </p>
        )}
      </CardContent>
    </Card>
  );
}

