'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, ShieldCheck, Mail, ArrowRight, X, Play, 
  Settings, Loader, FileText, CheckCircle2, ChevronRight, 
  Activity, Zap, Info, Cpu, HardDrive, Globe, Trash2,
  DollarSign, Send, Copy, AlertCircle, FileSpreadsheet, Sparkles, Plus
} from 'lucide-react';
import InvoiceWorkspace from '@/components/InvoiceWorkspace';
import Auth from '@/components/Auth';
import Dashboard from '@/components/Dashboard';
import PaymentWall from '@/components/PaymentWall';
import { supabase, hasSupabaseConfig } from '@/lib/supabaseClient';

export default function Home() {
  // Navigation active links / simulated route
  const [activeTab, setActiveTab] = useState<'all' | 'specs' | 'changelog'>('all');

  // Real-time edge latency ticker state
  const [latency, setLatency] = useState(11.4);
  useEffect(() => {
    const interval = setInterval(() => {
      setLatency(prev => {
        const change = (Math.random() - 0.5) * 0.4;
        return parseFloat(Math.max(10, Math.min(14, prev + change)).toFixed(1));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Hero Interactive Invoice Preview State
  const [heroClient, setHeroClient] = useState('ACME Tech Corp');
  const [heroItem, setHeroItem] = useState('Standard Edge VM Cluster Allocation');
  const [heroQty, setHeroQty] = useState(12);
  const [heroRate, setHeroRate] = useState(25);
  const [heroTaxRate, setHeroTaxRate] = useState(18);

  // Modal states
  const [activeModal, setActiveModal] = useState<
    'invoice' | 'metadata' | 'webhook' | 'manifesto' | 'status' | 'auth' | 'dashboard' | 'paywall' | null
  >(null);

  // Auth / session states
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [userEmail, setUserEmail] = useState<string>('');

  // Local state fallbacks for sandbox mode
  const [localInvoices, setLocalInvoices] = useState<any[]>([]);
  const [localProfile, setLocalProfile] = useState<any>({
    company_name: '',
    company_address: '',
    company_gstin: '',
    bank_name: '',
    bank_account_no: '',
    bank_ifsc: '',
    is_paid: false
  });

  // Listen to Supabase Auth State changes if configured
  useEffect(() => {
    if (hasSupabaseConfig() && supabase) {
      // 1. Get current session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session && session.user) {
          setSessionUser(session.user);
          setUserEmail(session.user.email || '');
        }
      });

      // 2. Set up event listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session && session.user) {
          setSessionUser(session.user);
          setUserEmail(session.user.email || '');
          if (activeModal === 'auth') {
            setActiveModal('dashboard');
          }
        } else {
          setSessionUser(null);
          setUserEmail('');
          if (activeModal === 'dashboard' || activeModal === 'invoice') {
            setActiveModal(null);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [activeModal]);

  // Handle invoice generator card click
  const handleInvoiceGeneratorClick = () => {
    if (sessionUser) {
      setActiveModal('dashboard');
    } else {
      setActiveModal('auth');
    }
  };

  // Metadata Stripper state
  const [dragActive, setDragActive] = useState(false);
  const [strippingProgress, setStrippingProgress] = useState(0);
  const [strippedFile, setStrippedFile] = useState<string | null>(null);

  // Webhook Broadcaster state
  const [webhookUrl, setWebhookUrl] = useState('https://api.venvex.com/v1/broadcast');
  const [webhookPayload, setWebhookPayload] = useState(
    JSON.stringify({ event: 'system.operational', source: 'edge-node-4', status: 'active' }, null, 2)
  );
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([]);

  // Email subscribe state
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // Handle subscribe submit
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribeStatus('loading');
    setTimeout(() => {
      setSubscribeStatus('success');
      setEmail('');
      setTimeout(() => setSubscribeStatus('idle'), 4000);
    }, 1200);
  };

  // Simulate Metadata Stripping
  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      startPurge(e.dataTransfer.files[0].name);
    }
  };

  const simulateFileSelect = () => {
    startPurge('DSC_9821_RAW.jpg');
  };

  const startPurge = (filename: string) => {
    setStrippingProgress(10);
    setStrippedFile(null);
    const interval = setInterval(() => {
      setStrippingProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setStrippedFile(filename);
          return 100;
        }
        return prev + 15;
      });
    }, 150);
  };

  // Simulate Webhook Broadcast
  const triggerBroadcast = () => {
    try {
      JSON.parse(webhookPayload); // validate JSON
      setBroadcasting(true);
      const timestamp = new Date().toLocaleTimeString();
      setBroadcastLog(prev => [`[${timestamp}] Connecting to relay...`, ...prev]);

      setTimeout(() => {
        setBroadcastLog(prev => [
          `[${timestamp}] POST ${webhookUrl} -> HTTP 200 OK`,
          `[${timestamp}] Response: { "relayed": true, "nodes": 12, "latencyMs": 14 }`,
          ...prev
        ]);
        setBroadcasting(false);
      }, 1000);
    } catch (err) {
      alert('Invalid JSON structure in payload.');
    }
  };

  return (
    <div className="relative min-h-screen bg-dark-bg text-white selection:bg-accent-emerald selection:text-dark-bg overflow-x-hidden">
      {/* Raw vertical layout separator line running down the screen */}
      <div className="vertical-split-line" />

      {/* Dynamic Background Overlays */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none z-0" />
      <div className="absolute inset-0 radial-glow pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        
        {/* Navigation Bar */}
        <header className="py-6 border-b border-border-dark flex items-center justify-between z-20">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveModal(null)}>
            <div className="relative w-8 h-8 flex-shrink-0">
              <img 
                src="/venvex-logo.png" 
                alt="VENVEX Logo" 
                className="w-full h-full object-contain rounded-full shadow-[0_0_15px_rgba(0,242,254,0.2)] group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-xl font-bold tracking-[0.15em] text-white font-mono uppercase">VENVEX</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-mono font-bold uppercase tracking-wider text-text-slate">
            <button 
              onClick={() => {
                const el = document.getElementById('grid-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              [ Utilities ]
            </button>
            <button 
              onClick={() => {
                setActiveTab('specs');
                setActiveModal('status');
              }} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              [ Core Telemetry ]
            </button>
            <button 
              onClick={() => {
                setActiveModal('manifesto');
              }} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              [ Documentation ]
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#00F2FE] bg-cyan-950/20 border border-cyan-900/30 px-2.5 py-1 rounded shadow-[0_0_15px_rgba(0,242,254,0.05)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
              EDGE LOAD: {latency}MS
            </span>
            <button 
              onClick={() => {
                if (sessionUser) {
                  setActiveModal('dashboard');
                } else {
                  setActiveModal('auth');
                }
              }}
              className="relative group px-4 py-2 border border-accent-emerald text-accent-emerald font-mono text-[11px] uppercase tracking-wider hover:bg-accent-emerald hover:text-dark-bg transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] rounded cursor-pointer"
            >
              [ Access Core ]
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center py-12 md:py-20 z-10">
          <div className="text-center max-w-4xl mx-auto space-y-6 md:space-y-8">
            
            {/* Centered Upper Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded bg-card-bg border border-border-dark text-[10px] font-mono tracking-widest text-accent-emerald shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              [ SYSTEM LOG: VEN_CORE_ACTIVE ]
            </div>

            {/* Master Header */}
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white leading-none max-w-4xl mx-auto">
              A Suite of Single-Purpose<br className="hidden md:inline" /> Software Modules.<br />
              <span className="bg-gradient-to-r from-accent-emerald via-emerald-400 to-teal-400 bg-clip-text text-transparent font-mono">
                Built for Absolute Speed.
              </span>
            </h1>

            {/* Sub-text */}
            <p className="text-base sm:text-lg md:text-xl text-text-slate max-w-3xl mx-auto leading-relaxed">
              Venvex is a zero-bloat software ecosystem. We engineer razor-sharp, isolated micro-utilities designed to replace massive, heavy platforms with lightning-fast execution layers. No clutter. Just raw computing utility.
            </p>

            {/* Tactical Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 font-mono text-xs">
              <button 
                onClick={() => {
                  const el = document.getElementById('grid-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded bg-accent-emerald text-dark-bg font-bold hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] cursor-pointer"
              >
                [ Explore the Vault ] →
              </button>
              <button 
                onClick={() => setActiveModal('manifesto')}
                className="w-full sm:w-auto px-8 py-3.5 rounded bg-card-bg border border-border-dark text-white font-semibold hover:border-white transition-all duration-300 cursor-pointer"
              >
                [ View Documentation ]
              </button>
            </div>

            {/* Shifting A4 Interactive Preview */}
            <div className="relative mt-12 md:mt-20 w-full max-w-4xl mx-auto group z-20">
              {/* Ambient Glowing Background */}
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-r from-accent-emerald/10 to-teal-500/10 blur-xl opacity-50 group-hover:opacity-70 transition-opacity pointer-events-none" />
              
              {/* Frame Container */}
              <div className="relative bg-slate-950/80 border border-border-dark rounded-xl p-4 md:p-8 backdrop-blur-md overflow-hidden flex flex-col md:flex-row gap-6 items-stretch">
                {/* Control Panel (left) */}
                <div className="md:w-1/3 flex flex-col justify-between space-y-4 text-left border-b md:border-b-0 md:border-r border-border-dark pb-4 md:pb-0 md:pr-6">
                  <div className="space-y-4">
                    <div className="text-[10px] font-mono uppercase tracking-widest text-accent-emerald flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent-emerald animate-ping" />
                      Live Billing Engine
                    </div>
                    <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Invoicely Sandbox</h3>
                    <p className="text-xs text-text-slate leading-relaxed">
                      Modify layout values here to watch the compiled A4 template calculate instantly.
                    </p>
                    
                    <div className="space-y-2.5 text-xs font-mono">
                      <div>
                        <label className="block text-[9px] text-text-slate uppercase mb-1">Client Name</label>
                        <input 
                          type="text" 
                          value={heroClient} 
                          onChange={(e) => setHeroClient(e.target.value)}
                          className="w-full bg-dark-bg/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-emerald text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] text-text-slate uppercase mb-1">Item Description</label>
                        <input 
                          type="text" 
                          value={heroItem} 
                          onChange={(e) => setHeroItem(e.target.value)}
                          className="w-full bg-dark-bg/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-emerald text-xs"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[9px] text-text-slate uppercase mb-1">Quantity</label>
                          <input 
                            type="number" 
                            value={heroQty} 
                            onChange={(e) => setHeroQty(Math.max(1, Number(e.target.value)))}
                            className="w-full bg-dark-bg/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-emerald text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] text-text-slate uppercase mb-1">Rate ($)</label>
                          <input 
                            type="number" 
                            value={heroRate} 
                            onChange={(e) => setHeroRate(Math.max(0, Number(e.target.value)))}
                            className="w-full bg-dark-bg/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none focus:border-accent-emerald text-xs"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-border-dark text-[10px] font-mono text-text-slate space-y-1">
                    <div>RENDER LATENCY: <span className="text-accent-emerald font-bold">0.04s (Instant)</span></div>
                    <div>ENVELOPE SIGN: <span className="text-accent-emerald font-bold">SHA-256 SECURE</span></div>
                  </div>
                </div>
                
                {/* Hyper-realistic white A4 document layout preview (right) */}
                <div className="flex-1 bg-white text-slate-900 rounded-lg p-6 shadow-2xl flex flex-col justify-between min-h-[380px] text-left transform md:rotate-1 md:group-hover:rotate-0 transition-transform duration-300 relative">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-slate-100 to-transparent pointer-events-none rounded-tr-lg" />
                  <div>
                    {/* A4 Header */}
                    <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                      <div>
                        <div className="text-lg font-black tracking-widest font-mono text-slate-900">VENVEX</div>
                        <div className="text-[8px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Core Software Suite</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-bold tracking-widest uppercase">INVOICE</div>
                        <div className="text-[8px] font-mono text-slate-400 mt-0.5">#INV-2026-009</div>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 my-4 text-[9px] font-mono">
                      <div>
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-[7px] mb-0.5">ISSUER</div>
                        <div className="font-bold text-slate-800">Venvex Core Systems, Inc.</div>
                        <div className="text-slate-500">Edge Gateway Node US-01</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-[7px] mb-0.5">BILLED TO</div>
                        <div className="font-bold text-slate-800">{heroClient || 'Client Name'}</div>
                        <div className="text-slate-500">Sandbox Client Session</div>
                      </div>
                    </div>
                    
                    {/* Item Table */}
                    <table className="w-full text-left border-collapse text-[9px] my-4 font-mono">
                      <thead>
                        <tr className="border-b border-slate-300 text-[7px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-1">Description</th>
                          <th className="py-1 text-right">Qty</th>
                          <th className="py-1 text-right">Rate</th>
                          <th className="py-1 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2.5 font-medium text-slate-800">{heroItem || 'Item Description'}</td>
                          <td className="py-2.5 text-right">{heroQty}</td>
                          <td className="py-2.5 text-right">${heroRate.toFixed(2)}</td>
                          <td className="py-2.5 text-right">${(heroQty * heroRate).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Totals & Stamp */}
                  <div className="flex justify-between items-end border-t border-slate-200 pt-3 mt-auto">
                    {/* Paid Stamp */}
                    <div className="border-2 border-accent-emerald text-accent-emerald text-[8px] font-black tracking-widest uppercase px-2.5 py-0.5 rounded rotate-[-4deg] font-mono animate-pulse">
                      PAID // COMPILED
                    </div>
                    
                    <div className="text-right space-y-0.5 text-[9px] w-1/2 font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>Subtotal:</span>
                        <span>${(heroQty * heroRate).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>GST ({heroTaxRate}%):</span>
                        <span>${((heroQty * heroRate) * (heroTaxRate / 100)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold border-t border-slate-300 pt-1 text-xs">
                        <span>Grand Total:</span>
                        <span>${((heroQty * heroRate) * (1 + heroTaxRate / 100)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Bento Grid (UtilityVault) */}
          <section id="grid-section" className="mt-24 md:mt-36 space-y-8 scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-dark pb-4">
              <div>
                <span className="text-xs font-mono text-accent-emerald tracking-widest uppercase">// THE VAULT</span>
                <h2 className="text-2xl font-bold tracking-tight mt-1">Select Your Engine Component.</h2>
              </div>
              <div className="text-xs text-text-slate flex items-center gap-4 font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-accent-emerald" /> Active</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" /> Compiling</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-600" /> Planned</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Invoicely */}
              <div 
                onClick={handleInvoiceGeneratorClick}
                className="group relative bg-card-bg border border-border-dark rounded-xl p-6 flex flex-col justify-between h-[340px] cursor-pointer card-hover overflow-hidden"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-accent-emerald group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-accent-emerald bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/40">
                      Module 01
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-accent-emerald transition-colors font-mono">Invoicely Engine v1.0</h3>
                    <div className="text-[10px] font-mono text-text-slate uppercase tracking-wider">Mobile Billing / High-Speed Generation</div>
                    <p className="text-xs text-text-slate leading-relaxed">
                      A zero-bloat mobile billing utility designed for immediate execution. Generate hyper-minimalist, professional A4 invoices instantly without touching heavy enterprise accounting platforms.
                    </p>
                  </div>
                </div>

                {/* Minimalist professional white A4 preview widget breaking cleanly out of a dark container line */}
                <div className="absolute -bottom-4 left-6 right-6 h-20 bg-white border border-slate-200 shadow-2xl rounded-t-md p-2 overflow-hidden text-slate-800 flex flex-col justify-between text-[5px] font-mono transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex justify-between items-start border-b border-slate-300 pb-0.5">
                    <span className="font-bold tracking-tighter">VENVEX // INVOICELY</span>
                    <span>#INV-2026</span>
                  </div>
                  <div className="flex justify-between items-center text-[6px] font-bold">
                    <span className="text-accent-emerald font-black">PAID // EDGE</span>
                    <span>$1,440.00</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-dark/60 flex items-center justify-between text-[10px] font-mono relative z-10 bg-card-bg/90">
                  <span className="font-bold text-accent-emerald">
                    0.04s Generation Time
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-slate group-hover:text-accent-emerald group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Card 2: Webhooks (Route) */}
              <div 
                onClick={() => setActiveModal('webhook')}
                className="group relative bg-card-bg border border-border-dark rounded-xl p-6 flex flex-col justify-between h-[340px] cursor-pointer card-hover"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded bg-amber-950/20 border border-amber-900/30 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-amber-500 bg-amber-950/30 px-2.5 py-1 rounded border border-amber-900/30">
                      Module 02
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-amber-500 transition-colors font-mono">Venvex Route v1.2</h3>
                    <div className="text-[10px] font-mono text-text-slate uppercase tracking-wider">Automation / Data Routing</div>
                    <p className="text-xs text-text-slate leading-relaxed">
                      A low-latency automation and webhook engine engineered to process, filter, and pipe massive JSON streams across infrastructure layers without drops.
                    </p>
                  </div>
                </div>

                {/* Simulated Webhook logs in card */}
                <div className="bg-black/60 border border-border-dark/60 rounded p-2.5 h-16 font-mono text-[8px] text-green-400 overflow-hidden space-y-1">
                  <div>POST /v1/broadcast - HTTP 200 OK</div>
                  <div className="text-text-slate">{"{ relayed: true, nodes: 12, latencyMs: 14 }"}</div>
                </div>

                <div className="pt-4 border-t border-border-dark/60 flex items-center justify-between text-[10px] font-mono">
                  <span className="font-bold text-amber-500">
                    99.999% Core Uptime
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-slate group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Card 3: [ Empty Slot // Allocation Pending ] */}
              <div 
                className="group relative border border-dashed border-border-dark bg-transparent rounded-xl p-6 flex flex-col justify-between h-[340px] overflow-hidden card-hover"
              >
                {/* Dashed Background Grid overlay */}
                <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
                
                <div className="space-y-4 relative z-10">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded border border-dashed border-border-dark flex items-center justify-center text-text-slate">
                      <Plus className="w-5 h-5 text-text-slate" />
                    </div>
                    <span className="text-[10px] font-mono uppercase font-bold tracking-widest text-text-slate border border-dashed border-border-dark px-2.5 py-1 rounded">
                      Module 03
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-text-slate font-mono">Module 03 Allocation</h3>
                    <div className="text-[10px] font-mono text-text-slate uppercase tracking-wider">Pipeline / In Development</div>
                    <p className="text-xs text-text-slate leading-relaxed">
                      Slot reserved for incoming single-purpose developer utilities. Venvex is scaling rapidly, deploying dedicated processing tools directly into the unified dashboard ecosystem.
                    </p>
                  </div>
                </div>

                <div className="border border-dashed border-border-dark/60 rounded p-4 text-center font-mono text-[9px] text-text-slate relative z-10">
                  // ENCRYPTED PROTOCOL RESERVATION
                </div>

                <div className="pt-4 border-t border-dashed border-border-dark/60 flex items-center justify-between text-[10px] font-mono relative z-10 text-text-slate">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-slate-600" />
                    Status: Queued
                  </span>
                  <span>[ Pending ]</span>
                </div>
              </div>

            </div>
          </section>

          {/* High-Converting Bottom CTA */}
          <section className="mt-28 md:mt-36 max-w-4xl mx-auto w-full text-center space-y-6 md:space-y-8 pb-12">
            <div className="bg-gradient-to-b from-[#111625] to-[#0B0F19] border border-border-dark rounded-2xl p-8 md:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-accent-emerald/5 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-accent-emerald/5 rounded-full blur-3xl pointer-events-none" />
              
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Ready to Deploy?
              </h2>
              <p className="text-sm sm:text-base text-text-slate max-w-xl mx-auto mt-3 leading-relaxed">
                Stop paying for feature-bloat. Integrate isolated, high-performance tools directly into your active workflow layers.
              </p>
              
              <div className="mt-8">
                <button 
                  onClick={() => {
                    if (sessionUser) {
                      setActiveModal('dashboard');
                    } else {
                      setActiveModal('auth');
                    }
                  }}
                  className="px-8 py-3.5 rounded bg-accent-emerald text-dark-bg font-bold font-mono text-xs uppercase tracking-wider hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.25)] hover:scale-[1.02] cursor-pointer"
                >
                  [ Secure Instant Access ]
                </button>
              </div>
            </div>
          </section>
        </main>


        {/* Footer */}
        <footer className="mt-20 md:mt-32 border-t border-border-dark py-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10 bg-dark-bg/80 backdrop-blur-sm">
          <div className="space-y-2 max-w-sm text-center md:text-left font-mono">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <img 
                src="/venvex-logo.png" 
                alt="VENVEX Logo" 
                className="w-5 h-5 object-contain rounded-full" 
              />
              <span className="font-bold tracking-wider uppercase text-white">VENVEX</span>
              <span className="text-[10px] font-mono text-accent-emerald bg-emerald-950/50 border border-emerald-900/50 px-2 py-0.5 rounded">v1.2.0</span>
            </div>
            <p className="text-[11px] text-text-slate">
              High-performance, isolated software engines. Code licensed under MIT. © 2026 VENVEX Core.
            </p>
          </div>

          <div className="w-full max-w-md space-y-3">
            <h4 className="text-sm font-semibold text-white text-center md:text-left">
              Subscribe to the Engine Feed. Get pinged the minute a new tool drops.
            </h4>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <div className="relative flex-1">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-slate" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  required
                  className="w-full bg-card-bg border border-border-dark rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none focus:border-accent-emerald transition-colors"
                />
              </div>
              <button 
                type="submit"
                disabled={subscribeStatus === 'loading'}
                className="bg-accent-emerald hover:bg-emerald-400 disabled:bg-emerald-800 text-dark-bg font-bold px-5 py-2.5 rounded-lg text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {subscribeStatus === 'loading' ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : subscribeStatus === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <>
                    Join Feed <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
            <AnimatePresence>
              {subscribeStatus === 'success' && (
                <motion.p 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-xs text-accent-emerald text-center md:text-left flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Subscription verified. Welcome to the feed!
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </footer>

      </div>

      {/* Interactive Modals */}
      <AnimatePresence>
        
        {/* 0. Auth Modal */}
        {activeModal === 'auth' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <div className="relative">
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer z-10"
              >
                <X className="w-4.5 h-4.5 text-slate-400 hover:text-white" />
              </button>
              <Auth 
                onSession={(email, user) => {
                  setSessionUser(user);
                  setUserEmail(email);
                  setActiveModal('dashboard');
                }} 
              />
            </div>
          </div>
        )}

        {/* 1. Dashboard Modal */}
        {activeModal === 'dashboard' && sessionUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <Dashboard 
              userEmail={userEmail}
              sessionUser={sessionUser}
              onLogout={() => {
                setSessionUser(null);
                setUserEmail('');
                setActiveModal(null);
              }}
              onCreateInvoice={() => {
                setActiveModal('invoice');
              }}
              triggerPaywall={() => {
                setActiveModal('paywall');
              }}
              localInvoices={localInvoices}
              setLocalInvoices={setLocalInvoices}
              localProfile={localProfile}
              setLocalProfile={setLocalProfile}
            />
          </div>
        )}

        {/* 2. Invoice Generator Workspace Modal */}
        {activeModal === 'invoice' && sessionUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <InvoiceWorkspace 
              profile={localProfile}
              userEmail={userEmail}
              sessionUser={sessionUser}
              onClose={() => setActiveModal('dashboard')}
              onInvoiceCreated={(newInvoice) => {
                setLocalInvoices(prev => [newInvoice, ...prev]);
              }}
            />
          </div>
        )}

        {/* 3. Paywall Modal */}
        {activeModal === 'paywall' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
            <PaymentWall 
              userEmail={userEmail}
              onClose={() => setActiveModal('dashboard')}
            />
          </div>
        )}

        {/* 4. Metadata Stripper Modal */}
        {activeModal === 'metadata' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-card-bg border border-border-dark rounded-xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-500" />
                  <h3 className="font-bold text-lg">Secure Metadata Stripper</h3>
                </div>
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    setStrippingProgress(0);
                    setStrippedFile(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-text-slate hover:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-text-slate leading-relaxed">
                  Venvex purges hidden Exif, GPS coordinates, device models, and editing software logs from your photos and documents at the client edge. No data is sent to servers.
                </p>

                {/* File Drop Area */}
                <div 
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleFileDrop}
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer ${
                    dragActive 
                      ? 'border-accent-emerald bg-accent-emerald/5' 
                      : strippingProgress > 0 
                        ? 'border-amber-500/50 bg-amber-500/5' 
                        : 'border-border-dark hover:border-amber-500/50 hover:bg-white/5'
                  }`}
                  onClick={simulateFileSelect}
                >
                  {strippingProgress === 0 ? (
                    <div className="space-y-2">
                      <Trash2 className="w-8 h-8 mx-auto text-text-slate" />
                      <p className="text-sm font-semibold">Drag & drop raw photo here</p>
                      <p className="text-xs text-text-slate">or click to upload simulated raw photo (JPEG, PNG, RAW)</p>
                    </div>
                  ) : strippingProgress < 100 ? (
                    <div className="space-y-3">
                      <Loader className="w-8 h-8 mx-auto text-amber-500 animate-spin" />
                      <p className="text-sm font-semibold">Purging EXIF metadata payload...</p>
                      <div className="w-full bg-dark-bg rounded-full h-1.5 max-w-xs mx-auto overflow-hidden">
                        <div className="bg-amber-500 h-1.5 transition-all duration-150" style={{ width: `${strippingProgress}%` }} />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-accent-emerald" />
                      <p className="text-sm font-semibold text-accent-emerald">Sanitization Complete</p>
                      <p className="text-xs text-text-slate font-mono">{strippedFile} (EXIF Purged)</p>
                      <p className="text-[10px] text-accent-emerald bg-emerald-950/40 border border-emerald-900 px-3 py-1 rounded inline-block">
                        -12 GPS coordinates and device properties removed
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-border-dark">
                {strippedFile && (
                  <button 
                    onClick={() => {
                      alert('Simulated download: Sanitized photo file successfully created.');
                      setActiveModal(null);
                      setStrippingProgress(0);
                      setStrippedFile(null);
                    }}
                    className="bg-accent-emerald hover:bg-emerald-400 text-dark-bg font-bold px-4 py-2 rounded text-xs transition-colors cursor-pointer"
                  >
                    Download Sanitized File
                  </button>
                )}
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    setStrippingProgress(0);
                    setStrippedFile(null);
                  }}
                  className="px-4 py-2 bg-dark-bg border border-border-dark hover:border-white rounded text-xs transition-colors font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 5. Webhook Broadcaster Modal */}
        {activeModal === 'webhook' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-card-bg border border-border-dark rounded-xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-accent-emerald" />
                  <h3 className="font-bold text-lg">Webhook Broadcaster</h3>
                </div>
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    setBroadcastLog([]);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-text-slate hover:text-white" />
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm text-text-slate leading-relaxed">
                  Validate your APIs, integrations, and serverless edge functions by broadcasting secure payloads to any HTTP endpoint.
                </p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-text-slate uppercase tracking-wider mb-1">Target URL</label>
                    <input 
                      type="text" 
                      value={webhookUrl}
                      onChange={(e) => setWebhookUrl(e.target.value)}
                      className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent-emerald"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-text-slate uppercase tracking-wider mb-1">JSON Payload (POST)</label>
                    <textarea 
                      rows={5}
                      value={webhookPayload}
                      onChange={(e) => setWebhookPayload(e.target.value)}
                      className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-accent-emerald"
                    />
                  </div>

                  <div>
                    <button 
                      onClick={triggerBroadcast}
                      disabled={broadcasting}
                      className="w-full bg-accent-emerald hover:bg-emerald-400 disabled:bg-emerald-800 text-dark-bg font-bold py-2 rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {broadcasting ? <Loader className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Trigger Broadcast Relay</>}
                    </button>
                  </div>
                </div>

                {/* Log Terminal */}
                <div className="space-y-1">
                  <span className="block text-xs font-semibold text-text-slate uppercase tracking-wider">Console Output</span>
                  <div className="bg-black border border-border-dark rounded-lg p-3 h-32 overflow-y-auto font-mono text-[10px] text-green-400 space-y-1">
                    {broadcastLog.length === 0 ? (
                      <span className="text-text-slate">// Waiting for transmission...</span>
                    ) : (
                      broadcastLog.map((log, index) => (
                        <div key={index} className={log.includes('HTTP 200') ? 'text-accent-emerald' : ''}>{log}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border-dark">
                <button 
                  onClick={() => {
                    setActiveModal(null);
                    setBroadcastLog([]);
                  }}
                  className="px-4 py-2 bg-dark-bg border border-border-dark hover:border-white rounded text-xs transition-colors font-semibold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 6. Manifesto Modal */}
        {activeModal === 'manifesto' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-card-bg border border-border-dark rounded-xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-accent-emerald" />
                  <h3 className="font-bold text-lg font-mono uppercase tracking-wider text-white">The VENVEX Manifesto</h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-text-slate hover:text-white" />
                </button>
              </div>

              <div className="space-y-4 text-sm text-text-slate leading-relaxed">
                <p className="font-semibold text-white">
                  1. Monolithic platforms have failed modern workflows.
                </p>
                <p>
                  Today's developers rent subscription platforms costing hundreds of dollars a month just to leverage one or two essential operations, like PDF exports or EXIF cleansing.
                </p>
                <p className="font-semibold text-white">
                  2. Micro-utilities should compile on global edge servers.
                </p>
                <p>
                  By shipping modular, sandboxed single-purpose endpoints, we can guarantee zero loading bloat, instant processing, and absolute security without cookies or tracker pipelines.
                </p>
                <p className="font-semibold text-white">
                  3. Pure utility is beautiful.
                </p>
                <p>
                  No configuration wizard setup. No account sign-up wall. Deployed at the edge, run by you, clean UI/UX, optimized by AI agents.
                </p>
              </div>

              <div className="flex justify-end pt-4 border-t border-border-dark">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 bg-accent-emerald hover:bg-emerald-400 text-dark-bg font-bold rounded text-xs transition-colors cursor-pointer"
                >
                  Understand & Approve
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* 7. Edge Server System Status Modal */}
        {activeModal === 'status' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-xl bg-card-bg border border-border-dark rounded-xl p-6 shadow-2xl space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-accent-emerald animate-pulse" />
                  <h3 className="font-bold text-lg">Cluster telemetry dashboard</h3>
                </div>
                <button 
                  onClick={() => setActiveModal(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-text-slate hover:text-white" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                <div className="bg-dark-bg p-4 border border-border-dark rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-text-slate">
                    <Globe className="w-4 h-4 text-accent-emerald" />
                    <span>Global Network</span>
                  </div>
                  <div className="text-base font-bold">12 Active Edges</div>
                  <div className="text-[10px] text-accent-emerald">Vercel Edge Platform</div>
                </div>

                <div className="bg-dark-bg p-4 border border-border-dark rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-text-slate">
                    <Zap className="w-4 h-4 text-accent-emerald" />
                    <span>Avg Latency</span>
                  </div>
                  <div className="text-base font-bold">11.4 ms</div>
                  <div className="text-[10px] text-accent-emerald">99.99% Core Uptime</div>
                </div>

                <div className="bg-dark-bg p-4 border border-border-dark rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-text-slate">
                    <Cpu className="w-4 h-4 text-accent-emerald" />
                    <span>Edge VM CPU</span>
                  </div>
                  <div className="text-base font-bold">1.2% usage</div>
                  <div className="text-[10px] text-text-slate">Dynamic scaling</div>
                </div>

                <div className="bg-dark-bg p-4 border border-border-dark rounded-lg space-y-2">
                  <div className="flex items-center gap-1.5 text-text-slate">
                    <HardDrive className="w-4 h-4 text-accent-emerald" />
                    <span>Edge Memory</span>
                  </div>
                  <div className="text-base font-bold">64 MB / Node</div>
                  <div className="text-[10px] text-text-slate">Sandboxed v8 engines</div>
                </div>
              </div>

              <div className="bg-black border border-border-dark rounded-lg p-4 font-mono text-[10px] text-text-slate space-y-1.5">
                <div className="text-accent-emerald font-bold">// Edge Routing Diagnostics</div>
                <div>Edge Node us-east-1: HTTP 200 - OK (10ms)</div>
                <div>Edge Node eu-central-1: HTTP 200 - OK (12ms)</div>
                <div>Edge Node ap-northeast-1: HTTP 200 - OK (14ms)</div>
              </div>

              <div className="flex justify-end pt-4 border-t border-border-dark">
                <button 
                  onClick={() => setActiveModal(null)}
                  className="px-6 py-2 bg-accent-emerald hover:bg-emerald-400 text-dark-bg font-bold rounded text-xs transition-colors cursor-pointer"
                >
                  Close Telemetry
                </button>
              </div>
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
