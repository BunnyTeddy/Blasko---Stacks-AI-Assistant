'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Receipt, ExternalLink, Clock, CheckCircle, XCircle, Loader2 } from 'lucide-react';

type TransactionDataProps = {
  tx_id: string;
  tx_status: string;
  tx_type: string;
  fee_rate: string;
  sender_address: string;
  block_height: number;
  burn_block_time_iso: string;
  tx_result?: {
    repr: string;
  };
  token_transfer?: Record<string, unknown>;
  contract_call?: Record<string, unknown>;
  smart_contract?: Record<string, unknown>;
};

export function TransactionData(props: TransactionDataProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-600"><CheckCircle className="h-3 w-3 mr-1" />Success</Badge>;
      case 'pending':
        return <Badge variant="secondary"><Loader2 className="h-3 w-3 mr-1 animate-spin" />Pending</Badge>;
      case 'failed':
      case 'abort_by_response':
      case 'abort_by_post_condition':
        return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatSTX = (microStx: string) => {
    return (parseInt(microStx) / 1_000_000).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="h-5 w-5 text-primary" />
          Transaction Details
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Transaction ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Transaction ID</label>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
              {props.tx_id}
            </code>
            <a
              href={`https://explorer.stacks.co/txid/${props.tx_id}?chain=mainnet`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700"
            >
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>

        {/* Status and Type */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <div>{getStatusBadge(props.tx_status)}</div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <Badge variant="outline">{props.tx_type.replace('_', ' ')}</Badge>
          </div>
        </div>

        {/* Sender */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Sender</label>
          <code className="text-xs bg-muted p-2 rounded block break-all">
            {props.sender_address}
          </code>
        </div>

        {/* Block and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Block Height</label>
            <p className="text-sm font-mono">#{props.block_height?.toLocaleString()}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              <Clock className="h-3 w-3 inline mr-1" />
              Time
            </label>
            <p className="text-sm">{formatDate(props.burn_block_time_iso)}</p>
          </div>
        </div>

        {/* Fee */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Network Fee</label>
          <p className="text-sm font-mono">{formatSTX(props.fee_rate)} STX</p>
        </div>

        {/* Result (if available) */}
        {props.tx_result && (
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Result</label>
            <ScrollArea className="h-20">
              <code className="text-xs bg-muted p-2 rounded block break-all">
                {props.tx_result.repr}
              </code>
            </ScrollArea>
          </div>
        )}

        {/* Additional transaction-specific data */}
        {props.token_transfer && (
          <div className="p-3 bg-accent/30 rounded-lg space-y-2">
            <p className="text-sm font-medium">Token Transfer Details</p>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">To:</span> {props.token_transfer.recipient_address}</p>
              <p><span className="text-muted-foreground">Amount:</span> {formatSTX(props.token_transfer.amount)} STX</p>
              {props.token_transfer.memo && (
                <p><span className="text-muted-foreground">Memo:</span> {Buffer.from(props.token_transfer.memo.slice(2), 'hex').toString()}</p>
              )}
            </div>
          </div>
        )}

        {props.contract_call && (
          <div className="p-3 bg-accent/30 rounded-lg space-y-2">
            <p className="text-sm font-medium">Contract Call Details</p>
            <div className="text-sm space-y-1">
              <p><span className="text-muted-foreground">Contract:</span> {props.contract_call.contract_id}</p>
              <p><span className="text-muted-foreground">Function:</span> {props.contract_call.function_name}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

