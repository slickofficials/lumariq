import React, { useEffect, useState } from 'react';

export const GlobalMap = () => {
  const [regions, setRegions] = useState([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/v1/admin/leaderboard');
        if (!res.ok) return;
        const data = await res.json();
        setRegions(Array.isArray(data) ? data : []);
      } catch (err) { console.error("Map link lost"); }
    };
    fetchRegions();
    const interval = setInterval(fetchRegions, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl h-[300px] flex flex-col justify-center items-center relative">
      <h3 className="absolute top-6 left-6 font-mono text-[9px] font-bold tracking-[0.4em] text-emerald-500 uppercase">Geographical_Density_Oracle</h3>
      <div className="text-center">
         <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-4">Tracking {regions.length || 0} nodes globally</p>
         <div className="w-48 h-24 border border-emerald-500/20 rounded-full animate-ping absolute opacity-10"></div>
         <p className="text-xs text-emerald-500 font-mono animate-pulse uppercase">Active_Heatmap_Loading...</p>
      </div>
    </div>
  );
};
