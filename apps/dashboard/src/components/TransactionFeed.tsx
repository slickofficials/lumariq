import React, { useEffect, useState } from 'react';

export const TransactionFeed = () => {
  const [history, setHistory] = useState([]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/history');
      if (!res.ok) throw new Error("UPSTREAM_LINK_FAILURE");
      const data = await res.json();
      
      // 🛡️ Ensure data is an array before mapping to prevent crash
      setHistory(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Feed link lost:", err);
    }
  };

  useEffect(() => {
    fetchHistory();
    const interval = setInterval(fetchHistory, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-md">
      <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
        <h3 className="font-mono text-[10px] font-black tracking-[0.4em] text-emerald-500 uppercase">System_Ledger_Feed</h3>
        <span className="text-[8px] font-mono text-emerald-500/40 uppercase animate-pulse">Live_Pulse_Synced</span>
      </div>
      <div className="overflow-x-auto max-h-[600px] overflow-y-auto scrollbar-hide">
        <table className="w-full text-left border-collapse">
          <thead className="sticky top-0 bg-slate-900 z-10">
            <tr className="text-[9px] font-mono text-slate-500 border-b border-white/5 uppercase">
              <th className="p-4 font-medium">ID</th>
              <th className="p-4 font-medium">Entity</th>
              <th className="p-4 font-medium">Origin/Hash</th>
              <th className="p-4 font-medium text-right">Delta (GHS)</th>
            </tr>
          </thead>
          <tbody className="text-xs font-mono">
            {history.map((tx: any) => (
              <tr key={tx.id} className="border-b border-white/[0.02] hover:bg-white/[0.02] transition-colors group">
                <td className="p-4 text-slate-600">#{tx.id}</td>
                <td className="p-4 font-bold text-white group-hover:text-emerald-400 transition-colors uppercase">{tx.userId}</td>
                <td className="p-4 text-emerald-500/70">{tx.region}</td>
                <td className="p-4 text-right font-black text-emerald-400">
                  +{(Number(tx.feeCaptured) || 0).toFixed(2)}
                </td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr>
                <td colSpan={4} className="p-12 text-center text-slate-700 uppercase italic text-[10px] tracking-widest">
                  Awaiting_Empire_Pulse...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
