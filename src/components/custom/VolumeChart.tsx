import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

interface MarketVolume {
  name: string;
  volume: number;
  probability: number;
  slug: string;
}

interface VolumeChartProps {
  query: string;
  limit?: number;
}

export const MarketVolumeChart: React.FC<VolumeChartProps> = ({ query, limit = 5 }) => {
  const [data, setData] = useState<MarketVolume[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Don't fetch if query is too short
    if (!query || query.length < 3) {
      setData([]);
      setLoading(false);
      return;
    }

    // Debounce API calls
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await fetch(`http://localhost:5090/market-volumes?query=${encodeURIComponent(query)}&limit=${limit}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        
        const result = await response.json();
        setData(result.chartData || []);
        
        console.log('Volume chart data:', result.chartData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
        console.error('Volume chart error:', err);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, limit]);

  if (loading) {
    return (
      <div className="w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2 text-muted-foreground">Loading volume data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="w-full h-96 p-4 border rounded-lg bg-card flex items-center justify-center">
        <div className="text-muted-foreground">No volume data found for "{query}"</div>
      </div>
    );
  }

  // Color bars based on probability
  const getBarColor = (probability: number) => {
    if (probability > 0.7) return '#22c55e'; // Green for high probability
    if (probability > 0.3) return '#eab308'; // Yellow for medium
    return '#ef4444'; // Red for low probability
  };

  return (
    <div className="w-full h-96 p-4 border rounded-lg bg-card">
      <h3 className="text-lg font-semibold mb-4">
        📊 Market Volumes: {query}
      </h3>
      
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={100}
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => `$${value}k`}
          />
          <Tooltip 
            formatter={(value: number) => [`$${value}k`, 'Volume']}
            labelFormatter={(label) => `Market: ${label}`}
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))'
            }}
          />
          <Bar dataKey="volume" name="Volume">
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.probability)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex justify-center mt-2 space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-1"></div>
          <span>High Probability (&gt;70%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-500 rounded mr-1"></div>
          <span>Medium (30-70%)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-1"></div>
          <span>Low (&lt;30%)</span>
        </div>
      </div>
    </div>
  );
};