import React, { useEffect, useState } from 'react';

export const RevenueCard = ({ isLocked }: { isLocked: boolean }) => {
  const [data, setData] = useState({ totalFee: 0, totalVolume: 0, transactionCount: 0 });

  const fetchRevenue = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/revenue');
      const json = await res.json();
      
      // 🛡️ Case-Insensitive Mapping to force the display to wake up
      setData({
        totalFee: json.totalFee ?? json.TotalFee ?? 0,
        totalVolume: json.totalVolume ?? json.TotalVolume ?? 0,
        transactionCount: json.transactionCount ?? json.TransactionCount ?? 0
      });
    } catch (err) {
      console.error("LUMARIQ_OFFLINE");
    }
  };

  useEffect(() => {
    fetchRevenue();
    const interval = setInterval(fetchRevenue, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-8 bg-slate-900 border border-white/10 rounded-3xl shadow-2xl relative overflow-hidden">
      <div className="flex justify-between items-start mb-8">
        <h3 className="font-mono text-[10px] text-emerald-500 uppercase italic">Mode: Market Neutral</h3>
        <div className={`w-3 h-3 rounded-full animate-pulse ${isLocked ? 'bg-red-500' : 'bg-emerald-500'}`} />
      </div>
      <div className="flex items-baseline gap-3 mb-8">
        <span className="text-6xl font-black text-white italic tracking-tighter">
          {Number(data.totalFee).toFixed(2)}
        </span>
        <span className="text-xl font-bold text-emerald-500">GHS</span>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5 font-mono">
        <div>
          <p className="text-[8px] text-slate-500 uppercase">Gross Volume</p>
          <p className="text-sm font-black text-white">{Number(data.totalVolume).toLocaleString()} GHS</p>
        </div>
        <div className="text-right">
          <p className="text-[8px] text-slate-500 uppercase">Verified Events</p>
          <p className="text-sm font-black text-white">{data.transactionCount}</p>
        </div>
      </div>
    </div>
  );
};