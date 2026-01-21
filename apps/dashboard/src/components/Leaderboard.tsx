import React, { useEffect, useState } from 'react';

export const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/v1/admin/leaderboard');
        if (!res.ok) return; // Silent return on 404/500
        const data = await res.json();
        setLeaders(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Leaderboard Offline"); }
    };
    fetchLeaders();
    const interval = setInterval(fetchLeaders, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl">
      <h3 className="font-mono text-[9px] font-bold tracking-[0.4em] text-emerald-500 uppercase mb-6">Global_Node_Ranking</h3>
      <div className="space-y-4">
        {leaders.map((node: any, i) => (
          <div key={i} className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <span className="text-xl font-black text-slate-700">0{i+1}</span>
            <div className="flex-1 ml-4">
                <p className="font-mono text-xs font-bold text-white">{node.region || "UNKNOWN"}</p>
                <p className="text-[8px] font-mono text-slate-500">{node.tx_count || 0} EVENTS</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-black text-emerald-400">+{Number(node.revenue || 0).toFixed(2)}</p>
            </div>
          </div>
        ))}
        {leaders.length === 0 && <p className="text-[10px] text-slate-700 uppercase italic">Awaiting_Data...</p>}
      </div>
    </div>
  );
};
