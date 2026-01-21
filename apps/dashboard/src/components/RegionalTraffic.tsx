import React, { useEffect, useState } from 'react';

export const RegionalTraffic = () => {
  const [regions, setRegions] = useState([]);

  const fetchRegions = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/regions');
      const data = await res.json();
      setRegions(data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchRegions();
    const interval = setInterval(fetchRegions, 3000);
    return () => clearInterval(interval);
  }, []);

  const maxTotal = regions.length > 0 ? Math.max(...regions.map((r: any) => r.total)) : 1;

  return (
    <div className="p-6 bg-slate-950 border border-white/5 rounded-2xl shadow-xl">
      <h3 className="font-mono text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-6">Regional_Capital_Density</h3>
      <div className="space-y-6">
        {regions.length > 0 ? regions.map((reg: any) => (
          <div key={reg.region} className="space-y-2">
            <div className="flex justify-between items-end font-mono text-[10px]">
              <span className="text-white font-bold tracking-widest">{reg.region}</span>
              <span className="text-emerald-500">{reg.total.toFixed(2)} GHS</span>
            </div>
            <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 shadow-[0_0_10px_#10b981] transition-all duration-[1000ms]"
                style={{ width: `${(reg.total / maxTotal) * 100}%` }}
              />
            </div>
            <div className="text-[8px] text-slate-600 font-mono uppercase">Throughput: {reg.count} Events</div>
          </div>
        )) : (
          <div className="text-center py-10 text-[10px] font-mono text-slate-700 uppercase tracking-widest">No Active Traffic Detected</div>
        )}
      </div>
    </div>
  );
};
