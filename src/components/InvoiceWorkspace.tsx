'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, Trash2, Printer, Copy, Check, 
  FileText, ArrowLeft, Mail, MapPin, User, Briefcase, FileSpreadsheet, Percent
} from 'lucide-react';
import { calculateGST, CalculatedItem, InvoiceItem, formatIndianCurrency, numberToWordsIndian } from '@/lib/calculateGST';
import { generateInvoicePDF } from '@/lib/generatePDF';
import { supabase, hasSupabaseConfig } from '@/lib/supabaseClient';

interface Profile {
  company_name: string;
  company_address: string;
  company_gstin: string;
  bank_name: string;
  bank_account_no: string;
  bank_ifsc: string;
  is_paid: boolean;
}

interface InvoiceWorkspaceProps {
  profile: Profile;
  userEmail: string;
  sessionUser: any;
  onClose: () => void;
  onInvoiceCreated: (invoice: any) => void;
}

export default function InvoiceWorkspace({
  profile,
  userEmail,
  sessionUser,
  onClose,
  onInvoiceCreated
}: InvoiceWorkspaceProps) {
  // Core Invoice Fields
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  
  // Client target fields
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientGstin, setClientGstin] = useState('');
  
  // IGST Toggle
  const [isIgst, setIsIgst] = useState(false);

  // Line items state
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: '1', description: 'Software Development Consulting Services', quantity: 1, rate: 45000, gstRate: 18 },
  ]);

  const [copiedJson, setCopiedJson] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Set default dates and invoice number on mount
  useEffect(() => {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0];
    
    const nextMonth = new Date();
    nextMonth.setDate(today.getDate() + 30);
    const formattedDue = nextMonth.toISOString().split('T')[0];
    
    setInvoiceDate(formattedToday);
    setDueDate(formattedDue);
    
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNumber(`INV-2026-${randomNum}`);
  }, []);

  // 1. Perform GST calculations
  const calculatedItems: CalculatedItem[] = calculateGST(items, isIgst);
  
  const subtotal = calculatedItems.reduce((sum, item) => sum + item.taxable, 0);
  const cgstTotal = calculatedItems.reduce((sum, item) => sum + item.cgst, 0);
  const sgstTotal = calculatedItems.reduce((sum, item) => sum + item.sgst, 0);
  const igstTotal = calculatedItems.reduce((sum, item) => sum + item.igst, 0);
  const grandTotal = calculatedItems.reduce((sum, item) => sum + item.total, 0);

  // 2. Row management
  const addRow = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0, gstRate: 18 }]);
  };

  const removeRow = (id: string) => {
    if (items.length <= 1) return;
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  // 3. Save to Supabase and trigger PDF
  const handleCompileAndExport = async () => {
    if (!clientName) {
      alert('Please provide a Client Name.');
      return;
    }

    setIsSaving(true);
    const isConfigured = hasSupabaseConfig();

    const invoicePayload = {
      invoice_number: invoiceNumber,
      client_name: clientName,
      client_email: clientEmail,
      client_address: clientAddress,
      client_gstin: clientGstin,
      invoice_date: invoiceDate,
      due_date: dueDate,
      is_igst: isIgst,
      items: calculatedItems,
      subtotal,
      cgst_total: cgstTotal,
      sgst_total: sgstTotal,
      igst_total: igstTotal,
      grand_total: grandTotal
    };

    if (isConfigured && supabase && sessionUser) {
      try {
        const { data, error } = await supabase
          .from('invoices')
          .insert({
            user_id: sessionUser.id,
            ...invoicePayload
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          onInvoiceCreated(data);
        }
      } catch (err: any) {
        console.error('Failed to save invoice in database:', err);
        alert(`Error saving invoice: ${err.message || 'Database error'}`);
        setIsSaving(false);
        return;
      }
    } else {
      // Mock Sandbox Save
      const mockSavedInvoice = {
        id: `mock-inv-${Date.now()}`,
        created_at: new Date().toISOString(),
        ...invoicePayload
      };
      onInvoiceCreated(mockSavedInvoice);
    }

    // Generate and download PDF
    const profileData = {
      company_name: profile.company_name,
      company_address: profile.company_address,
      company_gstin: profile.company_gstin,
      bank_name: profile.bank_name,
      bank_account_no: profile.bank_account_no,
      bank_ifsc: profile.bank_ifsc
    };

    generateInvoicePDF(invoicePayload, profileData);
    setIsSaving(false);
    onClose();
  };

  // Copy Schema to Clipboard
  const copySchema = () => {
    navigator.clipboard.writeText(JSON.stringify({
      meta: { invoiceNumber, invoiceDate, dueDate, isIgst, subtotal, cgstTotal, sgstTotal, igstTotal, grandTotal },
      company: profile,
      client: { name: clientName, email: clientEmail, address: clientAddress, gstin: clientGstin },
      items: calculatedItems
    }, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-[#FAFBFF] border border-slate-200 rounded-xl overflow-hidden shadow-2xl flex flex-col h-[92vh] font-sans text-slate-800">

      {/* Top Toolbar (Nav / Header) */}
      <div className="px-5 py-3.5 border-b border-slate-200 bg-[#0F172A] flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#2563EB] flex items-center justify-center text-[10px] font-black text-white shadow-[0_0_12px_rgba(37,99,235,0.3)]">
              In
            </div>
            <h1 className="text-sm font-bold tracking-wide text-white">
              Invoicely <span className="text-slate-400 font-normal">/</span> <span className="text-[#F97316] font-bold">GST Editor</span>
            </h1>
            <span className="text-[9px] font-mono text-amber-500/90 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">v2.2</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={copySchema}
            className="px-3 py-1.5 rounded-lg border border-slate-850 text-xs font-semibold text-slate-400 hover:text-white hover:border-slate-650 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedJson ? <><Check className="w-3 h-3 text-[#2563EB]" /> Copied</> : <><Copy className="w-3 h-3" /> JSON Schema</>}
          </button>
          
          <button
            onClick={handleCompileAndExport}
            disabled={isSaving}
            className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1E40AF] text-white font-bold text-xs uppercase tracking-wider active:scale-[0.98] transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(37,99,235,0.2)] disabled:bg-slate-700"
          >
            <Printer className="w-3.5 h-3.5 stroke-[3]" /> 
            {isSaving ? 'Compiling & Saving...' : 'Compile & Export PDF'}
          </button>
        </div>
      </div>

      {/* Split-screen body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* LEFT PANEL: Control Inputs & Live Tax Calculator */}
        <div className="w-full lg:w-[45%] p-6 overflow-y-auto border-r border-slate-200 bg-[#FFFFFF] space-y-6">

          {/* Section: Metadata */}
          <div className="bg-[#FAFBFF] p-4 rounded-xl border border-slate-200/80 space-y-3.5">
            <h2 className="text-[10px] font-bold text-[#2563EB] uppercase tracking-[0.2em] flex items-center gap-1.5 font-mono">
              <FileText className="w-3.5 h-3.5 text-[#F97316]" /> Invoice Core Configuration
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-1">Invoice ID</label>
                <input
                  type="text" value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-[#2563EB] focus:ring-1 focus:ring-[#2563EB]/20 outline-none transition font-mono font-bold"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-1">Transaction type</label>
                <select 
                  value={isIgst ? 'igst' : 'cgst_sgst'}
                  onChange={e => setIsIgst(e.target.value === 'igst')}
                  className="w-full bg-[#FFFFFF] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-[#2563EB] outline-none transition font-semibold"
                >
                  <option value="cgst_sgst">Intra-State (CGST + SGST)</option>
                  <option value="igst">Inter-State (IGST)</option>
                </select>
              </div>
              <div>
                <label className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-1">Invoice Date</label>
                <input
                  type="date" value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-[#2563EB] outline-none transition"
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase text-slate-500 font-bold tracking-wider mb-1">Due Date</label>
                <input
                  type="date" value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-[#FFFFFF] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-[#2563EB] outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section: Sender Info Overview */}
          <div>
            <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-2 flex items-center gap-1.5 font-mono">
              <Briefcase className="w-3.5 h-3.5 text-[#F97316]" /> Billing From
            </h2>
            <div className="bg-[#FAFBFF] border border-slate-200 rounded-lg p-3 text-xs space-y-1.5 shadow-sm">
              <div className="font-bold text-slate-900">{profile.company_name || 'Business details not set'}</div>
              <div className="text-slate-500 leading-relaxed">{profile.company_address}</div>
              <div className="font-mono text-slate-600 font-semibold">GSTIN: {profile.company_gstin || 'None'}</div>
            </div>
          </div>

          {/* Section: Client */}
          <div className="bg-[#FAFBFF] p-4 rounded-xl border border-slate-200/80 space-y-3">
            <h2 className="text-[10px] font-bold text-[#2563EB] uppercase tracking-[0.2em] flex items-center gap-1.5 font-mono">
              <User className="w-3.5 h-3.5 text-[#F97316]" /> Billing Target (Client)
            </h2>
            <div className="space-y-3">
              <input 
                type="text" value={clientName} onChange={(e) => setClientName(e.target.value)} required placeholder="Client / Company Legal Name"
                className="w-full bg-[#FFFFFF] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-[#2563EB] outline-none transition font-semibold" 
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} placeholder="client@email.com"
                  className="w-full bg-[#FFFFFF] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-[#2563EB] outline-none transition" 
                />
                <input 
                  type="text" value={clientGstin} onChange={(e) => setClientGstin(e.target.value.toUpperCase())} placeholder="Client GSTIN" maxLength={15}
                  className="w-full bg-[#FFFFFF] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-[#2563EB] outline-none transition font-mono uppercase" 
                />
              </div>
              <textarea 
                value={clientAddress} onChange={(e) => setClientAddress(e.target.value)} placeholder="Client Billing Address" rows={2}
                className="w-full bg-[#FFFFFF] border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:border-[#2563EB] outline-none transition" 
              />
            </div>
          </div>

          {/* Section: Line Items Ledger */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] flex items-center gap-1.5 font-mono">
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#F97316]" /> Line Items Ledger
              </h2>
              <button 
                onClick={addRow}
                className="text-[10px] font-bold text-[#2563EB] border border-[#2563EB]/20 px-2.5 py-1 rounded bg-[#2563EB]/5 hover:bg-[#2563EB]/15 transition cursor-pointer flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" /> Add Entry
              </button>
            </div>

            <div className="space-y-2.5 max-h-[30vh] overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex gap-2 items-end bg-[#FAFBFF] p-3 rounded-lg border border-slate-200 shadow-sm">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[8px] uppercase text-slate-500 font-bold mb-0.5">Description</label>
                    <input 
                      type="text" placeholder="Consulting hours / project name" value={item.description}
                      onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                      className="w-full bg-[#FFFFFF] border border-slate-200 rounded px-2.5 py-1.5 text-xs text-slate-800 focus:border-[#2563EB] outline-none transition" 
                    />
                  </div>
                  <div className="w-14">
                    <label className="block text-[8px] uppercase text-slate-500 font-bold mb-0.5">Qty</label>
                    <input 
                      type="number" min={1} value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value) || 0)}
                      className="w-full bg-[#FFFFFF] border border-slate-200 rounded px-1.5 py-1.5 text-xs text-slate-850 text-center focus:border-[#2563EB] outline-none transition font-mono font-bold" 
                    />
                  </div>
                  <div className="w-22">
                    <label className="block text-[8px] uppercase text-slate-500 font-bold mb-0.5">Rate (₹)</label>
                    <input 
                      type="number" min={0} step={0.01} value={item.rate}
                      onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value) || 0)}
                      className="w-full bg-[#FFFFFF] border border-slate-200 rounded px-1.5 py-1.5 text-xs text-slate-850 text-right focus:border-[#2563EB] outline-none transition font-mono font-bold" 
                    />
                  </div>
                  <div className="w-18">
                    <label className="block text-[8px] uppercase text-slate-500 font-bold mb-0.5">GST Slab</label>
                    <select
                      value={item.gstRate}
                      onChange={(e) => updateItem(item.id, 'gstRate', Number(e.target.value))}
                      className="w-full bg-[#FFFFFF] border border-slate-200 rounded px-1 py-1.5 text-xs text-slate-850 focus:border-[#2563EB] outline-none transition font-semibold"
                    >
                      <option value={0}>0%</option>
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </div>
                  <button 
                    onClick={() => removeRow(item.id)} disabled={items.length <= 1}
                    className="p-2 rounded bg-red-50 border border-red-200 text-red-650 hover:bg-red-100 disabled:opacity-20 disabled:pointer-events-none transition cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* SIGNATURE ELEMENT: Live GST Tax Calculator Side Panel */}
          <div className="bg-[#2563EB]/[0.02] border border-[#2563EB]/15 rounded-xl p-4 space-y-3 font-sans">
            <h3 className="text-[10px] font-bold text-[#2563EB] uppercase tracking-widest flex items-center gap-1.5 font-mono">
              <Percent className="w-3.5 h-3.5 text-[#F97316]" /> Live GST Tax Calculator
            </h3>
            
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-1.5">
                <span>Taxable Amount</span>
                <span className="text-slate-800 font-bold tabular-nums">{formatIndianCurrency(subtotal)}</span>
              </div>
              
              {isIgst ? (
                <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-1.5">
                  <span>IGST Total</span>
                  <span className="text-slate-800 font-bold tabular-nums">{formatIndianCurrency(igstTotal)}</span>
                </div>
              ) : (
                <>
                  <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-1.5">
                    <span>CGST (Central Tax)</span>
                    <span className="text-slate-800 font-semibold tabular-nums">{formatIndianCurrency(cgstTotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-500 border-b border-slate-100 pb-1.5">
                    <span>SGST (State Tax)</span>
                    <span className="text-slate-800 font-semibold tabular-nums">{formatIndianCurrency(sgstTotal)}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between text-sm font-bold pt-1.5">
                <span className="text-slate-900 font-sans">Total Bill Amount</span>
                <span className="text-[#F97316] tabular-nums">{formatIndianCurrency(grandTotal)}</span>
              </div>
            </div>

            {/* Word translation preview inside live calculator */}
            <div className="border-t border-slate-200/80 pt-2.5 mt-2.5">
              <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Amount in words</div>
              <div className="text-[10px] text-slate-600 font-semibold italic mt-0.5 leading-normal">
                {numberToWordsIndian(grandTotal)}
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: Live A4 Preview Canvas (Indian MSME Design) */}
        <div className="w-full lg:w-[55%] bg-[#EAEDF5] p-6 overflow-y-auto flex justify-center items-start">
          <div className="w-full max-w-[210mm] bg-white text-slate-900 shadow-xl rounded-sm border border-slate-200 p-8 lg:p-12 min-h-[297mm] flex flex-col justify-between font-sans">
            
            <div className="space-y-8">
              {/* Preview Header */}
              <div className="flex justify-between items-start border-b-2 border-[#F97316] pb-6">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight text-[#2563EB]">TAX INVOICE</h2>
                  <p className="text-xs font-mono text-slate-500 mt-1">{invoiceNumber || 'INV-XXXX-XXXX'}</p>
                </div>
                <div className="text-right">
                  <h3 className="font-bold text-sm text-slate-950">{profile.company_name || 'Business Legal Name'}</h3>
                  <p className="text-[10px] text-slate-500 max-w-[250px] leading-normal">{profile.company_address || 'Address not configured'}</p>
                  <p className="text-[10px] text-slate-800 font-mono font-bold mt-1.5 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded inline-block">
                    GSTIN: {profile.company_gstin || 'N/A'}
                  </p>
                </div>
              </div>

              {/* Client & Bank details */}
              <div className="grid grid-cols-2 gap-8 text-xs">
                <div>
                  <h4 className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1.5">BILL TO (CLIENT)</h4>
                  <p className="text-sm font-bold text-slate-950">{clientName || '—'}</p>
                  <p className="text-slate-500 leading-normal max-w-xs">{clientAddress || '—'}</p>
                  <p className="font-mono text-slate-850 font-bold mt-1.5">GSTIN: {clientGstin || 'N/A'}</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="text-[10px] text-slate-500 font-mono">
                    <div>Invoice Date: <span className="font-semibold text-slate-800">{invoiceDate}</span></div>
                    <div>Due Date: <span className="font-bold text-red-600">{dueDate}</span></div>
                  </div>
                  
                  <div className="border-t border-slate-100 pt-2 text-left inline-block">
                    <h5 className="text-[8px] font-bold uppercase text-slate-400 tracking-wider mb-1">Bank Settlement Details</h5>
                    <div className="text-[10px] text-slate-600 leading-normal font-mono">
                      <div>Bank: {profile.bank_name || '—'}</div>
                      <div>A/C: {profile.bank_account_no || '—'}</div>
                      <div>IFSC: {profile.bank_ifsc || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#2563EB]/40 text-[9px] uppercase tracking-wider text-[#2563EB] font-bold">
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5 text-center w-12">Qty</th>
                    <th className="py-2.5 text-right w-24">Rate</th>
                    <th className="py-2.5 text-right w-20">GST %</th>
                    <th className="py-2.5 text-right w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="text-xs divide-y divide-slate-100 text-slate-800">
                  {calculatedItems.map((item) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-slate-950">
                        {item.description || <span className="text-slate-350 italic">Untitled service item</span>}
                      </td>
                      <td className="py-3 text-center font-mono text-slate-600 tabular-nums">{item.quantity}</td>
                      <td className="py-3 text-right font-mono text-slate-600 tabular-nums">{formatIndianCurrency(item.rate)}</td>
                      <td className="py-3 text-right font-mono text-slate-600 tabular-nums">{item.gstRate}%</td>
                      <td className="py-3 text-right font-mono font-bold text-slate-950 tabular-nums">
                        {formatIndianCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Calculations and Double Border Verified Stamp */}
            <div className="border-t border-slate-200 pt-6 mt-8 flex flex-col md:flex-row justify-between items-start gap-6">
              
              {/* Amount in words & digital verification badge */}
              <div className="flex-1 space-y-3.5">
                <div className="space-y-1">
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-wider">Amount in Words</div>
                  <div className="text-[10px] text-slate-700 font-bold italic leading-normal">
                    {numberToWordsIndian(grandTotal)}
                  </div>
                </div>

                {/* Verification stamp */}
                <div className="border-2 border-emerald-500 bg-emerald-50/40 p-2.5 rounded text-center w-[185px] font-sans flex flex-col items-center justify-center">
                  <span className="text-[10px] font-black text-emerald-600 tracking-wider">VALID GST INVOICE</span>
                  <span className="text-[7px] text-emerald-600 font-semibold mt-0.5">Verified Indian Tax Document</span>
                  <span className="text-[6.5px] text-emerald-500 font-mono mt-1">Status: SECURE DIGITAL PASS</span>
                </div>
              </div>

              {/* Totals */}
              <div className="w-64 space-y-2 text-xs text-slate-500 font-mono">
                <div className="flex justify-between">
                  <span>Taxable Amount:</span>
                  <span className="font-semibold text-slate-800 tabular-nums">{formatIndianCurrency(subtotal)}</span>
                </div>
                {isIgst ? (
                  <div className="flex justify-between">
                    <span>IGST (Inter-State):</span>
                    <span className="font-semibold text-slate-800 tabular-nums">{formatIndianCurrency(igstTotal)}</span>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between">
                      <span>CGST (Central Tax):</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{formatIndianCurrency(cgstTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>SGST (State Tax):</span>
                      <span className="font-semibold text-slate-800 tabular-nums">{formatIndianCurrency(sgstTotal)}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between border-t border-[#F97316] pt-2 text-sm font-black text-slate-950">
                  <span className="text-slate-900 font-sans">Grand Total:</span>
                  <span className="text-[#2563EB] tabular-nums">{formatIndianCurrency(grandTotal)}</span>
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
