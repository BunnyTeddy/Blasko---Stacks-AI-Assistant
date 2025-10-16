'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BarChart3, ExternalLink } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type TopProtocolsProps = {
  chain: string;
  protocols: Array<{
    name: string;
    tvl: number;
    category: string;
    change_1d: number;
    change_7d: number;
    change_1m: number;
    logo: string | null;
    url: string | null;
  }>;
  count: number;
};

export function TopProtocols({ chain, protocols, count }: TopProtocolsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) {
      return `$${(value / 1_000_000_000).toFixed(2)}B`;
    }
    if (value >= 1_000_000) {
      return `$${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `$${(value / 1_000).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  // Prepare bar chart data (top 10)
  const barChartData = protocols.slice(0, 10).map((protocol) => ({
    name: protocol.name.length > 15 ? protocol.name.substring(0, 15) + '...' : protocol.name,
    tvl: protocol.tvl,
  }));

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-primary" />
            Top {chain} DeFi Protocols
          </div>
          <Badge variant="secondary">{count} Protocols</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Bar Chart */}
        <div>
          <h3 className="text-sm font-medium mb-4">Top 10 by TVL</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={barChartData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                type="number" 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                stroke="#9ca3af"
                tick={{ fontSize: 11 }}
                width={100}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                formatter={(value: Record<string, unknown>) => [formatCurrency(value), 'TVL']}
              />
              <Bar dataKey="tvl" fill="#8b5cf6" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Protocols Table */}
        <div>
          <h3 className="text-sm font-medium mb-3">All Protocols</h3>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {protocols.map((protocol, index) => (
                <div
                  key={protocol.name}
                  className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">
                        {index + 1}
                      </Badge>
                      {protocol.logo && (
                        <img
                          src={protocol.logo}
                          alt={protocol.name}
                          className="w-8 h-8 rounded-full"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">{protocol.name}</p>
                          {protocol.url && (
                            <a
                              href={protocol.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-700"
                            >
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{protocol.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(protocol.tvl)}</p>
                    </div>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <div className={`flex items-center gap-1 ${protocol.change_1d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {protocol.change_1d >= 0 ? '↑' : '↓'} {Math.abs(protocol.change_1d).toFixed(2)}% (24h)
                    </div>
                    <div className={`flex items-center gap-1 ${protocol.change_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {protocol.change_7d >= 0 ? '↑' : '↓'} {Math.abs(protocol.change_7d).toFixed(2)}% (7d)
                    </div>
                    {protocol.change_1m !== 0 && (
                      <div className={`flex items-center gap-1 ${protocol.change_1m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {protocol.change_1m >= 0 ? '↑' : '↓'} {Math.abs(protocol.change_1m).toFixed(2)}% (30d)
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}






