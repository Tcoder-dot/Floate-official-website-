import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Printer, 
  Loader2, 
  Building, 
  User, 
  DollarSign, 
  Calendar, 
  Plus, 
  Trash2, 
  Send, 
  Check, 
  ChevronRight, 
  RefreshCw,
  Info,
  Link,
  Share2,
  Zap
} from 'lucide-react';
import { Invoice, InvoiceLineItem, UserState } from '../types';

interface InvoiceGeneratorTabProps {
  user: UserState;
  invoices: Invoice[];
  onSaveInvoice: (invoice: Invoice) => Promise<void>;
  onDeleteInvoice: (id: string) => Promise<void>;
  onUpdateInvoiceStatus: (id: string, status: 'DRAFT' | 'SENT' | 'PAID' | 'OVERDUE') => Promise<void>;
  onTriggerChaserFromInvoice: (invoice: Invoice) => void;
}

const compressLogoFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 220;
        const MAX_HEIGHT = 120;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        resolve(compressedDataUrl);
      };
      img.onerror = (err) => reject(err);
      img.src = event.target?.result as string;
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function InvoiceGeneratorTab({
  user,
  invoices,
  onSaveInvoice,
  onDeleteInvoice,
  onUpdateInvoiceStatus,
  onTriggerChaserFromInvoice
}: InvoiceGeneratorTabProps) {
  // Input fields
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default Business Override settings
  const [businessName, setBusinessName] = useState(user.businessName || user.name || 'My Freelance Business');
  const [businessAddress, setBusinessAddress] = useState(user.businessAddress || 'Lagos, Nigeria');
  const [businessEmail, setBusinessEmail] = useState(user.email || '');
  const [businessPhone, setBusinessPhone] = useState(user.phone || '');
  const [logoUrl, setLogoUrl] = useState('');

  // Active Invoice preview & edit state
  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [showTax, setShowTax] = useState(true);

  // Auto-detect if activeInvoice contains tax/VAT to pre-select checkbox
  useEffect(() => {
    if (activeInvoice) {
      setShowTax((activeInvoice.taxRate || 0) > 0 || (activeInvoice.taxAmount || 0) > 0);
    }
  }, [activeInvoice?.id]);

  // List filter
  const [searchTerm, setSearchTerm] = useState('');

  // Sync with user profile on load
  useEffect(() => {
    if (user.businessName) setBusinessName(user.businessName);
    if (user.businessAddress) setBusinessAddress(user.businessAddress);
    if (user.email) setBusinessEmail(user.email);
    if (user.phone) setBusinessPhone(user.phone);
  }, [user]);

  // Presets of smart prompts to assist user
  const promptPresets = [
    {
      title: "Design Retainer",
      text: "Draft an invoice for Acme Tech Corp. 2 months of UX Design consultancy at ₦250,000 per month, plus ₦45,000 one-off branding charge. Include 7.5% Nigerian VAT. Due in 14 days. Bank: GTBank 0113224422."
    },
    {
      title: "Freelance Dev Consultation",
      text: "Create an invoice for Oba's Leather Outlets: 40 hours of full-stack developer consultation at ₦7,500/hr. No tax. Charge in Naira. Due next Friday. GTBank Account: 0229988112 Emeka Rich."
    },
    {
      title: "Content Marketing Plan",
      text: "Billing for Apex Digital. Custom social media marketing & SEO content plan total ₦180,000. 5% tax. Due within 10 days. Account Number: 1009922119 Access Bank."
    }
  ];

  const handleGenerateInvoice = async () => {
    if (!prompt.trim()) {
      setError("Please write an invoice outline prompt first!");
      return;
    }

    setLoading(true);
    setError(null);
    setIsSaved(false);

    try {
      const response = await fetch('/api/generate-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          businessName,
          businessAddress,
          businessEmail,
          businessPhone,
          logoUrl
        })
      });

      if (!response.ok) {
        throw new Error("Server had trouble parsing your invoice outline.");
      }

      const data = await response.json();
      
      // Assemble valid structured ID and owner state
      const newInvoiceId = 'inv_' + Math.random().toString(36).substr(2, 9);
      
      const savedBank = localStorage.getItem('floate_payout_bank_name');
      const savedAccNum = localStorage.getItem('floate_payout_acc_num');
      const savedAccHolder = localStorage.getItem('floate_payout_acc_name');

      const generatedInvoice: Invoice = {
        businessName: businessName || 'My Freelance Business',
        businessAddress: businessAddress || 'Lagos, Nigeria',
        businessEmail: businessEmail || '',
        businessPhone: businessPhone || '',
        logoUrl: logoUrl || '',
        ...data,
        bankName: savedBank || data.bankName || '',
        accountNumber: savedAccNum || data.accountNumber || '',
        accountName: savedAccHolder || data.accountName || data.accountHolder || '',
        id: newInvoiceId,
        ownerId: '', // set by save callback
        status: 'DRAFT',
        createdAt: new Date().toISOString()
      };

      setActiveInvoice(generatedInvoice);
    } catch (err: any) {
      setError(err.message || "Failed to analyze prompt. Please try a different wording.");
    } finally {
      setLoading(false);
    }
  };

  // Allow live editing of line items inside the active invoice preview
  const handleUpdateLineItem = (index: number, field: keyof InvoiceLineItem, value: any) => {
    if (!activeInvoice) return;
    
    const updatedItems = [...activeInvoice.items];
    const item = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate item total
    if (field === 'quantity' || field === 'unitPrice') {
      const qty = field === 'quantity' ? Number(value) : item.quantity;
      const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
      item.total = qty * price;
    }
    
    updatedItems[index] = item;

    // Recalculate subtotal, tax amount, and total Amount
    const newSubtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
    const newTaxAmount = (newSubtotal * activeInvoice.taxRate) / 100;
    const newTotalAmount = newSubtotal + newTaxAmount;

    setActiveInvoice({
      ...activeInvoice,
      items: updatedItems,
      subtotal: newSubtotal,
      taxAmount: newTaxAmount,
      totalAmount: newTotalAmount
    });
  };

  // Add a blank line item
  const handleAddLineItem = () => {
    if (!activeInvoice) return;
    const newItem: InvoiceLineItem = {
      description: 'New service/item',
      quantity: 1,
      unitPrice: 0,
      total: 0
    };
    const updatedItems = [...activeInvoice.items, newItem];
    setActiveInvoice({
      ...activeInvoice,
      items: updatedItems
    });
  };

  // Remove a line item
  const handleRemoveLineItem = (index: number) => {
    if (!activeInvoice) return;
    const updatedItems = activeInvoice.items.filter((_, idx) => idx !== index);
    const newSubtotal = updatedItems.reduce((sum, i) => sum + i.total, 0);
    const newTaxAmount = (newSubtotal * activeInvoice.taxRate) / 100;
    const newTotalAmount = newSubtotal + newTaxAmount;

    setActiveInvoice({
      ...activeInvoice,
      items: updatedItems,
      subtotal: newSubtotal,
      taxAmount: newTaxAmount,
      totalAmount: newTotalAmount
    });
  };

  const handleSaveActiveInvoice = async () => {
    if (!activeInvoice) return;
    try {
      await onSaveInvoice(activeInvoice);
      setIsSaved(true);
      // Keep active view but show Saved badge
    } catch (err: any) {
      setError("Error saving invoice profile: " + err.message);
    }
  };

  // Download / Print Active Invoice
  const handlePrintInvoice = () => {
    const printContent = document.getElementById('printable-invoice-canvas');
    if (!printContent) return;

    const originalContent = document.body.innerHTML;
    const printWindow = window.open('', '', 'height=650,width=900');
    if (printWindow) {
      printWindow.document.write('<html><head><title>Print Invoice</title>');
      // Inject Tailwind styles or basic beautiful print stylesheet
      printWindow.document.write('<script src="https://cdn.tailwindcss.com"></script>');
      printWindow.document.write('<style>body { font-family: sans-serif; padding: 24px; }</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      // Allow fonts and scripts to settle
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 600);
    } else {
      window.print();
    }
  };

  const filteredInvoices = invoices.filter(inv => 
    (inv.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.invoiceNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (inv.businessName || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="invoice_tab_container">
      {/* LEFT COLUMN: Input Outline Panel / Saved Invoices */}
      <div className="lg:col-span-5 space-y-6">
        
        {/* Step 1: Prompt AI Generator Panel */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6" id="panel_invoice_generation">
          <div className="mb-4">
            <h3 className="font-bold text-slate-800 text-lg uppercase tracking-tight">AI Invoice Draft Engine</h3>
            <p className="text-xs text-slate-500 mt-0.5">Provide a billing outline & AI will generate the item ledger</p>
          </div>

          <div className="space-y-4">
            {/* Sender Overrides Drawer */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3 border border-slate-100">
              <span className="text-xs font-semibold text-slate-600 tracking-wide uppercase flex items-center gap-1">
                <Building className="w-3.5 h-3.5 text-slate-500" /> Sender Billing Profile
              </span>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Business Name</label>
                  <input 
                    type="text" 
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Enter Trade Name"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Phone Line</label>
                  <input 
                    type="text" 
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="Seller Phone"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Business Address</label>
                <input 
                  type="text" 
                  value={businessAddress}
                  onChange={(e) => setBusinessAddress(e.target.value)}
                  className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  placeholder="Billing HQ Address"
                />
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500">Email Address</label>
                  <input 
                    type="email" 
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    placeholder="billing@email.com"
                  />
                </div>
                
                <div>
                  <label className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 block mb-1">Business Logo</label>
                  <div className="flex flex-col sm:flex-row gap-3 items-center bg-white p-3 rounded-lg border border-slate-200">
                    {logoUrl ? (
                      <div className="relative group shrink-0">
                        <img 
                          src={logoUrl} 
                          alt="Company Logo Preview" 
                          className="h-12 w-12 object-contain rounded border border-slate-200 bg-slate-50 p-1"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setLogoUrl('');
                            if (activeInvoice) {
                              setActiveInvoice({ ...activeInvoice, logoUrl: '' });
                            }
                          }}
                          className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white p-0.5 rounded-full hover:bg-rose-600 transition shadow cursor-pointer"
                          title="Remove logo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ) : (
                      <div className="h-12 w-12 rounded bg-slate-100 border border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 shrink-0">
                        <Building className="w-4 h-4 opacity-45" />
                        <span className="text-[8px]">No Logo</span>
                      </div>
                    )}
                    
                    <div className="flex-1 w-full space-y-1.5">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <label className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-[10px] font-bold uppercase tracking-wider cursor-pointer inline-flex items-center justify-center gap-1.5 transition whitespace-nowrap">
                          <input 
                            type="file" 
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                try {
                                  const compressed = await compressLogoFile(file);
                                  setLogoUrl(compressed);
                                  if (activeInvoice) {
                                    setActiveInvoice({ ...activeInvoice, logoUrl: compressed });
                                  }
                                } catch (err) {
                                  console.error("Logo compression failure:", err);
                                }
                              }
                            }}
                          />
                          Upload Logotype
                        </label>
                        <input 
                          type="text" 
                          value={logoUrl.startsWith('data:') ? '' : logoUrl}
                          onChange={(e) => {
                            setLogoUrl(e.target.value);
                            if (activeInvoice) {
                              setActiveInvoice({ ...activeInvoice, logoUrl: e.target.value });
                            }
                          }}
                          className="flex-1 text-[11px] bg-slate-50 border border-slate-200 rounded px-2.5 py-1.5 focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                          placeholder="Or paste logo URL..."
                        />
                      </div>
                      <p className="text-[9px] text-slate-400 leading-none">
                        Compresses logo client-side for offline PDF print inclusion.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prompt input */}
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">Describe your deliverables, client, and costs:</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="E.g., Generate an invoice for Bola Agency. We designed 3 high-fidelity screens for ₦50,000 each, and conducted 4 user interviews for ₦20,000 each. Tax rate is 5%. Due next week. Bank GTB 0122331122 Emeka."
                className="w-full h-32 text-xs border border-slate-200 rounded-xl p-3 focus:ring-1 focus:ring-emerald-500 focus:outline-none text-slate-700 font-sans"
              />
            </div>

            {/* Demo Presets */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">Or pick a demo outline:</span>
              <div className="flex flex-col gap-1.5">
                {promptPresets.map((preset, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(preset.text)}
                    className="text-left text-xs text-slate-600 border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/40 p-2.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <span className="font-semibold text-emerald-700 block">{preset.title}</span>
                    <span className="line-clamp-1 text-slate-500 text-[10px]">{preset.text}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              onClick={handleGenerateInvoice}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors disabled:bg-slate-300 disabled:cursor-not-allowed cursor-pointer"
              id="btn_generate_invoice_submit"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  Calculating totals & compiling...
                </>
              ) : (
                "Compile & Generate Billing Document"
              )}
            </button>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 flex items-start gap-2">
                <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>
        </div>

        {/* List of Saved Billings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6" id="panel_invoice_list">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-800 text-base">Archived invoices</h3>
              <p className="text-xs text-slate-500">Track and manage historic prompts</p>
            </div>
            <span className="bg-slate-100 text-slate-600 px-2 py-0.5 text-xs font-semibold rounded-full font-mono">
              {filteredInvoices.length}
            </span>
          </div>

          {/* Search bar */}
          <div className="relative mb-3">
            <input 
              type="text" 
              placeholder="Search client, invoice number..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <span className="absolute left-2.5 top-2.5 text-slate-400">
              <FileText className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                <p>No invoices saved or matching your filter.</p>
              </div>
            ) : (
              filteredInvoices.map((inv) => (
                <div 
                  key={inv.id} 
                  onClick={() => { setActiveInvoice(inv); setIsSaved(true); }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    activeInvoice?.id === inv.id 
                      ? 'bg-emerald-50/50 border-emerald-200 shadow-sm' 
                      : 'bg-white border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] font-mono text-slate-400 tracking-wider block uppercase">{inv.invoiceNumber}</span>
                      <h4 className="font-medium text-slate-800 text-xs line-clamp-1">{inv.clientName}</h4>
                      <p className="text-[10px] text-slate-400">{inv.issueDate}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-xs font-semibold block text-slate-700">
                        {inv.currency}{inv.totalAmount.toLocaleString()}
                      </span>
                      <select 
                        value={inv.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => onUpdateInvoiceStatus(inv.id, e.target.value as any)}
                        className={`text-[9px] font-semibold mt-1 rounded-full px-2 py-0.5 focus:outline-none cursor-pointer ${
                          inv.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                          inv.status === 'SENT' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                          inv.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-100' :
                          'bg-slate-100 text-slate-700 border-slate-200'
                        }`}
                      >
                        <option value="DRAFT">DRAFT</option>
                        <option value="SENT">SENT</option>
                        <option value="PAID">PAID</option>
                        <option value="OVERDUE">OVERDUE</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: Interactive High-Fidelity Invoice Preview Canvas */}
      <div className="lg:col-span-7 space-y-4">
        {activeInvoice ? (
          <div className="space-y-4" id="invoice_workspace_preview">
            
            {/* Context/Action bar */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <div>
                  <h4 className="text-xs font-semibold text-emerald-400">Interactive Document Studio</h4>
                  <p className="text-[10px] text-slate-300">Edit line items, update tax rates live, then export</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Print or Save as PDF"
                >
                  <Printer className="w-3.5 h-3.5" /> Print / Save PDF
                </button>
                <button
                  onClick={handleSaveActiveInvoice}
                  disabled={isSaved}
                  className={`${
                    isSaved 
                      ? 'bg-emerald-600 text-white' 
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold'
                  } px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-all cursor-pointer`}
                >
                  {isSaved ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Saved Successfully
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" /> Store to Ledger
                    </>
                  )}
                </button>
                {isSaved && (
                  <>
                    <button
                      onClick={() => {
                        const link = `${window.location.origin}${window.location.pathname}?invoiceId=${activeInvoice.id}`;
                        navigator.clipboard.writeText(link);
                        alert("Secure client payment link copied to clipboard!\n\nProvide this path to your client so they can settle directly via bank transfer.\n\nLink:\n" + link);
                      }}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                      title="Copy Public Settlement Link"
                    >
                      <Link className="w-3.5 h-3.5" /> Copy Client Link
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm("Are you sure you want to delete this invoice?")) {
                          await onDeleteInvoice(activeInvoice.id);
                          setActiveInvoice(null);
                          setIsSaved(false);
                        }
                      }}
                      className="p-1.5 bg-red-100 hover:bg-red-200 text-red-650 text-red-600 rounded-lg transition-colors cursor-pointer"
                      title="Delete Invoice"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                )}
              </div>
            </div>

            {isSaved && activeInvoice.status !== 'PAID' && (
              <div className="bg-amber-50/75 border border-amber-200/80 rounded-xl p-5 mb-5 space-y-3.5 animate-fade-in">
                <div className="flex items-start gap-3">
                  <span className="p-2 bg-amber-100 text-amber-800 rounded-lg">
                    <Zap className="w-5 h-5 text-amber-800 animate-pulse" />
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] uppercase font-mono font-black tracking-widest text-amber-850 bg-amber-100 px-2 py-0.5 rounded">Prepaid Chaser Tool</span>
                      <span className="text-[10px] text-slate-500">• Pay-as-you-go channel routing</span>
                    </div>
                    <h3 className="font-sans font-black text-slate-900 text-sm uppercase tracking-tight mt-1">Direct Automated Chaser Sequence</h3>
                    <p className="text-xs text-slate-555 leading-relaxed mt-1">
                      This client's invoice is currently unpaid. Instantly compile contact details, outstanding amounts, and payment links to launch automated robocall, SMS, and email alerts automatically via prepaid credits.
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-200/50">
                  <span className="text-[10px] text-slate-500 font-mono italic">
                    Recipient: {activeInvoice.clientName} ({activeInvoice.clientPhone || 'No Phone'})
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      onTriggerChaserFromInvoice(activeInvoice);
                    }}
                    className="py-2 px-4 bg-amber-600 hover:bg-amber-700 text-white text-[10px] uppercase tracking-widest font-extrabold rounded-lg transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    🚀 Trigger Automated Chaser Campaign
                  </button>
                </div>
              </div>
            )}

            {/* Editable Field Canvas / Main preview sheet */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-8 space-y-6" id="printable-invoice-canvas">
              {/* Top Row: Business Logo and Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-slate-100">
                <div className="space-y-1.5">
                  {activeInvoice.logoUrl ? (
                    <img 
                      src={activeInvoice.logoUrl} 
                      alt={activeInvoice.businessName || 'Business logo'} 
                      className="h-10 max-w-[150px] object-contain rounded-lg mb-1"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-10 w-10 flex items-center justify-center bg-slate-900 text-white font-black rounded-xl text-lg mb-1">
                      {(activeInvoice.businessName || 'B').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <h2 className="text-lg font-bold text-slate-900 tracking-tight">{activeInvoice.businessName || 'My Freelance Business'}</h2>
                  <p className="text-xs text-slate-500 leading-normal max-w-xs">{activeInvoice.businessAddress || 'Lagos, Nigeria'}</p>
                  <p className="text-xs text-slate-400 font-mono text-[10px]">{activeInvoice.businessEmail || 'no-email@business.com'} • {activeInvoice.businessPhone || 'No Phone'}</p>
                </div>
                <div className="sm:text-right space-y-1 sm:self-start">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">INVOICE</h1>
                  <span className="inline-block bg-slate-100 text-slate-800 font-mono font-bold text-[10px] px-2.5 py-0.5 rounded-full tracking-wider">
                    {activeInvoice.invoiceNumber}
                  </span>
                  <div className="pt-2 text-xs text-slate-500 space-y-0.5">
                    <p>Date issued: <span className="font-semibold text-slate-700">{activeInvoice.issueDate}</span></p>
                    <p>Payment due: <span className="font-semibold text-rose-600">{activeInvoice.dueDate}</span></p>
                  </div>
                </div>
              </div>

              {/* Recipient / Client details */}
              <div className="bg-slate-50 rounded-xl p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Billed To / Recipient</span>
                  <input
                    type="text"
                    value={activeInvoice.clientName}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, clientName: e.target.value })}
                    className="font-semibold text-slate-800 text-sm bg-transparent hover:bg-slate-200/50 focus:bg-white border-0 border-b border-transparent focus:border-slate-300 rounded px-1.5 py-0.5 w-full focus:outline-none mb-1"
                  />
                  <input
                    type="text"
                    value={activeInvoice.clientAddress}
                    onChange={(e) => setActiveInvoice({ ...activeInvoice, clientAddress: e.target.value })}
                    className="text-xs text-slate-500 bg-transparent hover:bg-slate-200/50 focus:bg-white border-0 border-b border-transparent focus:border-slate-300 rounded px-1.5 py-0.5 w-full focus:outline-none mb-1"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={activeInvoice.clientEmail}
                      onChange={(e) => setActiveInvoice({ ...activeInvoice, clientEmail: e.target.value })}
                      className="text-[11px] text-slate-400 bg-transparent hover:bg-slate-200/50 focus:bg-white border-0 border-b border-transparent focus:border-slate-300 rounded px-1.5 py-0.5 w-1/2 focus:outline-none"
                    />
                    <input
                      type="text"
                      value={activeInvoice.clientPhone}
                      onChange={(e) => setActiveInvoice({ ...activeInvoice, clientPhone: e.target.value })}
                      className="text-[11px] text-slate-400 bg-transparent hover:bg-slate-200/50 focus:bg-white border-0 border-b border-transparent focus:border-slate-300 rounded px-1.5 py-0.5 w-1/2 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="sm:text-right border-t sm:border-t-0 sm:border-l border-slate-200 sm:pl-4 pt-3 sm:pt-0">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Status Overview</span>
                  <span className={`inline-block px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase tracking-wider ${
                    activeInvoice.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                    activeInvoice.status === 'SENT' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                    activeInvoice.status === 'OVERDUE' ? 'bg-red-50 text-red-700 border-red-200' :
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {activeInvoice.status}
                  </span>
                  
                  {/* Bank quick review */}
                  {(activeInvoice.bankName || activeInvoice.accountNumber) && (
                    <div className="mt-3 text-xs text-slate-500">
                      <p className="text-[9px] uppercase font-bold text-slate-400">Payment Channel</p>
                      <p className="font-semibold text-slate-700 text-xs">{activeInvoice.bankName}</p>
                      <p className="font-mono text-xs">{activeInvoice.accountNumber}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Items Ledger table */}
              <div className="space-y-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">Deliverables & Ledgers</span>
                
                {/* Headers */}
                <div className="grid grid-cols-12 gap-2 pb-2 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase">
                  <div className="col-span-7">Description of work</div>
                  <div className="col-span-1 text-center">Qty</div>
                  <div className="col-span-2 text-right">Price ({activeInvoice.currency})</div>
                  <div className="col-span-2 text-right">Total ({activeInvoice.currency})</div>
                </div>

                {/* Rows */}
                <div className="space-y-1">
                  {activeInvoice.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center group py-1 border-b border-slate-50">
                      <div className="col-span-7 flex items-center gap-1.5">
                        <button
                          onClick={() => handleRemoveLineItem(index)}
                          className="opacity-0 group-hover:opacity-100 p-1 bg-red-50 hover:bg-red-100 text-red-600 rounded transition-opacity cursor-pointer flex-shrink-0"
                          title="Remove item"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => handleUpdateLineItem(index, 'description', e.target.value)}
                          className="text-xs text-slate-700 bg-transparent hover:bg-slate-100 focus:bg-slate-50 rounded p-1 w-full focus:outline-none"
                        />
                      </div>
                      <div className="col-span-1">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateLineItem(index, 'quantity', Number(e.target.value))}
                          className="text-xs font-mono text-center text-slate-700 bg-transparent hover:bg-slate-100 focus:bg-slate-50 rounded p-1 w-full focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => handleUpdateLineItem(index, 'unitPrice', Number(e.target.value))}
                          className="text-xs font-mono text-right text-slate-700 bg-transparent hover:bg-slate-100 focus:bg-slate-50 rounded p-1 w-full focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2 text-right font-mono text-xs font-semibold text-slate-700 px-1">
                        {activeInvoice.currency}{item.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Item Button */}
                <button
                  onClick={handleAddLineItem}
                  className="mt-2 text-xs font-semibold text-emerald-600 hover:text-emerald-500 hover:bg-emerald-50/50 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" /> Append Billing Item
                </button>
              </div>

              {/* Calculations Block */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 pt-4 border-t border-slate-100">
                <div className="sm:col-span-7 space-y-3">
                  {/* Bank Credentials overrides */}
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wide block">Remittance Details</span>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[9px] text-slate-400 block font-semibold">Bank</label>
                        <input
                          type="text"
                          value={activeInvoice.bankName || ''}
                          onChange={(e) => setActiveInvoice({ ...activeInvoice, bankName: e.target.value })}
                          className="text-[10px] text-slate-700 bg-white hover:bg-slate-100 focus:bg-white rounded px-1.5 py-1 w-full focus:outline-none font-sans"
                          placeholder="e.g. GTBank"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block font-semibold">Account No.</label>
                        <input
                          type="text"
                          value={activeInvoice.accountNumber || ''}
                          onChange={(e) => setActiveInvoice({ ...activeInvoice, accountNumber: e.target.value })}
                          className="text-[10px] font-mono text-slate-700 bg-white hover:bg-slate-100 focus:bg-white rounded px-1.5 py-1 w-full focus:outline-none"
                          placeholder="0123456789"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] text-slate-400 block font-semibold">Account Name</label>
                        <input
                          type="text"
                          value={activeInvoice.accountName || ''}
                          onChange={(e) => setActiveInvoice({ ...activeInvoice, accountName: e.target.value })}
                          className="text-[10px] text-slate-700 bg-white hover:bg-slate-100 focus:bg-white rounded px-1.5 py-1 w-full focus:outline-none"
                          placeholder="Beneficiary Name"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Notes Area */}
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Additional Notes</label>
                    <textarea
                      value={activeInvoice.notes || ''}
                      onChange={(e) => setActiveInvoice({ ...activeInvoice, notes: e.target.value })}
                      placeholder="Specify deliverables or instructions..."
                      className="w-full text-xs text-slate-600 bg-slate-50 rounded-xl p-2.5 focus:outline-none min-h-[60px]"
                    />
                  </div>
                </div>

                {/* Sub Total / Total summary values */}
                <div className="sm:col-span-5 space-y-2 text-right font-mono self-end">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Subtotal:</span>
                    <span className="font-semibold text-slate-700">
                      {activeInvoice.currency}{activeInvoice.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {/* Toggle switch for optional Tax/VAT */}
                  <div className="flex justify-between items-center text-[11px] text-slate-500 print:hidden select-none py-0.5">
                    <span></span>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showTax}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setShowTax(checked);
                          if (!checked) {
                            setActiveInvoice({
                              ...activeInvoice,
                              taxRate: 0,
                              taxAmount: 0,
                              totalAmount: activeInvoice.subtotal
                            });
                          } else {
                            // Default back to standard rate (5% or existing)
                            const rate = activeInvoice.taxRate || 5;
                            const tax = (activeInvoice.subtotal * rate) / 100;
                            setActiveInvoice({
                              ...activeInvoice,
                              taxRate: rate,
                              taxAmount: tax,
                              totalAmount: activeInvoice.subtotal + tax
                            });
                          }
                        }}
                        className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 h-3.5 w-3.5 cursor-pointer"
                      />
                      <span className="text-slate-500 font-medium hover:text-slate-800">Include Tax/VAT</span>
                    </label>
                  </div>

                  {showTax && (
                    <div className="flex justify-between text-xs text-slate-500 items-center">
                      <span className="flex items-center gap-1 justify-end">
                        Tax/VAT (
                        <input
                          type="number"
                          value={activeInvoice.taxRate}
                          onChange={(e) => {
                            const rate = Number(e.target.value);
                            const tax = (activeInvoice.subtotal * rate) / 100;
                            setActiveInvoice({
                              ...activeInvoice,
                              taxRate: rate,
                              taxAmount: tax,
                              totalAmount: activeInvoice.subtotal + tax
                            });
                          }}
                          className="w-10 text-[10px] text-center font-semibold bg-slate-100 hover:bg-slate-200 border-0 rounded py-0.5 focus:outline-none print:bg-white"
                        />
                        %):
                      </span>
                      <span className="font-semibold text-slate-700">
                        {activeInvoice.currency}{activeInvoice.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-slate-900 font-bold border-t border-slate-100 pt-1.5 mt-1">
                    <span className="font-sans">Grand Total:</span>
                    <span className="text-slate-900">
                      {activeInvoice.currency}{(showTax ? activeInvoice.totalAmount : activeInvoice.subtotal).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Design watermark footer / prompt record */}
              <div className="pt-6 border-t border-slate-100 text-center text-[9px] text-slate-400 font-mono tracking-wider uppercase">
                Generated via Floate Prompt Ledger Service
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center text-slate-500 space-y-3 flex flex-col items-center justify-center min-h-[480px]">
            <div className="p-3 bg-white rounded-full border border-slate-100 shadow-sm text-slate-400">
              <FileText className="w-10 h-10" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-755 text-base">Invoice Preview Panel</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1">Write your business terms in our prompt box and click generate to instantly synthesize a polished invoice.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
