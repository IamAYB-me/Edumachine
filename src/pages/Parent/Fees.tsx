import React, { useState, useMemo } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { 
  CreditCard, Receipt, Download, Calendar, 
  ArrowUpRight, ShieldCheck, AlertCircle, Loader2,
  CheckCircle, Landmark, Wallet, X
} from 'lucide-react';
import { cn } from '@/utils';
import { useDataStore } from '@/store/useDataStore';
import { downloadFromUrl, openPaymentReceiptWindow, readFileAsDataUrl } from '@/utils/fileHelpers';
import { useLocation } from 'react-router-dom';
import { useToastStore } from '@/store/useToastStore';

export default function FeesAndPayments() {
  const { format } = useCurrency();
  const { feeRecords, updateFeeRecord, schools } = useDataStore();
  const location = useLocation();
  const showToast = useToastStore((state) => state.showToast);
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [paymentProof, setPaymentProof] = useState<{ name: string; url: string } | null>(null);

  // In a real app, we'd filter by the parent's children IDs. 
  // For now, we'll show all records or simulate children IDs ['4'] for John Doe.
  const childrenIds = ['4']; 
  const childrenFees = useMemo(() => {
    return feeRecords.filter(record => childrenIds.includes(record.studentId));
  }, [feeRecords]);

  const outstandingFees = childrenFees.filter(t => t.status !== 'Paid');
  const paidFees = childrenFees.filter(t => t.status === 'Paid');

  const stats = useMemo(() => {
    const paid = paidFees.reduce((acc, f) => acc + f.amount, 0);
    const pending = outstandingFees.reduce((acc, f) => acc + f.amount, 0);
    return { paid, pending, isCleared: pending === 0 };
  }, [paidFees, outstandingFees]);

  const handlePay = (fee: any) => {
    setSelectedFee(fee);
    setPaymentStep('select');
    setSelectedMethod(null);
    setPaymentProof(null);
    setShowPayModal(true);
  };

  React.useEffect(() => {
    const state = location.state as { openPayment?: boolean } | null;
    if (state?.openPayment && outstandingFees.length > 0 && !showPayModal) {
      handlePayAllOutstanding();
      window.history.replaceState({}, document.title);
    }
  }, [location.state, outstandingFees, showPayModal]);

  const handleProofUpload = async (file?: File) => {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setPaymentProof({ name: file.name, url });
  };

  const processPayment = async () => {
    if (!selectedMethod) return;
    setPaymentStep('processing');
    await new Promise(resolve => setTimeout(resolve, 2000));
    if (selectedFee) {
      if (selectedFee.bulkIds?.length) {
        selectedFee.bulkIds.forEach((id: string) => {
          updateFeeRecord(id, {
            status: 'Paid',
            date: new Date().toISOString().split('T')[0],
            attachmentName: paymentProof?.name,
            attachmentUrl: paymentProof?.url,
          });
        });
      } else {
        updateFeeRecord(selectedFee.id, { 
          status: 'Paid', 
          date: new Date().toISOString().split('T')[0],
          attachmentName: paymentProof?.name,
          attachmentUrl: paymentProof?.url,
        });
      }
      setPaymentStep('success');
    }
  };

  const handlePayAllOutstanding = () => {
    if (outstandingFees.length === 0) {
      showToast({
        title: 'No outstanding fees',
        description: 'There are no unpaid balances to process right now.',
        variant: 'info',
      });
      return;
    }

    handlePay({
      id: 'bulk-payment',
      studentName: 'All Children',
      type: 'All Outstanding Fees',
      amount: outstandingFees.reduce((sum, fee) => sum + fee.amount, 0),
      bulkIds: outstandingFees.map((fee) => fee.id),
    });
  };

  const handleDownloadReceipt = (record?: { attachmentUrl?: string; attachmentName?: string; id?: string; type?: string; amount?: number }) => {
    if (record?.attachmentUrl) {
      downloadFromUrl(record.attachmentUrl, record.attachmentName || `${record.type}-receipt`);
      return;
    }

    openPaymentReceiptWindow({
      receiptNumber: `RCP-${String(record?.id || 'TXN').toUpperCase()}`,
      payerName: selectedFee?.studentName || 'Parent Payment',
      feeLabel: record?.type || 'School Fee',
      amount: format(record?.amount || 0),
      paymentDate: new Date().toLocaleDateString(),
      paymentMethod: selectedMethod === 'bank' ? 'Direct Bank Transfer' : selectedMethod === 'card' ? 'Debit / Credit Card' : 'Recorded Payment',
      schoolName: schools[0]?.name || 'EduPlatform',
      schoolCode: schools[0]?.code || 'EDU-001',
      note: 'This receipt confirms payment received on behalf of the student account and may be used for finance clearance and parent records.',
    });
  };

  return (
    <div className="space-y-6">
      {/* Shared Payment Gateway Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] overflow-y-auto transition-all transform scale-100">
            <div className="px-10 py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {paymentStep === 'success' ? 'Payment Successful' : 'Secure Checkout'}
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Transaction Secured by EduPay</p>
              </div>
              <button onClick={() => paymentStep !== 'processing' && setShowPayModal(false)} className="inline-flex items-center gap-2 px-4 py-3 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 font-bold text-xs uppercase tracking-widest">
                <X className="w-5 h-5" />
                Close
              </button>
            </div>

            <div className="p-10">
              {paymentStep === 'select' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Payable Amount</p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white">{format(selectedFee?.amount)}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">{selectedFee?.studentName} • {selectedFee?.type}</p>
                    </div>
                    <ShieldCheck className="w-8 h-8 text-blue-600" />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Choose Payment Method</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                        { id: 'bank', name: 'Direct Bank Transfer', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                      ].map((m) => (
                        <button 
                          key={m.id} 
                          onClick={() => setSelectedMethod(m.id)}
                          className={cn(
                            "flex items-center justify-between p-5 border-2 rounded-2xl transition-all group",
                            selectedMethod === m.id ? "border-blue-600 bg-blue-50/50" : "border-slate-100 dark:border-slate-800"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl", m.bg, m.color)}><m.icon className="w-5 h-5" /></div>
                            <span className="text-sm font-bold">{m.name}</span>
                          </div>
                          <div className={cn("w-6 h-6 rounded-full border-2", selectedMethod === m.id ? "border-blue-600 bg-blue-600" : "border-slate-200")}>
                            {selectedMethod === m.id && <CheckCircle className="w-4 h-4 text-white" />}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Attach Transaction Receipt</label>
                    <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-4 text-sm font-medium text-slate-600 transition-all hover:border-blue-400 hover:bg-blue-50/50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-700 dark:hover:bg-blue-900/20">
                      <Receipt className="w-4 h-4" />
                      <span>{paymentProof?.name || 'Upload receipt or bank transfer proof'}</span>
                      <input type="file" accept="image/*,.pdf" className="hidden" onChange={(e) => handleProofUpload(e.target.files?.[0])} />
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setShowPayModal(false)}
                      className="py-5 rounded-2xl text-sm font-bold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
                    >
                      Cancel
                    </button>
                    <button 
                      disabled={!selectedMethod || !paymentProof}
                      onClick={processPayment}
                      className={cn(
                        "py-5 rounded-2xl text-sm font-bold shadow-xl transition-all",
                        selectedMethod && paymentProof ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                      )}
                    >
                      Make Payment
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Select a payment method and attach proof before continuing.
                  </p>
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-20 flex flex-col items-center justify-center text-center space-y-6">
                  <Loader2 className="w-24 h-24 text-blue-600 animate-spin" />
                  <h3 className="text-xl font-bold">Processing Transaction</h3>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-10 text-center space-y-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center"><CheckCircle className="w-12 h-12" /></div>
                    <h3 className="text-2xl font-black">Payment Confirmed!</h3>
                  </div>
                  <div className="flex gap-4">
                    <button onClick={() => setShowPayModal(false)} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-bold">Done</button>
                    <button onClick={() => handleDownloadReceipt(selectedFee)} className="flex-1 border-2 border-slate-200 dark:border-slate-800 py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" />
                      Receipt
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Fees & Payments</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Review and manage your children's school fees.</p>
        </div>
        <button
          onClick={handlePayAllOutstanding}
          disabled={stats.isCleared}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold shadow-lg transition-all",
            stats.isCleared
              ? "bg-emerald-100 text-emerald-700 shadow-emerald-900/10 cursor-default"
              : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/20"
          )}
        >
          <CreditCard className="w-4 h-4" />
          {stats.isCleared ? 'All Fees Settled' : 'Pay All Outstanding'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Outstanding Bills */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Outstanding Bills</h3>
            </div>
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {outstandingFees.length > 0 ? outstandingFees.map((bill, i) => (
                <div key={i} className="p-6 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-2xl">
                      <Receipt className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{bill.type}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{bill.studentName} • Due: {bill.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">{format(bill.amount)}</p>
                    <button onClick={() => handlePay(bill)} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-widest">Pay Now</button>
                  </div>
                </div>
              )) : (
                <div className="p-10 text-center space-y-3">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <p className="text-sm font-black text-emerald-700 uppercase tracking-widest">Account Fully Cleared</p>
                  <p className="text-sm text-slate-500">Great news. There are no outstanding bills on this parent account at the moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* Payment History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Payment History</h3>
              <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View All Transactions</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="py-4 px-6">Ref ID</th>
                    <th className="py-4 px-6">Child</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-slate-100 dark:divide-slate-800">
                  {paidFees.map((tx, i) => (
                    <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-[10px] font-bold text-slate-500">TXN-{tx.id}</td>
                      <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">{tx.studentName}</td>
                      <td className="py-4 px-6 text-slate-600 dark:text-slate-400 font-medium">{tx.type}</td>
                      <td className="py-4 px-6 font-black text-emerald-600">{format(tx.amount)}</td>
                      <td className="py-4 px-6 text-slate-500 text-xs font-medium">{tx.date}</td>
                      <td className="py-4 px-6 text-center">
                        <button onClick={() => handleDownloadReceipt(tx)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors">
                          <Download className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Summary Card */}
          <div className="bg-slate-900 dark:bg-blue-950 p-8 rounded-[2rem] text-white shadow-xl relative overflow-hidden">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 relative z-10">Financial Summary</h3>
            <div className="space-y-8 relative z-10">
              <div>
                <p className="text-[10px] font-bold text-blue-300 uppercase tracking-widest mb-1">Total Paid This Session</p>
                <h2 className="text-4xl font-black">{format(stats.paid)}</h2>
              </div>
              <div className="pt-8 border-t border-white/10">
                <p className="text-[10px] font-bold text-rose-300 uppercase tracking-widest mb-1">Remaining Balance</p>
                <h2 className="text-4xl font-black text-rose-400">{format(stats.pending)}</h2>
              </div>
              <div className={cn(
                "p-5 rounded-2xl flex items-center gap-4 border",
                stats.isCleared ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-rose-500/10 border-rose-500/20 text-rose-400"
              )}>
                {stats.isCleared ? <ShieldCheck className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-widest">
                  {stats.isCleared 
                    ? "Excellent. No outstanding balance remains and your parent account is fully cleared." 
                    : "Outstanding balance detected. Please settle to avoid disruption."}
                </p>
              </div>
            </div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          {/* Quick Payment Info */}
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h4 className="font-bold text-slate-400 uppercase tracking-widest text-[10px] mb-6">Linked Payment Methods</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-transparent hover:border-blue-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-xl shadow-sm text-blue-600">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Visa • 4242</span>
                </div>
                <div className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <button className="w-full py-3.5 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:border-blue-500 hover:text-blue-500 transition-all">
                + Add New Method
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
