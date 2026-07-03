'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, LogOut, Settings, CreditCard, 
  Trash2, Download, CheckCircle2, ShieldAlert, Sparkles, Building, User, Mail, X 
} from 'lucide-react';
import { supabase, hasSupabaseConfig } from '@/lib/supabaseClient';
import { generateInvoicePDF } from '@/lib/generatePDF';

interface CalculatedItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  gstRate: number;
  taxable: number;
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email: string;
  client_address: string;
  client_gstin: string;
  invoice_date: string;
  due_date: string;
  is_igst: boolean;
  items: CalculatedItem[];
  subtotal: number;
  cgst_total: number;
  sgst_total: number;
  igst_total: number;
  grand_total: number;
  created_at: string;
}

interface Profile {
  company_name: string;
  company_address: string;
  company_gstin: string;
  bank_name: string;
  bank_account_no: string;
  bank_ifsc: string;
  is_paid: boolean;
}

interface DashboardProps {
  userEmail: string;
  sessionUser: any;
  onLogout: () => void;
  onCreateInvoice: () => void;
  triggerPaywall: () => void;
  // Local state sync callbacks for sandbox mode
  localInvoices: Invoice[];
  setLocalInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
  localProfile: Profile;
  setLocalProfile: React.Dispatch<React.SetStateAction<Profile>>;
}

export default function Dashboard({
  userEmail,
  sessionUser,
  onLogout,
  onCreateInvoice,
  triggerPaywall,
  localInvoices,
  setLocalInvoices,
  localProfile,
  setLocalProfile
}: DashboardProps) {
  // UI Panels
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);

  // Forms profile details
  const [companyName, setCompanyName] = useState('');
  const [companyAddress, setCompanyAddress] = useState('');
  const [companyGstin, setCompanyGstin] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isPaid, setIsPaid] = useState(false);

  const isConfigured = hasSupabaseConfig();

  // 1. Fetch Profile & Invoices on Mount
  useEffect(() => {
    async function loadData() {
      setLoading(true);
      if (isConfigured && supabase && sessionUser) {
        try {
          // Fetch Profile
          const { data: profileData, error: profileErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionUser.id)
            .single();

          if (profileErr && profileErr.code !== 'PGRST116') {
            throw profileErr;
          }

          if (profileData) {
            setCompanyName(profileData.company_name || '');
            setCompanyAddress(profileData.company_address || '');
            setCompanyGstin(profileData.company_gstin || '');
            setBankName(profileData.bank_name || '');
            setBankAccountNo(profileData.bank_account_no || '');
            setBankIfsc(profileData.bank_ifsc || '');
            setIsPaid(profileData.is_paid || false);
            
            // Sync local profile state as well
            setLocalProfile({
              company_name: profileData.company_name || '',
              company_address: profileData.company_address || '',
              company_gstin: profileData.company_gstin || '',
              bank_name: profileData.bank_name || '',
              bank_account_no: profileData.bank_account_no || '',
              bank_ifsc: profileData.bank_ifsc || '',
              is_paid: profileData.is_paid || false
            });
          } else {
            // Create initial profile if missing
            const { error: insErr } = await supabase
              .from('profiles')
              .insert({
                id: sessionUser.id,
                email: userEmail,
                is_paid: false
              });
            if (insErr) console.error('Failed to init profile:', insErr);
          }

          // Fetch Invoices
          const { data: invoiceData, error: invoiceErr } = await supabase
            .from('invoices')
            .select('*')
            .eq('user_id', sessionUser.id)
            .order('created_at', { ascending: false });

          if (invoiceErr) throw invoiceErr;
          if (invoiceData) {
            const mapped: Invoice[] = invoiceData.map(inv => ({
              id: inv.id,
              invoice_number: inv.invoice_number,
              client_name: inv.client_name,
              client_email: inv.client_email,
              client_address: inv.client_address,
              client_gstin: inv.client_gstin,
              invoice_date: inv.invoice_date,
              due_date: inv.due_date,
              is_igst: inv.is_igst,
              items: inv.items,
              subtotal: Number(inv.subtotal),
              cgst_total: Number(inv.cgst_total),
              sgst_total: Number(inv.sgst_total),
              igst_total: Number(inv.igst_total),
              grand_total: Number(inv.grand_total),
              created_at: inv.created_at
            }));
            setInvoices(mapped);
            setLocalInvoices(mapped);
          }
        } catch (err) {
          console.error('Error fetching dashboard data:', err);
        } finally {
          setLoading(false);
        }
      } else {
        // Local Sandbox Mode Loading
        setCompanyName(localProfile.company_name);
        setCompanyAddress(localProfile.company_address);
        setCompanyGstin(localProfile.company_gstin);
        setBankName(localProfile.bank_name);
        setBankAccountNo(localProfile.bank_account_no);
        setBankIfsc(localProfile.bank_ifsc);
        setIsPaid(localProfile.is_paid);
        setInvoices(localInvoices);
        setLoading(false);
      }
    }

    loadData();
  }, [isConfigured, sessionUser, userEmail, localProfile, localInvoices, setLocalInvoices, setLocalProfile]);

  // 2. Save Business Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);

    if (isConfigured && supabase && sessionUser) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            company_name: companyName,
            company_address: companyAddress,
            company_gstin: companyGstin,
            bank_name: bankName,
            bank_account_no: bankAccountNo,
            bank_ifsc: bankIfsc
          })
          .eq('id', sessionUser.id);

        if (error) throw error;

        setLocalProfile(prev => ({
          ...prev,
          company_name: companyName,
          company_address: companyAddress,
          company_gstin: companyGstin,
          bank_name: bankName,
          bank_account_no: bankAccountNo,
          bank_ifsc: bankIfsc
        }));

        setShowProfileEdit(false);
      } catch (err) {
        console.error('Failed to save profile:', err);
        alert('Could not update profile details.');
      } finally {
        setProfileSaving(false);
      }
    } else {
      // Mock save
      setLocalProfile(prev => ({
        ...prev,
        company_name: companyName,
        company_address: companyAddress,
        company_gstin: companyGstin,
        bank_name: bankName,
        bank_account_no: bankAccountNo,
        bank_ifsc: bankIfsc
      }));
      setShowProfileEdit(false);
      setProfileSaving(false);
    }
  };

  // 3. Delete Invoice
  const handleDeleteInvoice = async (invoiceId: string) => {
    if (!confirm('Are you sure you want to delete this invoice record?')) return;

    if (isConfigured && supabase) {
      try {
        const { error } = await supabase
          .from('invoices')
          .delete()
          .eq('id', invoiceId);

        if (error) throw error;

        const updated = invoices.filter(i => i.id !== invoiceId);
        setInvoices(updated);
        setLocalInvoices(updated);
      } catch (err) {
        console.error('Failed to delete invoice:', err);
        alert('Could not delete invoice.');
      }
    } else {
      const updated = invoices.filter(i => i.id !== invoiceId);
      setInvoices(updated);
      setLocalInvoices(updated);
    }
  };

  // 4. Download PDF (regenerate in client)
  const handleDownloadPDF = (invoice: Invoice) => {
    const profileData = {
      company_name: companyName,
      company_address: companyAddress,
      company_gstin: companyGstin,
      bank_name: bankName,
      bank_account_no: bankAccountNo,
      bank_ifsc: bankIfsc
    };
    generateInvoicePDF(invoice, profileData);
  };

  // 5. Handle Logout
  const handleLogoutClick = async () => {
    if (isConfigured && supabase) {
      await supabase.auth.signOut();
    }
    onLogout();
  };

  // 6. Create New Invoice Click with Paywall Intercept
  const handleCreateClick = () => {
    if (!isPaid && invoices.length >= 3) {
      triggerPaywall();
    } else {
      onCreateInvoice();
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-8 h-8 rounded-full border-4 border-amber-500/20 border-t-amber-500 animate-spin" />
        <span className="text-xs text-slate-400 font-mono">LOADING BUSINESS TELEMETRY...</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-[#080C14] border border-slate-800/80 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[85vh] font-sans">
      
      {/* Dashboard Top Navigation */}
      <div className="px-6 py-4 border-b border-slate-800/60 bg-[#0F172A] flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center font-bold text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
            In
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight">
              Invoicely <span className="text-amber-500 font-black">Dashboard</span>
            </h1>
            <span className="text-[10px] text-slate-500 font-mono">{userEmail}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Lifetime Status badge */}
          {isPaid ? (
            <div className="px-3 py-1.5 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-[10px] text-emerald-400 font-bold flex items-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              LIFETIME PREMIUM ACTIVE
            </div>
          ) : (
            <div 
              onClick={triggerPaywall}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[10px] text-slate-400 hover:border-amber-500/50 hover:text-amber-400 transition-all font-mono font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <CreditCard className="w-3.5 h-3.5 text-amber-500" />
              USAGE: {invoices.length}/3 FREE INVOICES
            </div>
          )}

          <button 
            onClick={() => setShowProfileEdit(true)}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Edit Business Details"
          >
            <Settings className="w-4.5 h-4.5" />
          </button>

          <button 
            onClick={handleLogoutClick}
            className="p-2 rounded-lg bg-slate-900 border border-slate-800/80 hover:border-red-900/50 text-slate-400 hover:text-red-400 transition-all cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>

      {/* Main Panel Content Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left Side Info Panel */}
        <div className="w-full md:w-[32%] border-r border-slate-800/60 p-6 space-y-6 overflow-y-auto bg-[#080C14]">
          
          {/* Profile Overview Card */}
          <div className="space-y-4">
            <h2 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5" /> Business Profile
            </h2>

            {companyName ? (
              <div className="bg-[#0D111C] p-4 rounded-lg border border-slate-800/60 space-y-3 font-sans">
                <div>
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Company</div>
                  <div className="text-sm font-bold text-white">{companyName}</div>
                </div>
                {companyGstin && (
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">GSTIN</div>
                    <div className="text-xs font-mono text-slate-300">{companyGstin}</div>
                  </div>
                )}
                {companyAddress && (
                  <div>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Address</div>
                    <div className="text-xs text-slate-400 leading-relaxed">{companyAddress}</div>
                  </div>
                )}
                <div className="border-t border-slate-800/80 pt-2.5 space-y-1">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Bank Details</div>
                  <div className="text-xs text-slate-400">{bankName || 'N/A'}</div>
                  <div className="text-xs text-slate-400 font-mono">A/C: {bankAccountNo || 'N/A'}</div>
                  <div className="text-xs text-slate-400 font-mono">IFSC: {bankIfsc || 'N/A'}</div>
                </div>
              </div>
            ) : (
              <div className="border border-dashed border-slate-800 rounded-lg p-5 text-center space-y-3 bg-[#0D111C]/30">
                <Settings className="w-7 h-7 text-slate-600 mx-auto" />
                <p className="text-xs text-slate-400">Please configure your Business Details before generating invoices.</p>
                <button 
                  onClick={() => setShowProfileEdit(true)}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition cursor-pointer"
                >
                  Configure Profile
                </button>
              </div>
            )}
          </div>

          {/* Quick Stats banner */}
          <div className="bg-amber-500/[0.02] border border-amber-500/10 rounded-lg p-4 space-y-2.5 font-sans">
            <h3 className="text-[10px] font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Stats Engine
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                <div className="text-xl font-black text-white font-mono">{invoices.length}</div>
                <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Invoices</div>
              </div>
              <div className="bg-slate-900/60 p-2.5 rounded border border-slate-800/80">
                <div className="text-xl font-black text-amber-500 font-mono">
                  ₹{invoices.reduce((sum, inv) => sum + Number(inv.grand_total), 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </div>
                <div className="text-[9px] text-slate-500 font-bold uppercase mt-0.5">Billed Total</div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Side Invoices Ledger List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#080C14]">
          <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-amber-500" /> Invoice Ledger
            </h2>
            <button 
              onClick={handleCreateClick}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(245,158,11,0.15)] active:scale-[0.98]"
            >
              <Plus className="w-3.5 h-3.5 text-slate-950 stroke-[3]" /> Create New Invoice
            </button>
          </div>

          {/* Invoices List Display */}
          {invoices.length === 0 ? (
            <div className="h-[45vh] border border-dashed border-slate-800 rounded-lg flex flex-col items-center justify-center space-y-3 text-center p-6 bg-[#0D111C]/10">
              <FileText className="w-10 h-10 text-slate-700" />
              <p className="text-sm font-semibold text-slate-400">No invoices generated yet</p>
              <p className="text-xs text-slate-500 max-w-xs leading-normal">
                Kick off billing by creating your first professional GST-calculated invoice layout.
              </p>
            </div>
          ) : (
            <div className="border border-slate-800/60 rounded-lg overflow-hidden bg-[#0D111C]/35">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 bg-[#0F172A] text-[9px] uppercase tracking-wider text-slate-400 font-bold font-mono">
                    <th className="p-3.5">Invoice #</th>
                    <th className="p-3.5">Billing Target</th>
                    <th className="p-3.5 text-center">Date</th>
                    <th className="p-3.5 text-right">Grand Total</th>
                    <th className="p-3.5 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-800/40 text-slate-300">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-900/35 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-white">{inv.invoice_number}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-slate-200">{inv.client_name}</div>
                        {inv.client_gstin && <div className="text-[9px] text-slate-500 font-mono">GSTIN: {inv.client_gstin}</div>}
                      </td>
                      <td className="p-3.5 text-center text-slate-400 font-mono">{inv.invoice_date}</td>
                      <td className="p-3.5 text-right font-bold text-amber-500 font-mono">
                        ₹{Number(inv.grand_total).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleDownloadPDF(inv)}
                            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-amber-500/50 hover:text-amber-500 text-slate-400 transition"
                            title="Download PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-1.5 rounded bg-slate-900 border border-slate-800 hover:border-red-900/50 hover:text-red-400 text-slate-400 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Business Setup Edit Dialog overlay */}
      {showProfileEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative font-sans">
            
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-800/80 bg-[#0F172A] flex justify-between items-center">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-500" /> Config Business Settings
              </h3>
              <button 
                onClick={() => setShowProfileEdit(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile configuration Form */}
            <form onSubmit={handleSaveProfile} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              <div className="space-y-3.5">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Company legal name</label>
                  <input 
                    type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} required
                    placeholder="e.g. Acme Studio Pvt Ltd"
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 text-sm text-white px-3 py-2 rounded-lg outline-none transition"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">GSTIN</label>
                    <input 
                      type="text" value={companyGstin} onChange={e => setCompanyGstin(e.target.value.toUpperCase())}
                      placeholder="e.g. 27AAAAA1111A1Z1" maxLength={15}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 text-sm text-white font-mono px-3 py-2 rounded-lg outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Bank Name</label>
                    <input 
                      type="text" value={bankName} onChange={e => setBankName(e.target.value)}
                      placeholder="e.g. HDFC Bank"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 text-sm text-white px-3 py-2 rounded-lg outline-none transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Registered address</label>
                  <textarea 
                    value={companyAddress} onChange={e => setCompanyAddress(e.target.value)} required rows={2}
                    placeholder="Provide full legal billing address..."
                    className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 text-sm text-white px-3 py-2 rounded-lg outline-none transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">Account Number</label>
                    <input 
                      type="text" value={bankAccountNo} onChange={e => setBankAccountNo(e.target.value)}
                      placeholder="Bank account number"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 text-sm text-white font-mono px-3 py-2 rounded-lg outline-none transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider mb-1">IFSC Code</label>
                    <input 
                      type="text" value={bankIfsc} onChange={e => setBankIfsc(e.target.value.toUpperCase())}
                      placeholder="IFSC code" maxLength={11}
                      className="w-full bg-slate-900 border border-slate-800 focus:border-amber-500/60 text-sm text-white font-mono px-3 py-2 rounded-lg outline-none transition"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-800/80">
                <button
                  type="button" onClick={() => setShowProfileEdit(false)}
                  className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-lg text-xs font-semibold text-slate-300 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={profileSaving}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-800 text-slate-950 text-xs font-bold rounded-lg transition-all cursor-pointer"
                >
                  {profileSaving ? 'Saving...' : 'Save Settings'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
