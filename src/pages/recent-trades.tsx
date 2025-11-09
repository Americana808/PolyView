import React, { useEffect, useState } from "react";

type Trade = {
  side?: string;
  size?: number | string;
  price?: number | string;
  time?: string;
  [key: string]: any;
};

const RecentTrades: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("http://localhost:5090/recent-trades")
      .then((res) => res.json())
      .then((data) => {
        setTrades(Array.isArray(data?.trades) ? data.trades : []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch recent trades");
        setLoading(false);
      });
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Ten Most Recent Trades</h1>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && (
        <table className="min-w-full border border-gray-300">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-left">Side</th>
              <th className="border px-4 py-2 text-right">Size</th>
              <th className="border px-4 py-2 text-right">Price</th>
              <th className="border px-4 py-2 text-right">Total ($)</th>
              <th className="border px-4 py-2 text-left">Time</th>
            </tr>
          </thead>
          <tbody>
            {trades.map((trade, idx) => {
              const sizeNum = Number(trade.size ?? 0) || 0;
              const priceNum = Number(trade.price ?? 0) || 0;
              const total = sizeNum * priceNum;
              return (
                <tr key={idx}>
                  <td className="border px-4 py-2">{String(trade.side ?? "")}</td>
                  <td className="border px-4 py-2 text-right">{sizeNum}</td>
                  <td className="border px-4 py-2 text-right">${priceNum.toFixed(4)}</td>
                  <td className="border px-4 py-2 text-right">${total.toFixed(2)}</td>
                  <td className="border px-4 py-2">{String(trade.time ?? "")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default RecentTrades;
