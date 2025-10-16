'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, ExternalLink, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { request, isConnected, getLocalStorage } from '@stacks/connect';
import { Cl } from '@stacks/transactions';
import * as bitcoin from 'bitcoinjs-lib';

interface BridgeTokenProps {
  direction: 'deposit' | 'withdraw';
  amount?: string;
  recipient?: string;
  maxFee?: string;
}

// sBTC Deposit Address (from signers)
// This is the mainnet sBTC peg wallet address where users send BTC
const SBTC_DEPOSIT_ADDRESS = 'bc1q3f0vu0uzsmxvzdkcf7x6hfw7g5wc2r3ma6t6zv';

export function BridgeToken({ 
  direction: initialDirection, 
  amount: initialAmount, 
  recipient: initialRecipient,
  maxFee: initialMaxFee 
}: BridgeTokenProps) {
  const [direction, setDirection] = useState<'deposit' | 'withdraw'>(initialDirection || 'deposit');
  const [amount, setAmount] = useState(initialAmount || '');
  const [recipient, setRecipient] = useState(initialRecipient || '');
  const [maxFee, setMaxFee] = useState(initialMaxFee || '5000'); // Default 5,000 sats (~$2-5)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [stacksAddress, setStacksAddress] = useState<string>('');

  useEffect(() => {
    setWalletConnected(isConnected());
    
    // Get user's addresses
    const userData = getLocalStorage();
    if (userData?.addresses) {
      // Check for Stacks address
      if (userData.addresses.stx?.[0]?.address) {
        setStacksAddress(userData.addresses.stx[0].address);
        // Pre-fill recipient if in deposit mode and not provided
        if (initialDirection === 'deposit' && !initialRecipient) {
          setRecipient(userData.addresses.stx[0].address);
        }
      }
    }
  }, [initialDirection, initialRecipient]);

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!recipient || !recipient.match(/^(SP|ST)[0-9A-Z]{38,40}$/)) {
      setError('Please enter a valid Stacks address to receive sBTC');
      return;
    }

    // Redirect to official bridge with pre-filled data
    // This ensures compatibility with all Bitcoin wallets
    setLoading(true);
    setError('Opening official sBTC bridge...');
    
    setTimeout(() => {
      window.open(`https://sbtc.stacks.co?stxAddress=${recipient}&amount=${amount}`, '_blank');
      setError(null);
      setLoading(false);
    }, 1000);
  };

  const parseBitcoinAddress = (address: string): { version: Buffer; hashbytes: Buffer } => {
    try {
      // Try base58 decoding first (legacy addresses: 1... and 3...)
      const decoded = bitcoin.address.fromBase58Check(address);
      
      // Don't pad! Return the actual hash (20 bytes for P2PKH/P2SH)
      return {
        version: Buffer.from([decoded.version]),
        hashbytes: decoded.hash, // Keep original 20-byte hash
      };
    } catch (base58Error) {
      // If base58 fails, try bech32 (SegWit and Taproot)
      try {
        const decoded = bitcoin.address.fromBech32(address);
        
        // Don't pad! Return actual witness program
        return {
          version: Buffer.from([decoded.version]),
          hashbytes: Buffer.from(decoded.data), // Keep original size (20 or 32 bytes)
        };
      } catch (bech32Error) {
        console.error('Bitcoin address parsing failed:', { 
          address,
          base58Error: base58Error instanceof Error ? base58Error.message : String(base58Error),
          bech32Error: bech32Error instanceof Error ? bech32Error.message : String(bech32Error)
        });
        throw new Error('Invalid Bitcoin address format. Please check your address and try again.');
      }
    }
  };

  const handleWithdraw = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    if (!recipient || !recipient.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
      setError('Please enter a valid Bitcoin address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountInMicroUnits = Math.floor(parseFloat(amount) * 1e8);
      const maxFeeInSats = parseInt(maxFee);

      // Validate: Bitcoin dust limit (minimum 10,000 sats)
      const DUST_LIMIT = 10000;
      if (amountInMicroUnits < DUST_LIMIT) {
        setError(`Withdrawal amount (${amountInMicroUnits} sats) is below Bitcoin dust limit. Minimum: ${DUST_LIMIT} sats (0.0001 BTC).`);
        setLoading(false);
        return;
      }

      // Validate: amount must be greater than fee
      if (amountInMicroUnits <= maxFeeInSats) {
        setError(`Withdrawal amount (${amountInMicroUnits} sats) must be greater than max fee (${maxFeeInSats} sats). Please increase amount or decrease fee.`);
        setLoading(false);
        return;
      }

      // Warn if fee is more than 50% of amount
      if (maxFeeInSats > amountInMicroUnits * 0.5) {
        console.warn('⚠️ Fee is more than 50% of withdrawal amount');
      }
      const { version, hashbytes } = parseBitcoinAddress(recipient);

      // Ensure we have proper hex strings (remove '0x' prefix if present)
      const versionHex = Buffer.isBuffer(version) 
        ? version.toString('hex') 
        : typeof version === 'string' 
          ? version.replace('0x', '') 
          : '';
      
      const hashbytesHex = Buffer.isBuffer(hashbytes) 
        ? hashbytes.toString('hex') 
        : typeof hashbytes === 'string' 
          ? hashbytes.replace('0x', '') 
          : '';

      console.log('Creating withdrawal request:', {
        amount: amountInMicroUnits,
        maxFee: maxFeeInSats,
        recipient,
        versionHex,
        hashbytesHex,
        versionLength: versionHex.length,
        hashbytesLength: hashbytesHex.length,
      });

      // Validate hex strings
      if (!versionHex || !hashbytesHex) {
        throw new Error('Failed to parse Bitcoin address');
      }

      console.log('💫 Initiating withdrawal request:', {
        amount: amountInMicroUnits,
        maxFee: maxFeeInSats,
        recipient: { hashbytes: hashbytesHex, version: versionHex },
      });

      // Call the sbtc-withdrawal contract (user-facing)
      // This contract will handle sender and height automatically
      const response = await request('stx_callContract', {
        contract: 'SM3VDXK3WZZSA84XXFKAFAF15NNZX32CTSG82JFQ4.sbtc-withdrawal',
        functionName: 'initiate-withdrawal-request',
        functionArgs: [
          Cl.uint(amountInMicroUnits),
          Cl.tuple({
            hashbytes: Cl.bufferFromHex(hashbytesHex),
            version: Cl.bufferFromHex(versionHex),
          }),
          Cl.uint(maxFeeInSats),
        ],
        postConditionMode: 'allow',
        network: 'mainnet',
      });

      setTxId(response.txid || null);
      console.log('✅ Withdrawal request created:', response.txid);
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Withdrawal request failed';
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user');
      } else if (errorMessage.includes('hexToBytes') || errorMessage.includes('parse') || errorMessage.includes('Invalid Bitcoin address')) {
        setError('Invalid Bitcoin address format. Please check your address and try again.');
      } else if (errorMessage.includes('Insufficient balance')) {
        setError('Insufficient sBTC balance to complete this withdrawal');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  if (txId) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>
              {direction === 'deposit' ? 'Deposit Transaction Sent' : 'Withdrawal Request Created'}
            </CardTitle>
          </div>
          <CardDescription>
            {direction === 'deposit' 
              ? 'Your Bitcoin deposit has been sent to the sBTC peg address' 
              : 'Your sBTC withdrawal request has been submitted'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Transaction ID:</strong>
            </p>
            <code className="text-xs break-all">{txId}</code>
          </div>

          {direction === 'deposit' ? (
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Bitcoin transaction broadcast to network</p>
              <p>⏳ Waiting for 3 Bitcoin confirmations (~30 min)</p>
              <p>🪙 sBTC will be minted to: <code className="text-xs">{recipient}</code></p>
              <p className="text-xs text-gray-500 mt-2">
                * Small consolidation fee (max 80,000 sats) will be deducted
              </p>
            </div>
          ) : (
            <div className="space-y-2 text-sm text-gray-600">
              <p>✅ Withdrawal request submitted to signers</p>
              <p>⏳ Bitcoin transaction will be broadcast after signer approval</p>
              <p>📦 Your BTC will arrive after 3 Bitcoin confirmations (~30 min)</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                const explorerUrl = direction === 'deposit'
                  ? `https://mempool.space/tx/${txId}`
                  : `https://explorer.stacks.co/txid/${txId}?chain=mainnet`;
                window.open(explorerUrl, '_blank');
              }}
              className="flex-1"
            >
              View on Explorer
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setTxId(null);
                setAmount('');
                if (direction === 'withdraw') {
                  setRecipient('');
                }
              }}
              className="flex-1"
            >
              New {direction === 'deposit' ? 'Deposit' : 'Withdrawal'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5" />
            <CardTitle>Bridge BTC ↔ sBTC</CardTitle>
          </div>
          <Badge variant={direction === 'deposit' ? 'default' : 'secondary'}>
            {direction === 'deposit' ? 'Deposit' : 'Withdraw'}
          </Badge>
        </div>
        <CardDescription>
          {direction === 'deposit' 
            ? 'Convert Bitcoin (BTC) to sBTC on Stacks' 
            : 'Convert sBTC back to Bitcoin (BTC)'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex gap-2">
          <Button
            variant={direction === 'deposit' ? 'default' : 'outline'}
            onClick={() => setDirection('deposit')}
            className="flex-1"
          >
            Deposit BTC → sBTC
          </Button>
          <Button
            variant={direction === 'withdraw' ? 'default' : 'outline'}
            onClick={() => setDirection('withdraw')}
            className="flex-1"
          >
            Withdraw sBTC → BTC
          </Button>
        </div>

        {direction === 'deposit' && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-700 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                <span>
                  You&apos;ll be redirected to the official sBTC bridge to complete your deposit with pre-filled information. The bridge supports all Bitcoin wallets (Leather, Xverse, Unisat, etc).
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (BTC)</label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Amount of Bitcoin to deposit and convert to sBTC
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Stacks Address (Recipient)</label>
              <Input
                type="text"
                placeholder={stacksAddress || 'SP...'}
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Stacks address that will receive the minted sBTC
              </p>
            </div>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-600 space-y-1">
              <p><strong>📍 Deposit Address:</strong></p>
              <code className="text-xs break-all">{SBTC_DEPOSIT_ADDRESS}</code>
              <p className="mt-2 text-xs text-gray-500">
                ⏱️ Timeline: ~30-60 minutes (3 Bitcoin confirmations + minting)
              </p>
              <p className="text-xs text-gray-500">
                💰 Fees: Bitcoin network fee + consolidation fee (max 80,000 sats)
              </p>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            <Button
              onClick={handleDeposit}
              disabled={loading}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Opening Bridge...
                </>
              ) : (
                <>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Continue on Official sBTC Bridge
                </>
              )}
            </Button>
            
            <p className="text-xs text-center text-gray-500">
              Pre-filled with your amount and Stacks address for convenience
            </p>
          </div>
        )}

        {direction === 'withdraw' && (
          <div className="space-y-4">
            {!walletConnected && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Please connect your Stacks wallet to create a withdrawal request
                </p>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount (sBTC)</label>
              <Input
                type="number"
                step="0.00000001"
                placeholder="0.1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Amount of sBTC you want to withdraw as BTC
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bitcoin Address</label>
              <Input
                type="text"
                placeholder="bc1q... or 1... or 3..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Bitcoin address to receive your BTC
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Max Fee (sats)</label>
              <Input
                type="number"
                placeholder="5000"
                value={maxFee}
                onChange={(e) => setMaxFee(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Maximum Bitcoin network fee (typical: 3,000-10,000 sats)
              </p>
              {amount && maxFee && parseFloat(amount) > 0 && parseInt(maxFee) > 0 && (
                <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                  <p>
                    <strong>You&apos;ll receive:</strong> ~
                    {(Math.floor(parseFloat(amount) * 1e8) - parseInt(maxFee)).toLocaleString()} sats
                    {' '}(
                    {((Math.floor(parseFloat(amount) * 1e8) - parseInt(maxFee)) / 1e8).toFixed(8)} BTC)
                  </p>
                  {parseInt(maxFee) >= Math.floor(parseFloat(amount) * 1e8) && (
                    <p className="text-red-600 mt-1">
                      ⚠️ Fee must be less than withdrawal amount!
                    </p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            <Button
              onClick={handleWithdraw}
              disabled={loading || !walletConnected}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Withdrawal...
                </>
              ) : (
                'Create Withdrawal Request'
              )}
            </Button>

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-700 space-y-1">
              <p><strong>💡 Withdrawal Tips:</strong></p>
              <p>• Minimum recommended: 0.0001 BTC (10,000 sats)</p>
              <p>• Typical fee: 3,000-10,000 sats (~$1-4)</p>
              <p>• Amount must be greater than the fee</p>
              <p>• Smaller withdrawals = higher fee percentage</p>
            </div>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600 space-y-1">
              <p><strong>What happens next:</strong></p>
              <p>1. Your sBTC will be locked in the contract</p>
              <p>2. Signers will review and approve the request</p>
              <p>3. Bitcoin transaction will be broadcast to the network</p>
              <p>4. You&apos;ll receive BTC after 3 confirmations (~30 min)</p>
            </div>
          </div>
        )}

        <div className="pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Powered by sBTC • Learn more at{' '}
            <a 
              href="https://docs.stacks.co/stacks-101/sbtc" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              docs.stacks.co
            </a>
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

