import React, { useEffect, useState } from 'react';

export const SecurityAudit = () => {
  const [audits, setAudits] = useState([]);

  const fetchAudits = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/security-audit');
      const data = await res.json();
      setAudits(data || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAudits();
    const interval = setInterval(fetchAudits, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleExport = () => {
    window.open('http://localhost:3001/api/v1/admin/export-audit');
  };

  return (
    <div className="p-6 bg-red-950/10 border border-red-500/20 rounded-2xl relative">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-mono text-[9px] font-bold tracking-[0.4em] text-red-500 uppercase">L7_Audit_Log</h3>
        <button 
          onClick={handleExport}
          className="px-3 py-1 bg-red-500 text-black font-mono text-[8px] font-black rounded hover:bg-red-400 transition-all uppercase"
        >
          Export_CSV
        </button>
      </div>
      <div className="space-y-2">
        {audits.length > 0 ? audits.map((log: any) => (
          <div key={log.id} className="p-2 border border-red-500/10 bg-red-500/5 rounded font-mono text-[9px] flex justify-between items-center">
            <span className="text-red-400 font-bold">[{log.region}]</span>
            <span className="text-white">Whale: {log.user}</span>
            <span className="text-red-500/80">${log.amount.toLocaleString()}</span>
          </div>
        )) : (
          <p className="text-[9px] font-mono text-slate-600 uppercase text-center py-4">Safe Grid: No Breaches</p>
        )}
      </div>
    </div>
  );
};
