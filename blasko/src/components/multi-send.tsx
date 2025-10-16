'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Users, Upload, Plus, Trash2, Send, AlertCircle, CheckCircle2 } from 'lucide-react';
import { request, getLocalStorage } from '@stacks/connect';
import { Cl, Pc } from '@stacks/transactions';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';

type Recipient = {
  address: string;
  amount: string;
  amountMicroSTX: string;
  memo: string;
};

type MultiSendProps = {
  recipients: Recipient[];
  totalAmount: string;
  totalAmountMicroSTX: string;
  recipientCount: number;
  contractAddress: string;
  contractName: string;
  functionName: string;
};

export function MultiSend(props: MultiSendProps) {
  const [recipients, setRecipients] = useState<Recipient[]>(props.recipients);
  const [newAddress, setNewAddress] = useState('');
  const [newAmount, setNewAmount] = useState('');
  const [newMemo, setNewMemo] = useState('');
  const [csvText, setCsvText] = useState('');
  const [showCsvInput, setShowCsvInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const calculateTotal = () => {
    return recipients.reduce((sum, r) => sum + parseFloat(r.amount), 0);
  };

  const handleAddRecipient = () => {
    if (!newAddress || !newAmount) {
      setError('Address and amount are required');
      return;
    }

    const amount = parseFloat(newAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Invalid amount');
      return;
    }

    if (recipients.length >= 200) {
      setError('Maximum 200 recipients allowed');
      return;
    }

    setRecipients([
      ...recipients,
      {
        address: newAddress,
        amount: newAmount,
        amountMicroSTX: (amount * 1_000_000).toString(),
        memo: newMemo,
      },
    ]);

    setNewAddress('');
    setNewAmount('');
    setNewMemo('');
    setError(null);
  };

  const handleRemoveRecipient = (index: number) => {
    setRecipients(recipients.filter((_, i) => i !== index));
  };

  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvText(text);
    };
    reader.readAsText(file);
  };

  const handleParseCsv = () => {
    try {
      const lines = csvText.split('\n').filter(line => line.trim());
      const newRecipients: Recipient[] = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line || line.startsWith('#')) continue; // Skip empty lines and comments

        // Support both comma and tab-separated
        const parts = line.includes('\t') ? line.split('\t') : line.split(',');
        
        if (parts.length < 2) {
          throw new Error(`Invalid format on line ${i + 1}. Expected: address,amount or address,amount,memo`);
        }

        const address = parts[0].trim();
        const amount = parts[1].trim();
        const memo = parts[2]?.trim() || '';

        const amountNum = parseFloat(amount);
        if (isNaN(amountNum) || amountNum <= 0) {
          throw new Error(`Invalid amount on line ${i + 1}: ${amount}`);
        }

        if (!address.startsWith('SP') && !address.startsWith('ST')) {
          throw new Error(`Invalid Stacks address on line ${i + 1}: ${address}`);
        }

        newRecipients.push({
          address,
          amount,
          amountMicroSTX: (amountNum * 1_000_000).toString(),
          memo,
        });
      }

      if (recipients.length + newRecipients.length > 200) {
        throw new Error(`Total recipients would exceed 200 (current: ${recipients.length}, adding: ${newRecipients.length})`);
      }

      setRecipients([...recipients, ...newRecipients]);
      setCsvText('');
      setShowCsvInput(false);
      setError(null);
    } catch (err: Record<string, unknown>) {
      setError(err.message);
    }
  };

  const handleSendAll = async () => {
    if (recipients.length === 0) {
      setError('No recipients to send to');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setTxId(null);

    try {
      // Get sender address for post-conditions
      const userData = getLocalStorage();
      const senderAddress = userData?.addresses?.stx?.[0]?.address;

      if (!senderAddress) {
        throw new Error('Wallet not connected');
      }

      // Build the recipients list in Clarity format
      // Each recipient is a tuple: { to: principal, ustx: uint }
      const clarityRecipients = recipients.map(r => 
        Cl.tuple({
          to: Cl.principal(r.address),
          ustx: Cl.uint(BigInt(r.amountMicroSTX)),
        })
      );

      // Calculate total amount to send (in microSTX)
      const totalMicroSTX = recipients.reduce(
        (sum, r) => sum + BigInt(r.amountMicroSTX),
        0n
      );

      // Add post-condition: sender will send at most the total amount
      const postConditions = [
        Pc.principal(senderAddress).willSendLte(totalMicroSTX).ustx(),
      ];

      const response = await request('stx_callContract', {
        contract: `${props.contractAddress}.${props.contractName}`,
        functionName: props.functionName,
        functionArgs: [Cl.list(clarityRecipients)],
        postConditions,
        network: 'mainnet',
      });

      setTxId(response.txid);
    } catch (err: Record<string, unknown>) {
      console.error('Multi-send error:', err);
      if (err.message?.includes('User rejected')) {
        setError('Transaction cancelled by user');
      } else {
        setError(err.message || 'Failed to send transaction');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalAmount = calculateTotal();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            Multi Send STX
          </div>
          <Badge variant="secondary" className="text-sm">
            {recipients.length} {recipients.length === 1 ? 'Recipient' : 'Recipients'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total Amount Display */}
        <div className="p-4 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Amount to Send</p>
              <p className="text-3xl font-bold">{totalAmount.toFixed(6)} STX</p>
            </div>
            <Send className="h-8 w-8 text-blue-500 opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Plus network fees (~0.001 STX)
          </p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {txId && (
          <Alert className="bg-green-500/10 border-green-500/50">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700 dark:text-green-400">
              Multi-send transaction submitted!{' '}
              <a
                href={`https://explorer.hiro.so/txid/${txId}?chain=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-semibold"
              >
                View transaction
              </a>
            </AlertDescription>
          </Alert>
        )}

        {/* Recipients Table */}
        <div className="border rounded-lg">
          <div className="max-h-[300px] overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead className="w-[120px]">Amount (STX)</TableHead>
                  <TableHead className="w-[150px]">Memo</TableHead>
                  <TableHead className="w-[60px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recipients.map((recipient, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {recipient.address.slice(0, 10)}...{recipient.address.slice(-6)}
                    </TableCell>
                    <TableCell className="font-semibold">
                      {recipient.amount}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground truncate">
                      {recipient.memo || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveRecipient(index)}
                        className="h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Add Recipient Form */}
        <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add More Recipients
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-1">
              <Label htmlFor="address" className="text-xs">Address</Label>
              <Input
                id="address"
                placeholder="SP2MF04VA..."
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
                className="font-mono text-xs"
              />
            </div>
            <div>
              <Label htmlFor="amount" className="text-xs">Amount (STX)</Label>
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="1.5"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="memo" className="text-xs">Memo (optional)</Label>
              <Input
                id="memo"
                placeholder="Payment for..."
                value={newMemo}
                onChange={(e) => setNewMemo(e.target.value)}
                maxLength={34}
              />
            </div>
          </div>
          <Button onClick={handleAddRecipient} variant="outline" size="sm" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add Recipient
          </Button>
        </div>

        {/* CSV Upload */}
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => setShowCsvInput(!showCsvInput)}
            className="w-full"
          >
            <Upload className="h-4 w-4 mr-2" />
            {showCsvInput ? 'Hide' : 'Upload'} CSV File
          </Button>

          {showCsvInput && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
              <div className="space-y-2">
                <Label htmlFor="csv-file" className="text-xs">
                  Upload CSV file or paste data below
                </Label>
                <Input
                  id="csv-file"
                  type="file"
                  accept=".csv,.txt"
                  onChange={handleCsvUpload}
                  className="text-xs"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="csv-text" className="text-xs">
                  Or paste CSV data (format: address,amount,memo)
                </Label>
                <Textarea
                  id="csv-text"
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  placeholder="SP2MF04VAGYHGAZWGTEDW5VYCPDWWSY08Z1QFNDSN,1.5,Payment
ST2EB9WEQNR9P0K28D2DC352TM75YG3K0GT7V13CV,2.0,Airdrop"
                  className="font-mono text-xs"
                  rows={5}
                />
              </div>
              <Button onClick={handleParseCsv} variant="secondary" size="sm" className="w-full">
                Parse & Add Recipients
              </Button>
              <p className="text-xs text-muted-foreground">
                Format: Each line should be: <code className="bg-muted px-1 rounded">address,amount,memo</code>
                <br />
                Memo is optional. Lines starting with # are ignored.
              </p>
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          onClick={handleSendAll}
          disabled={isSubmitting || recipients.length === 0}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2" />
              Sending to {recipients.length} recipients...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Send {totalAmount.toFixed(6)} STX to {recipients.length} Recipients
            </>
          )}
        </Button>

        {/* Info */}
        <div className="text-xs text-muted-foreground space-y-1 p-3 bg-muted/20 rounded">
          <p>• Multi-send uses a single transaction to send STX to up to 200 recipients</p>
          <p>• More efficient and cheaper than individual transactions</p>
          <p>• Contract: {props.contractAddress}.{props.contractName}</p>
        </div>
      </CardContent>
    </Card>
  );
}

