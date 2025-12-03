
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Search, CreditCard, DollarSign, Receipt, Printer, CheckCircle, AlertTriangle } from 'lucide-react';
import { Payment } from '../types';

export const Cashier: React.FC = () => {
  const { sales, clients, stands, developers, payments, addPayment } = useApp();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState<string | null>(null);
  
  // Payment Form State
  const [amount, setAmount] = useState('');
  const [manualReceiptNo, setManualReceiptNo] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [bankRef, setBankRef] = useState('');
  const [paymentType, setPaymentType] = useState<'INSTALLMENT' | 'FULL_PAYMENT' | 'DEPOSIT'>('INSTALLMENT');

  const filteredSales = sales.filter(s => {
      const client = clients.find(c => c.id === s.clientId);
      const stand = stands.find(st => st.id === s.standId);
      const search = searchTerm.toLowerCase();
      
      return (
          s.status !== 'CANCELLED' && 
          (client?.name.toLowerCase().includes(search) || 
           stand?.standNumber.toLowerCase().includes(search) ||
           client?.idNumber.includes(search))
      );
  });

  const selectedSale = sales.find(s => s.id === selectedSaleId);
  
  // Financial Calculations
  const getSaleFinancials = (saleId: string) => {
      const sale = sales.find(s => s.id === saleId);
      if(!sale) return { paid: 0, balance: 0, price: 0 };
      
      const paid = payments.filter(p => p.saleId === saleId).reduce((acc, p) => acc + p.amount, 0);
      return {
          price: sale.salePrice,
          paid,
          balance: sale.salePrice - paid
      };
  };

  const financials = selectedSale ? getSaleFinancials(selectedSale.id) : null;

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
            <div class="logo">FineEstate</div>
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
             Recorded by System Cashier Module.<br/>
             This receipt corresponds to physical receipt #${payment.manualReceiptNo}.
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const processPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if(!selectedSaleId || !amount || !manualReceiptNo) return;

      const payment: Payment = {
          id: `pay-${Date.now()}`,
          saleId: selectedSaleId,
          amount: parseFloat(amount),
          date: new Date(payDate + 'T12:00:00').toISOString(),
          reference: bankRef || `CASH-${Date.now().toString().slice(-6)}`,
          manualReceiptNo: manualReceiptNo,
          type: paymentType
      };

      addPayment(payment);
      
      // Auto Print
      setTimeout(() => handlePrintReceipt(payment), 500);

      // Reset
      setAmount('');
      setManualReceiptNo('');
      setBankRef('');
      setSelectedSaleId(null);
      alert("Payment Processed Successfully!");
  };

  return (
    <div className="space-y-8">
      <div>
         <h1 className="text-2xl font-bold text-slate-900">Cashier Transaction Desk</h1>
         <p className="text-slate-500 text-sm">Process payments and issue receipts linked to physical books.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel: Search & Select */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 h-fit lg:col-span-1">
              <h2 className="text-lg font-bold text-slate-900 mb-4">1. Find Account</h2>
              <div className="relative mb-6">
                  <input 
                    type="text" 
                    className="premium-input pl-10" 
                    placeholder="Search Client or Stand..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    autoFocus
                  />
                  <Search className="absolute left-0 top-1.5 text-slate-400" size={18} />
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                  {searchTerm && filteredSales.length === 0 && (
                      <div className="text-center text-slate-400 italic text-sm py-4">No matching active accounts found.</div>
                  )}
                  {searchTerm && filteredSales.map(sale => {
                      const client = clients.find(c => c.id === sale.clientId);
                      const stand = stands.find(s => s.id === sale.standId);
                      const dev = developers.find(d => d.id === sale.developerId);
                      const isSelected = selectedSaleId === sale.id;

                      return (
                          <div 
                            key={sale.id} 
                            onClick={() => setSelectedSaleId(sale.id)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all ${isSelected ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-slate-50 border-slate-100 hover:border-amber-400 text-slate-600'}`}
                          >
                              <div className="flex justify-between items-start">
                                  <span className="font-bold">{client?.name}</span>
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'}`}>Stand {stand?.standNumber}</span>
                              </div>
                              <div className={`text-xs mt-1 ${isSelected ? 'text-slate-300' : 'text-slate-400'}`}>{dev?.name}</div>
                          </div>
                      );
                  })}
                  {!searchTerm && <div className="text-center text-slate-400 text-xs py-4">Start typing to search accounts...</div>}
              </div>
          </div>

          {/* Right Panel: Transaction Form */}
          <div className="lg:col-span-2 space-y-6">
             {selectedSale && financials ? (
                 <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-slate-900 animate-in fade-in slide-in-from-right-4">
                     <div className="flex justify-between items-start border-b border-slate-100 pb-6 mb-6">
                         <div>
                            <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                                <Receipt className="mr-3 text-amber-500" size={28}/> 
                                New Transaction
                            </h2>
                            <p className="text-slate-500 mt-1">
                                {clients.find(c => c.id === selectedSale.clientId)?.name} • 
                                Stand #{stands.find(s => s.id === selectedSale.standId)?.standNumber}
                            </p>
                         </div>
                         <div className="text-right">
                             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Balance</div>
                             <div className={`text-3xl font-bold ${financials.balance > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                 ${financials.balance.toLocaleString()}
                             </div>
                             <div className="text-xs text-slate-400 mt-1">Total Price: ${financials.price.toLocaleString()}</div>
                         </div>
                     </div>

                     <form onSubmit={processPayment} className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         <div className="space-y-6">
                             <div>
                                 <label className="premium-label flex items-center text-amber-700">
                                     <AlertTriangle size={12} className="mr-1"/> Physical Receipt Number (Required)
                                 </label>
                                 <input 
                                    type="text" 
                                    required 
                                    className="premium-input bg-amber-50/50 px-2 border-amber-200 focus:border-amber-500 font-mono font-bold"
                                    placeholder="e.g. BK-10552"
                                    value={manualReceiptNo}
                                    onChange={(e) => setManualReceiptNo(e.target.value)}
                                 />
                                 <p className="text-[10px] text-slate-400 mt-1">Must match the number on the manual receipt book.</p>
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
                                 <label className="premium-label">Payment Type</label>
                                 <select 
                                    className="premium-input"
                                    value={paymentType}
                                    onChange={(e) => setPaymentType(e.target.value as any)}
                                 >
                                     <option value="INSTALLMENT">Monthly Installment</option>
                                     <option value="DEPOSIT">Initial Deposit</option>
                                     <option value="FULL_PAYMENT">Settlement / Full Payment</option>
                                 </select>
                             </div>
                         </div>

                         <div className="space-y-6">
                             <div>
                                 <label className="premium-label">Amount Received ($)</label>
                                 <div className="relative">
                                     <input 
                                        type="number" 
                                        required 
                                        className="premium-input pl-8 text-2xl font-bold"
                                        placeholder="0.00"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                     />
                                     <DollarSign className="absolute left-0 top-3 text-slate-400" size={20} />
                                 </div>
                             </div>

                             <div>
                                 <label className="premium-label">Bank Reference / Cheque # (Optional)</label>
                                 <input 
                                    type="text" 
                                    className="premium-input"
                                    placeholder="e.g. EFT-999222"
                                    value={bankRef}
                                    onChange={(e) => setBankRef(e.target.value)}
                                 />
                             </div>

                             <div className="pt-4">
                                 <button 
                                    type="submit" 
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold uppercase tracking-wider hover:bg-slate-800 shadow-xl transition-all active:scale-95 flex justify-center items-center"
                                 >
                                     <CheckCircle size={20} className="mr-2"/> Process Payment
                                 </button>
                                 <p className="text-center text-xs text-slate-400 mt-3 flex justify-center items-center">
                                     <Printer size={12} className="mr-1"/> Receipt will print automatically
                                 </p>
                             </div>
                         </div>
                     </form>
                 </div>
             ) : (
                 <div className="h-full flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200 rounded-xl min-h-[400px] text-slate-400">
                     <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4">
                         <CreditCard size={32} className="opacity-50"/>
                     </div>
                     <p className="font-medium">Select an account to start a transaction.</p>
                 </div>
             )}
          </div>
      </div>
    </div>
  );
};
