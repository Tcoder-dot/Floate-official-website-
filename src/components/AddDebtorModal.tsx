import React, { useState, useRef } from 'react';
import { X, FileText, Upload, Check, Calendar, ArrowRight, Loader2 } from 'lucide-react';

interface AddDebtorModalProps {
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    email: string;
    phone: string;
    amount: number;
    currency: string;
    receiptName: string | null;
    merchantBusinessName: string;
    merchantLocation: string;
    merchantEthnicity: string;
    merchantWhatTheySell: string;
    debtorLocation: string;
    paymentDueDate: string;
    isFreelancer: boolean;
    isMouthToMouth?: boolean;
    sequenceMode: 'FRIENDLY' | 'ENFORCEMENT';
  }) => void;
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    amount?: string;
    currency?: string;
    debtorLocation?: string;
    paymentDueDate?: string;
    merchantWhatTheySell?: string;
    merchantBusinessName?: string;
    merchantLocation?: string;
    merchantEthnicity?: string;
    isFreelancer?: boolean;
    sequenceMode?: 'FRIENDLY' | 'ENFORCEMENT';
  } | null;
}

export default function AddDebtorModal({ onClose, onSubmit, initialData }: AddDebtorModalProps) {
  // Simple form fields
  const [name, setName] = useState(initialData?.name || '');
  const [email, setEmail] = useState(initialData?.email || '');
  const [amount, setAmount] = useState(initialData?.amount || '');
  const [currency, setCurrency] = useState(initialData?.currency || '₦'); // Defaults to local Naira
  const [paymentDueDate, setPaymentDueDate] = useState(initialData?.paymentDueDate || new Date().toISOString().split('T')[0]);
  const [sequenceMode, setSequenceMode] = useState<'FRIENDLY' | 'ENFORCEMENT'>(initialData?.sequenceMode || 'ENFORCEMENT');

  // Optional attachment proof
  const [receiptName, setReceiptName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setReceiptName(file.name);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setReceiptName(e.target.files[0].name);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !amount) {
      alert('Please fill out the debtor name, email, and outstanding balance to proceed.');
      return;
    }

    // Supply clean defaults for hidden fields to preserve backend compliance without bothering the user
    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: initialData?.phone || '+234 000 000 0000',
      amount: parseFloat(amount),
      currency,
      receiptName,
      merchantBusinessName: initialData?.merchantBusinessName || 'SME Store',
      merchantLocation: initialData?.merchantLocation || 'Nigeria',
      merchantEthnicity: initialData?.merchantEthnicity || 'Standard B2B Tone',
      merchantWhatTheySell: initialData?.merchantWhatTheySell || 'Core trade goods',
      debtorLocation: initialData?.debtorLocation || 'Not specified',
      paymentDueDate: paymentDueDate || new Date().toISOString().split('T')[0],
      isFreelancer: initialData?.isFreelancer || false,
      isMouthToMouth: false,
      sequenceMode,
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Dark overlay backdrop */}
      <div 
        id="add-debtor-backdrop"
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity" 
      />

      {/* Main card modal */}
      <div className="relative bg-white rounded-lg max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden mx-auto animate-fade-in z-10">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 bg-[#FAFAFA]">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-sans font-black text-slate-950 text-base uppercase tracking-tight">New Debtor Entry</h3>
              <p className="text-xs text-slate-500">Provide the details to register the invoice and schedule alerts</p>
            </div>
            <button 
              id="close-add-debtor-btn"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-900 p-1.5 rounded-sm hover:bg-slate-150 transition cursor-pointer font-bold"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Simplified Form */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono">
              Debtor / Customer Email *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@email.com"
              className="block w-full rounded border border-slate-200 py-2.5 px-3.5 text-sm text-slate-950 focus:outline-none focus:border-slate-950 bg-slate-50/50 hover:bg-slate-50 transition"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono">
              Debtor Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Chinedu Okafor"
              className="block w-full rounded border border-slate-200 py-2.5 px-3.5 text-sm text-slate-950 focus:outline-none focus:border-slate-950 bg-slate-50/50 hover:bg-slate-50 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono">
                Outstanding Balance *
              </label>
              <div className="flex">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="rounded-l border-y border-l border-slate-200 bg-[#FAFAFA] px-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="₦">₦ (NGN)</option>
                  <option value="$">$ (USD)</option>
                  <option value="£">£ (GBP)</option>
                  <option value="€">€ (EUR)</option>
                </select>
                <input
                  type="number"
                  required
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="e.g. 15000"
                  className="block w-full rounded-r border border-slate-200 py-2.5 px-3.5 text-sm text-slate-950 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due Date *
              </label>
              <input
                type="date"
                required
                value={paymentDueDate}
                onChange={(e) => setPaymentDueDate(e.target.value)}
                className="block w-full rounded border border-slate-200 py-2.5 px-3.5 text-sm text-slate-950 focus:outline-none bg-slate-50/50 transition font-mono"
              />
            </div>
          </div>

          {/* Optional Attachment File */}
          <div className="space-y-1.5 pt-2">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono flex justify-between">
              <span>Attach Invoice / Receipt (Optional)</span>
              {receiptName && (
                <button 
                  type="button" 
                  onClick={() => setReceiptName(null)}
                  className="text-red-600 hover:underline text-[9px] uppercase font-bold"
                >
                  Remove
                </button>
              )}
            </label>

            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded p-4 text-center cursor-pointer transition ${
                isDragging 
                  ? 'border-slate-950 bg-slate-50' 
                  : receiptName 
                    ? 'border-emerald-600 bg-emerald-50/10' 
                    : 'border-slate-200 hover:border-slate-950 hover:bg-[#FAFAFA]'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.png,.jpg,.jpeg"
                className="hidden"
              />

              {receiptName ? (
                <div className="flex items-center justify-center space-x-2 text-slate-900">
                  <FileText className="w-5 h-5 text-emerald-700" />
                  <p className="text-xs font-bold text-slate-950 truncate max-w-[200px]">{receiptName}</p>
                </div>
              ) : (
                <div className="space-y-1 select-none">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                  <p className="text-xs font-medium text-slate-600">Click or drag receipt PDF or image</p>
                </div>
              )}
            </div>
          </div>

          {/* Sequence Mode Toggle selection */}
          <div className="space-y-1.5 pt-1">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-widest font-mono">
              Sequence Mode (Outreach Tone)
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSequenceMode('FRIENDLY')}
                className={`p-2 px-3 border rounded text-xs font-bold text-left cursor-pointer transition-all ${
                  sequenceMode === 'FRIENDLY'
                    ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 ring-1 ring-indigo-650'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 overflow-hidden'
                }`}
              >
                <div className="font-sans font-black uppercase text-[9px] tracking-wider block mb-0.5 text-indigo-900">Standard Friendly</div>
                <span className="text-[8.5px] leading-snug text-slate-500 font-normal normal-case block">Collaborative throughout all 4 stages. Keeps client relationships sweet & secure.</span>
              </button>

              <button
                type="button"
                onClick={() => setSequenceMode('ENFORCEMENT')}
                className={`p-2 px-3 border rounded text-xs font-bold text-left cursor-pointer transition-all ${
                  sequenceMode === 'ENFORCEMENT'
                    ? 'border-rose-600 bg-rose-50/30 text-rose-900 ring-1 ring-rose-650'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-350 overflow-hidden'
                }`}
              >
                <div className="font-sans font-black uppercase text-[9px] tracking-wider block mb-0.5 text-rose-700">Enforcement Hammer</div>
                <span className="text-[8.5px] leading-snug text-slate-500 font-normal normal-case block">Gradual escalate to platform dispute registry and credit reporting blacklist (Stage 4).</span>
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
            <button
              id="submit-add-debtor-btn"
              type="submit"
              className="px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-white text-[10px] uppercase tracking-widest font-extrabold rounded-sm transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-98"
            >
              Add Debtor & Schedule Alerts <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
