import React, { useState, useMemo } from 'react';
import { 
  DollarSign, CreditCard, Receipt, Clock, Download, 
  CheckCircle, AlertCircle, ShieldCheck, Loader2,
  Landmark, Wallet, X
} from 'lucide-react';
import { KPICard } from '@/components/ui/KPICard';
import { cn } from '@/utils';
import { useCurrency } from '@/hooks/useCurrency';
import { useDataStore } from '@/store/useDataStore';
import { useAuthStore } from '@/store/useAuthStore';
import { useToastStore } from '@/store/useToastStore';
import { downloadFromUrl, openPaymentReceiptWindow, readFileAsDataUrl, downloadTextFile } from '@/utils/fileHelpers';

export default function StudentFees() {
  const { format } = useCurrency();
  const { user } = useAuthStore();
  const { feeRecords, updateFeeRecord, schools } = useDataStore();
  const showToast = useToastStore((state) => state.showToast);
  
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [paymentStep, setPaymentStep] = useState<'select' | 'processing' | 'success'>('select');
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [transactionId] = useState(() => `EDU-${Math.random().toString(36).substring(2, 11).toUpperCase()}`);
  const [paymentProof, setPaymentProof] = useState<{ name: string; url: string } | null>(null);

  // Filter records for the current student
  const studentFees = useMemo(() => {
    return feeRecords.filter(record => record.studentId === user?.id);
  }, [feeRecords, user?.id]);

  const pendingFees = studentFees.filter(f => f.status === 'Pending');
  const feeHistory = studentFees.filter(f => f.status === 'Paid');

  const stats = useMemo(() => {
    const total = studentFees.reduce((acc, f) => acc + f.amount, 0);
    const paid = feeHistory.reduce((acc, f) => acc + f.amount, 0);
    const pending = pendingFees.reduce((acc, f) => acc + f.amount, 0);
    return { total, paid, pending };
  }, [studentFees, feeHistory, pendingFees]);

  const handlePay = (fee: any) => {
    setSelectedFee(fee);
    setPaymentStep('select');
    setSelectedMethod(null);
    setPaymentProof(null);
    setShowPayModal(true);
  };

  const handleProofUpload = async (file?: File) => {
    if (!file) return;
    const url = await readFileAsDataUrl(file);
    setPaymentProof({ name: file.name, url });
  };

  const processPayment = async () => {
    if (!selectedMethod) return;
    
    setPaymentStep('processing');
    
    // Simulate API call to payment gateway (e.g. Paystack/Flutterwave)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (selectedFee) {
      updateFeeRecord(selectedFee.id, { 
        status: 'Paid', 
        date: new Date().toISOString().split('T')[0],
        attachmentName: paymentProof?.name,
        attachmentUrl: paymentProof?.url,
      });
      setPaymentStep('success');
    }
  };

  const handleDownloadReceipt = (record = selectedFee) => {
    if (record?.attachmentUrl) {
      downloadFromUrl(record.attachmentUrl, record.attachmentName || `${record.type}-receipt`);
      return;
    }

    openPaymentReceiptWindow({
      receiptNumber: `RCP-${String(record?.id || 'TXN').toUpperCase()}`,
      payerName: user?.name || record?.studentName || 'Student Payment',
      feeLabel: record?.type || 'School Fee',
      amount: format(record?.amount || 0),
      paymentDate: new Date().toLocaleDateString(),
      paymentMethod: selectedMethod === 'bank' ? 'Direct Bank Transfer' : selectedMethod === 'card' ? 'Debit / Credit Card' : 'Recorded Payment',
      schoolName: user?.schoolName || schools[0]?.name || 'EduPlatform',
      schoolCode: schools[0]?.code || 'EDU-001',
      schoolLogoUrl: schools[0]?.logoUrl,
      note: 'Retain this receipt for future reference and present it to the finance office whenever payment confirmation is requested.',
    });
  };

  const handleRequestInstallment = () => {
    showToast({
      title: 'Installment request started',
      description: 'Your payment plan request has been logged for finance review.',
      variant: 'success',
    });
  };

  const handleScholarshipStatus = () => {
    showToast({
      title: 'Scholarship review',
      description:
        stats.pending > 0
          ? 'Clear pending fees to improve eligibility review for new scholarship awards.'
          : 'Your account is financially cleared and ready for scholarship eligibility review.',
      variant: stats.pending > 0 ? 'warning' : 'info',
    });
  };

  return (
    <div className="space-y-6">
      {/* Payment Gateway Modal */}
      {showPayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg max-h-[90vh] flex flex-col transition-all transform scale-100">
            
            {/* Modal Header - sticky */}
            <div className="shrink-0 px-6 sm:px-10 py-6 sm:py-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {paymentStep === 'success' ? 'Payment Successful' : 'Secure Checkout'}
                </h2>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Transaction Secured by EduPay</p>
              </div>
              <button 
                onClick={() => {
                  if (paymentStep !== 'processing') setShowPayModal(false);
                }} 
                className="shrink-0 p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-all text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto p-6 sm:p-10">
              {paymentStep === 'select' && (
                <div className="space-y-8">
                  <div className="flex justify-between items-center p-6 bg-blue-50 dark:bg-blue-900/10 rounded-3xl border border-blue-100 dark:border-blue-900/20">
                    <div>
                      <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-1">Payable Amount</p>
                      <h3 className="text-3xl font-black text-slate-900 dark:text-white">{format(selectedFee?.amount)}</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">{selectedFee?.type}</p>
                    </div>
                    <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl shadow-sm text-blue-600">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-2">Choose Payment Method</label>
                    <div className="grid grid-cols-1 gap-3">
                      {[
                        { id: 'card', name: 'Debit/Credit Card', icon: CreditCard, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
                        { id: 'bank', name: 'Direct Bank Transfer', icon: Landmark, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
                        { id: 'wallet', name: 'Online Wallet (EduPay)', icon: Wallet, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
                      ].map((m) => (
                        <button 
                          key={m.id} 
                          onClick={() => setSelectedMethod(m.id)}
                          className={cn(
                            "flex items-center justify-between p-5 border-2 rounded-2xl transition-all group active:scale-[0.98]",
                            selectedMethod === m.id 
                              ? "border-blue-600 bg-blue-50/50 dark:bg-blue-900/10" 
                              : "border-slate-100 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"
                          )}
                        >
                          <div className="flex items-center gap-4">
                            <div className={cn("p-3 rounded-xl transition-transform group-hover:scale-110", m.bg, m.color)}>
                              <m.icon className="w-5 h-5" />
                            </div>
                            <span className={cn("text-sm font-bold", selectedMethod === m.id ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-300")}>
                              {m.name}
                            </span>
                          </div>
                          <div className={cn(
                            "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                            selectedMethod === m.id ? "border-blue-600 bg-blue-600" : "border-slate-200 dark:border-slate-700"
                          )}>
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
                        "py-5 rounded-2xl text-sm font-bold shadow-xl transition-all active:scale-95",
                        selectedMethod && paymentProof
                          ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-900/30" 
                          : "bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
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
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-blue-100 dark:border-blue-900/20 rounded-full"></div>
                    <Loader2 className="w-24 h-24 text-blue-600 animate-spin absolute top-0 left-0" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Processing Transaction</h3>
                    <p className="text-sm text-slate-500 mt-2">Please do not close this window or refresh the page.</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-10 text-center space-y-8">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center animate-in zoom-in duration-500">
                      <CheckCircle className="w-12 h-12" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Payment Confirmed!</h3>
                       <p className="text-sm text-slate-500 mt-1">Transaction ID: {transactionId}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 text-left space-y-3">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Payment for</span>
                      <span className="text-slate-900 dark:text-white font-bold">{selectedFee?.type}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Amount Paid</span>
                      <span className="text-slate-900 dark:text-white font-bold">{format(selectedFee?.amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Payment Method</span>
                      <span className="text-slate-900 dark:text-white font-bold capitalize">{selectedMethod}</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button 
                      onClick={() => setShowPayModal(false)}
                      className="flex-1 bg-slate-900 dark:bg-white dark:text-slate-900 text-white py-4 rounded-2xl text-sm font-bold hover:opacity-90 transition-all"
                    >
                      Done
                    </button>
                    <button onClick={handleDownloadReceipt} className="flex items-center justify-center gap-2 flex-1 border-2 border-slate-200 dark:border-slate-800 py-4 rounded-2xl text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all">
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

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">My Financial Portal</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 font-medium">Manage your school fees, payments, and receipts.</p>
        </div>
        <button onClick={() => {
          const lines = [
            'STATEMENT OF ACCOUNT',
            '====================',
            `Student: ${user?.name || 'N/A'}`,
            `Date: ${new Date().toLocaleDateString()}`,
            '',
            '--- Fee Summary ---',
            `Total Fees: ${format(stats.total)}`,
            `Total Paid: ${format(stats.paid)}`,
            `Outstanding: ${format(stats.pending)}`,
            '',
            '--- Pending Fees ---',
            ...pendingFees.map(f => `- ${f.type}: ${format(f.amount)} (Due: ${f.date})`),
            '',
            '--- Payment History ---',
            ...feeHistory.map(f => `- ${f.type}: ${format(f.amount)} on ${f.date}`),
            '',
            'Generated by EduPlatform',
          ];
          downloadTextFile('statement-of-account.txt', lines.join('\n'));
          showToast({ title: 'Statement downloaded', description: 'Your statement of account has been generated.', variant: 'success' });
        }} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
          <Download className="w-4 h-4" />
          Statement of Account
        </button>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard 
          title="Total Fees" 
          value={stats.total} 
          isCurrency={true}
          icon={Receipt} 
          iconBgClass="bg-blue-50 dark:bg-blue-900/20"
          iconColorClass="text-blue-600 dark:text-blue-400"
          trend={{ value: 0, label: "Current Session" }}
        />
        <KPICard 
          title="Total Paid" 
          value={stats.paid} 
          isCurrency={true}
          icon={CheckCircle} 
          iconBgClass="bg-emerald-50 dark:bg-emerald-900/20"
          iconColorClass="text-emerald-600 dark:text-emerald-400"
          trend={{ value: 0, label: "All time" }}
        />
        <KPICard 
          title="Outstanding" 
          value={stats.pending} 
          isCurrency={true}
          icon={AlertCircle} 
          iconBgClass="bg-rose-50 dark:bg-rose-900/20"
          iconColorClass="text-rose-600 dark:text-rose-400"
          trend={{ value: 0, label: "Action Required" }}
        />
        <KPICard 
          title="Scholarship" 
          value={150.00} 
          isCurrency={true}
          icon={ShieldCheck} 
          iconBgClass="bg-amber-50 dark:bg-amber-900/20"
          iconColorClass="text-amber-600 dark:text-amber-400"
          trend={{ value: 0, label: "Merit Based" }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Payments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Pending Payments</h3>
              <span className="px-2.5 py-1 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-bold rounded-lg uppercase">Action Required</span>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {pendingFees.length > 0 ? pendingFees.map((fee) => (
                  <div key={fee.id} className="flex items-center justify-between p-5 rounded-2xl border border-rose-100 dark:border-rose-900/20 bg-rose-50/30 dark:bg-rose-900/10 group transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-slate-800 text-rose-600 rounded-2xl shadow-sm">
                        <DollarSign className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 dark:text-white">{fee.type}</h4>
                        <p className="text-xs text-slate-500 font-medium">Due by {fee.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <span className="text-xl font-black text-slate-900 dark:text-white">{format(fee.amount)}</span>
                      <button 
                        onClick={() => handlePay(fee)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/20 active:scale-95"
                      >
                        Pay Now
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-widest">All fees paid</p>
                    <p className="text-xs text-slate-500 mt-1">You have no outstanding payments at this time.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Transaction History */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Payment History</h3>
              <button onClick={() => {
                const header = 'Transaction ID,Description,Date,Status,Amount';
                const rows = feeHistory.map(txn => `TXN-${txn.id},${txn.type},${txn.date},${txn.status},${format(txn.amount)}`);
                downloadTextFile('fee-ledger.csv', `${header}\n${rows.join('\n')}`, 'text/csv;charset=utf-8;');
                showToast({ title: 'Ledger downloaded', description: 'Complete financial ledger has been generated.', variant: 'success' });
              }} className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">View Full Ledger</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <th className="py-4 px-6">Transaction ID</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Amount</th>
                    <th className="py-4 px-6 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {feeHistory.map((txn, i) => (
                    <tr key={i} className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 px-6 font-mono text-xs text-slate-500">TXN-{txn.id}</td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 dark:text-white">{txn.type}</span>
                      </td>
                      <td className="py-4 px-6 text-slate-500">{txn.date}</td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                          {txn.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-emerald-600">{format(txn.amount)}</span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button onClick={() => handleDownloadReceipt(txn)} className="p-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors">
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

        {/* Sidebar Cards */}
        <div className="space-y-6">
          <div className="bg-slate-900 dark:bg-blue-950 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden">
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-6">
                 <div className="p-3 bg-white/10 rounded-2xl">
                   <ShieldCheck className="w-6 h-6 text-blue-300" />
                 </div>
                 <h3 className="font-bold text-lg">Financial Clearance</h3>
               </div>
               <p className="text-blue-200 text-sm leading-relaxed mb-8">
                 Your financial status determines your eligibility for exams and results access. 
               </p>
               <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-2 rounded-full animate-pulse", stats.pending > 0 ? "bg-rose-500" : "bg-emerald-500")}></div>
                    <span className={cn("text-xs font-bold uppercase tracking-widest", stats.pending > 0 ? "text-rose-400" : "text-emerald-400")}>
                      {stats.pending > 0 ? "Restricted Access" : "Cleared"}
                    </span>
                  </div>
                  <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Outstanding Balance</p>
                    <p className="text-xl font-black">{format(stats.pending)}</p>
                  </div>
               </div>
             </div>
             {/* Abstract background */}
             <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Payment Support</h3>
            <div className="space-y-4">
              <button
                type="button"
                onClick={handleRequestInstallment}
                className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group cursor-pointer hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all border border-transparent text-left"
              >
                <div className="p-2 bg-white dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 rounded-lg shadow-sm">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Request Installment</p>
                  <p className="text-[10px] text-slate-500">Apply for a payment plan</p>
                </div>
              </button>
              <button
                type="button"
                onClick={handleScholarshipStatus}
                className="w-full flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl group cursor-pointer hover:border-blue-500 hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-all border border-transparent text-left"
              >
                <div className="p-2 bg-white dark:bg-slate-800 text-slate-400 group-hover:text-blue-600 rounded-lg shadow-sm">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Scholarship Status</p>
                  <p className="text-[10px] text-slate-500">Check eligibility & awards</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
