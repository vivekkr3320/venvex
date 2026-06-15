'use client';

import React, { useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { 
  Plus, Trash2, Printer, Download, Copy, Check, 
  DollarSign, FileText, ArrowLeft, Percent, Calendar, 
  Briefcase, Mail, MapPin, User, ChevronDown
} from 'lucide-react';

interface LineItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
}

interface InvoiceWorkspaceProps {
  onClose: () => void;
}

export default function InvoiceWorkspace({ onClose }: InvoiceWorkspaceProps) {
  // State variables for Invoice
  const [companyName, setCompanyName] = useState('UtilityOS Labs');
  const [companyEmail, setCompanyEmail] = useState('billing@utilityos.com');
  const [companyAddress, setCompanyAddress] = useState('100 Edge Network Lane, SF, CA');
  
  const [clientName, setClientName] = useState('Acme Corporation');
  const [clientEmail, setClientEmail] = useState('accounts@acme.com');
  const [clientAddress, setClientAddress] = useState('500 Monolith Blvd, Seattle, WA');
  
  const [invoiceNumber, setInvoiceNumber] = useState('INV-2026-0042');
  const [invoiceDate, setInvoiceDate] = useState('2026-06-15');
  const [dueDate, setDueDate] = useState('2026-07-15');
  
  const [taxRate, setTaxRate] = useState(18);
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { id: '1', name: 'Edge Function Orchestration (Monthly)', quantity: 1, price: 1250.00 },
    { id: '2', name: 'EXIF Purge Engine Core License', quantity: 1, price: 600.00 }
  ]);

  const [copiedJson, setCopiedJson] = useState(false);

  // Reference for react-to-print
  const contentRef = useRef<HTMLDivElement>(null);

  // Hook from react-to-print 3.x
  const reactToPrintFn = useReactToPrint({
    contentRef,
    documentTitle: `Invoice_${invoiceNumber}`,
    pageStyle: `
      @page {
        size: A4;
        margin: 15mm 20mm;
      }
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        background-color: white !important;
        color: black !important;
      }
    `
  });

  // Calculate values
  const subtotal = lineItems.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const grandTotal = subtotal + taxAmount;

  // Handlers for line items
  const addLineItem = () => {
    const newItem: LineItem = {
      id: Date.now().toString(),
      name: '',
      quantity: 1,
      price: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const removeLineItem = (id: string) => {
    if (lineItems.length === 1) return; // keep at least one
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const updateLineItem = (id: string, field: keyof LineItem, value: string | number) => {
    setLineItems(lineItems.map(item => {
      if (item.id === id) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Copy JSON Invoice Schema to Clipboard
  const copyInvoiceJson = () => {
    const schema = {
      meta: {
        invoiceNumber,
        invoiceDate,
        dueDate,
        taxRate,
        subtotal,
        taxAmount,
        grandTotal
      },
      company: {
        name: companyName,
        email: companyEmail,
        address: companyAddress
      },
      client: {
        name: clientName,
        email: clientEmail,
        address: clientAddress
      },
      items: lineItems
    };

    navigator.clipboard.writeText(JSON.stringify(schema, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto bg-card-bg border border-border-dark rounded-xl overflow-hidden shadow-2xl flex flex-col h-[90vh]">
      
      {/* Header bar */}
      <div className="px-6 py-4 border-b border-border-dark flex items-center justify-between bg-dark-bg/60 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button 
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 border border-border-dark text-text-slate hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-accent-emerald" />
            <h2 className="font-bold text-lg text-white">Invoice Workspace v1.1.0</h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={copyInvoiceJson}
            className="px-3.5 py-1.5 rounded-lg border border-border-dark text-xs font-semibold text-text-slate hover:text-white hover:border-white transition-all flex items-center gap-1.5 cursor-pointer"
          >
            {copiedJson ? (
              <>
                <Check className="w-3.5 h-3.5 text-accent-emerald" /> Copied Schema
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" /> Copy JSON Schema
              </>
            )}
          </button>
          
          <button 
            onClick={() => reactToPrintFn()}
            className="px-4 py-2 rounded-lg bg-accent-emerald text-dark-bg font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1.5 cursor-pointer shadow-[0_0_15px_rgba(16,185,129,0.2)]"
          >
            <Printer className="w-3.5 h-3.5" /> Download PDF Invoice
          </button>
        </div>
      </div>

      {/* Split screen body */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Column: Form Settings (Scrollable) */}
        <div className="w-full lg:w-1/2 p-6 overflow-y-auto space-y-8 bg-dark-bg/30 border-r border-border-dark">
          
          {/* Sender & Receiver Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Company Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-accent-emerald uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" /> Your Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Company Name</label>
                  <input 
                    type="text" 
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-emerald transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Billing Email</label>
                  <input 
                    type="email" 
                    value={companyEmail}
                    onChange={(e) => setCompanyEmail(e.target.value)}
                    className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-emerald transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Business Address</label>
                  <input 
                    type="text" 
                    value={companyAddress}
                    onChange={(e) => setCompanyAddress(e.target.value)}
                    className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-emerald transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Client Info */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-accent-emerald uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Client Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Client Name</label>
                  <input 
                    type="text" 
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-emerald transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Client Email</label>
                  <input 
                    type="email" 
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-emerald transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Billing Address</label>
                  <input 
                    type="text" 
                    value={clientAddress}
                    onChange={(e) => setClientAddress(e.target.value)}
                    className="w-full bg-dark-bg border border-border-dark rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-accent-emerald transition-colors"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Metadata: Invoice Number, Dates, Taxes */}
          <div className="border-t border-border-dark/60 pt-6 space-y-4">
            <h3 className="text-xs font-bold text-accent-emerald uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" /> Meta Details & Taxes
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Invoice Number</label>
                <input 
                  type="text" 
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full bg-dark-bg border border-border-dark rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-emerald transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Invoice Date</label>
                <input 
                  type="date" 
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="w-full bg-dark-bg border border-border-dark rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1">Due Date</label>
                <input 
                  type="date" 
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full bg-dark-bg border border-border-dark rounded px-3 py-1.5 text-xs text-white focus:outline-none focus:border-accent-emerald transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] text-text-slate font-semibold uppercase mb-1 flex justify-between">
                  <span>Tax Rate</span>
                  <span className="text-accent-emerald font-bold">{taxRate}%</span>
                </label>
                <div className="flex items-center gap-2">
                  <Percent className="w-3.5 h-3.5 text-text-slate" />
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    className="w-full bg-dark-bg border border-border-dark rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-accent-emerald"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Line Items Container */}
          <div className="border-t border-border-dark/60 pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-accent-emerald uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Line Items
              </h3>
              <button 
                onClick={addLineItem}
                className="px-2.5 py-1 rounded bg-accent-emerald/10 border border-accent-emerald/20 text-accent-emerald text-xs font-semibold hover:bg-accent-emerald hover:text-dark-bg transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Add Item
              </button>
            </div>

            <div className="space-y-3">
              {lineItems.map((item, index) => (
                <div key={item.id} className="flex gap-3 items-end bg-card-bg/40 p-3 rounded-lg border border-border-dark/60">
                  <div className="flex-1">
                    <label className="block text-[9px] text-text-slate font-semibold uppercase mb-0.5">Item Name</label>
                    <input 
                      type="text" 
                      value={item.name}
                      placeholder="e.g. Consulting hours"
                      onChange={(e) => updateLineItem(item.id, 'name', e.target.value)}
                      className="w-full bg-dark-bg border border-border-dark rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-emerald"
                    />
                  </div>

                  <div className="w-20">
                    <label className="block text-[9px] text-text-slate font-semibold uppercase mb-0.5">Qty</label>
                    <input 
                      type="number" 
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateLineItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                      className="w-full bg-dark-bg border border-border-dark rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-accent-emerald text-center"
                    />
                  </div>

                  <div className="w-28">
                    <label className="block text-[9px] text-text-slate font-semibold uppercase mb-0.5">Unit Price ($)</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={item.price}
                      onChange={(e) => updateLineItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                      className="w-full bg-dark-bg border border-border-dark rounded px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-accent-emerald text-right"
                    />
                  </div>

                  <button 
                    onClick={() => removeLineItem(item.id)}
                    disabled={lineItems.length === 1}
                    className="p-2.5 rounded bg-red-950/20 border border-red-900/30 text-red-400 hover:bg-red-900/40 disabled:opacity-30 disabled:pointer-events-none hover:text-white transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Live Printable PDF Preview */}
        <div className="w-full lg:w-1/2 p-6 bg-dark-bg overflow-y-auto flex justify-center items-start">
          
          {/* A4 Styled Sheet Container */}
          <div className="w-full max-w-[210mm] shadow-2xl bg-white text-black p-8 md:p-12 border border-gray-200 rounded-sm relative aspect-[1/1.414]">
            
            <div ref={contentRef} className="w-full bg-white text-black p-2 font-sans select-none print:p-0">
              
              {/* Invoice Top Header */}
              <div className="flex justify-between border-b border-gray-100 pb-8 items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-[#10B981] font-extrabold tracking-wider text-lg">
                    <div className="w-6 h-6 rounded bg-[#10B981] flex items-center justify-center font-bold text-white text-xs">U</div>
                    <span>{companyName}</span>
                  </div>
                  <div className="text-[10px] text-gray-500 space-y-0.5">
                    <div className="flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {companyEmail}</div>
                    <div className="flex items-center gap-1"><MapPin className="w-2.5 h-2.5" /> {companyAddress}</div>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <h1 className="text-xl font-bold uppercase tracking-widest text-gray-800">INVOICE</h1>
                  <p className="font-mono text-sm font-semibold text-gray-700">{invoiceNumber}</p>
                  <div className="text-[10px] text-gray-500">
                    <div>Date: {invoiceDate}</div>
                    <div className="text-red-500 font-bold">Due: {dueDate}</div>
                  </div>
                </div>
              </div>

              {/* Sender & Receiver Address Details */}
              <div className="grid grid-cols-2 gap-8 py-8 border-b border-gray-100 text-[11px] leading-relaxed">
                <div>
                  <span className="block font-bold text-[9px] uppercase tracking-wider text-gray-400 mb-1">Billed By</span>
                  <div className="font-bold text-gray-800 text-xs">{companyName}</div>
                  <div className="text-gray-600">{companyAddress}</div>
                  <div className="text-gray-500 mt-1">{companyEmail}</div>
                </div>
                <div>
                  <span className="block font-bold text-[9px] uppercase tracking-wider text-gray-400 mb-1">Prepare For</span>
                  <div className="font-bold text-gray-800 text-xs">{clientName}</div>
                  <div className="text-gray-600">{clientAddress}</div>
                  <div className="text-gray-500 mt-1">{clientEmail}</div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left border-collapse my-8 text-[11px]">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-400 uppercase tracking-widest text-[9px] font-bold">
                    <th className="py-2.5 font-bold">Line Description</th>
                    <th className="py-2.5 text-center font-bold w-12">Qty</th>
                    <th className="py-2.5 text-right font-bold w-24">Unit Rate</th>
                    <th className="py-2.5 text-right font-bold w-28">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-700">
                  {lineItems.map((item, index) => (
                    <tr key={item.id}>
                      <td className="py-3 font-medium text-gray-800">{item.name || <span className="text-gray-300 italic">No name provided</span>}</td>
                      <td className="py-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-3 text-right font-mono">{formatCurrency(item.price)}</td>
                      <td className="py-3 text-right font-mono font-bold text-gray-900">
                        {formatCurrency(item.quantity * item.price)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Summary details */}
              <div className="flex justify-end pt-4">
                <div className="w-64 space-y-2 text-xs font-semibold text-gray-700">
                  <div className="flex justify-between font-medium text-[11px] text-gray-500">
                    <span>Subtotal</span>
                    <span className="font-mono">{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium text-[11px] text-gray-500">
                    <span>Taxes ({taxRate}%)</span>
                    <span className="font-mono">{formatCurrency(taxAmount)}</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-3 text-sm font-bold text-gray-900">
                    <span>Total Balance Due</span>
                    <span className="font-mono text-[#10B981]">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* A4 printable footer notes */}
              <div className="border-t border-gray-100 mt-16 pt-8 text-[9px] text-gray-400 leading-relaxed text-center space-y-1">
                <p className="font-semibold text-gray-500">Payment Terms: Net 30 days. Payments accepted via wire or bank transfer.</p>
                <p>Generated securely via UtilityOS. Edge cluster validation tag: node4-v19.2-verified.</p>
              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
