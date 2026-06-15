'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Terminal, ShieldCheck, Mail, ArrowRight, X, Play, 
  Settings, Loader, FileText, CheckCircle2, ChevronRight, 
  Activity, Zap, Info, Cpu, HardDrive, Globe, Trash2,
  DollarSign, Send, Copy, AlertCircle, FileSpreadsheet
} from 'lucide-react';
import InvoiceWorkspace from '@/components/InvoiceWorkspace';

export default function Home() {
  // Navigation active links / simulated route
  const [activeTab, setActiveTab] = useState<'all' | 'specs' | 'changelog'>('all');

  // Modal states
  const [activeModal, setActiveModal] = useState<
    'invoice' | 'metadata' | 'webhook' | 'manifesto' | 'status' | null
  >(null);

  // Invoice generator state (delegated to workspace)

  // Metadata Stripper state
  const [dragActive, setDragActive] = useState(false);
  const [strippingProgress, setStrippingProgress] = useState(0);
  const [strippedFile, setStrippedFile] = useState<string | null>(null);

  // Webhook Broadcaster state
  const [webhookUrl, setWebhookUrl] = useState('https://api.utilityos.com/v1/broadcast');
  const [webhookPayload, setWebhookPayload] = useState(
    JSON.stringify({ event: 'system.operational', source: 'edge-node-4', status: 'active' }, null, 2)
  );
  const [broadcasting, setBroadcasting] = useState(false);
  const [broadcastLog, setBroadcastLog] = useState<string[]>([]);

  // Email subscribe state
  const [email, setEmail] = useState('');
  const [subscribeStatus, setSubscribeStatus] = useState<'idle' | 'loading' | 'success'>('idle');

  // formatCurrency moved to workspace

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
      {/* Dynamic Background Overlays */}
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none z-0" />
      <div className="absolute inset-0 radial-glow pointer-events-none z-0" />

      {/* Main Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col min-h-screen">
        
        {/* Navigation Bar */}
        <header className="py-6 border-b border-border-dark flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveModal(null)}>
            <div className="w-8 h-8 rounded bg-gradient-to-tr from-accent-emerald to-emerald-400 flex items-center justify-center font-bold text-dark-bg shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              U
            </div>
            <span className="text-xl font-bold tracking-tight text-white glow-text">UtilityOS</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-text-slate">
            <button 
              onClick={() => setActiveTab('all')} 
              className={`hover:text-white transition-colors py-1 relative ${activeTab === 'all' ? 'text-white' : ''}`}
            >
              All Tools
              {activeTab === 'all' && (
                <motion.div layoutId="nav-line" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-emerald" />
              )}
            </button>
            <button 
              onClick={() => {
                setActiveTab('specs');
                setActiveModal('status');
              }} 
              className="hover:text-white transition-colors py-1 relative"
            >
              Core Specs
            </button>
            <button 
              onClick={() => {
                setActiveTab('changelog');
                alert('UtilityOS v1.0.0 Changelog: \n- Initial launch of UtilityOS core container.\n- Added Invoice Generator flag.\n- Placed EXIF Stripper in compiler pipeline.\n- Deployed global Edge network endpoints.');
              }} 
              className="hover:text-white transition-colors py-1 relative"
            >
              Changelog
            </button>
          </nav>

          <div>
            <button 
              onClick={() => setActiveModal('status')}
              className="group relative flex items-center gap-2.5 px-4 py-2 rounded-full bg-card-bg border border-border-dark text-xs font-semibold hover:border-accent-emerald transition-all duration-300 shadow-[0_4px_12px_rgba(0,0,0,0.5)] cursor-pointer"
            >
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-emerald opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-accent-emerald"></span>
              </span>
              <span className="text-text-slate group-hover:text-white transition-colors">System Status: <span className="text-accent-emerald font-bold">Online</span></span>
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <main className="flex-1 flex flex-col justify-center py-12 md:py-20">
          <div className="text-center max-w-3xl mx-auto space-y-6 md:space-y-8">
            
            {/* Centered Upper Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-card-bg border border-border-dark text-xs font-medium text-accent-emerald shadow-inner">
              <span className="flex h-2 w-2 rounded-full bg-accent-emerald animate-pulse" />
              🛠️ Portfolio Run: 20 Mini-Apps Live Progress
            </div>

            {/* Master Header */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-none">
              Single-purpose code.<br />
              <span className="bg-gradient-to-r from-accent-emerald via-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Zero operational bloat.
              </span>
            </h1>

            {/* Sub-text */}
            <p className="text-base sm:text-lg md:text-xl text-text-slate max-w-2xl mx-auto leading-relaxed">
              Stop renting complex, massive enterprise software platforms just to use one simple feature. UtilityOS deploys lightning-fast, hyper-focused micro-utilities exactly when you need them.
            </p>

            {/* Tactical Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button 
                onClick={() => {
                  const el = document.getElementById('grid-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-accent-emerald text-dark-bg font-bold text-sm hover:bg-emerald-400 transition-all duration-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] hover:scale-[1.02] cursor-pointer"
              >
                Explore Core Tools
              </button>
              <button 
                onClick={() => setActiveModal('manifesto')}
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-card-bg border border-border-dark text-white font-semibold text-sm hover:border-accent-emerald hover:text-accent-emerald transition-all duration-300 cursor-pointer"
              >
                Read the Manifesto
              </button>
            </div>
          </div>

          {/* Micro-SaaS Tool Grid */}
          <section id="grid-section" className="mt-20 md:mt-32 space-y-8 scroll-mt-24">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-border-dark pb-4">
              <div>
                <h2 className="text-xl font-bold">Micro-SaaS Pipeline</h2>
                <p className="text-sm text-text-slate">Click fully operational tools to boot them instantly in your environment.</p>
              </div>
              <div className="text-xs text-text-slate flex items-center gap-4">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-accent-emerald" /> Active</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" /> Compiling</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-gray-600" /> Planned</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1: Invoice Generator */}
              <div 
                onClick={() => setActiveModal('invoice')}
                className="group relative bg-card-bg border border-border-dark rounded-xl p-6 flex flex-col justify-between h-72 cursor-pointer card-hover"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded bg-emerald-950/50 border border-emerald-900 flex items-center justify-center text-accent-emerald group-hover:scale-110 transition-transform">
                      <FileText className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-accent-emerald bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-900/50">
                      Flagship
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-accent-emerald transition-colors">Invoice Generator</h3>
                    <p className="text-sm text-text-slate leading-relaxed">
                      Instant client PDF layout billing with custom templates and zero watermarks.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-dark/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-accent-emerald flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
                    Fully Operational / Click to Boot
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-slate group-hover:text-accent-emerald group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Card 2: Secure Metadata Stripper */}
              <div 
                onClick={() => setActiveModal('metadata')}
                className="group relative bg-card-bg border border-border-dark rounded-xl p-6 flex flex-col justify-between h-72 cursor-pointer card-hover"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded bg-amber-950/20 border border-amber-900/30 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-amber-500 bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-900/40 animate-pulse">
                      Edge Dev
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-amber-500 transition-colors">Secure Metadata Stripper</h3>
                    <p className="text-sm text-text-slate leading-relaxed">
                      Drop any media file to purge tracking EXIF data instantly before publishing.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-dark/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-amber-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    Compiling
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-slate group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                </div>
              </div>

              {/* Card 3: Webhook Broadcaster */}
              <div 
                onClick={() => setActiveModal('webhook')}
                className="group relative bg-card-bg border border-border-dark rounded-xl p-6 flex flex-col justify-between h-72 cursor-pointer card-hover"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="w-10 h-10 rounded bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-500 group-hover:scale-110 transition-transform">
                      <Terminal className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-gray-500 bg-gray-900 px-2.5 py-1 rounded-full border border-gray-800">
                      Queue
                    </span>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold group-hover:text-white transition-colors">Webhook Broadcaster</h3>
                    <p className="text-sm text-text-slate leading-relaxed">
                      Test your live backend connection relays with raw structural JSON data payload payloads.
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border-dark/60 flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-600" />
                    Planned
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-slate group-hover:text-white group-hover:translate-x-1 transition-all" />
                </div>
              </div>

            </div>
          </section>

          {/* Infrastructure Callout */}
          <section className="mt-20 md:mt-32 max-w-4xl mx-auto">
            <div className="relative bg-gradient-to-r from-card-bg to-dark-bg border-l-2 border-accent-emerald rounded-r-xl p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-accent-emerald/5 rounded-full blur-2xl" />
              <blockquote className="text-lg md:text-xl font-medium italic text-white/90 leading-relaxed">
                "Engineered on global edge networks. Built entirely with AI agent automation. Deployed instantly to Vercel."
              </blockquote>
              <div className="mt-4 flex items-center gap-3">
                <div className="flex -space-x-2">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-accent-emerald to-emerald-500 border-2 border-card-bg flex items-center justify-center text-[8px] font-bold text-dark-bg">AI</div>
                  <div className="w-7 h-7 rounded-full bg-gray-800 border-2 border-card-bg flex items-center justify-center text-[8px] font-bold text-white">V</div>
                  <div className="w-7 h-7 rounded-full bg-accent-emerald/10 border-2 border-card-bg flex items-center justify-center text-[8px] font-bold text-accent-emerald">🗲</div>
                </div>
                <span className="text-xs text-text-slate font-medium">UtilityOS Infrastructure Cluster // Node-01</span>
              </div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="mt-20 md:mt-32 border-t border-border-dark py-12 flex flex-col md:flex-row items-center justify-between gap-8 z-10 bg-dark-bg/80 backdrop-blur-sm">
          <div className="space-y-2 max-w-sm text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="font-bold tracking-tight">UtilityOS</span>
              <span className="text-[10px] font-mono text-accent-emerald bg-emerald-950/50 border border-emerald-900/50 px-2 py-0.5 rounded">v1.0.0</span>
            </div>
            <p className="text-xs text-text-slate">
              Open source edge-native toolbelt. Code licensed under MIT. © 2026 UtilityOS Hub.
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
        
        {/* 1. Invoice Generator Modal */}
        {activeModal === 'invoice' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <InvoiceWorkspace onClose={() => setActiveModal(null)} />
          </div>
        )}

        {/* 2. Metadata Stripper Modal */}
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
                  UtilityOS purges hidden Exif, GPS coordinates, device models, and editing software logs from your photos and documents at the client edge. No data is sent to servers.
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

        {/* 3. Webhook Broadcaster Modal */}
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

        {/* 4. Manifesto Modal */}
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
                  <h3 className="font-bold text-lg">The UtilityOS Manifesto</h3>
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

        {/* 5. Edge Server System Status Modal */}
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
