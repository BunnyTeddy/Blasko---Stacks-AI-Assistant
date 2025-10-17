'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Sparkles, Loader2 } from 'lucide-react';
import { request, isConnected } from '@stacks/connect';

interface RegisterBNSProps {
  name: string;
  namespace: string;
  fullName: string;
  available: boolean;
  registered: boolean;
  owner?: string;
  expiresAt?: number;
  renewalHeight?: number;
  status?: string;
  priceInfo?: {
    estimatedPriceMicroSTX: number;
    estimatedPriceSTX: number;
    note: string;
  };
  message: string;
}

export function RegisterBNS({
  name,
  namespace,
  fullName,
  available,
  registered,
  owner,
  expiresAt,
  renewalHeight,
  status,
  priceInfo,
  message,
}: RegisterBNSProps) {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);

  useEffect(() => {
    setWalletConnected(isConnected());
  }, []);

  const handleRegister = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Import BNS SDK function dynamically
      const { buildNameClaimFastTx } = await import('bns-v2-sdk');
      const { getLocalStorage } = await import('@stacks/connect');
      
      const userData = getLocalStorage();
      const senderAddress = userData?.addresses?.stx?.[0]?.address;

      if (!senderAddress) {
        throw new Error('Could not get wallet address');
      }

      const stxToBurn = BigInt(priceInfo?.estimatedPriceMicroSTX || 2560000000);

      console.log('Building registration transaction:', { fullName, stxToBurn, senderAddress });

      const payload = await buildNameClaimFastTx({
        fullyQualifiedName: fullName,
        stxToBurn,
        sendTo: senderAddress,
        senderAddress,
        network: 'mainnet',
      });

      console.log('Transaction payload:', payload);

      // Validate payload
      if (!payload.contractAddress || !payload.contractName || !payload.functionName) {
        throw new Error('Invalid transaction payload from BNS SDK');
      }

      if (!payload.functionArgs || payload.functionArgs.length === 0) {
        throw new Error('Missing function arguments');
      }

      const response = await request('stx_callContract', {
        contract: `${payload.contractAddress}.${payload.contractName}` as `${string}.${string}`,
        functionName: payload.functionName,
        functionArgs: payload.functionArgs,
        postConditions: payload.postConditions || [],
        network: 'mainnet',
      });

      setTxId(response.txid || null);
      console.log('✅ Registration submitted:', response.txid);
    } catch (err) {
      console.error('❌ Registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      
      // Better error handling
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user');
      } else if (errorMessage.includes('transaction rejected')) {
        setError('Transaction rejected by network. This might happen if: 1) The name is already taken, 2) Insufficient STX balance, or 3) Invalid transaction format. Please try again or contact support.');
      } else if (errorMessage.includes('broadcast')) {
        setError('Failed to broadcast transaction. Please check your wallet balance and network connection.');
      } else if (errorMessage.includes('nonce')) {
        setError('Transaction nonce error. Please try again in a few seconds.');
      } else {
        setError(`Registration failed: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Success state
  if (txId) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>Registration Submitted!</CardTitle>
          </div>
          <CardDescription>
            Your BNS name registration has been submitted to the blockchain
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-bold text-green-700 mb-2">{fullName}</p>
            <p className="text-xs text-gray-600">Transaction ID:</p>
            <code className="text-xs break-all">{txId}</code>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            <p>✅ Transaction broadcast to network</p>
            <p>⏳ Waiting for confirmation (~10 minutes)</p>
            <p>🎉 Your name will be active after confirmation</p>
          </div>

          <Button
            variant="outline"
            onClick={() => window.open(`https://explorer.stacks.co/txid/${txId}?chain=mainnet`, '_blank')}
            className="w-full"
          >
            View on Explorer
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            <CardTitle>BNS Name Registration</CardTitle>
          </div>
          <Badge variant={available ? 'default' : 'secondary'}>
            {available ? 'Available' : 'Registered'}
          </Badge>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Name Display */}
        <div className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-2">BNS Name</p>
          <p className="text-3xl font-bold text-purple-700">{fullName}</p>
          <div className="flex items-center justify-center gap-4 mt-3">
            <div className="text-center">
              <p className="text-xs text-gray-500">Name</p>
              <p className="font-medium text-sm">{name}</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500">Namespace</p>
              <p className="font-medium text-sm">.{namespace}</p>
            </div>
          </div>
        </div>

        {/* Available - Registration */}
        {available && (
          <div className="space-y-4">
            {!walletConnected && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-gray-700 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Please connect your Stacks wallet to register this name
                </p>
              </div>
            )}

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  {error}
                </p>
              </div>
            )}

            {/* Registration Button */}
            <Button
              onClick={handleRegister}
              disabled={loading || !walletConnected}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Register {fullName}
                </>
              )}
            </Button>

            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
              <p className="font-medium mb-1">About BNS Registration</p>
              <p>
                Registration is instant and your name will be active after the transaction confirms
                (~10 minutes). The name will be permanently linked to your wallet address.
              </p>
            </div>

            <p className="text-xs text-center text-gray-500">
              Powered by BNSv2 • <a href="https://www.bnsv2.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Learn more</a>
            </p>
          </div>
        )}

        {/* Already Registered */}
        {registered && owner && (
          <div className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm font-medium text-gray-800">This name is already registered</p>
              </div>
              <p className="text-xs text-gray-600">
                Someone else owns this BNS name. Try searching for a different one!
              </p>
            </div>

            <div className="p-4 bg-white border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-600 font-medium mb-2">Current Owner</p>
              <p className="font-mono text-xs break-all bg-gray-50 p-2 rounded">{owner}</p>
            </div>

            {expiresAt && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <p className="text-xs text-gray-700">
                    <strong>Expires at block:</strong> {expiresAt.toLocaleString()}
                  </p>
                </div>
              </div>
            )}

            {status && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-gray-600">
                  <strong>Status:</strong> <Badge variant="outline" className="ml-1">{status}</Badge>
                </p>
              </div>
            )}

            <Button
              variant="outline"
              onClick={() =>
                window.open(`https://explorer.stacks.co/address/${owner}?chain=mainnet`, '_blank')
              }
              className="w-full"
            >
              View Owner on Explorer
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
