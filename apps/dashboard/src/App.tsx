import React, { useState, useEffect } from 'react';
import { RevenueCard } from './components/RevenueCard';
import { TransactionFeed } from './components/TransactionFeed';
import { Globe } from './components/Globe'; // 🌍 THE ORBITAL ENGINE
import { AlertTicker } from './components/AlertTicker';
import { DispatchTerminal } from './components/DispatchTerminal';
import { Leaderboard } from './components/Leaderboard';
import { GrowthForecaster } from './components/GrowthForecaster';
import { GlobalVault } from './components/GlobalVault';

function App() {
  const [isOnline, setIsOnline] = useState(false);
  const [systemLocked, setSystemLocked] = useState(false);
  const [showPinGate, setShowPinGate] = useState(false);
  const [activeAction, setActiveAction] = useState<'SETTLE' | 'BRIDGE' | 'GLOBAL' | null>(null);
  const [pin, setPin] = useState("");
  const [uptime, setUptime] = useState(0);

  const SOVEREIGN_PIN = "8888"; 

  // 🛡️ Industrial Toggle Logic
  const toggleLock = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/v1/admin/toggle');
      const data = await res.json();
      setSystemLocked(data.status === 'REROUTED');
    } catch (err) { console.error("Control Link Failure:", err); }
  };

  const openAuth = (action: 'SETTLE' | 'BRIDGE' | 'GLOBAL') => {
    setActiveAction(action);
    setShowPinGate(true);
  };

  const executeAuthAction = async () => {
    if (pin !== SOVEREIGN_PIN) {
      alert("INVALID_SOVEREIGN_PIN");
      setPin("");
      return;
    }
    try {
      const endpoints = { 'BRIDGE': 'bridge', 'SETTLE': 'withdraw', 'GLOBAL': 'settle-global' };
      const res = await fetch(`http://localhost:3001/api/v1/admin/${endpoints[activeAction!]}`, { method: 'POST' });
      const data = await res.json();
      alert(activeAction === 'GLOBAL' ? `USD SETTLED: $${data.usd}` : "SUCCESS");
      setShowPinGate(false);
      setPin("");
    } catch (err) { console.error("Settlement Failure:", err); }
  };

  // 📡 Real-Time Sovereignty Pulse
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const res = await fetch('http://localhost:3001/api/v1/admin/revenue');
        if (res.ok) {
          const data = await res.json();
          setIsOnline(true);
          setUptime(prev => prev + 2); 
        } else {
          setIsOnline(false);
        }
      } catch { setIsOnline(false); }
    };
    checkStatus();
    const interval = setInterval(checkStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans pb-24 selection:bg-emerald-500 selection:text-black">
      {showPinGate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="bg-slate-900 border border-emerald-500/30 p-8 rounded-2xl w-80 shadow-2xl">
            <h2 className="text-emerald-500 font-mono text-[10px] font-bold tracking-[0.3em] mb-4 uppercase text-center">Auth_{activeAction}</h2>
            <input 
              type="password" 
              maxLength={4} 
              value={pin} 
              onChange={(e) => setPin(e.target.value)} 
              className="w-full bg-black border border-white/10 rounded-lg p-4 text-center text-3xl font-black focus:border-emerald-500 outline-none transition-all" 
              autoFocus 
            />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowPinGate(false)} className="flex-1 py-3 text-[10px] font-mono border border-white/10 rounded uppercase hover:bg-white/5 transition-colors">Cancel</button>
              <button onClick={executeAuthAction} className="flex-1 py-3 text-[10px] font-mono bg-emerald-500 text-black font-bold rounded uppercase hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20">Authorize</button>
            </div>
          </div>
        </div>
      )}

      <header className="mb-12 flex justify-between items-start border-b border-white/5 pb-8">
        <div>
          <h1 className="text-7xl font-black tracking-tighter text-emerald-500 italic drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]">LUMARIQ</h1>
          <div className="flex items-center gap-4 mt-2">
            <p className="text-slate-500 font-mono tracking-widest text-[10px] uppercase">Empire_Command_v6 // 40,000_Nodes_Live</p>
            <span className="text-[10px] font-mono text-emerald-500/50 uppercase tracking-widest">Uptime: {uptime}s</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => openAuth('GLOBAL')} className="px-4 py-2 rounded-lg font-mono text-[10px] font-bold bg-white text-black hover:bg-slate-200 transition-colors">GLOBAL_SETTLEMENT</button>
          <button 
            onClick={toggleLock} 
            className={`px-6 py-2 rounded-lg font-mono text-xs font-bold border transition-all duration-300 ${
              systemLocked 
                ? 'bg-red-500/20 text-red-500 border-red-500/40 shadow-[0_0_15px_rgba(239,68,68,0.2)]' 
                : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/40'
            }`}
          >
            {systemLocked ? 'OVERRIDE: ON' : 'SYSTEM_HEALTHY'}
          </button>
        </div>
      </header>

      <main className="max-w-[1900px] mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="col-span-1 space-y-8">
          <RevenueCard isLocked={systemLocked} />
          <GlobalVault />
          <GrowthForecaster />
          
          {/* 🌍 3D GEOSPATIAL ORACLE */}
          <div className="h-64 rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl bg-slate-900">
            <Globe />
          </div>

        </div>
        <div className="col-span-1 space-y-8">
          <DispatchTerminal />
          <Leaderboard />
        </div>
        <div className="col-span-2">
          <TransactionFeed />
        </div>
      </main>

      <AlertTicker />
    </div>
  );
}
export default App;
