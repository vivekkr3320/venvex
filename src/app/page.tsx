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

const TechBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    {/* Grid Overlay */}
    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,242,254,0.01)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,242,254,0.01)_1px,transparent_1px)] bg-[size:32px_32px]" />

    {/* SVG Circuits & Honeycombs */}
    <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="cyan-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#00F2FE" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#0B0F19" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="emerald-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.10" />
          <stop offset="100%" stopColor="#0B0F19" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Glows */}
      <rect x="0" y="0" width="100%" height="100%" fill="url(#cyan-glow)" className="opacity-70" />
      <circle cx="20%" cy="40%" r="400" fill="url(#emerald-glow)" />
      <circle cx="80%" cy="60%" r="400" fill="url(#cyan-glow)" />

      {/* Hexagonal Mesh (Left Side) */}
      <path 
        d="M 50,200 L 100,170 L 150,200 L 150,260 L 100,290 L 50,260 Z M 150,200 L 200,170 L 250,200 L 250,260 L 200,290 L 150,260" 
        stroke="rgba(0, 242, 254, 0.05)" 
        strokeWidth="1" 
        fill="none" 
      />
      <path 
        d="M 100,290 L 150,320 L 150,380 L 100,410 L 50,380 L 50,320 Z" 
        stroke="rgba(16, 185, 129, 0.04)" 
        strokeWidth="1" 
        fill="none" 
      />

      {/* Hexagonal Mesh (Right Side) */}
      <path 
        d="M 900,400 L 950,370 L 1000,400 L 1000,460 L 950,490 L 900,460 Z M 1000,400 L 1050,370 L 1100,400 L 1100,460 L 1050,490 L 1000,460" 
        stroke="rgba(0, 242, 254, 0.05)" 
        strokeWidth="1" 
        fill="none" 
      />

      {/* Circuit lines */}
      <path d="M 0,150 L 150,150 L 200,200 L 300,200" stroke="rgba(0, 242, 254, 0.12)" strokeWidth="1" fill="none" />
      <path d="M 150,150 L 180,120 L 280,120" stroke="rgba(16, 185, 129, 0.1)" strokeWidth="1" fill="none" />
      <path d="M 1000,250 L 900,250 L 850,300 L 700,300" stroke="rgba(0, 242, 254, 0.12)" strokeWidth="1" fill="none" />

      {/* Nodes */}
      <circle cx="300" cy="200" r="3" fill="#00F2FE" />
      <circle cx="280" cy="120" r="2.5" fill="#10B981" />
      <circle cx="700" cy="300" r="3" fill="#00F2FE" />
    </svg>

    {/* Floating Code Snippets */}
    <div className="absolute top-[22%] left-[6%] font-mono text-[8px] text-[#00F2FE]/10 select-none hidden lg:block space-y-1">
      <div>const relay = new WebhookRelay();</div>
      <div>relay.on('packet', (data) =&gt; {"{"}</div>
      <div className="pl-4">process.stdout.write(data.sign);</div>
      <div>{"}"});</div>
    </div>

    <div className="absolute top-[48%] right-[4%] font-mono text-[8px] text-[#10B981]/10 select-none hidden lg:block space-y-1">
      <div># VENVEX CORE CONFIGURATION</div>
      <div>PORT=3000</div>
      <div>SECURITY_LEVEL=MAX</div>
      <div>LATENCY_BUDGET=12ms</div>
    </div>
  </div>
);

const ScrewHead = ({ className = '' }: { className?: string }) => (
  <div className={`screw-head absolute ${className}`} />
);

const RockerSwitch = ({
  label,
  active,
  onChange
}: {
  label: string;
  active: boolean;
  onChange: (val: boolean) => void;
}) => {
  return (
    <div className="flex items-center justify-between font-mono text-[9px] text-slate-400">
      <span className="uppercase tracking-wider">{label}</span>
      <div 
        className={`rocker-switch ${active ? 'active' : ''}`}
        onClick={() => onChange(!active)}
      >
        <div className="rocker-switch-toggle" />
      </div>
    </div>
  );
};

const RotaryKnob = ({ 
  label, 
  value, 
  min, 
  max, 
  onChange, 
  suffix = '' 
}: { 
  label: string; 
  value: number; 
  min: number; 
  max: number; 
  onChange: (val: number) => void;
  suffix?: string;
}) => {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const percent = (value - min) / (max - min);
    const angle = percent * 270 - 135;
    setRotation(angle);
  }, [value, min, max]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startValue = value;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const deltaY = startY - moveEvent.clientY;
      const range = max - min;
      const step = range / 120;
      const newValue = Math.max(min, Math.min(max, Math.round(startValue + deltaY * step)));
      onChange(newValue);
    };

    const handleMouseUp = () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="knob-container">
      <span className="text-[8px] font-mono text-slate-400 uppercase mb-1 tracking-wider">{label}</span>
      <div 
        className="knob-dial"
        style={{ transform: `rotate(${rotation}deg)` }}
        onMouseDown={handleMouseDown}
      >
        <div className="knob-pointer" />
      </div>
      <span className="text-[9px] font-mono text-white mt-1.5 font-bold">
        {value}{suffix}
      </span>
    </div>
  );
};

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
    setActiveModal('manifesto');
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

  const exportInvoice = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - VENVEX</title>
          <style>
            body { font-family: monospace; padding: 40px; color: #111; }
            .header { display: flex; justify-content: space-between; border-bottom: 2px solid #000; padding-bottom: 10px; }
            .meta { display: grid; grid-cols: 2; gap: 20px; margin: 20px 0; font-size: 12px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 12px; }
            th { border-bottom: 1px solid #000; padding: 5px 0; text-align: left; }
            td { padding: 8px 0; }
            .totals { margin-top: 30px; text-align: right; font-size: 12px; }
            .stamp { border: 2px solid #10B981; color: #10B981; padding: 5px; display: inline-block; transform: rotate(-4deg); font-weight: bold; font-size: 10px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #333; padding-bottom: 15px;">
            <div>
              <h2 style="margin: 0; font-size: 20px; letter-spacing: 2px;">VENVEX</h2>
              <p style="font-size: 9px; color: #666; margin: 5px 0 0 0; letter-spacing: 1px;">CORE SOFTWARE SUITE</p>
            </div>
            <div style="text-align: right;">
              <h2 style="margin: 0; font-size: 18px; letter-spacing: 1px;">INVOICE</h2>
              <p style="font-size: 9px; color: #666; margin: 5px 0 0 0;">#INV-2026-009</p>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; margin: 30px 0; font-size: 11px;">
            <div>
              <strong style="font-size: 8px; color: #888;">ISSUER</strong><br/>
              <strong>Venvex Core Systems, Inc.</strong><br/>
              Edge Gateway Node US-01
            </div>
            <div style="text-align: right;">
              <strong style="font-size: 8px; color: #888;">BILLED TO</strong><br/>
              <strong>${heroClient}</strong><br/>
              Sandbox Client Session
            </div>
          </div>
          <table style="width: 100%; border-collapse: collapse; margin: 35px 0; font-size: 11px;">
            <thead>
              <tr style="border-b: 1px solid #aaa; font-size: 9px; color: #666;">
                <th style="padding: 6px 0; border-bottom: 1px solid #ccc;">Description</th>
                <th style="padding: 6px 0; border-bottom: 1px solid #ccc; text-align: right;">Qty</th>
                <th style="padding: 6px 0; border-bottom: 1px solid #ccc; text-align: right;">Rate</th>
                <th style="padding: 6px 0; border-bottom: 1px solid #ccc; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="padding: 12px 0; font-weight: bold; border-bottom: 1px solid #eee;">${heroItem}</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">${heroQty}</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">$${heroRate.toFixed(2)}</td>
                <td style="padding: 12px 0; border-bottom: 1px solid #eee; text-align: right;">$${(heroQty * heroRate).toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          <div style="margin-left: auto; width: 250px; font-size: 11px; margin-top: 30px;">
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #666;">
              <span>Subtotal:</span>
              <span>$${(heroQty * heroRate).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #666;">
              <span>GST (${heroTaxRate}%):</span>
              <span>$${((heroQty * heroRate) * (heroTaxRate / 100)).toFixed(2)}</span>
            </div>
            <div style="display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #333; font-weight: bold; font-size: 13px; margin-top: 5px;">
              <span>Grand Total:</span>
              <span>$${((heroQty * heroRate) * (1 + heroTaxRate / 100)).toFixed(2)}</span>
            </div>
          </div>
          <div style="margin-top: 50px; border: 2px solid #10B981; color: #10B981; padding: 8px 12px; display: inline-block; transform: rotate(-3deg); font-weight: bold; font-size: 10px; letter-spacing: 1px;">
            PAID // COMPILED via VENVEX
          </div>
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.currentTarget.style.setProperty('--x', `${x}px`);
    e.currentTarget.style.setProperty('--y', `${y}px`);
  };

  return (
    <div className="relative min-h-screen bg-dark-bg text-white selection:bg-accent-emerald selection:text-dark-bg overflow-x-hidden">
      {/* Raw vertical layout separator line running down the screen */}
      <div className="vertical-split-line" />

      {/* Dynamic Background Overlays */}
      <TechBackground />

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
              [ Architecture ]
            </button>
            <button 
              onClick={() => {
                setActiveTab('specs');
                setActiveModal('status');
              }} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              [ Live Network ]
            </button>
            <button 
              onClick={() => {
                setActiveModal('manifesto');
              }} 
              className="hover:text-white transition-colors cursor-pointer"
            >
              [ Manifesto ]
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[9px] font-mono tracking-widest text-[#00F2FE] bg-cyan-950/20 border border-cyan-900/30 px-2.5 py-1 rounded shadow-[0_0_15px_rgba(0,242,254,0.05)]">
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#00F2FE] animate-pulse" />
              EDGE LOAD: {latency}MS
            </span>
            <button 
              onClick={() => {
                setActiveModal('manifesto');
              }}
              className="relative group px-4 py-2 border border-accent-emerald text-accent-emerald font-mono text-[11px] uppercase tracking-wider hover:bg-accent-emerald hover:text-dark-bg transition-all duration-300 shadow-[0_0_15px_rgba(16,185,129,0.15)] rounded cursor-pointer"
            >
              [ Initialize System ]
            </button>
          </div>
        </header>

        {/* Restructured Mockup Layout */}
        <main className="flex-1 flex flex-col justify-center py-10 md:py-16 z-10 relative">
          
          {/* Shifting A4 Interactive Preview on a 3D Pedestal */}
          <div className="relative mt-8 md:mt-12 w-full max-w-5xl mx-auto z-20 flex flex-col md:flex-row gap-8 items-center justify-center">
            
            {/* Sleek, collapsible Sandbox Input Controller (Floating on the left) */}
            <div className="w-full md:w-[260px] bg-slate-900 border border-slate-950 rounded-xl p-5 text-left shadow-2xl relative z-30 self-center brushed-metal overflow-hidden">
              <div className="glass-plate-gloss" />
              {/* Corner Screws */}
              <ScrewHead className="top-2 left-2" />
              <ScrewHead className="top-2 right-2" />
              <ScrewHead className="bottom-2 left-2" />
              <ScrewHead className="bottom-2 right-2" />

              <div className="text-[10px] font-mono text-accent-emerald mb-4 tracking-widest flex items-center gap-1.5 uppercase pl-2 font-bold">
                <span className="flex led-indicator led-green animate-pulse" />
                Console Desk
              </div>
              <div className="space-y-4 font-mono text-xs relative z-10 px-1">
                <div>
                  <label className="block text-[8px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Target Identity Node</label>
                  <input 
                    type="text" 
                    value={heroClient} 
                    onChange={(e) => setHeroClient(e.target.value)}
                    className="w-full bg-black/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none transition-all text-[10px] font-mono engraved-well"
                  />
                </div>
                <div>
                  <label className="block text-[8px] text-slate-400 uppercase tracking-wider mb-1 font-bold">Operation Protocol</label>
                  <input 
                    type="text" 
                    value={heroItem} 
                    onChange={(e) => setHeroItem(e.target.value)}
                    className="w-full bg-black/60 border border-border-dark rounded px-2.5 py-1.5 text-white focus:outline-none transition-all text-[10px] font-mono engraved-well"
                  />
                </div>

                {/* Tactile Rotary Knobs side-by-side */}
                <div className="grid grid-cols-2 gap-2 pt-2 pb-1 border-t border-b border-white/5">
                  <RotaryKnob 
                    label="Rate ($)" 
                    value={heroRate} 
                    min={0} 
                    max={150} 
                    onChange={(val) => setHeroRate(val)} 
                  />
                  <RotaryKnob 
                    label="Quantity" 
                    value={heroQty} 
                    min={1} 
                    max={50} 
                    onChange={(val) => setHeroQty(val)} 
                  />
                </div>

                {/* Tactile Switch to Toggle paid status */}
                <div className="pt-1">
                  <RockerSwitch 
                    label="PAID STATE"
                    active={heroTaxRate === 18} 
                    onChange={(val) => setHeroTaxRate(val ? 18 : 0)}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/5 text-[9px] font-mono text-slate-400 mt-4 space-y-1 relative z-10 pl-1">
                <div className="flex items-center gap-1.5">
                  <span className="flex led-indicator led-green" />
                  COMPILE SPEED: <span className="text-accent-emerald font-bold">0.04s</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="flex led-indicator led-amber" />
                  SECURITY: <span className="text-amber-500">SHA-256</span>
                </div>
              </div>
            </div>

            {/* Tilted Pedestal + A4 invoice block */}
            <div className="pedestal-wrap flex-1 flex justify-center items-center">
              <div className="pedestal-slab brushed-metal">
                {/* Corner Screws */}
                <ScrewHead className="top-3 left-3" />
                <ScrewHead className="top-3 right-3" />
                <ScrewHead className="bottom-3 left-3" />
                <ScrewHead className="bottom-3 right-3" />

                {/* Neon Cyan Base Shadow underneath */}
                <div className="pedestal-glow" />

                {/* Hyper-realistic white A4 document layout preview */}
                <div className="bg-white text-slate-900 rounded-lg p-5 flex flex-col justify-between min-h-[360px] text-left relative overflow-hidden shadow-[0_30px_60px_-15px_rgba(0,0,0,0.8),inset_0_-2px_4px_rgba(0,0,0,0.1),inset_0_2px_4px_rgba(255,255,255,0.2)] border border-slate-300">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-slate-100 to-transparent pointer-events-none rounded-tr-lg" />
                  <div>
                    {/* A4 Header */}
                    <div className="flex justify-between items-start border-b border-slate-900 pb-2">
                      <div>
                        <div className="text-base font-black tracking-widest font-mono text-slate-900">VENVEX</div>
                        <div className="text-[7px] font-mono text-slate-400 uppercase tracking-widest mt-0.5">Core Software Suite</div>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold tracking-widest uppercase">TELEMETRY</div>
                        <div className="text-[7px] font-mono text-slate-400 mt-0.5">#TEL-2026-CORE</div>
                      </div>
                    </div>
                    
                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 my-3 text-[8px] font-mono">
                      <div>
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-[6px] mb-0.5">REGISTRY</div>
                        <div className="font-bold text-slate-800">Venvex Core Systems, Inc.</div>
                        <div className="text-slate-500">Edge Gateway Node US-01</div>
                      </div>
                      <div>
                        <div className="text-slate-400 font-bold uppercase tracking-wider text-[6px] mb-0.5">TARGET NODE</div>
                        <div className="font-bold text-slate-800">{heroClient || 'Client Name'}</div>
                        <div className="text-slate-500">Sandbox Client Session</div>
                      </div>
                    </div>
                    
                    {/* Item Table */}
                    <table className="w-full text-left border-collapse text-[8px] my-3 font-mono">
                      <thead>
                        <tr className="border-b border-slate-300 text-[6px] font-bold text-slate-400 uppercase tracking-wider">
                          <th className="py-1">Operation Protocol</th>
                          <th className="py-1 text-right">Rate</th>
                          <th className="py-1 text-right">Offset</th>
                          <th className="py-1 text-right">Load Quotient</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-100">
                          <td className="py-2 font-medium text-slate-800 truncate max-w-[120px]">{heroItem || 'Item Description'}</td>
                          <td className="py-2 text-right">{heroQty}</td>
                          <td className="py-2 text-right">${heroRate.toFixed(2)}</td>
                          <td className="py-2 text-right">${(heroQty * heroRate).toFixed(2)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Totals & Stamp */}
                  <div className="flex justify-between items-end border-t border-slate-200 pt-2 mt-auto">
                    {/* Paid Stamp & Print Action */}
                    <div className="flex flex-col gap-1 items-start">
                      {heroTaxRate === 18 ? (
                        <div className="border border-accent-emerald text-accent-emerald text-[7px] font-black tracking-widest uppercase px-2 py-0.5 rounded rotate-[-4deg] font-mono animate-pulse bg-emerald-50/50">
                          VERIFIED // SIGNED
                        </div>
                      ) : (
                        <div className="border border-amber-500 text-amber-500 text-[7px] font-black tracking-widest uppercase px-2 py-0.5 rounded rotate-[2deg] font-mono">
                          STAGE // LOCAL
                        </div>
                      )}
                      <button 
                        onClick={exportInvoice}
                        className="px-2 py-0.5 rounded bg-slate-900 text-white font-mono text-[7px] uppercase tracking-wider hover:bg-black hover:text-accent-emerald transition-all cursor-pointer"
                      >
                        [ Export Metric ]
                      </button>
                    </div>
                    
                    <div className="text-right space-y-0.5 text-[8px] w-1/2 font-mono">
                      <div className="flex justify-between text-slate-500">
                        <span>Base Load:</span>
                        <span>${(heroQty * heroRate).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500">
                        <span>Variance ({heroTaxRate}%):</span>
                        <span>${((heroQty * heroRate) * (heroTaxRate / 100)).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-slate-900 font-bold border-t border-slate-300 pt-1 text-[9px]">
                        <span>Net System Load:</span>
                        <span>${((heroQty * heroRate) * (1 + heroTaxRate / 100)).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Symmetrical Sided Bento Row (Matching the layout mockup) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center mt-12 md:mt-16 z-20">
            
            {/* Left Column: Glass Invoicely Card */}
            <div 
              onClick={handleInvoiceGeneratorClick}
              onMouseMove={handleMouseMove}
              className="group glass-card glass-plate spotlight-card rounded-xl p-6 flex flex-col justify-between h-[280px] cursor-pointer overflow-hidden text-left"
            >
              <div className="glass-plate-gloss" />
              {/* Corner Screws */}
              <ScrewHead className="top-2.5 left-2.5" />
              <ScrewHead className="top-2.5 right-2.5" />
              <ScrewHead className="bottom-2.5 left-2.5" />
              <ScrewHead className="bottom-2.5 right-2.5" />

              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded bg-emerald-950/30 border border-emerald-900/50 flex items-center justify-center text-accent-emerald group-hover:scale-110 transition-transform relative z-10">
                    <FileText className="w-4 h-4" />
                  </div>
                  <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-accent-emerald bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/40 relative z-10">
                    ENGINE I
                  </span>
                </div>
                <div className="space-y-1 relative z-10">
                  <h3 className="text-base font-bold group-hover:text-accent-emerald transition-colors font-mono text-white">Invoicely Core v1.0</h3>
                  <div className="text-[9px] font-mono text-text-slate uppercase tracking-wider">High-Speed Document Compilation</div>
                  <p className="text-xs text-text-slate leading-relaxed pt-2">
                    A zero-bloat gateway utility designed for mathematical compiling. Model and generate precise telemetry sheets with instant hardware latency output.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-border-dark/60 flex items-center justify-between text-[9px] font-mono relative z-10">
                <span className="font-bold text-accent-emerald">
                  0.04s Execution
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-text-slate group-hover:text-accent-emerald group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            {/* Center Column: Center CTA Layout */}
            <div className="flex flex-col items-center justify-center space-y-5 text-center px-4">
              {/* Centered System Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-slate-950/80 border border-white/5 text-[9px] font-mono tracking-widest text-[#10B981] shadow-inner uppercase">
                <span className="flex h-1.5 w-1.5 rounded-full bg-[#10B981] animate-pulse" />
                [ VENVEX CORE INITIATIVE ]
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-[-0.03em] text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400 font-sans">
                The VENVEX Core
              </h2>
              
              <p className="text-xs text-text-slate max-w-xs leading-relaxed">
                Precision-engineered developer systems. Deploying local-first, low-latency telemetry structures directly to gateway nodes.
              </p>
              
              <div className="pt-2">
                <button 
                  onClick={() => {
                    setActiveModal('manifesto');
                  }}
                  className="px-8 py-3.5 rounded glow-button text-dark-bg font-bold font-mono text-xs uppercase tracking-wider hover:scale-[1.02] transition-all cursor-pointer animate-pulse"
                >
                  [ Open Core Manifesto ]
                </button>
              </div>
            </div>

            {/* Right Column: Module 03 Allocation Card */}
            <div 
              onMouseMove={handleMouseMove}
              className="group glass-card glass-plate spotlight-card border border-dashed border-border-dark rounded-xl p-6 flex flex-col justify-between h-[280px] overflow-hidden text-left"
            >
              <div className="glass-plate-gloss" />
              {/* Corner Screws */}
              <ScrewHead className="top-2.5 left-2.5" />
              <ScrewHead className="top-2.5 right-2.5" />
              <ScrewHead className="bottom-2.5 left-2.5" />
              <ScrewHead className="bottom-2.5 right-2.5" />

              {/* Dashed Background Grid overlay */}
              <div className="absolute inset-0 bg-[radial-gradient(#1f293d_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
              
              <div className="space-y-4 relative z-10">
                <div className="flex justify-between items-start">
                  <div className="w-9 h-9 rounded border border-dashed border-border-dark flex items-center justify-center text-text-slate">
                    <Plus className="w-4 h-4 text-text-slate" />
                  </div>
                  <span className="text-[9px] font-mono uppercase font-bold tracking-widest text-text-slate border border-dashed border-border-dark px-2 py-0.5 rounded">
                    ENGINE III
                  </span>
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-text-slate font-mono">Registry Allocation</h3>
                  <div className="text-[9px] font-mono text-text-slate uppercase tracking-wider">Cryptographic Processing / Queued</div>
                  <p className="text-xs text-text-slate leading-relaxed pt-2">
                    Expansion registry reserved for incoming micro-services. Modeling parallel thread gateways and low-level diagnostic engines.
                  </p>
                </div>
              </div>

              <div className="border border-dashed border-border-dark/60 rounded py-1.5 text-center font-mono text-[8px] text-text-slate relative z-10">
                // SECURE REGISTER SEQUENCE
              </div>

              <div className="pt-3 border-t border-dashed border-border-dark/60 flex items-center justify-between text-[9px] font-mono relative z-10 text-text-slate">
                <span className="font-bold flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                  Registry State: Locked
                </span>
                <span>[ Pending ]</span>
              </div>
            </div>

          </div>

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
