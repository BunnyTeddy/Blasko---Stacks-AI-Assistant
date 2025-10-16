'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, User, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface BNSResolverProps {
  type: 'address' | 'bns' | 'unknown';
  input: string;
  address: string | null;
  bnsName?: string | null;
  owner?: string;
  namespace?: string;
  name?: string;
  message: string;
  error?: string;
  zonefile?: string;
}

export function BNSResolver({
  type,
  input,
  address,
  bnsName,
  owner,
  namespace,
  name,
  message,
  error,
  zonefile,
}: BNSResolverProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = () => {
    if (error) return 'destructive';
    if (type === 'bns' && address) return 'default';
    if (type === 'address') return 'secondary';
    return 'outline';
  };

  const getIcon = () => {
    if (error) return <XCircle className="h-5 w-5 text-red-500" />;
    if (type === 'bns' && address) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    if (type === 'address') return <CheckCircle2 className="h-5 w-5 text-blue-500" />;
    return <XCircle className="h-5 w-5 text-gray-400" />;
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon()}
            <CardTitle>BNS Resolution</CardTitle>
          </div>
          <Badge variant={getStatusColor()}>
            {type === 'bns' ? 'BNS Name' : type === 'address' ? 'Address' : 'Unknown'}
          </Badge>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Input</p>
          <p className="font-mono text-sm break-all">{input}</p>
        </div>

        {/* BNS Name Resolution */}
        {type === 'bns' && address && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-gray-600 font-medium">Resolved Address</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(address)}
                  className="h-6 px-2"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <p className="font-mono text-sm break-all text-gray-800">{address}</p>
            </div>

            {namespace && name && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Name</p>
                  <p className="font-medium text-sm">{name}</p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-500 mb-1">Namespace</p>
                  <p className="font-medium text-sm">.{namespace}</p>
                </div>
              </div>
            )}

            {zonefile && (
              <details className="p-3 bg-white border border-gray-200 rounded-lg">
                <summary className="cursor-pointer text-xs text-gray-600 font-medium mb-2">
                  Zone File
                </summary>
                <pre className="text-xs bg-gray-50 p-2 rounded overflow-x-auto whitespace-pre-wrap">
                  {zonefile}
                </pre>
              </details>
            )}

            <Button
              variant="outline"
              onClick={() =>
                window.open(`https://explorer.stacks.co/address/${address}?chain=mainnet`, '_blank')
              }
              className="w-full"
            >
              View on Explorer
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Address Validation */}
        {type === 'address' && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <p className="text-sm text-gray-700 font-medium">Valid Stacks Address</p>
            </div>
            <p className="text-xs text-gray-600">
              This is a valid Stacks address. You can use it for transactions.
            </p>
          </div>
        )}

        {/* BNS Not Found */}
        {type === 'bns' && !address && error === 'not_found' && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
            <p className="text-sm text-gray-700">
              The BNS name <strong>{input}</strong> is not registered yet.
            </p>
            <p className="text-xs text-gray-600">
              You can register it by using the BNS registration feature!
            </p>
          </div>
        )}

        {/* Invalid Input */}
        {type === 'unknown' && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-gray-700">
              The input is not a valid Stacks address or BNS name.
            </p>
            <p className="text-xs text-gray-600 mt-2">
              • Stacks addresses start with SP or ST
              <br />• BNS names have a format like alice.btc or bob.id
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}






