import React, { useEffect, useState } from 'react';

export const GrowthForecaster = () => {
  const [stats, setStats] = useState({ totalVolume: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/v1/admin/revenue');
        const data = await res.json();
        setStats(data);
      } catch (err) { console.error("Forecaster Offline"); }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 5000);
    return () => clearInterval(interval);
  }, []);

  const annual = (Number(stats.totalVolume || 0) * 0.0075) * 365;

  return (
    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl relative overflow-hidden">
      <h3 className="font-mono text-[9px] font-bold tracking-[0.4em] text-blue-400 uppercase mb-4">Annual_Revenue_Projection</h3>
      <p className="text-3xl font-black text-white italic">${annual.toLocaleString(undefined, {maximumFractionDigits: 0})} <span className="text-xs text-slate-500">USD / YR</span></p>
      <p className="mt-2 text-[8px] font-mono text-slate-500 uppercase">Based on current 40,000 node velocity</p>
    </div>
  );
};
