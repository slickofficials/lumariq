import React, { useState, useEffect, useRef } from 'react';

export const DispatchTerminal = () => {
  const [logs, setLogs] = useState<string[]>([
    "LUMARIQ_TERMINAL_v6.0: ONLINE...", 
    "AWAITING_COMMAND_INPUT..."
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of logs
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isProcessing) return;

    const cmd = input.toUpperCase().trim();
    setLogs(prev => [...prev, `> ${cmd}`]);
    setInput("");
    setIsProcessing(true);

    // --- COMMAND REGISTRY ---
    switch (cmd) {
      case "HELP":
        addLog("COMMANDS: EXECUTE SURGE, SYSTEM STATUS, CLEAR");
        setIsProcessing(false);
        break;

      case "CLEAR":
        setLogs(["CONSOLE_PURGED."]);
        setIsProcessing(false);
        break;

      case "SYSTEM STATUS":
        addLog("ALL SYSTEMS: OPTIMAL.");
        addLog("UPLINK: SECURE (TELEGRAM).");
        addLog("DB: POSTGRES_LINKED.");
        setIsProcessing(false);
        break;

      case "EXECUTE SURGE":
        addLog("INITIATING WHALE PROTOCOL...");
        try {
          const res = await fetch('http://localhost:3001/api/v1/admin/inject-whale', { method: 'POST' });
          const data = await res.json();
          addLog(`SUCCESS: CAPTURED ${data.amount.toFixed(2)} GHS`);
          addLog(">> SENTRY ALERT SENT TO PHONE");
        } catch (err) {
          addLog("ERROR: UPLINK FAILED.");
        }
        setIsProcessing(false);
        break;

      default:
        addLog(`ERROR: UNKNOWN COMMAND "${cmd}"`);
        setIsProcessing(false);
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, msg]);
  };

  return (
    <div className="bg-black rounded-3xl border border-white/10 p-6 h-[250px] flex flex-col font-mono text-xs shadow-2xl relative overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
        <span className="text-emerald-500 font-bold tracking-widest">DISPATCH_CLI // ROOT</span>
        <div className="flex gap-2">
           <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
        </div>
      </div>

      {/* Log Output */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-1 mb-4 text-slate-400 scrollbar-hide">
        {logs.map((log, i) => (
          <p key={i} className={log.startsWith(">") ? "text-white font-bold" : "text-emerald-500/80"}>
            {log}
          </p>
        ))}
        {isProcessing && <p className="text-emerald-500 animate-pulse">PROCESSING...</p>}
      </div>

      {/* Input Field */}
      <form onSubmit={handleCommand} className="relative">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">{'>'}</span>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full bg-transparent text-white pl-4 focus:outline-none uppercase placeholder:text-slate-700"
          placeholder="ENTER COMMAND..."
          autoFocus
        />
      </form>
    </div>
  );
};
