'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, Terminal, Send, Play, Loader, CheckCircle2, ChevronRight,
  Database, RefreshCw, Activity, Cpu, HardDrive, Globe, Zap, Info, ShieldAlert
} from 'lucide-react';

interface ConsoleSandboxProps {
  sessionUser: any;
  setActiveModal: (modal: any) => void;
}

export default function ConsoleSandbox({ sessionUser, setActiveModal }: ConsoleSandboxProps) {
  const [activeTab, setActiveTab] = useState<'invoice' | 'webhook' | 'terminal'>('invoice');

  // --- TAB 1: Invoicely States ---
  const [clientName, setClientName] = useState('ACME Tech Corp');
  const [itemName, setItemName] = useState('Standard Edge VM Cluster Allocation');
  const [qty, setQty] = useState(12);
  const [rate, setRate] = useState(25);
  const taxRate = 18;

  // --- TAB 2: Webhook States ---
  const [webhookUrl, setWebhookUrl] = useState('https://api.venvex.com/v1/broadcast');
  const [payload, setPayload] = useState(
    JSON.stringify({ event: 'system.operational', source: 'edge-node-4', status: 'active' }, null, 2)
  );
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([]);
  const [pulseActive, setPulseActive] = useState(false);

  // --- TAB 3: Terminal States ---
  const [terminalInput, setTerminalInput] = useState('');
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    'VENVEX Core OS v1.2.0-STABLE',
    'Session established at edge-node-us-east-1',
    'Type "help" to list available subsystem commands.',
    ''
  ]);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [terminalHistory]);

  const handleInvoiceAccess = () => {
    if (sessionUser) {
      setActiveModal('dashboard');
    } else {
      setActiveModal('auth');
    }
  };

  const handleBroadcast = () => {
    try {
      JSON.parse(payload); // Validate JSON
      setBroadcasting(true);
      setPulseActive(true);
      const timestamp = new Date().toLocaleTimeString();
      setBroadcastLog(prev => [`[${timestamp}] Initiating broadcast relay...`, ...prev]);

      setTimeout(() => {
        setBroadcastLog(prev => [
          `[${timestamp}] POST ${webhookUrl} -> HTTP 200 OK`,
          `[${timestamp}] Telemetry: { relayed: true, nodes: 12, latencyMs: 14 }`,
          ...prev
        ]);
        setBroadcasting(false);
        setTimeout(() => setPulseActive(false), 800);
      }, 1000);
    } catch (err) {
      alert('Invalid JSON structure in payload.');
    }
  };

  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalInput.trim()) return;

    const cmd = terminalInput.trim().toLowerCase();
    let response: string[] = [];

    switch (cmd) {
      case 'help':
        response = [
          'Available commands:',
          '  telemetry   - View live edge VM resource indicators',
          '  status      - Display global edge nodes online statuses',
          '  modules     - List VENVEX modules catalog details',
          '  manifesto   - Print VENVEX core manifesto values',
          '  clear       - Clear terminal session history'
        ];
        break;
      case 'telemetry':
        response = [
          'VENVEX Edge VM Telemetry:',
          '  CPU: 1.2% usage [scaling idle]',
          '  Memory: 64MB / Node [V8 Sandboxed]',
          '  Latency: 11.4ms global average',
          '  Active Nodes: 12 (Vercel Edge Platform)'
        ];
        break;
      case 'status':
        response = [
          'Node Status Telemetry:',
          '  edge-us-east-1:       ONLINE (10ms)',
          '  edge-eu-central-1:    ONLINE (12ms)',
          '  edge-ap-northeast-1: ONLINE (14ms)',
          '  Database Synced:      TRUE'
        ];
        break;
      case 'modules':
        response = [
          'VENVEX Storefront Modules Catalog:',
          '  Module 01: Invoicely (GST billing generator - 0.04s generation)',
          '  Module 02: Route (low-latency webhook routing - 99.999% uptime)',
          '  Module 03: Allocation Pending (cryptographic queue)'
        ];
        break;
      case 'manifesto':
        response = [
          'VENVEX manifesto:',
          '  1. Monolithic platforms have failed modern workflows.',
          '  2. Micro-utilities should compile on global edge servers.',
          '  3. Pure utility is beautiful.'
        ];
        break;
      case 'clear':
        setTerminalHistory([]);
        setTerminalInput('');
        return;
      default:
        response = [`Command not found: "${cmd}". Type "help" for options.`];
    }

    setTerminalHistory(prev => [...prev, `venvex@core:~$ ${terminalInput}`, ...response, '']);
    setTerminalInput('');
  };

  const calculatedSubtotal = qty * rate;
  const calculatedGST = calculatedSubtotal * (taxRate / 100);
  const calculatedGrandTotal = calculatedSubtotal + calculatedGST;

  return (
    <div className="relative bg-slate-950/80 border border-border-dark rounded-xl p-4 md:p-8 backdrop-blur-md overflow-hidden flex flex-col md:flex-row gap-6 items-stretch w-full max-w-4xl mx-auto shadow-2xl">
      
      {/* Sidebar Controls (Left) */}
      <div className="md:w-1/3 flex flex-col justify-between space-y-6 text-left border-b md:border-b-0 md:border-r border-border-dark pb-6 md:pb-0 md:pr-6">
        <div className="space-y-4">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-card-bg border border-border-dark w-fit text-[9px] font-mono tracking-widest text-accent-emerald uppercase">
            <span className="flex h-1.5 w-1.5 rounded-full bg-accent-emerald animate-ping" />
            CONSOLE ACTIVE
          </div>

          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">VENVEX Console</h3>
          <p className="text-xs text-text-slate leading-relaxed font-sans">
            Interact with the core software modules in real-time before staging to production.
          </p>

          {/* Tab Navigation */}
          <div className="flex flex-col gap-2 font-mono text-xs">
            <button
              onClick={() => setActiveTab('invoice')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-left transition ${
                activeTab === 'invoice' 
                  ? 'bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald' 
                  : 'hover:bg-card-bg text-text-slate'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Invoicely Sandbox</span>
            </button>
            <button
              onClick={() => setActiveTab('webhook')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-left transition ${
                activeTab === 'webhook' 
                  ? 'bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald' 
                  : 'hover:bg-card-bg text-text-slate'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Route Webhook</span>
            </button>
            <button
              onClick={() => setActiveTab('terminal')}
              className={`flex items-center gap-2 px-3 py-2 rounded text-left transition ${
                activeTab === 'terminal' 
                  ? 'bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald' 
                  : 'hover:bg-card-bg text-text-slate'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Shell Console</span>
            </button>
          </div>
        </div>

        {/* Console latency telemetry */}
        <div className="pt-4 border-t border-border-dark text-[10px] font-mono text-text-slate space-y-1">
          <div className="flex justify-between">
            <span>PING NODE:</span>
            <span className="text-accent-emerald font-bold">11.4ms [US-EAST]</span>
          </div>
          <div className="flex justify-between">
            <span>STATE METADATA:</span>
            <span className="text-accent-emerald">SHA-256 SECURED</span>
          </div>
        </div>
      </div>

      {/* Dynamic Tab Body (Right) */}
      <div className="flex-1 min-h-[380px] flex flex-col justify-stretch">
        
        {/* Tab 1: Invoicely (A4 Preview) */}
        {activeTab === 'invoice' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col md:flex-row gap-4 items-stretch justify-stretch"
          >
            {/* Input Panel */}
            <div className="md:w-2/5 flex flex-col justify-center space-y-3 text-left text-xs font-mono">
              <div>
                <label className="block text-[9px] text-text-slate uppercase mb-1">Client Name</label>
                <input 
                  type="text" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full bg-dark-bg/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-emerald"
                />
              </div>
              <div>
                <label className="block text-[9px] text-text-slate uppercase mb-1">Item Description</label>
                <input 
                  type="text" 
                  value={itemName} 
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full bg-dark-bg/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-emerald"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] text-text-slate uppercase mb-1">Quantity</label>
                  <input 
                    type="number" 
                    value={qty} 
                    onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-dark-bg/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-emerald"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-text-slate uppercase mb-1">Rate ($)</label>
                  <input 
                    type="number" 
                    value={rate} 
                    onChange={(e) => setRate(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-dark-bg/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-emerald"
                  />
                </div>
              </div>
              <button 
                onClick={handleInvoiceAccess}
                className="w-full mt-2 py-2 rounded bg-accent-emerald text-dark-bg font-bold font-mono text-[10px] uppercase hover:bg-emerald-400 transition"
              >
                Access Billing Core →
              </button>
            </div>

            {/* A4 Paper Layout Preview */}
            <div className="flex-1 bg-white text-slate-900 rounded-lg p-5 shadow-2xl flex flex-col justify-between text-left relative transform md:rotate-1 hover:rotate-0 transition duration-300">
              <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-100 to-transparent pointer-events-none rounded-tr-lg" />
              <div>
                <div className="flex justify-between items-start border-b border-slate-300 pb-2">
                  <div>
                    <div className="text-base font-black tracking-widest font-mono text-slate-900">VENVEX</div>
                    <div className="text-[7px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Core Software Suite</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-bold tracking-widest uppercase">INVOICE</div>
                    <div className="text-[7px] font-mono text-slate-400">#INV-2026-009</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 my-3.5 text-[8px] font-mono">
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[6px] mb-0.5">ISSUER</div>
                    <div className="font-bold text-slate-700">Venvex Core Systems, Inc.</div>
                    <div className="text-slate-500">Edge US-EAST-1</div>
                  </div>
                  <div>
                    <div className="text-slate-400 font-bold uppercase tracking-wider text-[6px] mb-0.5">BILLED TO</div>
                    <div className="font-bold text-slate-700">{clientName || 'Client Name'}</div>
                    <div className="text-slate-500">Sandbox Node</div>
                  </div>
                </div>

                <table className="w-full text-left border-collapse text-[8px] my-3.5 font-mono">
                  <thead>
                    <tr className="border-b border-slate-300 text-[6px] font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-1">Description</th>
                      <th className="py-1 text-right">Qty</th>
                      <th className="py-1 text-right">Rate</th>
                      <th className="py-1 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-slate-100">
                      <td className="py-2 font-medium text-slate-800 truncate max-w-[120px]">{itemName || 'Item Description'}</td>
                      <td className="py-2 text-right">{qty}</td>
                      <td className="py-2 text-right">${rate.toFixed(2)}</td>
                      <td className="py-2 text-right">${calculatedSubtotal.toFixed(2)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="flex justify-between items-end border-t border-slate-200 pt-2.5 mt-auto">
                <div className="border-2 border-accent-emerald text-accent-emerald text-[7px] font-black tracking-widest uppercase px-2 py-0.5 rounded rotate-[-4deg] font-mono animate-pulse">
                  PAID // COMPILED
                </div>
                <div className="text-right space-y-0.5 text-[8px] w-1/2 font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Subtotal:</span>
                    <span>${calculatedSubtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>GST ({taxRate}%):</span>
                    <span>${calculatedGST.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold border-t border-slate-300 pt-1 text-[10px]">
                    <span>Grand Total:</span>
                    <span>${calculatedGrandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 2: Webhook broadcater */}
        {activeTab === 'webhook' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col gap-4 text-left"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              
              {/* Webhook Settings */}
              <div className="space-y-3 text-xs font-mono">
                <div>
                  <label className="block text-[9px] text-text-slate uppercase tracking-wider mb-1">Target Routing URL</label>
                  <input 
                    type="text" 
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-emerald"
                  />
                </div>
                <div>
                  <label className="block text-[9px] text-text-slate uppercase tracking-wider mb-1">JSON Payload (POST)</label>
                  <textarea 
                    rows={4}
                    value={payload}
                    onChange={(e) => setPayload(e.target.value)}
                    className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-accent-emerald resize-none"
                  />
                </div>
                <button
                  onClick={handleBroadcast}
                  disabled={broadcasting}
                  className="w-full py-2 bg-accent-emerald text-dark-bg font-bold font-mono text-[10px] uppercase hover:bg-emerald-400 transition flex items-center justify-center gap-1.5"
                >
                  {broadcasting ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Broadcast payload</>}
                </button>
              </div>

              {/* Graphic coordinator map */}
              <div className="bg-dark-bg border border-border-dark rounded-lg p-4 flex flex-col justify-between font-mono relative overflow-hidden">
                <div className="text-[9px] text-text-slate uppercase tracking-wider mb-2">// Network Coordinate Map</div>
                
                {/* Node graph representation */}
                <div className="relative h-28 flex items-center justify-between px-6 z-10">
                  {/* Connection Line */}
                  <div className="absolute top-1/2 left-10 right-10 h-0.5 bg-slate-800 -translate-y-1/2" />
                  
                  {/* Glowing Pulse */}
                  {pulseActive && (
                    <motion.div 
                      initial={{ left: '15%' }}
                      animate={{ left: '85%' }}
                      transition={{ duration: 0.8, ease: 'easeInOut' }}
                      className="absolute top-1/2 w-2 h-2 rounded-full bg-accent-emerald -translate-y-1/2 shadow-[0_0_10px_#10B981]"
                    />
                  )}

                  {/* Node 1 */}
                  <div className="relative flex flex-col items-center">
                    <div className="w-8 h-8 rounded-full bg-card-bg border border-border-dark flex items-center justify-center text-[10px] text-accent-emerald font-bold z-10">
                      G
                    </div>
                    <span className="text-[7px] text-text-slate mt-1">Gateway</span>
                  </div>

                  {/* Node 2 */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full bg-card-bg border flex items-center justify-center text-[10px] font-bold z-10 transition-colors ${
                      pulseActive ? 'border-accent-emerald text-accent-emerald' : 'border-border-dark text-text-slate'
                    }`}>
                      R
                    </div>
                    <span className="text-[7px] text-text-slate mt-1">Router</span>
                  </div>

                  {/* Node 3 */}
                  <div className="relative flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full bg-card-bg border flex items-center justify-center text-[10px] font-bold z-10 transition-colors ${
                      pulseActive ? 'border-accent-emerald text-accent-emerald animate-pulse' : 'border-border-dark text-text-slate'
                    }`}>
                      D
                    </div>
                    <span className="text-[7px] text-text-slate mt-1">Deploy</span>
                  </div>
                </div>

                {/* Console logs */}
                <div className="bg-black/80 border border-border-dark/60 rounded p-2 h-16 overflow-y-auto text-[7px] text-green-400 space-y-0.5">
                  {broadcastLog.length === 0 ? (
                    <div className="text-text-slate">// Telemetry standing by...</div>
                  ) : (
                    broadcastLog.map((log, index) => <div key={index}>{log}</div>)
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Tab 3: Shell Console */}
        {activeTab === 'terminal' && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col bg-black border border-border-dark rounded-lg p-4 font-mono text-xs text-left"
          >
            <div className="flex-1 overflow-y-auto h-52 space-y-1 text-[10px] text-green-400 scrollbar-thin">
              {terminalHistory.map((line, index) => (
                <div key={index} className="whitespace-pre-wrap leading-relaxed">{line}</div>
              ))}
              <div ref={terminalEndRef} />
            </div>

            <form onSubmit={handleTerminalSubmit} className="flex gap-2 items-center border-t border-border-dark/60 pt-2.5 mt-2">
              <span className="text-accent-emerald font-bold">venvex@core:~$</span>
              <input 
                type="text"
                value={terminalInput}
                onChange={(e) => setTerminalInput(e.target.value)}
                placeholder="type 'help'..."
                className="flex-1 bg-transparent text-white focus:outline-none font-mono text-[10px]"
              />
              <button type="submit" className="text-accent-emerald hover:text-emerald-400">
                <Play className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}

      </div>

    </div>
  );
}
