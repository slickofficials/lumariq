import React, { useEffect, useState } from 'react';

export const AlertTicker = () => {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/v1/admin/history');
        if (!res.ok) return;
        const data = await res.json();
        const whales = (data || []).filter((tx: any) => tx.rawAmount > 1000);
        setAlerts(whales);
      } catch (err) { console.error("Ticker link lost"); }
    };
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-red-950/90 border-t border-red-500/50 p-2 overflow-hidden z-50 backdrop-blur-md">
      <div className="flex gap-12 animate-marquee whitespace-nowrap">
        {alerts.map((a: any, i) => (
          <span key={i} className="text-[10px] font-mono font-bold text-red-500 uppercase tracking-tighter">
            ⚠️ WHALE_DETECTED: {a.userId} | CAPTURED {a.rawAmount} GHS IN {a.region}
          </span>
        ))}
        {alerts.length === 0 && (
          <span className="text-[10px] font-mono text-red-500/50 uppercase tracking-widest">
            System_Pulse: Stable // Monitoring 40,000+ Active Nodes...
          </span>
        )}
      </div>
    </div>
  );
};
