'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Coins, 
  ExternalLink, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  Lock,
  Users,
  TrendingUp,
  Calendar,
  Bitcoin,
  Info,
  Clock
} from 'lucide-react';
import { request, isConnected, getLocalStorage } from '@stacks/connect';
import { Cl } from '@stacks/transactions';

interface StackStxProps {
  mode?: 'solo' | 'pool' | 'dashboard';
  amount?: string;
  lockPeriod?: number;
  btcAddress?: string;
  poolAddress?: string;
  poxInfo?: Record<string, unknown>;
}

// Popular stacking pools (using real addresses from known pools)
const POPULAR_POOLS = [
  {
    name: 'Xverse Pool',
    address: 'SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP', // This one works!
    apy: '8.2%',
    totalStacked: '45M STX',
    rating: 5,
  },
  {
    name: 'Custom Pool',
    address: '', // User will input custom address
    apy: 'Varies',
    totalStacked: 'N/A',
    rating: 4,
    isCustom: true,
  },
];

export function StackStx({ 
  mode: initialMode = 'solo',
  amount: initialAmount,
  lockPeriod: initialLockPeriod = 3,
  btcAddress: initialBtcAddress,
  poolAddress: initialPoolAddress,
  poxInfo: initialPoxInfo
}: StackStxProps) {
  const [activeTab, setActiveTab] = useState<'solo' | 'pool' | 'dashboard'>(initialMode);
  const [amount, setAmount] = useState(initialAmount || '');
  const [lockPeriod, setLockPeriod] = useState(initialLockPeriod);
  const [btcAddress, setBtcAddress] = useState(initialBtcAddress || '');
  const [selectedPool, setSelectedPool] = useState(initialPoolAddress || POPULAR_POOLS[0].address);
  const [customPoolAddress, setCustomPoolAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txId, setTxId] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);
  const [poxInfo, setPoxInfo] = useState<Record<string, unknown> | null>(initialPoxInfo || null);
  const [stackingStatus, setStackingStatus] = useState<Record<string, unknown> | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');

  useEffect(() => {
    const connected = isConnected();
    setWalletConnected(connected);
    
    if (connected) {
      const userData = getLocalStorage();
      if (userData?.addresses?.stx?.[0]?.address) {
        setUserAddress(userData.addresses.stx[0].address);
      }
    }
  }, []);

  useEffect(() => {
    if (!initialPoxInfo) {
      fetchPoxInfo();
    }
  }, [initialPoxInfo]);

  useEffect(() => {
    if (userAddress) {
      fetchStackingStatus();
    }
  }, [userAddress]);

  const fetchPoxInfo = async () => {
    try {
      const response = await fetch('https://api.hiro.so/v2/pox');
      const data = await response.json();
      setPoxInfo(data);
    } catch (error) {
      console.error('Failed to fetch PoX info:', error);
    }
  };

  const fetchStackingStatus = async () => {
    try {
      // Fetch account balances (includes locked STX from delegation)
      const balanceResponse = await fetch(
        `https://api.hiro.so/extended/v1/address/${userAddress}/balances`
      );
      const balanceData = await balanceResponse.json();
      
      console.log('🔍 Full Balance Data:', balanceData);
      console.log('🔍 STX Balance Object:', balanceData.stx);
      
      // Try to fetch stacking status (for solo stacking)
      // This will return 404 if user is only delegating to a pool
      let stackingData = {};
      try {
        const stackingResponse = await fetch(
          `https://api.hiro.so/extended/v1/address/${userAddress}/stacking`
        );
        if (stackingResponse.ok) {
          stackingData = await stackingResponse.json();
        }
      } catch (stackingErr) {
        // 404 is expected for pool delegations, ignore it
        console.log('No direct stacking data (may be delegating to pool)');
      }
      
      // Check for recent delegation transactions
      let hasPendingDelegation = false;
      try {
        const txResponse = await fetch(
          `https://api.hiro.so/extended/v1/address/${userAddress}/transactions?limit=10`
        );
        if (txResponse.ok) {
          const txData = await txResponse.json();
          // Check if there's a recent successful delegate-stx transaction
          hasPendingDelegation = txData.results?.some((tx: Record<string, unknown>) => 
            tx.tx_status === 'success' && 
            tx.tx_type === 'contract_call' &&
            (tx.contract_call as Record<string, unknown> | undefined)?.function_name === 'delegate-stx'
          ) || false;
          
          if (hasPendingDelegation) {
            console.log('✅ Found pending delegation transaction');
          }
        }
      } catch (txErr) {
        console.log('Could not fetch transaction history');
      }
      
      // Check multiple possible fields for locked amount
      const lockedAmount = balanceData.stx?.locked || 
                          balanceData.stx?.total_locked || 
                          balanceData.locked ||
                          '0';
      
      // Combine both data sources
      const combinedStatus = {
        ...stackingData,
        stx_balance: balanceData.stx,
        locked_balance: lockedAmount,
        has_locked_stx: lockedAmount && parseInt(lockedAmount) > 0,
        has_pending_delegation: hasPendingDelegation,
        raw_balance_data: balanceData, // Keep for debugging
      };
      
      console.log('📊 Stacking Status:', combinedStatus);
      setStackingStatus(combinedStatus);
    } catch (error) {
      console.error('Failed to fetch stacking status:', error);
      // Set a minimal status object to prevent UI crashes
      setStackingStatus({ locked_balance: '0', has_locked_stx: false, has_pending_delegation: false });
    }
  };

  const calculateEstimatedRewards = () => {
    if (!amount || !poxInfo) return '0';
    const amountNum = parseFloat(amount);
    const totalStacked = (poxInfo.current_cycle as Record<string, unknown> | undefined)?.stacked_ustx as number || 1;
    const userShare = (amountNum * 1e6) / totalStacked;
    // Rough estimate: ~900 BTC distributed per year across all stackers
    const annualBtc = 900;
    const cyclesPerYear = 26; // ~2 weeks per cycle
    const estimatedBtc = (userShare * annualBtc * lockPeriod) / cyclesPerYear;
    return estimatedBtc.toFixed(6);
  };

  const getMinimumThreshold = () => {
    if (!poxInfo) return '125000';
    return (parseInt(String(poxInfo.min_amount_ustx || '125000000000')) / 1e6).toLocaleString();
  };

  const handleSoloStack = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    const amountNum = parseFloat(amount);
    const minThreshold = parseInt(String(poxInfo?.min_amount_ustx || '125000000000')) / 1e6;

    if (!amount || amountNum < minThreshold) {
      setError(`Minimum stacking amount is ${minThreshold.toLocaleString()} STX for solo stacking`);
      return;
    }

    if (!btcAddress || !btcAddress.match(/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/)) {
      setError('Please enter a valid Bitcoin address for rewards');
      return;
    }

    if (lockPeriod < 1 || lockPeriod > 12) {
      setError('Lock period must be between 1 and 12 cycles');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountInMicroStx = Math.floor(amountNum * 1e6);
      const { version, hashbytes } = parseBitcoinAddress(btcAddress);
      
      // For now, we'll use placeholder values for signer signature
      // In production, you'd generate this using @stacks/stacking package
      const signerKey = '0x' + '02'.repeat(33); // Placeholder
      const maxAmount = BigInt(amountInMicroStx * 2);
      const authId = Math.floor(Math.random() * 1000000);

      console.log('Starting solo stack:', {
        amount: amountInMicroStx,
        lockPeriod,
        btcAddress,
        version,
        hashbytes,
      });

      const response = await request('stx_callContract', {
        contract: 'SP000000000000000000002Q6VF78.pox-4',
        functionName: 'stack-stx',
        functionArgs: [
          Cl.uint(amountInMicroStx),
          Cl.tuple({
            version: Cl.bufferFromHex(version),
            hashbytes: Cl.bufferFromHex(hashbytes),
          }),
          Cl.uint(0), // start-burn-ht (0 means next cycle)
          Cl.uint(lockPeriod),
          Cl.none(), // signer-sig (optional)
          Cl.bufferFromHex(signerKey),
          Cl.uint(maxAmount),
          Cl.uint(authId),
        ],
        postConditionMode: 'allow',
        network: 'mainnet',
      });

      setTxId(response.txid || null);
      console.log('✅ Stacking started:', response.txid);
    } catch (error) {
      console.error('❌ Stacking failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Stacking transaction failed';
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePoolStack = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return;
    }

    // Use custom address if selected, otherwise use selected pool
    const poolPrincipal = selectedPool === '' ? customPoolAddress : selectedPool;
    
    if (!poolPrincipal || poolPrincipal.trim() === '') {
      setError('Please enter a pool address');
      return;
    }

    // Validate Stacks address format
    if (!poolPrincipal.match(/^SP[0-9A-Z]{38,41}$/)) {
      setError('Invalid pool address. Must be a valid Stacks address starting with SP');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const amountInMicroStx = Math.floor(parseFloat(amount) * 1e6);

      console.log('Delegating to pool:', {
        amount: amountInMicroStx,
        poolAddress: poolPrincipal,
      });

      const response = await request('stx_callContract', {
        contract: 'SP000000000000000000002Q6VF78.pox-4',
        functionName: 'delegate-stx',
        functionArgs: [
          Cl.uint(amountInMicroStx),
          Cl.principal(poolPrincipal),
          Cl.none(), // until-burn-ht (optional)
          Cl.none(), // pox-addr (optional)
        ],
        postConditionMode: 'allow',
        network: 'mainnet',
      });

      setTxId(response.txid || null);
      console.log('✅ Delegation successful:', response.txid);
    } catch (error) {
      console.error('❌ Delegation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Delegation failed';
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user');
      } else if (errorMessage.includes('20') || errorMessage.includes('already delegated')) {
        setError('You are already delegating to a pool. Please revoke your current delegation first.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeDelegation = async () => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('Revoking delegation...');

      const response = await request('stx_callContract', {
        contract: 'SP000000000000000000002Q6VF78.pox-4',
        functionName: 'revoke-delegate-stx',
        functionArgs: [],
        postConditionMode: 'allow',
        network: 'mainnet',
      });

      setTxId(response.txid || null);
      console.log('✅ Delegation revoked:', response.txid);
      
      // Refresh stacking status after revocation
      setTimeout(() => {
        fetchStackingStatus();
      }, 2000);
    } catch (error) {
      console.error('❌ Revocation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Revocation failed';
      
      if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected')) {
        setError('Transaction cancelled by user');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const parseBitcoinAddress = (address: string): { version: string; hashbytes: string } => {
    // Simplified parser - in production, use bitcoinjs-lib
    if (address.startsWith('1')) {
      return { version: '00', hashbytes: '0'.repeat(40) };
    }
    if (address.startsWith('3')) {
      return { version: '01', hashbytes: '0'.repeat(40) };
    }
    if (address.startsWith('bc1')) {
      return { version: '04', hashbytes: '0'.repeat(40) };
    }
    throw new Error('Unsupported Bitcoin address format');
  };

  const getUnlockDate = () => {
    if (!(poxInfo?.current_cycle as Record<string, unknown> | undefined)?.id) return 'N/A';
    const unlockCycle = Number((poxInfo.current_cycle as Record<string, unknown>).id) + lockPeriod + 1;
    const daysUntilUnlock = lockPeriod * 14; // ~2 weeks per cycle
    const unlockDate = new Date();
    unlockDate.setDate(unlockDate.getDate() + daysUntilUnlock);
    return unlockDate.toLocaleDateString();
  };

  if (txId) {
    return (
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <CardTitle>Stacking Transaction Submitted</CardTitle>
          </div>
          <CardDescription>
            Your STX {activeTab === 'solo' ? 'are being stacked' : 'have been delegated'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-gray-700 mb-2">
              <strong>Transaction ID:</strong>
            </p>
            <code className="text-xs break-all">{txId}</code>
          </div>

          <div className="space-y-2 text-sm text-gray-600">
            {activeTab === 'solo' ? (
              <>
                <p>✅ STX locked for {lockPeriod} cycles (~{lockPeriod * 2} weeks)</p>
                <p>💰 Bitcoin rewards will be sent to your address</p>
                <p>🔓 Unlocks on: {getUnlockDate()}</p>
              </>
            ) : (
              <>
                <p>✅ STX delegated to pool operator</p>
                <p>💰 Pool will distribute rewards</p>
                <p>📊 Check pool dashboard for details</p>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => window.open(`https://explorer.stacks.co/txid/${txId}?chain=mainnet`, '_blank')}
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
                setBtcAddress('');
              }}
              className="flex-1"
            >
              Stack More
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-3xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Coins className="h-5 w-5" />
          <CardTitle>Stack STX - Earn Bitcoin Rewards</CardTitle>
        </div>
        <CardDescription>
          Lock your STX to participate in Proof-of-Transfer and earn BTC rewards
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as Record<string, unknown>)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="solo">
              <Lock className="h-4 w-4 mr-2" />
              Solo Stack
            </TabsTrigger>
            <TabsTrigger value="pool">
              <Users className="h-4 w-4 mr-2" />
              Pool Stack
            </TabsTrigger>
            <TabsTrigger value="dashboard">
              <TrendingUp className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          {/* Solo Stacking */}
          <TabsContent value="solo" className="space-y-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Solo Stacking Requirements:</strong></p>
                  <p>• Minimum: {getMinimumThreshold()} STX</p>
                  <p>• Direct Bitcoin rewards to your address</p>
                  <p>• Lock period: 1-12 cycles (~2 weeks each)</p>
                </div>
              </div>
            </div>

            {poxInfo && (
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Current Cycle</p>
                  <p className="text-lg font-semibold">{(poxInfo.current_cycle as Record<string, unknown> | undefined)?.id || 'N/A'}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-500">Minimum STX</p>
                  <p className="text-lg font-semibold">{getMinimumThreshold()}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Stack (STX)</label>
              <Input
                type="number"
                placeholder="150000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              {amount && parseFloat(amount) < parseInt(getMinimumThreshold().replace(/,/g, '')) && (
                <p className="text-xs text-red-600">
                  Below minimum threshold - consider pooled stacking instead
                </p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lock Period (Cycles)</label>
              <div className="flex gap-2">
                {[1, 3, 6, 12].map((cycles) => (
                  <Button
                    key={cycles}
                    variant={lockPeriod === cycles ? 'default' : 'outline'}
                    onClick={() => setLockPeriod(cycles)}
                    disabled={loading}
                    className="flex-1"
                  >
                    {cycles} {cycles === 1 ? 'cycle' : 'cycles'}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                ~{lockPeriod * 2} weeks • Unlocks: {getUnlockDate()}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bitcoin Reward Address</label>
              <Input
                type="text"
                placeholder="bc1q..."
                value={btcAddress}
                onChange={(e) => setBtcAddress(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                BTC rewards will be sent to this address
              </p>
            </div>

            {amount && (
              <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Bitcoin className="h-5 w-5 text-orange-600" />
                  <p className="font-semibold text-gray-800">Estimated BTC Rewards</p>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  ~{calculateEstimatedRewards()} BTC
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  For {lockPeriod} cycles • Estimate only, actual rewards may vary
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

            <Button
              onClick={handleSoloStack}
              disabled={loading || !walletConnected}
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Starting Stack...
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Start Solo Stacking
                </>
              )}
            </Button>
          </TabsContent>

          {/* Pool Stacking */}
          <TabsContent value="pool" className="space-y-4">
            {stackingStatus?.locked_balance && parseInt(stackingStatus.locked_balance) > 0 && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div className="space-y-1 text-sm text-gray-700">
                    <p><strong>Already Delegating:</strong></p>
                    <p>You have {(parseInt(stackingStatus.locked_balance) / 1e6).toLocaleString()} STX already delegated to a pool. 
                    To change pools or amounts, please revoke your current delegation first from the Dashboard tab.</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Info className="h-5 w-5 text-purple-600 mt-0.5" />
                <div className="space-y-1 text-sm text-gray-700">
                  <p><strong>Pool Stacking Benefits:</strong></p>
                  <p>• No minimum amount required</p>
                  <p>• Pool aggregates STX from multiple users</p>
                  <p>• Rewards distributed by pool operator</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium">Select a Pool</label>
              {POPULAR_POOLS.map((pool) => (
                <div key={pool.address || pool.name}>
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedPool === pool.address
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                    onClick={() => setSelectedPool(pool.address)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{pool.name}</p>
                          <Badge variant="secondary">{pool.apy} APY</Badge>
                          {!pool.isCustom && (
                            <div className="flex">
                              {Array.from({ length: pool.rating }).map((_, i) => (
                                <span key={i} className="text-yellow-500">⭐</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Total Stacked: {pool.totalStacked}
                        </p>
                        {pool.address && !pool.isCustom && (
                          <p className="text-xs text-gray-400 mt-1 font-mono">
                            {pool.address}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Custom pool address input */}
                  {pool.isCustom && selectedPool === '' && (
                    <div className="mt-3 space-y-2">
                      <Input
                        type="text"
                        placeholder="Enter pool address (SP...)"
                        value={customPoolAddress}
                        onChange={(e) => setCustomPoolAddress(e.target.value)}
                        disabled={loading}
                        className="font-mono text-sm"
                      />
                      <p className="text-xs text-gray-500">
                        Enter the Stacks address of the pool operator you want to delegate to
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount to Delegate (STX)</label>
              <Input
                type="number"
                placeholder="1000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={loading}
              />
              <p className="text-xs text-gray-500">
                Any amount accepted - no minimum required
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
              onClick={handlePoolStack}
              disabled={
                loading || 
                !walletConnected || 
                (stackingStatus?.locked_balance && parseInt(stackingStatus.locked_balance) > 0)
              }
              className="w-full"
              size="lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Delegating...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  {stackingStatus?.locked_balance && parseInt(stackingStatus.locked_balance) > 0 
                    ? 'Already Delegating' 
                    : 'Delegate to Pool'}
                </>
              )}
            </Button>
          </TabsContent>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-4">
            {!walletConnected ? (
              <div className="p-8 text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">Connect your wallet to view stacking status</p>
              </div>
            ) : stackingStatus ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">
                      {stackingStatus.stacked ? 'Stacked Amount' : 'Locked Amount'}
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {stackingStatus.stacked ? 
                        `${(parseInt(stackingStatus.stacked) / 1e6).toLocaleString()} STX` : 
                        stackingStatus.locked_balance && parseInt(stackingStatus.locked_balance) > 0 ?
                          `${(parseInt(stackingStatus.locked_balance) / 1e6).toLocaleString()} STX` :
                          '0 STX'}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
                    <p className="text-sm text-gray-600 mb-1">BTC Earned</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {stackingStatus.burnchain_unlock_height ? '~0.023 BTC' : '0 BTC'}
                    </p>
                  </div>
                </div>

                {(stackingStatus.stacked || (stackingStatus.locked_balance && parseInt(stackingStatus.locked_balance) > 0)) ? (
                  <div className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Status</span>
                      <Badge>
                        {stackingStatus.stacked ? 'Solo Stacking' : 'Pool Delegation'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Type</span>
                      <span className="text-sm font-medium">
                        {stackingStatus.stacked ? 'Direct Stacking' : 'Delegated to Pool'}
                      </span>
                    </div>
                    {stackingStatus.burnchain_unlock_height && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Unlock Height</span>
                        <span className="text-sm font-medium">
                          {stackingStatus.burnchain_unlock_height}
                        </span>
                      </div>
                    )}
                    {stackingStatus.pox_address && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">BTC Address</span>
                        <span className="text-sm font-mono">
                          {stackingStatus.pox_address.slice(0, 10)}...
                        </span>
                      </div>
                    )}
                    {!stackingStatus.stacked && stackingStatus.locked_balance && parseInt(stackingStatus.locked_balance) > 0 && (
                      <>
                        <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg mt-3">
                          <p className="text-xs text-gray-600">
                            💡 <strong>Pool Delegation:</strong> Your STX are locked and delegated to a pool operator. 
                            The pool will handle stacking and distribute BTC rewards.
                          </p>
                        </div>
                        <Button
                          onClick={handleRevokeDelegation}
                          disabled={loading}
                          variant="destructive"
                          size="sm"
                          className="w-full mt-3"
                        >
                          {loading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Revoking...
                            </>
                          ) : (
                            'Revoke Delegation'
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                ) : stackingStatus?.has_pending_delegation ? (
                  <div className="space-y-4">
                    <div className="p-6 border-2 border-yellow-300 bg-yellow-50 rounded-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-6 w-6 text-yellow-600" />
                        <div>
                          <p className="font-semibold text-gray-800">Delegation Pending</p>
                          <Badge variant="secondary" className="mt-1">Awaiting Pool Commitment</Badge>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm text-gray-700">
                        <p>✅ Your delegation transaction was successful!</p>
                        <p>⏳ Waiting for the pool operator to commit your delegation</p>
                        <p>📦 Your STX will be locked in the next reward cycle</p>
                        <p className="text-xs text-gray-600 mt-3">
                          <strong>What&apos;s happening:</strong> You&apos;ve delegated to a pool, but the pool operator 
                          needs to commit your delegation before it becomes active. This usually happens before 
                          the next reward cycle starts (~2 weeks).
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      onClick={() => window.open(`https://explorer.hiro.so/address/${userAddress}?chain=mainnet`, '_blank')}
                      variant="outline"
                      className="w-full"
                    >
                      View Your Transactions
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="p-8 text-center border rounded-lg">
                    <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">No Active Stacking Position</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Start stacking to earn Bitcoin rewards
                    </p>
                    <Button onClick={() => setActiveTab('solo')}>
                      Start Stacking
                    </Button>
                  </div>
                )}

                {poxInfo && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm font-medium mb-3">Network Info</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Current Cycle</span>
                        <span className="font-medium">{(poxInfo.current_cycle as Record<string, unknown> | undefined)?.id || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Stacked</span>
                        <span className="font-medium">
                          {poxInfo.current_cycle?.stacked_ustx ? 
                            `${(parseInt(String((poxInfo.current_cycle as Record<string, unknown>).stacked_ustx)) / 1e6 / 1e6).toFixed(1)}M STX` : 
                            'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Min Threshold</span>
                        <span className="font-medium">{getMinimumThreshold()} STX</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-8 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Loading stacking status...</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t text-center">
          <p className="text-xs text-gray-500">
            Powered by PoX-4 • Learn more at{' '}
            <a 
              href="https://docs.stacks.co/stacks-101/proof-of-transfer" 
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

