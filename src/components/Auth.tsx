'use client';

import React, { useState } from 'react';
import { Mail, Loader, CheckCircle2, AlertCircle, ShieldAlert } from 'lucide-react';
import { supabase, hasSupabaseConfig } from '@/lib/supabaseClient';

interface AuthProps {
  onSession: (userEmail: string, sessionUser: any) => void;
}

export default function Auth({ onSession }: AuthProps) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [demoLogin, setDemoLogin] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    setMessage(null);

    const isConfigured = hasSupabaseConfig();

    if (isConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOtp({
          email,
          options: {
            emailRedirectTo: window.location.origin,
          },
        });

        if (error) throw error;

        setMessage({
          type: 'success',
          text: 'Magic link sent! Check your inbox to sign in.',
        });
      } catch (err: any) {
        setMessage({
          type: 'error',
          text: err.message || 'Authentication request failed.',
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Mock mode auth animation
      setDemoLogin(true);
      setTimeout(() => {
        setMessage({
          type: 'success',
          text: 'Demo Mode: Simulating magic link transmission...',
        });
        setTimeout(() => {
          // Autologin after 2.5 seconds
          const mockUser = { id: 'mock-uuid-123', email };
          onSession(email, mockUser);
          setLoading(false);
          setDemoLogin(false);
        }, 1800);
      }, 700);
    }
  };

  const handleDirectDemo = () => {
    setLoading(true);
    setTimeout(() => {
      onSession('demo@invoicely.io', { id: 'demo-user-id', email: 'demo@invoicely.io' });
      setLoading(false);
    }, 500);
  };

  return (
    <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-xl p-8 shadow-2xl flex flex-col space-y-6">
      
      {/* Title / Logo */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 mb-2">
          <span className="text-xl font-black font-sans tracking-wider">In</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-white font-sans">
          Welcome to <span className="text-amber-500 font-black">Invoicely</span>
        </h2>
        <p className="text-xs text-slate-400 max-w-xs mx-auto">
          The zero-bloat GST invoice engine for Indian freelancers, developers, and micro-SaaS creators.
        </p>
      </div>

      {!hasSupabaseConfig() && (
        <div className="bg-amber-950/20 border border-amber-900/30 px-3.5 py-2.5 rounded-lg flex gap-2.5 items-start text-xs text-amber-400/90 font-sans">
          <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Supabase Config Not Found:</span> Running in fully-functional local sandbox. Enter any email to begin.
          </div>
        </div>
      )}

      {/* Auth Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1.5">
            Business Email
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
              disabled={loading}
              className="w-full bg-slate-900/60 border border-slate-800 focus:border-amber-500/60 text-white rounded-lg py-2.5 pl-11 pr-4 text-sm focus:outline-none transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2.5 rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_4px_12px_rgba(245,158,11,0.15)] active:scale-[0.98]"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin text-slate-950" />
          ) : (
            'Send Magic Sign-In Link'
          )}
        </button>
      </form>

      {/* Direct Sandbox Trigger */}
      <div className="relative flex py-2 items-center">
        <div className="flex-grow border-t border-slate-800/80"></div>
        <span className="flex-shrink mx-3 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Or</span>
        <div className="flex-grow border-t border-slate-800/80"></div>
      </div>

      <button
        onClick={handleDirectDemo}
        disabled={loading}
        className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 font-semibold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
      >
        Enter Demo Sandbox Instantly
      </button>

      {/* Notifications */}
      {message && (
        <div
          className={`p-3.5 rounded-lg flex items-start gap-2.5 text-xs border ${
            message.type === 'success'
              ? 'bg-emerald-950/20 border-emerald-900/30 text-emerald-400'
              : 'bg-red-950/20 border-red-900/30 text-red-400'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="leading-relaxed font-sans">{message.text}</span>
        </div>
      )}

      {demoLogin && (
        <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/60 font-mono text-[10px] text-amber-500 space-y-1">
          <div className="animate-pulse flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>TRANSMITTING MAGIC TOKEN RELAY...</span>
          </div>
          <div className="text-slate-500">To: {email}</div>
          <div className="text-slate-500">Status: OK // Handshake bypass activated</div>
        </div>
      )}

    </div>
  );
}
