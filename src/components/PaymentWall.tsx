'use client';

import React from 'react';
import { X, QrCode, PhoneCall, AlertTriangle, ShieldCheck } from 'lucide-react';

interface PaymentWallProps {
  userEmail: string;
  onClose: () => void;
}

export default function PaymentWall({ userEmail, onClose }: PaymentWallProps) {
  const upiId = process.env.NEXT_PUBLIC_UPI_ID || 'vivek.gupta@okaxis'; // Fallback to a developer UPI or config
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '+91XXXXXXXXXX';
  const price = process.env.NEXT_PUBLIC_PRODUCT_PRICE || '499';

  // Construct standard Indian UPI payment protocol URL
  const upiUrl = `upi://pay?pa=${upiId}&pn=${encodeURIComponent('Invoicely Engine')}&am=${price}.00&cu=INR&tn=${encodeURIComponent(`Invoicely Lifetime ${userEmail}`)}`;
  
  // Render scannable QR using free qrserver API
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upiUrl)}&color=0f-17-2a&bgcolor=ffffff`;

  const whatsappMessage = encodeURIComponent(
    `Hi Invoicely, I have paid ₹${price} for Lifetime Access.\n\nRegistered Email: ${userEmail}\n\n[Please attach screenshot here]`
  );
  
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

  return (
    <div className="w-full max-w-md bg-[#0F172A] border border-slate-800 rounded-xl overflow-hidden shadow-2xl relative font-sans">
      
      {/* Header Close button */}
      <button 
        onClick={onClose}
        className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-all cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>

      <div className="p-6 space-y-5 text-center flex flex-col items-center">
        
        {/* Warning Indicator */}
        <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center animate-bounce mt-2">
          <AlertTriangle className="w-5.5 h-5.5" />
        </div>

        {/* Text */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold text-white tracking-tight">
            Free Invoice Limit Reached
          </h3>
          <p className="text-xs text-slate-400 max-w-sm">
            You've generated your 3 free invoices. Pay a single, one-time fee of <span className="text-amber-500 font-bold">₹{price}</span> for lifetime unlimited access.
          </p>
        </div>

        {/* Dynamic UPI QR Code */}
        <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-inner flex flex-col items-center justify-center space-y-1.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={qrCodeUrl} 
            alt="UPI QR Code" 
            className="w-[200px] h-[200px]"
          />
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono font-bold tracking-tight">
            <QrCode className="w-3.5 h-3.5 text-slate-700" />
            <span>SCAN WITH GPAY / PHONEPE</span>
          </div>
        </div>

        {/* Payment Metadata details */}
        <div className="w-full bg-slate-900/60 border border-slate-800/80 rounded-lg p-3 text-[11px] text-left text-slate-400 font-mono space-y-1">
          <div><span className="text-slate-500">Amount:</span> ₹{price}.00 (One-Time)</div>
          <div><span className="text-slate-500">UPI Payee:</span> {upiId}</div>
          <div><span className="text-slate-500">For Account:</span> {userEmail}</div>
        </div>

        {/* Next Steps WhatsApp CTA */}
        <div className="w-full space-y-2.5">
          <a 
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba56] text-white font-bold py-2.5 rounded-lg text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-[0_4px_12px_rgba(37,211,102,0.15)]"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            WhatsApp Screenshot to Unlock
          </a>
          
          <div className="text-[10px] text-slate-500 leading-normal">
            Once sent, our team will review the transaction and enable lifetime access for <span className="text-slate-400 font-semibold">{userEmail}</span> within minutes.
          </div>
        </div>

        {/* Security assurance */}
        <div className="flex items-center gap-1.5 text-[9px] text-emerald-500/90 font-semibold uppercase tracking-wider pt-2 border-t border-slate-800/40 w-full justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>100% Secure Direct UPI Payment</span>
        </div>

      </div>
    </div>
  );
}
