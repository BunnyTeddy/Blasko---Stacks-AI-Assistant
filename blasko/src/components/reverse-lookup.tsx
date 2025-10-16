'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, CheckCircle2, AlertCircle, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface ReverseLookupProps {
  address: string;
  bnsName: string | null;
  allNames?: string[];
  message: string;
  error?: string;
}

export function ReverseLookup({ address, bnsName, allNames = [], message, error }: ReverseLookupProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="h-5 w-5" />
            <CardTitle>Reverse BNS Lookup</CardTitle>
          </div>
          <Badge variant={bnsName ? 'default' : 'secondary'}>
            {bnsName ? 'Name Found' : 'No Name'}
          </Badge>
        </div>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Stacks Address</p>
          <div className="flex items-center justify-between">
            <p className="font-mono text-sm break-all flex-1">{address}</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCopy(address)}
              className="ml-2 h-6 px-2"
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
        </div>

        {/* BNS Name Found */}
        {bnsName && (
          <div className="space-y-3">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-xs text-gray-600 font-medium">Primary BNS Name</p>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-2xl font-bold text-green-700">{bnsName}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(bnsName)}
                  className="h-8 px-2"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
            </div>

            {allNames && allNames.length > 1 && (
              <div className="p-4 bg-white border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-2">All Registered Names</p>
                <div className="flex flex-wrap gap-2">
                  {allNames.map((name, index) => (
                    <Badge key={index} variant="outline" className="font-mono">
                      {name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-gray-600">
              <p>
                ✨ You can now use <strong>{bnsName}</strong> instead of the full address when
                sending tokens or interacting with this account.
              </p>
            </div>
          </div>
        )}

        {/* No BNS Name */}
        {!bnsName && !error && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-2">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <p className="text-sm text-gray-700 font-medium">No BNS Name Found</p>
            </div>
            <p className="text-xs text-gray-600">
              This address doesn&apos;t have a registered BNS name yet. The owner can register one to
              make their address more memorable!
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <p className="text-sm text-gray-700 font-medium">Lookup Failed</p>
            </div>
            <p className="text-xs text-gray-600 mt-1">{message}</p>
          </div>
        )}

        {/* Info Card */}
        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
          <p className="font-medium mb-1">About BNS Names</p>
          <p>
            BNS (Bitcoin Name Service) allows users to register human-readable names like
            &quot;alice.btc&quot; that map to their Stacks addresses. A principal can only own one primary
            name at a time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}






