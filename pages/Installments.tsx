
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sale, Payment, Stand } from '../types';
import { Calendar, DollarSign, AlertCircle, CheckCircle, Clock, Plus, X } from 'lucide-react';

export const Installments: React.FC = () => {
  const { sales, payments, stands, developers, addPayment } = useApp();
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedSaleForPayment, setSelectedSaleForPayment] = useState<string | null>(null);
  const [payAmount, setPayAmount] = useState('');

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
      // Simplifying: Assuming Balance should be amortized over Duration.
      // Expected Monthly = (Price - Initial Deposit) / Duration
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
      setShowPayModal(true);
  };

  const submitPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedSaleForPayment || !payAmount) return;

      const payment: Payment = {
          id: `pay-${Date.now()}`,
          saleId: selectedSaleForPayment,
          amount: parseFloat(payAmount),
          date: new Date().toISOString().split('T')[0],
          reference: `INST-${Date.now().toString().slice(-4)}`,
          type: 'INSTALLMENT'
      };

      addPayment(payment);
      setShowPayModal(false);
      setPayAmount('');
      alert("Installment recorded successfully!");
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
                   <div className="flex justify-between items-center mb-4">
                       <h3 className="text-lg font-bold text-slate-900">Record Installment</h3>
                       <button onClick={() => setShowPayModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                   </div>
                   <form onSubmit={submitPayment} className="space-y-4">
                       <div>
                           <label className="premium-label">Amount ($)</label>
                           <input 
                                type="number" 
                                autoFocus
                                className="premium-input text-lg font-bold"
                                placeholder="0.00"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                           />
                       </div>
                       <button className="w-full btn-gradient-dark text-white py-3 rounded-xl font-bold text-sm uppercase tracking-wide">
                           Confirm Payment
                       </button>
                   </form>
               </div>
           </div>
       )}
    </div>
  );
};
