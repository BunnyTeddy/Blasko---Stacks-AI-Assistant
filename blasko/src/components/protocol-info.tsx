'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, TrendingUp, TrendingDown, Activity, Twitter } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type ProtocolInfoProps = {
  name: string;
  slug: string;
  category: string;
  tvl: number;
  change_1d: number;
  change_7d: number;
  change_1m: number;
  mcap: number;
  logo: string | null;
  url: string | null;
  description: string;
  twitter: string | null;
  historicalTVL: Array<{ date: number; tvl: number }>;
  chains: string[];
};

export function ProtocolInfo({
  name,
  category,
  tvl,
  change_1d,
  change_7d,
  change_1m,
  mcap,
  logo,
  url,
  description,
  twitter,
  historicalTVL,
  chains,
}: ProtocolInfoProps) {
  const formatCurrency = (value: number | any) => {
    // Ensure value is a valid number
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    
    if (numValue >= 1_000_000_000) {
      return `$${(numValue / 1_000_000_000).toFixed(2)}B`;
    }
    if (numValue >= 1_000_000) {
      return `$${(numValue / 1_000_000).toFixed(2)}M`;
    }
    if (numValue >= 1_000) {
      return `$${(numValue / 1_000).toFixed(2)}K`;
    }
    return `$${numValue.toFixed(2)}`;
  };

  const formatDate = (timestamp: number | any) => {
    const numTimestamp = typeof timestamp === 'number' ? timestamp : parseInt(String(timestamp)) || 0;
    const date = new Date(numTimestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPercent = (value: number | any) => {
    const numValue = typeof value === 'number' ? value : parseFloat(String(value)) || 0;
    const sign = numValue >= 0 ? '+' : '';
    return `${sign}${numValue.toFixed(2)}%`;
  };

  // Prepare chart data - ensure all TVL values are numbers
  const chartData = historicalTVL
    .map((entry) => {
      const tvlValue = typeof entry.tvl === 'number' ? entry.tvl : parseFloat(String(entry.tvl)) || 0;
      return {
        date: formatDate(entry.date),
        tvl: tvlValue,
      };
    })
    .filter((entry) => !isNaN(entry.tvl)); // Remove any entries with invalid TVL

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {logo && (
              <img
                src={logo}
                alt={name}
                className="w-10 h-10 rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{name}</h2>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                )}
                {twitter && (
                  <a
                    href={`https://twitter.com/${twitter}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-500"
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Badge>{category}</Badge>
                {chains.length > 0 && (
                  <div className="flex gap-1">
                    {chains.slice(0, 3).map((chain) => (
                      <Badge key={chain} variant="outline" className="text-xs">
                        {chain}
                      </Badge>
                    ))}
                    {chains.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{chains.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Description */}
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-xs text-muted-foreground mb-1">TVL</p>
            <p className="text-xl font-bold">{formatCurrency(tvl)}</p>
          </div>

          <div className={`p-3 rounded-lg border ${
            change_1d >= 0 
              ? 'bg-green-500/10 border-green-200 dark:border-green-800' 
              : 'bg-red-500/10 border-red-200 dark:border-red-800'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">24h</p>
            <div className="flex items-center gap-1">
              {change_1d >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <p className={`text-lg font-bold ${change_1d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(change_1d)}
              </p>
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${
            change_7d >= 0 
              ? 'bg-green-500/10 border-green-200 dark:border-green-800' 
              : 'bg-red-500/10 border-red-200 dark:border-red-800'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">7d</p>
            <div className="flex items-center gap-1">
              {change_7d >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <p className={`text-lg font-bold ${change_7d >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(change_7d)}
              </p>
            </div>
          </div>

          <div className={`p-3 rounded-lg border ${
            change_1m >= 0 
              ? 'bg-green-500/10 border-green-200 dark:border-green-800' 
              : 'bg-red-500/10 border-red-200 dark:border-red-800'
          }`}>
            <p className="text-xs text-muted-foreground mb-1">30d</p>
            <div className="flex items-center gap-1">
              {change_1m >= 0 ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
              <p className={`text-lg font-bold ${change_1m >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(change_1m)}
              </p>
            </div>
          </div>
        </div>

        {/* Market Cap */}
        {mcap > 0 && (
          <div className="p-3 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Market Cap</p>
            <p className="text-xl font-bold">{formatCurrency(mcap)}</p>
          </div>
        )}

        {/* Historical TVL Chart */}
        {chartData.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-4 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              TVL History
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                <XAxis 
                  dataKey="date" 
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  tick={{ fontSize: 11 }}
                  tickFormatter={formatCurrency}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '8px',
                  }}
                  labelStyle={{ color: '#f3f4f6' }}
                  formatter={(value: Record<string, unknown>) => [formatCurrency(value), 'TVL']}
                />
                <Line
                  type="monotone"
                  dataKey="tvl"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}



