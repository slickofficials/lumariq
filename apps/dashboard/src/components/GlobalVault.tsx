import React, { useEffect, useState } from 'react';

export const GlobalVault = () => {
  const [data, setData] = useState({ pending_ghs: 0, usd_value: 0 });

  const fetchSettlement = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/settlement-preview');
      if (!res.ok) throw new Error("VAULT_SYNC_ERROR");
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error("Vault link lost:", err);
    }
  };

  useEffect(() => {
    fetchSettlement();
    const interval = setInterval(fetchSettlement, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 bg-slate-900 border border-white/5 rounded-2xl">
      <h3 className="font-mono text-[9px] font-bold tracking-[0.4em] text-blue-400 uppercase mb-4">Global_Treasury_Vault <span className="text-[7px] opacity-40">BRIDGE_SYNC_OK</span></h3>
      <div className="space-y-4">
        <div>
          <p className="text-3xl font-black text-white italic">${data.usd_value.toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">USDC_EQUIVALENT_AVAILABLE</p>
        </div>
        <div className="pt-4 border-t border-white/5">
          <p className="text-xs font-bold text-slate-400">{data.pending_ghs.toLocaleString()} GHS</p>
          <p className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">LOCAL_BACKING</p>
        </div>
      </div>
    </div>
  );
};
