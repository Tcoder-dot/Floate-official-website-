import React, { useState } from 'react';
import { 
  Check, 
  Copy, 
  FileText, 
  Building, 
  CreditCard, 
  CheckCircle, 
  Calendar, 
  Info,
  Lock,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { Invoice } from '../types';
import FlutterwaveSandboxModal from './FlutterwaveSandboxModal';

interface ClientInvoicePaymentPortalProps {
  invoice: Invoice;
  onConfirmPayment: (invoiceId: string, payerReference: string) => Promise<void>;
  onBackToApp?: () => void;
}

export default function ClientInvoicePaymentPortal({
  invoice,
  onConfirmPayment,
  onBackToApp
}: ClientInvoicePaymentPortalProps) {
  const [payerRef, setPayerRef] = useState('');
  const [copiedBank, setCopiedBank] = useState(false);
  const [copiedNum, setCopiedNum] = useState(false);
  const [copiedName, setCopiedName] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // Flutterwave Integration States
  const [paymentMode, setPaymentMode] = useState<'FLUTTERWAVE' | 'TRANSFER'>('FLUTTERWAVE');
  const [showFlwModal, setShowFlwModal] = useState(false);
  const [initializingFlw, setInitializingFlw] = useState(false);
  const [flwError, setFlwError] = useState<string | null>(null);

  const handlePayWithFlutterwave = async () => {
    setInitializingFlw(true);
    setFlwError(null);
    try {
      const tx_ref = `flw_inv_${invoice.id}_${Date.now()}`;
      
      const res = await fetch("/api/payment/flutterwave/initialize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          amount: invoice.totalAmount,
          currency: invoice.currency === '₦' ? 'NGN' : (invoice.currency === '$' ? 'USD' : 'NGN'),
          email: invoice.clientEmail || 'billing@customer.com',
          name: invoice.clientName || 'Customer',
          tx_ref,
          description: `Payment for Invoice ${invoice.invoiceNumber}`
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to initialize Flutterwave payment");
      }

      if (data.simulated) {
        setShowFlwModal(true);
      } else if (data.link) {
        window.location.href = data.link;
      } else {
        throw new Error("No payment link returned by payment gateway");
      }
    } catch (err: any) {
      console.error(err);
      setFlwError(err.message || "Could not connect to payment gateway");
    } finally {
      setInitializingFlw(false);
    }
  };

  const handleFlutterwaveSuccess = async (reference: string) => {
    setShowFlwModal(false);
    setSubmitting(true);
    try {
      await onConfirmPayment(invoice.id, `Flutterwave Ref: ${reference}`);
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyText = (text: string, setCopied: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitConfirmation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payerRef.trim()) {
      alert("Please enter the payer reference or bank sender name first!");
      return;
    }
    setSubmitting(true);
    try {
      await onConfirmPayment(invoice.id, payerRef.trim());
      setSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const isPaid = invoice.status === 'PAID' || success;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 sm:p-8 flex flex-col items-center">
      
      {/* Top minimalistic header bar */}
      <div className="w-full max-w-6xl flex items-center justify-between pb-6 mb-4 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 bg-slate-950 text-white rounded-lg flex items-center justify-center font-bold font-mono">
            F
          </div>
          <div>
            <span className="text-[10px] uppercase font-mono font-black text-slate-400 tracking-wider">Floate Network Gateway</span>
            <h1 className="font-extrabold text-xs text-slate-800 uppercase tracking-tight">Direct Client Settlement</h1>
          </div>
        </div>
        {onBackToApp ? (
          <button
            onClick={onBackToApp}
            className="text-xs text-slate-600 hover:text-slate-950 flex items-center gap-1.5 transition-colors font-medium border border-slate-200 bg-white px-3 py-1.5 rounded-lg shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Dashboard
          </button>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
            <Lock className="w-3 h-3" /> Secure Client Link
          </div>
        )}
      </div>

      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: Responsive Invoice Ledger Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6">
          
          {/* Header row with logo and credentials */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
            <div className="space-y-1">
              {invoice.logoUrl ? (
                <img 
                  src={invoice.logoUrl} 
                  alt={invoice.businessName} 
                  className="h-10 max-w-[150px] object-contain rounded-lg mb-1"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="h-10 w-10 flex items-center justify-center bg-slate-950 text-white font-black rounded-lg text-lg mb-1">
                  {invoice.businessName.charAt(0).toUpperCase()}
                </div>
              )}
              <h2 className="text-base font-bold text-slate-900 leading-none">{invoice.businessName}</h2>
              <p className="text-xs text-slate-450 flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-400" /> {invoice.businessAddress}</p>
              <div className="text-[10px] text-slate-400 font-mono space-y-0.5">
                <p className="flex items-center gap-1"><Mail className="w-3 h-3" /> {invoice.businessEmail}</p>
                <p className="flex items-center gap-1"><Phone className="w-3 h-3" /> {invoice.businessPhone}</p>
              </div>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="text-[9px] uppercase tracking-widest font-mono font-extrabold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full block w-fit sm:ml-auto">
                Official Bill
              </span>
              <h1 className="text-xl font-black text-slate-950 leading-none mt-1">INVOICE PREVIEW</h1>
              <span className="inline-block bg-slate-100 text-slate-800 font-mono text-[10.5px] px-2.5 py-0.5 rounded border border-slate-200">
                {invoice.invoiceNumber}
              </span>
              <p className="text-[10.5px] text-slate-400 mt-2 font-mono">
                Issued: <span className="text-slate-700 font-semibold">{invoice.issueDate}</span>
              </p>
            </div>
          </div>

          {/* Recipient area */}
          <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Billed To Recipient</span>
              <h4 className="font-bold text-slate-900 text-sm leading-snug">{invoice.clientName}</h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-snug">{invoice.clientAddress}</p>
              <p className="text-[10px] text-slate-400 mt-1.5 font-mono select-all">{invoice.clientEmail} • {invoice.clientPhone}</p>
            </div>

            <div className="sm:text-right flex flex-col justify-between items-start sm:items-end">
              <div>
                <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block mb-1">Payment Status</span>
                <span className={`inline-block px-2.5 py-1 text-[10px] font-black tracking-widest rounded uppercase border ${
                  isPaid 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-250 font-mono shadow-2xs' 
                    : 'bg-rose-50 text-rose-700 border-rose-200 font-mono animate-pulse'
                }`}>
                  {isPaid ? 'PAID / CLEARED' : 'UNPAID / OVERDUE'}
                </span>
              </div>
              <p className="text-[10.5px] font-mono text-slate-400 mt-2">
                Deadline: <span className="text-rose-600 font-bold">{invoice.dueDate}</span>
              </p>
            </div>
          </div>

          {/* Table list */}
          <div className="space-y-2">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block pb-1 border-b">Deliverable Statement</span>
            
            <div className="grid grid-cols-12 gap-2 text-[9px] font-black text-slate-400 uppercase tracking-wider font-mono">
              <div className="col-span-8">Description of service rendered</div>
              <div className="col-span-1 text-center">Qty</div>
              <div className="col-span-3 text-right">Price ({invoice.currency})</div>
            </div>

            <div className="space-y-1.5 pt-1.5">
              {invoice.items.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-center py-2 border-b border-slate-100 text-xs text-slate-800">
                  <div className="col-span-8 font-medium leading-normal">{item.description}</div>
                  <div className="col-span-1 text-center font-mono text-slate-500">{item.quantity}</div>
                  <div className="col-span-3 text-right font-mono font-bold text-slate-900">
                    {invoice.currency}{item.unitPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Calculations row */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-4 border-t border-slate-100 justify-end">
            <div className="sm:col-span-6 text-xs text-slate-500 italic max-w-sm">
              {invoice.notes || "Please inspect the deliverables. This bill was formulated from natural language parameters & verified."}
            </div>
            <div className="sm:col-span-6 space-y-2 font-mono text-right text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-800">
                  {invoice.currency}{invoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
              {invoice.taxRate > 0 && (
                <div className="flex justify-between text-slate-500">
                  <span>Tax/VAT ({invoice.taxRate}%):</span>
                  <span className="font-semibold text-slate-800">
                    {invoice.currency}{invoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-950 border-t pt-2">
                <span className="font-sans">Grand Total:</span>
                <span>
                  {invoice.currency}{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Watermark footer */}
          <div className="pt-4 border-t border-slate-100 text-center text-[9px] text-slate-400 tracking-wider font-mono uppercase">
            Payment requested via Floate Direct Ledger Gateway • Fully Audited
          </div>

        </div>

        {/* RIGHT COMPONENT: Online Flutterwave Gateway or Direct Transfer selection */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Payment Mode Selector tabs */}
          <div className="grid grid-cols-2 bg-slate-100 p-1 rounded-xl border border-slate-200 shadow-sm shrink-0">
            <button
              onClick={() => setPaymentMode('FLUTTERWAVE')}
              className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentMode === 'FLUTTERWAVE'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5 text-[#EF4444]" /> Pay Online
            </button>
            <button
              onClick={() => setPaymentMode('TRANSFER')}
              className={`py-2 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                paymentMode === 'TRANSFER'
                  ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Building className="w-3.5 h-3.5 text-slate-600" /> Bank Transfer
            </button>
          </div>

          {paymentMode === 'FLUTTERWAVE' ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-2xl"></div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-red-50 text-[#EF4444] rounded border border-red-100">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-400 tracking-wider font-bold">Secure Online checkout</span>
                    <h3 className="font-sans font-black text-sm uppercase tracking-tight text-slate-800">Flutterwave Payment</h3>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-250/50 rounded-lg p-4 space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-400 font-mono block">Direct Amount Due</span>
                  <span className="font-mono text-2.5xl font-black text-slate-900 leading-none">
                    {invoice.currency}{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] text-slate-500">Instant credit clearance with zero processing fee. Settle via Card, USSD, or Direct Debit.</p>
                </div>

                {flwError && (
                  <div className="p-3 bg-red-50 text-red-700 rounded-lg text-[10.5px] leading-relaxed border border-red-100 flex items-start gap-1.5 font-medium animate-shake">
                    <span className="text-sm">⚠️</span>
                    <div>
                      <span className="font-bold">Gateway Connection:</span> {flwError}
                    </div>
                  </div>
                )}

                <div className="space-y-2.5 pt-1">
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>Real-time instant ledger payment logging</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>Automatic settlement notification triggers</span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="text-emerald-600 font-black">✓</span>
                    <span>Zero transactional surcharge to the customer</span>
                  </div>
                </div>
              </div>

              {isPaid ? (
                <div className="bg-emerald-50 border border-emerald-500/20 rounded-xl p-4.5 text-center space-y-2.5 animate-fade-in">
                  <span className="inline-flex items-center justify-center p-2.5 bg-emerald-500/10 text-emerald-600 rounded-full border border-emerald-500/25">
                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-emerald-600 uppercase tracking-wider">Invoice Fully Paid</h4>
                    <p className="text-[10px] text-slate-500 leading-normal mt-1">This transaction is certified secure. Receipt reference has been logged.</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handlePayWithFlutterwave}
                  disabled={initializingFlw || submitting}
                  className="w-full py-3.5 bg-[#EF4444] hover:bg-red-500 text-white font-black uppercase text-[10px] tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-500/10 cursor-pointer disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
                >
                  {initializingFlw ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" /> Securing Tunnel Link...
                    </>
                  ) : (
                    <>Pay Now with Flutterwave</>
                  )}
                </button>
              )}

              <div className="text-center pt-2">
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono font-bold block">
                  🔒 Flutterwave security shield • 256-bit AES Encryption
                </span>
              </div>
            </div>
          ) : (
            /* Main Direct Transfer clearance card */
            <div className="bg-slate-950 text-white rounded-2xl border border-slate-900 p-6 flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
              
              {/* Background patterns */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-28 h-28 bg-indigo-500/10 rounded-full blur-2xl"></div>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">
                    <CreditCard className="w-5 h-5" />
                  </span>
                  <div>
                    <span className="text-[9px] uppercase font-mono text-slate-500 tracking-wider font-bold">Transfer Remittance</span>
                    <h3 className="font-sans font-black text-sm uppercase tracking-tight text-white">Direct Bank Clearance</h3>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1.5">
                  <span className="text-[9px] uppercase tracking-wider font-bold text-slate-550 font-mono block">Direct Amount Payable</span>
                  <span className="font-mono text-2.5xl font-extrabold text-white leading-none">
                    {invoice.currency}{invoice.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[10px] text-slate-400">Please send 100% of this amount directly to the bank account below.</p>
                </div>

                {/* Bank Credentials info list */}
                <div className="space-y-3 pt-2">
                  
                  {/* Bank Name */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Recipient Bank</span>
                      <span className="font-sans font-black text-xs text-white uppercase">{invoice.bankName || 'Access Bank'}</span>
                    </div>
                    <button 
                      onClick={() => handleCopyText(invoice.bankName || 'Access Bank', setCopiedBank)}
                      className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded transition"
                      title="Copy Bank"
                    >
                      {copiedBank ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Account Number */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Account Number</span>
                      <span className="font-mono font-black text-sm text-slate-100 select-all tracking-wider">{invoice.accountNumber || '0122334455'}</span>
                    </div>
                    <button 
                      onClick={() => handleCopyText(invoice.accountNumber || '0122334455', setCopiedNum)}
                      className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white rounded-lg transition"
                      title="Copy Account Number"
                    >
                      {copiedNum ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                  {/* Account Beneficiary Name */}
                  <div className="flex items-center justify-between border-b border-white/5 pb-2.5">
                    <div>
                      <span className="text-[9.5px] uppercase font-bold text-slate-500 block">Account Holder Name</span>
                      <span className="font-sans font-bold text-xs text-slate-200 select-all">{invoice.accountName || invoice.businessName}</span>
                    </div>
                    <button 
                      onClick={() => handleCopyText(invoice.accountName || invoice.businessName, setCopiedName)}
                      className="p-1 text-slate-500 hover:text-white hover:bg-white/5 rounded transition"
                      title="Copy Holder Name"
                    >
                      {copiedName ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>

                </div>
              </div>

              {/* Checkboxes confirmations and confirmations submit */}
              {isPaid ? (
                <div className="bg-emerald-900/25 border border-emerald-500/20 rounded-xl p-4.5 text-center space-y-2.5 animate-fade-in">
                  <span className="inline-flex items-center justify-center p-2.5 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/25">
                    <CheckCircle className="w-6 h-6 text-emerald-400" />
                  </span>
                  <div>
                    <h4 className="font-bold text-xs text-[#EF4444] uppercase tracking-wider">Remittance Fully Logged</h4>
                    <p className="text-[10px] text-slate-350 leading-normal mt-1">This invoice status has been updated to PAID inside the merchant's ledger system. You can close this window safely.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitConfirmation} className="space-y-3.5 pt-2 border-t border-white/5">
                  <div className="space-y-1.5">
                    <label className="text-[9.5px] uppercase tracking-wider font-extrabold text-slate-400 font-mono block">Sender Name / Transfer Ref</label>
                    <input 
                      type="text"
                      required
                      value={payerRef}
                      onChange={(e) => setPayerRef(e.target.value)}
                      placeholder="E.g., Emeka transfer GTB"
                      className="w-full text-xs bg-slate-900 border border-slate-850 hover:border-slate-800 focus:border-slate-700 text-white rounded-lg p-2.5 outline-none focus:ring-1 focus:ring-rose-500 transition-all placeholder:text-slate-600 font-sans"
                    />
                    <p className="text-[9px] text-slate-500 leading-tight">By clicking confirm below, you confirm that a transfer has indeed been fully processed via your mobile app.</p>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-rose-600 hover:bg-rose-500 text-white font-black uppercase text-[10px] tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-rose-900/10 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      "Notifying Merchant..."
                    ) : (
                      <>I HAVE PAID <Check className="w-4 h-4 text-white" /></>
                    )}
                  </button>
                </form>
              )}

            </div>
          )}

          {/* Secure Network note card */}
          <div className="bg-slate-100 border border-slate-200/60 rounded-xl p-4 flex gap-3 text-slate-500 text-[11px] leading-relaxed">
            <Info className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block text-slate-800 uppercase text-[9px] tracking-wide mb-1">Decentralized Direct Settlement</span>
              This trade remittance utilizes zero middle-man holding bank accounts, allowing fee-free settlement directly to local accounts. Verify due limits and account information prior to final confirmation.
            </div>
          </div>

        </div>

      </div>

      <FlutterwaveSandboxModal
        isOpen={showFlwModal}
        onClose={() => setShowFlwModal(false)}
        amount={invoice.totalAmount}
        currency={invoice.currency === '₦' ? 'NGN' : (invoice.currency === '$' ? 'USD' : 'NGN')}
        email={invoice.clientEmail || 'billing@customer.com'}
        name={invoice.clientName || 'Customer'}
        txRef={`flw_inv_${invoice.id}_${Date.now()}`}
        description={`Payment for Invoice ${invoice.invoiceNumber}`}
        onSuccess={handleFlutterwaveSuccess}
      />

    </div>
  );
}
