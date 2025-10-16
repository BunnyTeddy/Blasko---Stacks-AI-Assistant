'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type StacksTVLProps = {
  chain: string;
  currentTVL: number;
  tvlChange: number;
  tvlChange24h: number;
  timeframe: string;
  historicalTVL: Array<{ date: number; tvl: number }>;
};

export function StacksTVL({
  chain,
  currentTVL,
  tvlChange,
  tvlChange24h,
  timeframe,
  historicalTVL,
}: StacksTVLProps) {
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

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  // Prepare chart data
  const tvlChartData = historicalTVL.map((entry) => ({
    date: formatDate(entry.date),
    tvl: entry.tvl,
  }));

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-primary" />
          {chain} Total Value Locked
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Current TVL */}
          <div className="p-4 bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg border border-purple-200 dark:border-purple-800">
            <p className="text-sm text-muted-foreground mb-1">Current TVL</p>
            <p className="text-3xl font-bold">{formatCurrency(currentTVL)}</p>
          </div>

          {/* 24h Change */}
          <div className={`p-4 rounded-lg border ${
            tvlChange24h >= 0 
              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800' 
              : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-200 dark:border-red-800'
          }`}>
            <p className="text-sm text-muted-foreground mb-1">24h Change</p>
            <div className="flex items-center gap-2">
              {tvlChange24h >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-2xl font-bold ${tvlChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(tvlChange24h)}
              </p>
            </div>
          </div>

          {/* Period Change */}
          <div className={`p-4 rounded-lg border ${
            tvlChange >= 0 
              ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800' 
              : 'bg-gradient-to-br from-red-500/10 to-rose-500/10 border-red-200 dark:border-red-800'
          }`}>
            <p className="text-sm text-muted-foreground mb-1">{timeframe} Change</p>
            <div className="flex items-center gap-2">
              {tvlChange >= 0 ? (
                <TrendingUp className="h-5 w-5 text-green-600" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-600" />
              )}
              <p className={`text-2xl font-bold ${tvlChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercent(tvlChange)}
              </p>
            </div>
          </div>
        </div>

        {/* TVL Historical Chart */}
        <div>
          <h3 className="text-sm font-medium mb-4">TVL History ({timeframe})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={tvlChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                stroke="#9ca3af"
                tick={{ fontSize: 12 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: '#f3f4f6' }}
                formatter={(value: any) => [formatCurrency(value), 'TVL']}
              />
              <Line
                type="monotone"
                dataKey="tvl"
                stroke="#8b5cf6"
                strokeWidth={3}
                dot={false}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}






