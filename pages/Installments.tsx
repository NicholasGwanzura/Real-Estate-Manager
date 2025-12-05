
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sale, Payment, Stand } from '../types';
import { Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Plus, X, Receipt, Printer, AlertTriangle } from 'lucide-react';

export const Installments: React.FC = () => {
  const { sales, payments, stands, developers, addPayment, clients } = useApp();
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<string | null>(null);
  
  // Payment Form State
  const [payAmount, setPayAmount] = useState('');
  const [manualReceiptNo, setManualReceiptNo] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRef, setPayRef] = useState('');

  // --- Logic to parse financing terms ---
  const getMonthsFromTerms = (terms?: string): number => {
    if (!terms) return 12; // Default to 12 if undefined
    const match = terms.match(/(\d+)/); // Extract first number found
    return match ? parseInt(match[0], 10) : 12; 
  };

  // --- Calculate Status for each Sale ---
  const activeSales = sales.filter(s => s.status !== 'CANCELLED');
  
  const installmentData = activeSales.map(sale => {
      const stand = stands.find(s => s.id === sale.standId);
      const dev = developers.find(d => d.id === sale.developerId);
      const salePayments = payments.filter(p => p.saleId === sale.id);
      
      const totalPaid = salePayments.reduce((acc, p) => acc + p.amount, 0);
      const balance = sale.salePrice - totalPaid;
      
      // Financing Details
      const durationMonths = getMonthsFromTerms(stand?.financingTerms);
      const saleDate = new Date(sale.saleDate);
      const today = new Date();
      
      // Calculate months passed since sale
      const monthsPassed = (today.getFullYear() - saleDate.getFullYear()) * 12 + (today.getMonth() - saleDate.getMonth());
      
      // Calculate expected payments so far (Deposit + Monthly * MonthsPassed)
      const initialDeposit = sale.depositPaid; 
      const principalForInstallments = sale.salePrice - initialDeposit;
      const monthlyAmount = durationMonths > 0 ? principalForInstallments / durationMonths : 0;
      
      const expectedTotalPaidByNow = initialDeposit + (monthlyAmount * monthsPassed);
      
      // Status Logic
      let status: 'PAID' | 'CURRENT' | 'OVERDUE' = 'CURRENT';
      let dueAmount = 0;
      
      if (balance <= 0) {
          status = 'PAID';
      } else {
          // If they have paid less than expected by now (with a small buffer)
          if (totalPaid < expectedTotalPaidByNow - 10) { 
              status = 'OVERDUE';
              dueAmount = expectedTotalPaidByNow - totalPaid;
          }
      }

      // Next Due Date: Sale day of next month
      const nextDue = new Date(today.getFullYear(), today.getMonth() + 1, saleDate.getDate());

      return {
          sale,
          stand,
          dev,
          totalPaid,
          balance,
          monthlyAmount,
          status,
          dueAmount,
          nextDue: nextDue.toISOString().split('T')[0],
          progress: Math.min((totalPaid / sale.salePrice) * 100, 100)
      };
  }).filter(item => item.balance > 0); // Only show active debts

  // Stats
  const totalOutstanding = installmentData.reduce((acc, i) => acc + i.balance, 0);
  const totalOverdue = installmentData.filter(i => i.status === 'OVERDUE').reduce((acc, i) => acc + i.dueAmount, 0);
  const overdueCount = installmentData.filter(i => i.status === 'OVERDUE').length;

  const handleOpenPay = (saleId: string) => {
      setSelectedSaleForPayment(saleId);
      setPayDate(new Date().toISOString().split('T')[0]);
      setManualReceiptNo('');
      setPayRef('');
      setPayAmount('');
      setShowPayModal(true);
  };

  const handlePrintReceipt = (payment: Payment) => {
    const sale = sales.find(s => s.id === payment.saleId);
    const client = clients.find(c => c.id === sale?.clientId);
    const stand = stands.find(s => s.id === sale?.standId);
    const dev = developers.find(d => d.id === sale?.developerId);
    const totalPaid = payments.filter(p => p.saleId === sale?.id).reduce((acc, p) => acc + p.amount, 0); // Recalc including new payment
    const outstanding = (sale?.salePrice || 0) - totalPaid;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt #${payment.manualReceiptNo}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
            .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #000; text-transform: uppercase; }
            .receipt-box { border: 2px solid #000; padding: 20px; margin-bottom: 20px; }
            .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
            .label { font-weight: bold; color: #666; }
            .val { font-weight: bold; font-size: 1.1em; }
            .big-amt { font-size: 2em; color: #000; text-align: center; margin: 20px 0; border-top: 1px dashed #ccc; border-bottom: 1px dashed #ccc; padding: 15px 0; }
            .footer { margin-top: 40px; font-size: 12px; text-align: center; color: #888; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Real Estate Plus</div>
            <p>Official Payment Receipt</p>
          </div>

          <div class="receipt-box">
             <div class="row">
                <span class="label">Physical Receipt Book #:</span>
                <span class="val">${payment.manualReceiptNo}</span>
             </div>
             <div class="row">
                <span class="label">System Transaction Ref:</span>
                <span class="val">${payment.reference}</span>
             </div>
             <div class="row">
                <span class="label">Date:</span>
                <span class="val">${new Date(payment.date).toLocaleString()}</span>
             </div>
          </div>

          <div class="row">
             <span class="label">Received From:</span>
             <span class="val">${client?.name} (ID: ${client?.idNumber})</span>
          </div>
          <div class="row">
             <span class="label">Payment For:</span>
             <span class="val">${dev?.name} - Stand #${stand?.standNumber}</span>
          </div>

          <div class="big-amt">
             $${payment.amount.toLocaleString()}
          </div>

          <div class="row">
             <span class="label">Payment Type:</span>
             <span>${payment.type}</span>
          </div>
          <div class="row">
             <span class="label">New Balance Outstanding:</span>
             <span style="color: ${outstanding > 0 ? 'red' : 'green'}">$${outstanding.toLocaleString()}</span>
          </div>

          <div class="footer">
             Recorded by Installment Tracker.<br/>
             This receipt corresponds to physical receipt #${payment.manualReceiptNo}.
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const submitPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedSaleForPayment || !payAmount || !manualReceiptNo) {
          alert("Audit Requirement: Manual Receipt Number is missing.");
          return;
      }

      const payment: Payment = {
          id: `pay-${Date.now()}`,
          saleId: selectedSaleForPayment,
          amount: parseFloat(payAmount),
          date: new Date(payDate + 'T12:00:00').toISOString(),
          reference: payRef || `INST-${Date.now().toString().slice(-4)}`,
          manualReceiptNo: manualReceiptNo,
          type: 'INSTALLMENT'
      };

      addPayment(payment);
      
      // Auto Print
      setTimeout(() => handlePrintReceipt(payment), 500);

      setShowPayModal(false);
      setPayAmount('');
      setManualReceiptNo('');
      setPayRef('');
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Installment Tracker</h1>
            <p className="text-sm text-slate-500">Monitor monthly payments and account health.</p>
          </div>
       </div>

       {/* Stats Overview */}
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-slate-100 rounded-lg text-slate-600"><DollarSign size={20}/></div>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Outstanding</span>
               </div>
               <p className="text-2xl font-bold text-slate-900">${totalOutstanding.toLocaleString()}</p>
           </div>
           
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-red-50 rounded-lg text-red-600"><AlertCircle size={20}/></div>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overdue Amount</span>
               </div>
               <p className="text-2xl font-bold text-red-600">${totalOverdue.toLocaleString()}</p>
               <p className="text-xs text-red-400 mt-1">{overdueCount} accounts behind schedule</p>
           </div>

           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
               <div className="flex items-center space-x-3 mb-2">
                   <div className="p-2 bg-green-50 rounded-lg text-green-600"><CheckCircle size={20}/></div>
                   <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Payment Plans</span>
               </div>
               <p className="text-2xl font-bold text-slate-900">{installmentData.length}</p>
           </div>
       </div>

       {/* Tracker Table */}
       <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
           <div className="p-6 border-b border-slate-100 flex justify-between items-center">
               <h3 className="font-bold text-slate-900">Active Accounts</h3>
           </div>
           <div className="overflow-x-auto">
               <table className="w-full text-sm text-left">
                   <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase text-xs font-semibold">
                       <tr>
                           <th className="px-6 py-4">Client / Property</th>
                           <th className="px-6 py-4 text-center">Progress</th>
                           <th className="px-6 py-4 text-right">Balance</th>
                           <th className="px-6 py-4 text-right">Mth. Installment</th>
                           <th className="px-6 py-4 text-right">Next Due</th>
                           <th className="px-6 py-4 text-center">Status</th>
                           <th className="px-6 py-4 text-center">Action</th>
                       </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                       {installmentData.length === 0 ? (
                           <tr><td colSpan={7} className="p-8 text-center text-slate-400 italic">No active payment plans found.</td></tr>
                       ) : (
                           installmentData.map((item) => (
                               <tr key={item.sale.id} className="hover:bg-slate-50 transition-colors">
                                   <td className="px-6 py-4">
                                       <p className="font-bold text-slate-900">{item.sale.clientName}</p>
                                       <p className="text-xs text-slate-500">Stand #{item.stand?.standNumber} • {item.dev?.name}</p>
                                   </td>
                                   <td className="px-6 py-4 align-middle">
                                       <div className="w-full bg-slate-100 rounded-full h-2 max-w-[120px] mx-auto">
                                           <div 
                                                className={`h-2 rounded-full ${item.progress > 80 ? 'bg-green-500' : 'bg-blue-500'}`} 
                                                style={{width: `${item.progress}%`}}
                                           ></div>
                                       </div>
                                       <p className="text-[10px] text-center mt-1 text-slate-400 font-medium">{item.progress.toFixed(0)}% Paid</p>
                                   </td>
                                   <td className="px-6 py-4 text-right font-mono text-slate-700 font-medium">
                                       ${item.balance.toLocaleString()}
                                   </td>
                                   <td className="px-6 py-4 text-right font-mono text-slate-600">
                                       ${item.monthlyAmount.toLocaleString(undefined, {maximumFractionDigits: 0})}
                                   </td>
                                   <td className="px-6 py-4 text-right text-slate-600">
                                       {item.nextDue}
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                       {item.status === 'OVERDUE' ? (
                                           <div className="flex flex-col items-center">
                                               <span className="inline-flex items-center bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                                   <AlertCircle size={10} className="mr-1"/> Overdue
                                               </span>
                                               <span className="text-[10px] text-red-600 font-bold mt-1">
                                                   Pay ${item.dueAmount.toLocaleString()}
                                               </span>
                                           </div>
                                       ) : (
                                           <span className="inline-flex items-center bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                                               <Clock size={10} className="mr-1"/> Current
                                           </span>
                                       )}
                                   </td>
                                   <td className="px-6 py-4 text-center">
                                       <button 
                                        onClick={() => handleOpenPay(item.sale.id)}
                                        className="bg-slate-900 text-white p-2 rounded-lg hover:bg-slate-800 transition-colors shadow-sm"
                                        title="Record Payment"
                                       >
                                           <Plus size={16}/>
                                       </button>
                                   </td>
                               </tr>
                           ))
                       )}
                   </tbody>
               </table>
           </div>
       </div>

       {/* Quick Pay Modal */}
       {showPayModal && (
           <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
               <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl">
                   <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-4">
                       <h3 className="text-lg font-bold text-slate-900 flex items-center">
                           <Receipt size={20} className="mr-2 text-amber-500"/> Record Installment
                       </h3>
                       <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                   </div>
                   <form onSubmit={submitPayment} className="space-y-4">
                       
                       <div className="p-3 bg-amber-50 border border-amber-100 rounded-lg">
                           <label className="text-[10px] font-bold text-amber-800 uppercase tracking-wide flex items-center mb-1">
                               <AlertTriangle size={10} className="mr-1"/> Receipt Book Reference
                           </label>
                           <input 
                                type="text" 
                                required
                                className="w-full bg-white border border-amber-200 rounded p-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-amber-500 outline-none"
                                placeholder="e.g. BK-10523"
                                value={manualReceiptNo}
                                onChange={(e) => setManualReceiptNo(e.target.value)}
                           />
                       </div>

                       <div>
                           <label className="premium-label">Payment Date</label>
                           <input 
                                type="date" 
                                required
                                className="premium-input"
                                value={payDate}
                                onChange={(e) => setPayDate(e.target.value)}
                           />
                       </div>

                       <div>
                           <label className="premium-label">Amount Paid ($)</label>
                           <input 
                                type="number" 
                                autoFocus
                                className="premium-input text-2xl font-bold"
                                placeholder="0.00"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                           />
                       </div>

                       <div>
                           <label className="premium-label">Bank Ref (Optional)</label>
                           <input 
                                type="text" 
                                className="premium-input"
                                placeholder="EFT Reference..."
                                value={payRef}
                                onChange={(e) => setPayRef(e.target.value)}
                           />
                       </div>

                       <button className="w-full btn-gradient-dark text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center shadow-lg mt-2">
                           <Printer size={16} className="mr-2"/> Confirm & Print
                       </button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};
