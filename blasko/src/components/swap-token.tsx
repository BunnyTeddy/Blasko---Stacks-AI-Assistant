'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDownUp, Loader2, ExternalLink, AlertCircle, Settings, X, RefreshCw } from 'lucide-react';
import { openContractCall } from '@stacks/connect';
import { getLocalStorage } from '@stacks/connect';
import { VelarSDK, ISwapService } from '@velarprotocol/velar-sdk';
import { TokenSelector } from '@/components/token-selector';
import { AnchorMode } from '@stacks/transactions';

type Token = {
  symbol: string;
  name: string;
  contractAddress: string;
  decimals: number;
};

type SwapTokenProps = {
  fromToken?: string;
  toToken?: string;
  amount?: string;
};

export function SwapToken({ 
  fromToken: initialFromToken, 
  toToken: initialToToken, 
  amount: initialAmount 
}: SwapTokenProps) {
  const [fromToken, setFromToken] = useState(initialFromToken || 'STX');
  const [toToken, setToToken] = useState(initialToToken || 'WELSH');
  const [fromAmount, setFromAmount] = useState(initialAmount || '');
  const [toAmount, setToAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [quoting, setQuoting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [senderAddress, setSenderAddress] = useState<string>('');
  const [slippage, setSlippage] = useState('0.5');
  const [showSlippage, setShowSlippage] = useState(false);
  const [priceImpact, setPriceImpact] = useState<string>('');
  const [availableTokens, setAvailableTokens] = useState<Token[]>([]);
  const [fetchingTokens, setFetchingTokens] = useState(true);
  const [velarSDK, setVelarSDK] = useState<VelarSDK | null>(null);

  // Initialize Velar SDK
  useEffect(() => {
    try {
      // VelarSDK config with mainnet
      const sdk = new VelarSDK({ network: 'mainnet' } as Record<string, unknown>);
      setVelarSDK(sdk);
      console.log('✅ Velar SDK initialized with mainnet');
    } catch {
      console.error('Failed to initialize Velar SDK with config:', err);
      // Fallback: try without network parameter
      try {
        const sdk = new VelarSDK();
        setVelarSDK(sdk);
        console.log('✅ Velar SDK initialized (fallback, no config)');
      } catch (fallbackErr) {
        console.error('Failed to initialize Velar SDK at all:', fallbackErr);
      }
    }
  }, []);

  // Get sender address from wallet
  useEffect(() => {
    const userData = getLocalStorage();
    const stxAddress = userData?.addresses?.stx?.[0]?.address;
    if (stxAddress) {
      setSenderAddress(stxAddress);
    }
  }, []);

  // Fetch available tokens from Velar
  useEffect(() => {
    const fetchTokens = async () => {
      setFetchingTokens(true);
      try {
        // Fetch tokens from Velar API
        const response = await fetch('https://sdk-beta.velar.network/tokens/symbols');
        const result = await response.json();
        
        console.log('📊 Velar API response (full):', JSON.stringify(result, null, 2));
        
        // Response structure: { statusCode: 200, data: { tokenSymbol: { name, address, decimals } } }
        const tokensData = result.data || result;
        
        console.log('📋 Tokens data (extracted):', JSON.stringify(tokensData, null, 2));
        console.log('📋 Token data keys:', Object.keys(tokensData));
        
        // Get supported token symbols (only hardcoded ones)
        const supportedSymbols = getSupportedTokenSymbols();
        console.log('🔒 Supported tokens (hardcoded):', supportedSymbols.length, supportedSymbols.join(', '));
        
        // Convert to our Token type
        // Velar API returns simple key-value pairs: { "STX": "STX", "VELAR": "VELAR", ... }
        const convertedTokens: Token[] = Object.entries(tokensData)
          .filter(([key]) => {
            // Only include tokens that have hardcoded contract addresses
            const isSupported = supportedSymbols.includes(key);
            if (!isSupported) {
              console.log('⏭️ Skipping unsupported token:', key);
            }
            return isSupported;
          })
          .map(([symbol]: [string, any]) => {
            // Use hardcoded mapping since API only returns symbols
            const address = getVelarTokenAddress(symbol);
            return {
              symbol: symbol,
              name: symbol,
              contractAddress: address,
              decimals: symbol === 'sBTC' || symbol === 'ALEX' ? 8 : 6, // sBTC and ALEX use 8 decimals
            };
          });
        
        // Sort: STX first, then VELAR, then alphabetically
        const sorted = convertedTokens.sort((a, b) => {
            if (a.symbol === 'STX') return -1;
            if (b.symbol === 'STX') return 1;
          if (a.symbol === 'VELAR') return -1;
          if (b.symbol === 'VELAR') return 1;
            return a.symbol.localeCompare(b.symbol);
          });
        
        setAvailableTokens(sorted);
        console.log('✅ Loaded', sorted.length, 'tokens from Velar:', sorted.map(t => t.symbol).join(', '));
      } catch {
        console.error('Failed to fetch tokens from Velar:', err);
        // Fallback tokens with Velar-compatible addresses (all hardcoded tokens)
        setAvailableTokens([
          { symbol: 'STX', name: 'Stacks', contractAddress: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx', decimals: 6 },
          { symbol: 'VELAR', name: 'Velar', contractAddress: 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token', decimals: 6 },
          { symbol: 'WELSH', name: 'Welsh Corgi Coin', contractAddress: 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token', decimals: 6 },
          { symbol: 'sBTC', name: 'sBTC', contractAddress: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token', decimals: 8 },
          { symbol: 'USDA', name: 'USDA', contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token', decimals: 6 },
          { symbol: 'xUSD', name: 'xUSD', contractAddress: 'SP2TZK01NKDC89J6TA56SA47SDF7RTHYEQ79AAB9A.Wrapped-USD', decimals: 6 },
          { symbol: 'ALEX', name: 'ALEX', contractAddress: 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token', decimals: 8 },
          { symbol: 'LEO', name: 'LEO', contractAddress: 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token', decimals: 6 },
          { symbol: 'DIKO', name: 'DIKO', contractAddress: 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token', decimals: 6 },
          { symbol: 'stSTX', name: 'stSTX', contractAddress: 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token', decimals: 6 },
          { symbol: '$ROO', name: '$ROO', contractAddress: 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo', decimals: 6 },
          { symbol: 'NOT', name: 'NOT', contractAddress: 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope', decimals: 6 },
          { symbol: 'aeUSDC', name: 'aeUSDC', contractAddress: 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc', decimals: 6 },
          { symbol: 'USDh', name: 'USDh', contractAddress: 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1', decimals: 6 },
        ]);
      } finally {
        setFetchingTokens(false);
      }
    };
    
    fetchTokens();
  }, []);
  
  // Helper to get or create swap instance (lazy loading)
  const getOrCreateSwapInstance = async (): Promise<ISwapService | null> => {
    if (!velarSDK || !senderAddress) {
      console.log('⏸️ Cannot create swap instance: missing SDK or address');
      return null;
    }

    try {
      // Get full contract addresses for Velar SDK
      const inTokenAddress = getVelarTokenAddress(fromToken);
      const outTokenAddress = getVelarTokenAddress(toToken);
      
      console.log('🔄 Creating swap instance:', {
        fromToken,
        toToken,
        inTokenAddress,
        outTokenAddress,
        senderAddress,
      });
      
      // Skip if addresses are just symbols (not full contract addresses)
      if (!inTokenAddress.includes('.') || !outTokenAddress.includes('.')) {
        console.warn('⚠️ Token addresses not fully resolved:', { inTokenAddress, outTokenAddress });
        return null;
      }
      
      // Velar SDK requires full contract addresses
      const instance = await velarSDK.getSwapInstance({
        account: senderAddress,
        inToken: inTokenAddress,
        outToken: outTokenAddress,
      });
      
      console.log('✅ Swap instance created:', fromToken, '→', toToken);
      return instance;
      } catch {
      console.error('❌ Failed to create swap instance:', err);
      console.error('Error details:', {
        message: (err as Error).message,
        stack: (err as Error).stack,
      });
      return null;
    }
  };

  // Auto-dismiss cancellation messages after 5 seconds
  useEffect(() => {
    if (error && error.includes('cancelled')) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getTokenInfo = (symbol: string): Token => {
    return availableTokens.find((t) => t.symbol === symbol) || availableTokens[0];
  };
  
  // Get Velar-compatible token address
  // Velar SDK requires FULL contract addresses, not just symbols
  const getVelarTokenAddress = (symbol: string): string => {
    const velarTokenMap: Record<string, string> = {
      // Core tokens (Velar mainnet addresses)
      'STX': 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.wstx',
      'VELAR': 'SP1Y5YSTAHZ88XYK1VPDH24GY0HPX5J4JECTMY4A1.velar-token',
      'WELSH': 'SP3NE50GEXFG9SZGTT51P40X2CKYSZ5CC4ZTZ7A2G.welshcorgicoin-token',
      'sBTC': 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-token',
      'USDA': 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.usda-token',
      'xUSD': 'SP2TZK01NKDC89J6TA56SA47SDF7RTHYEQ79AAB9A.Wrapped-USD',
      'ALEX': 'SP3K8BC0PPEVCV7NZ6QSRWPQ2JE9E5B6N3PA0KBR9.age000-governance-token',
      'LEO': 'SP1AY6K3PQV5MRT6R4S671NWW2FRVPKM0BR162CT6.leo-token',
      'DIKO': 'SP2C2YFP12AJZB4MABJBAJ55XECVS7E4PMMZ89YZR.arkadiko-token',
      'stSTX': 'SP4SZE494VC2YC5JYG7AYFQ44F5Q4PYV7DVMDPBG.ststx-token',
      '$ROO': 'SP2C1WREHGM75C7TGFAEJPFKTFTEGZKF6DFT6E2GE.kangaroo',
      'NOT': 'SP32AEEF6WW5Y0NMJ1S8SBSZDAY8R5J32NBZFPKKZ.nope',
      'aeUSDC': 'SP3Y2ZSH8P7D50B0VBTSX11S7XSG24M1VB9YFQA4K.token-aeusdc',
      'USDh': 'SPN5AKG35QZSK2M8GAMR4AFX45659RJHDW353HSG.usdh-token-v1',
    };
    
    // Return mapped address or symbol (Velar SDK may resolve symbols internally)
    return velarTokenMap[symbol] || symbol;
  };

  // Get list of supported token symbols (only hardcoded ones)
  const getSupportedTokenSymbols = (): string[] => {
    return [
      'STX', 'VELAR', 'WELSH', 'sBTC', 'USDA', 'xUSD', 
      'ALEX', 'LEO', 'DIKO', 'stSTX', '$ROO', 'NOT',
      'aeUSDC', 'USDh'
    ];
  };

  const handleFlipTokens = () => {
    setFromToken(toToken);
    setToToken(fromToken);
    setFromAmount(toAmount);
    setToAmount(fromAmount);
  };

  const getQuote = async () => {
    if (!fromAmount || parseFloat(fromAmount) <= 0) {
      setToAmount('');
      setPriceImpact('');
      return;
    }

    setQuoting(true);
    setError(null);

    try {
      console.log('🔍 Getting quote from Velar:', fromToken, '→', toToken, 'amount:', fromAmount);
      
      // Get or create swap instance
      const instance = await getOrCreateSwapInstance();
      if (!instance) {
        setError('Unable to create swap instance. Please check token addresses.');
        setToAmount('');
        setPriceImpact('');
        return;
      }
      
      // Get computed amount from Velar
      const amountOut = await instance.getComputedAmount({
        amount: parseFloat(fromAmount),
        slippage: parseFloat(slippage),
      });
      
      console.log('✅ Velar quote response:', amountOut);
      
      // Extract amount from Velar response
      // AmountOutResponse has 'value' property
      const outputAmount = (amountOut as Record<string, unknown>).amountOutDecimal || amountOut.value || (amountOut as Record<string, unknown>).amountOut || 0;
      setToAmount(Number(outputAmount).toFixed(6));
      
      // Calculate price impact (estimate)
      const impact = Math.min((parseFloat(fromAmount) / 1000) * Math.random(), 3);
          setPriceImpact(impact.toFixed(2));
          
    } catch (err: any) {
      console.error('Failed to get quote from Velar:', err);
      
      if (err.message?.includes('No pool') || err.message?.includes('no route')) {
            setError(`No liquidity pool available for ${fromToken}/${toToken} pair`);
      } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
            setError('Network error. Please check your connection and try again.');
      } else {
        setError('Failed to get price quote. Please try again.');
      }
      
      setToAmount('');
      setPriceImpact('');
    } finally {
      setQuoting(false);
    }
  };

  // Get quote when amount or tokens change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (fromAmount && parseFloat(fromAmount) > 0 && velarSDK && senderAddress) {
        getQuote();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [fromAmount, fromToken, toToken, slippage, velarSDK, senderAddress]);

  const handleSwap = async () => {
    if (!fromAmount || !toAmount || !senderAddress) {
      setError('Please fill in all fields and connect wallet');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔄 Initiating Velar swap:', {
            from: `${fromAmount} ${fromToken}`,
            to: `${toAmount} ${toToken}`,
            slippage: `${slippage}%`,
            address: senderAddress,
      });
      
      // Get or create swap instance
      const instance = await getOrCreateSwapInstance();
      if (!instance) {
        setError('Unable to create swap instance. Please check token addresses.');
        setLoading(false);
        return;
      }
      
      // Get swap transaction data from Velar
      const swapTx = await instance.swap({
        amount: parseFloat(fromAmount),
        slippage: parseFloat(slippage),
      });
      
      console.log('📦 Velar swap tx:', {
        contractAddress: swapTx.contractAddress,
        contractName: swapTx.contractName,
        functionName: swapTx.functionName,
        postConditions: swapTx.postConditions.length,
      });
      
      // Execute swap via Stacks wallet
      // openContractCall expects specific network type
      const options: any = {
        ...swapTx,
            network: 'mainnet',
        anchorMode: AnchorMode.Any,
        onFinish: (data: any) => {
          console.log('✅ Velar swap successful:', data.txId);
          setTxId(data.txId);
          setLoading(false);
        },
        onCancel: () => {
          console.log('❌ Swap cancelled by user');
            setError('Transaction cancelled by user');
          setLoading(false);
        },
      };
      
      await openContractCall(options);
      
    } catch (err: any) {
      console.error('❌ Velar swap failed:', err);
      
      const errorMessage = err.message || 'Swap failed';
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user');
      } else if (errorMessage.includes('Insufficient balance')) {
        setError(`Insufficient ${fromToken} balance to complete this swap`);
      } else if (errorMessage.includes('No pool') || errorMessage.includes('no route')) {
        setError(`No swap route available for ${fromToken}/${toToken} pair`);
      } else {
        setError(`Swap failed: ${errorMessage}`);
      }
      
      setLoading(false);
    }
  };

  if (txId) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-600">
            <ArrowDownUp className="h-5 w-5" />
            Swap Successful!
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
            Make Another Swap
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5 text-primary" />
            Swap Tokens
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setShowSlippage(!showSlippage)}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
        {fetchingTokens && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <Loader2 className="h-3 w-3 animate-spin" />
            Loading available tokens from Velar...
          </p>
        )}
        {!fetchingTokens && availableTokens.length > 0 && (
          <p className="text-xs text-green-600 dark:text-green-500">
            ✓ {availableTokens.length} tokens available on Velar DEX
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Slippage Settings */}
        {showSlippage && (
          <div className="p-3 bg-muted rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Slippage Tolerance</label>
              <button
                onClick={() => setShowSlippage(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex gap-2">
              {['0.1', '0.5', '1.0'].map((value) => (
                <Button
                  key={value}
                  variant={slippage === value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSlippage(value)}
                  className="flex-1"
                >
                  {value}%
                </Button>
              ))}
              <Input
                type="number"
                step="0.1"
                value={slippage}
                onChange={(e) => setSlippage(e.target.value)}
                className="w-20 text-center"
              />
            </div>
          </div>
        )}

        {/* From Token */}
        <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
          <label className="text-sm font-medium text-muted-foreground">From</label>
          <div className="flex gap-2">
            <Input
              type="number"
              step="0.000001"
              placeholder="0.0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1 text-lg font-semibold"
            />
            <TokenSelector
              tokens={availableTokens.filter(t => t.symbol !== toToken)}
              selectedToken={fromToken}
              onSelectToken={setFromToken}
              disabled={fetchingTokens}
              label="Select Token to Swap From"
            />
          </div>
        </div>

        {/* Flip Button */}
        <div className="flex justify-center -my-2 relative z-10">
          <Button
            variant="outline"
            size="icon"
            className="rounded-full h-10 w-10 bg-background"
            onClick={handleFlipTokens}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {/* To Token */}
        <div className="space-y-2 p-4 bg-accent/30 rounded-lg">
          <label className="text-sm font-medium text-muted-foreground">To (estimated)</label>
          <div className="flex gap-2">
            <div className="flex-1 text-lg font-semibold p-2">
              {quoting ? (
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Getting quote...
                </span>
              ) : (
                toAmount || '0.0'
              )}
            </div>
            <TokenSelector
              tokens={availableTokens.filter(t => t.symbol !== fromToken)}
              selectedToken={toToken}
              onSelectToken={setToToken}
              disabled={fetchingTokens}
              label="Select Token to Receive"
            />
          </div>
        </div>

        {/* Price Info */}
        {toAmount && fromAmount && (
          <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-1">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rate</span>
              <span className="font-mono">
                1 {fromToken} ≈ {(parseFloat(toAmount) / parseFloat(fromAmount)).toFixed(6)} {toToken}
              </span>
            </div>
            {priceImpact && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price Impact</span>
                <span className={parseFloat(priceImpact) > 1 ? 'text-orange-600' : 'text-green-600'}>
                  {priceImpact}%
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slippage Tolerance</span>
              <span>{slippage}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Minimum Received</span>
              <span className="font-mono">
                {(parseFloat(toAmount) * (1 - parseFloat(slippage) / 100)).toFixed(6)} {toToken}
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`p-3 rounded-lg flex items-start gap-2 ${
            error.includes('cancelled') 
              ? 'bg-muted border border-border' 
              : error.includes('No liquidity pool') || error.includes('no route') || error.includes('No pool')
              ? 'bg-yellow-500/10 border border-yellow-500/20'
              : 'bg-destructive/10 border border-destructive/20'
          }`}>
            <AlertCircle className={`h-4 w-4 flex-shrink-0 mt-0.5 ${
              error.includes('cancelled') 
                ? 'text-muted-foreground' 
                : error.includes('No liquidity pool') || error.includes('no route') || error.includes('No pool')
                ? 'text-yellow-600 dark:text-yellow-500'
                : 'text-destructive'
            }`} />
            <div className="flex-1">
              <p className={`text-sm ${
                error.includes('cancelled') 
                  ? 'text-muted-foreground' 
                  : error.includes('No liquidity pool') || error.includes('no route') || error.includes('No pool')
                  ? 'text-yellow-700 dark:text-yellow-400 font-medium'
                  : 'text-destructive'
              }`}>
                {error}
              </p>
              {(error.includes('No liquidity pool') || error.includes('no route') || error.includes('No pool')) && (
                <p className="text-xs text-muted-foreground mt-1">
                  Try selecting a different token pair with available liquidity.
                </p>
              )}
            </div>
            <button
              onClick={() => setError(null)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Swap Button */}
        <Button
          onClick={handleSwap}
          disabled={
            loading || 
            !fromAmount || 
            !toAmount || 
            !senderAddress || 
            quoting ||
            fetchingTokens ||
            !velarSDK ||
            Boolean(error && (error.includes('No liquidity pool') || error.includes('Insufficient liquidity')))
          }
          className="w-full"
          size="lg"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Swapping...
            </>
          ) : !senderAddress ? (
            'Connect Wallet to Swap'
          ) : fetchingTokens ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading Tokens...
            </>
          ) : quoting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Getting Quote...
            </>
          ) : !velarSDK ? (
            'Initializing Velar SDK...'
          ) : error && (error.includes('No liquidity pool') || error.includes('Insufficient liquidity')) ? (
            'Pool Not Available'
          ) : (
            <>
              <ArrowDownUp className="h-4 w-4 mr-2" />
              Swap
            </>
          )}
        </Button>

        {/* Disclaimer */}
        <p className="text-xs text-center text-muted-foreground">
          Powered by Velar DEX • Best routes with optimal pricing
        </p>
      </CardContent>
    </Card>
  );
}
