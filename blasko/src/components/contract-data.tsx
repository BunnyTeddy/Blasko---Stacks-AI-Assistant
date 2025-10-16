'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { FileCode, ExternalLink, ChevronDown, Code2 } from 'lucide-react';
import { useState } from 'react';

type ContractDataProps = {
  contract_id: string;
  tx_id: string;
  canonical: boolean;
  clarity_version: number;
  source_code?: string;
  abi?: Record<string, unknown>;
  [key: string]: Record<string, unknown>;
};

export function ContractData(props: ContractDataProps) {
  const [sourceOpen, setSourceOpen] = useState(false);
  const [abiOpen, setAbiOpen] = useState(false);

  const [contractAddress, contractName] = props.contract_id.split('.');

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileCode className="h-5 w-5 text-primary" />
          Smart Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract ID */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Contract ID</label>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted p-2 rounded flex-1 break-all">
              {props.contract_id}
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

        {/* Contract Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Address</label>
            <code className="text-xs bg-muted p-2 rounded block break-all">
              {contractAddress}
            </code>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Name</label>
            <code className="text-xs bg-muted p-2 rounded block break-all">
              {contractName}
            </code>
          </div>
        </div>

        {/* Status and Version */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Status</label>
            <Badge variant={props.canonical ? "default" : "secondary"}>
              {props.canonical ? "Canonical" : "Non-canonical"}
            </Badge>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Clarity Version</label>
            <Badge variant="outline">v{props.clarity_version}</Badge>
          </div>
        </div>

        {/* Source Code */}
        {props.source_code && (
          <Collapsible open={sourceOpen} onOpenChange={setSourceOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Source Code</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${sourceOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ScrollArea className="h-96 w-full">
                <pre className="text-xs bg-muted p-4 rounded overflow-x-auto">
                  <code>{props.source_code}</code>
                </pre>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* ABI */}
        {props.abi && (
          <Collapsible open={abiOpen} onOpenChange={setAbiOpen}>
            <CollapsibleTrigger className="w-full">
              <div className="flex items-center justify-between p-3 bg-accent/30 rounded-lg hover:bg-accent/50 transition-colors">
                <div className="flex items-center gap-2">
                  <FileCode className="h-4 w-4" />
                  <span className="text-sm font-medium">Contract Interface (ABI)</span>
                </div>
                <ChevronDown 
                  className={`h-4 w-4 transition-transform ${abiOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <ScrollArea className="h-96 w-full">
                <div className="space-y-3">
                  {/* Functions */}
                  {props.abi.functions && props.abi.functions.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Functions</p>
                      {props.abi.functions.map((func: Record<string, unknown>, idx: number) => (
                        <div key={idx} className="p-3 bg-muted rounded text-xs space-y-1">
                          <p className="font-mono font-medium">{func.name}</p>
                          <p className="text-muted-foreground">{func.access}</p>
                          {func.args && func.args.length > 0 && (
                            <p className="text-muted-foreground">
                              Args: {func.args.map((arg: Record<string, unknown>) => arg.name).join(', ')}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Variables */}
                  {props.abi.variables && props.abi.variables.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Variables</p>
                      {props.abi.variables.map((variable: Record<string, unknown>, idx: number) => (
                        <div key={idx} className="p-3 bg-muted rounded text-xs">
                          <p className="font-mono">{variable.name}</p>
                          <p className="text-muted-foreground">{variable.type}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Maps */}
                  {props.abi.maps && props.abi.maps.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold text-muted-foreground">Maps</p>
                      {props.abi.maps.map((map: Record<string, unknown>, idx: number) => (
                        <div key={idx} className="p-3 bg-muted rounded text-xs">
                          <p className="font-mono">{map.name}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Deployment Transaction */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Deployment Transaction</label>
          <a
            href={`https://explorer.stacks.co/txid/${props.tx_id}?chain=mainnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-blue-600 hover:underline flex items-center gap-1"
          >
            {props.tx_id}
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

