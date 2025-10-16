'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PieChart as PieChartIcon, TrendingUp } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

type DefiCategoriesProps = {
  chain: string;
  totalTVL: number;
  categories: Array<{
    name: string;
    tvl: number;
    count: number;
    percentage: number;
    protocols: string[];
  }>;
  categoryCount: number;
};

const COLORS = [
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#f59e0b', // Amber
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#06b6d4', // Cyan
  '#a855f7', // Violet
];

export function DefiCategories({
  chain,
  totalTVL,
  categories,
  categoryCount,
}: DefiCategoriesProps) {
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

  // Prepare pie chart data - NO inline labels to avoid overlap
  const pieChartData = categories.map((category) => ({
    name: category.name,
    value: category.tvl,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }: Record<string, unknown>) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalTVL) * 100).toFixed(2);
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold mb-1">{data.name}</p>
          <p className="text-gray-300 text-sm">TVL: {formatCurrency(data.value)}</p>
          <p className="text-gray-400 text-xs mt-1">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PieChartIcon className="h-6 w-6 text-primary" />
            {chain} DeFi Categories
          </div>
          <Badge variant="secondary" className="text-sm">
            {categoryCount} {categoryCount === 1 ? 'Category' : 'Categories'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Total TVL */}
        <div className="p-4 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total TVL Across All Categories</p>
              <p className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency(totalTVL)}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-500 opacity-50" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Pie Chart - Clean, no labels */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-semibold mb-4 text-center">TVL Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  // NO LABELS - clean look
                >
                  {pieChartData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List with Color Legend */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-semibold mb-4">Breakdown by Category</h3>
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-2 custom-scrollbar">
              {categories.map((category, index) => (
                <div
                  key={category.name}
                  className="group p-3 bg-gradient-to-r from-muted/30 to-muted/10 hover:from-muted/50 hover:to-muted/30 rounded-lg transition-all duration-200 border border-transparent hover:border-primary/20"
                >
                  <div className="flex items-start gap-3">
                    {/* Color indicator */}
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0 mt-1 ring-2 ring-offset-2 ring-offset-background"
                      style={{ 
                        backgroundColor: COLORS[index % COLORS.length],
                        boxShadow: `0 0 10px ${COLORS[index % COLORS.length]}40`
                      }}
                    />
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <p className="font-semibold text-sm truncate">{category.name}</p>
                        <Badge 
                          variant="outline" 
                          className="text-xs flex-shrink-0"
                          style={{ borderColor: COLORS[index % COLORS.length] + '40' }}
                        >
                          {category.percentage.toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className="text-muted-foreground">
                          {category.count} {category.count === 1 ? 'protocol' : 'protocols'}
                        </span>
                        <span className="font-mono font-semibold">
                          {formatCurrency(category.tvl)}
                        </span>
                      </div>
                      
                      {category.protocols.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-2 truncate">
                          {category.protocols.slice(0, 2).join(', ')}
                          {category.protocols.length > 2 && ` +${category.protocols.length - 2}`}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

