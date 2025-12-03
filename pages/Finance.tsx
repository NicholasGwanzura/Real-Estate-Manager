
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Plus, Download, DollarSign, Calendar, CreditCard, X, Printer, Receipt } from 'lucide-react';
import { Payment } from '../types';

export const Finance: React.FC = () => {
  const { payments, sales, developers, clients, stands, addPayment } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'clients'>('overview');
  
  // Payment Modal State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [payAmount, setPayAmount] = useState('');
  const [payDate, setPayDate] = useState(new Date().toISOString().split('T')[0]);
  const [payRef, setPayRef] = useState('');
  const [payType, setPayType] = useState<'INSTALLMENT' | 'FULL_PAYMENT'>('INSTALLMENT');

  // Print Receipt Logic
  const handlePrintReceipt = (payment: Payment) => {
      const sale = sales.find(s => s.id === payment.saleId);
      const client = clients.find(c => c.id === sale?.clientId);
      const stand = stands.find(s => s.id === sale?.standId);
      const dev = developers.find(d => d.id === sale?.developerId);

      // Calculate balance at time of payment (simplified for now as current balance)
      const totalPaid = payments.filter(p => p.saleId === sale?.id).reduce((acc, p) => acc + p.amount, 0);
      const outstanding = (sale?.salePrice || 0) - totalPaid;

      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      printWindow.document.write(`
        <html>
          <head>
            <title>Receipt #${payment.reference}</title>
            <style>
              body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
              .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 40px; }
              .logo { font-size: 28px; font-weight: bold; letter-spacing: 2px; color: #000; text-transform: uppercase; }
              .subtitle { color: #666; font-size: 14px; margin-top: 5px; }
              .receipt-info { display: flex; justify-content: space-between; margin-bottom: 40px; border-bottom: 1px solid #eee; padding-bottom: 20px; }
              .info-group h4 { margin: 0 0 5px 0; font-size: 12px; color: #999; text-transform: uppercase; }
              .info-group p { margin: 0; font-size: 16px; font-weight: 500; }
              .amount-box { background: #f8fafc; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 40px; border: 1px solid #e2e8f0; }
              .amount-label { display: block; font-size: 14px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
              .amount-value { font-size: 48px; font-weight: bold; color: #0f172a; }
              .details-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
              .details-table td { padding: 15px 0; border-bottom: 1px solid #eee; }
              .details-label { color: #64748b; width: 40%; }
              .details-value { font-weight: 500; text-align: right; }
              .footer { margin-top: 60px; text-align: center; font-size: 12px; color: #94a3b8; }
            </style>
          </head>
          <body>
            <div class="header">
              <div class="logo">FineEstate</div>
              <div class="subtitle">Official Payment Receipt</div>
            </div>

            <div class="receipt-info">
              <div class="info-group">
                <h4>Receipt Number</h4>
                <p>${payment.reference}</p>
              </div>
              <div class="info-group" style="text-align: center;">
                <h4>Date & Time</h4>
                <p>${new Date(payment.date).toLocaleString()}</p>
              </div>
              <div class="info-group" style="text-align: right;">
                <h4>Payment Method</h4>
                <p>${payment.type}</p>
              </div>
            </div>

            <div class="amount-box">
              <span class="amount-label">Amount Received</span>
              <span class="amount-value">$${payment.amount.toLocaleString()}</span>
            </div>

            <table class="details-table">
              <tr>
                <td class="details-label">Received From</td>
                <td class="details-value">${client?.name}</td>
              </tr>
              <tr>
                <td class="details-label">For Property</td>
                <td class="details-value">${dev?.name}, Stand #${stand?.standNumber}</td>
              </tr>
              <tr>
                <td class="details-label">Transaction Reference</td>
                <td class="details-value">${payment.id}</td>
              </tr>
              <tr>
                <td class="details-label" style="font-weight: bold;">Remaining Balance</td>
                <td class="details-value" style="font-weight: bold; color: ${outstanding > 0 ? '#ef4444' : '#10b981'}">
                   $${outstanding.toLocaleString()}
                </td>
              </tr>
            </table>

            <div class="footer">
              <p>Thank you for your payment.</p>
              <p>FineEstate Management Systems | Generated: ${new Date().toISOString()}</p>
            </div>
            <script>window.onload = function() { window.print(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
  };

  // Statement Generation
  const handleGenerateStatement = (saleId: string) => {
    const sale = sales.find(s => s.id === saleId);
    const client = clients.find(c => c.id === sale?.clientId);
    const stand = stands.find(s => s.id === sale?.standId);
    const dev = developers.find(d => d.id === sale?.developerId);
    const salePayments = payments.filter(p => p.saleId === saleId).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const totalPaid = salePayments.reduce((acc, p) => acc + p.amount, 0);
    const outstanding = (sale?.salePrice || 0) - totalPaid;

    const printWindow = window.open('', '_blank');
    if (!printWindow) { alert("Please allow popups"); return; }

    printWindow.document.write(`
      <html>
        <head>
          <title>Statement - ${client?.name}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
            .logo { font-size: 24px; font-weight: bold; letter-spacing: 1px; color: #000; text-transform: uppercase; }
            .meta { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 14px; }
            .meta-box { width: 45%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; border-bottom: 2px solid #000; padding: 10px 0; font-size: 12px; text-transform: uppercase; }
            td { border-bottom: 1px solid #eee; padding: 12px 0; font-size: 14px; }
            .total-row td { border-top: 2px solid #000; border-bottom: none; font-weight: bold; font-size: 16px; padding-top: 15px; }
            .footer { margin-top: 50px; font-size: 12px; color: #777; text-align: center; }
            .status-paid { color: green; }
            .status-due { color: red; }
          </style>
        </head>
        <body>
          <div class="header">
             <div class="logo">FineEstate Financial Services</div>
             <p>Statement of Account</p>
          </div>

          <div class="meta">
             <div class="meta-box">
                <strong>Bill To:</strong><br/>
                ${client?.name}<br/>
                ${client?.email}<br/>
                ${client?.address}
             </div>
             <div class="meta-box" style="text-align: right;">
                <strong>Property Details:</strong><br/>
                ${dev?.name}<br/>
                Stand #${stand?.standNumber}<br/>
                Date: ${new Date().toLocaleDateString()}
             </div>
          </div>

          <table>
             <thead>
                <tr>
                   <th>Date</th>
                   <th>Description</th>
                   <th>Reference</th>
                   <th style="text-align: right;">Amount</th>
                </tr>
             </thead>
             <tbody>
                <tr>
                   <td>${sale?.saleDate}</td>
                   <td>Purchase Price - Stand #${stand?.standNumber}</td>
                   <td>SALE-AGR</td>
                   <td style="text-align: right;">$${sale?.salePrice.toLocaleString()}</td>
                </tr>
                ${salePayments.map(p => `
                <tr>
                   <td>${new Date(p.date).toLocaleString()}</td>
                   <td>Payment Received (${p.type})</td>
                   <td>${p.reference}</td>
                   <td style="text-align: right; color: green;">-$${p.amount.toLocaleString()}</td>
                </tr>
                `).join('')}
                
                <tr class="total-row">
                   <td colspan="3" style="text-align: right;">Total Paid</td>
                   <td style="text-align: right; color: green;">$${totalPaid.toLocaleString()}</td>
                </tr>
                <tr class="total-row">
                   <td colspan="3" style="text-align: right;">Outstanding Balance</td>
                   <td style="text-align: right; color: ${outstanding > 0 ? 'red' : 'green'};">$${outstanding.toLocaleString()}</td>
                </tr>
             </tbody>
          </table>

          <div class="footer">
             <p>This is a computer-generated document. No signature is required.</p>
             <p>FineEstate Management Systems</p>
          </div>
          <script>window.onload = function() { window.print(); }</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleRecordPayment = (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedSaleId || !payAmount) return;
      
      // Use Full ISO String to capture time for receipts
      const timestamp = new Date().toISOString(); 
      // If user selected a specific date in the input, use that date but add current time
      const finalDate = payDate === new Date().toISOString().split('T')[0] 
          ? timestamp 
          : new Date(payDate + 'T12:00:00').toISOString();

      const newPayment: Payment = {
          id: `pay-${Date.now()}`,
          saleId: selectedSaleId,
          amount: parseFloat(payAmount),
          date: finalDate, 
          reference: payRef || `REF-${Date.now().toString().slice(-6)}`,
          type: payType
      };

      addPayment(newPayment);
      setShowPaymentModal(false);
      setPayAmount('');
      setPayRef('');
      setSelectedSaleId('');
  };

  // Aggregate Data for Reconciliation
  const devStats = developers.map(dev => {
    const devSales = sales.filter(s => s.developerId === dev.id && s.status !== 'CANCELLED');
    const totalContractValue = devSales.reduce((acc, s) => acc + s.salePrice, 0);
    const agencyCommission = totalContractValue * 0.05; // 5% Deduction
    const netDueToDeveloper = totalContractValue - agencyCommission;

    const totalCollected = payments
      .filter(p => devSales.some(s => s.id === p.saleId))
      .reduce((acc, p) => acc + p.amount, 0);
    
    // Developer outstanding is (Net Due) - (Collected)
    // NOTE: This assumes Agency takes commission from collected funds. 
    // Usually, we want to see how much more the developer expects to receive.
    const outstanding = netDueToDeveloper - totalCollected; 
    
    return {
      ...dev,
      totalContractValue,
      agencyCommission,
      netDueToDeveloper,
      totalCollected,
      outstanding
    };
  });

  const COLORS = ['#10b981', '#ef4444'];

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-100 shadow-lg rounded text-xs font-medium text-slate-700">
           ${payload[0].value.toLocaleString()}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-slate-900">Finance & Reconciliation</h1>
         <button onClick={() => setShowPaymentModal(true)} className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
             <Plus size={18} />
             <span>Record Payment</span>
         </button>
      </div>

      <div className="flex space-x-6 border-b border-slate-200">
          <button 
             onClick={() => setActiveTab('overview')}
             className={`pb-3 font-medium text-sm transition-colors ${activeTab === 'overview' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
              Developer Reconciliation (Net)
          </button>
          <button 
             onClick={() => setActiveTab('clients')}
             className={`pb-3 font-medium text-sm transition-colors ${activeTab === 'clients' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
              Client Statements
          </button>
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 gap-6">
            {devStats.map(stat => (
            <div key={stat.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">{stat.name}</h2>
                    <p className="text-sm text-slate-500">Net Revenue Analysis (Less 5% Agency Commission)</p>
                </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-4">
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                        <p className="text-sm text-slate-500">Gross Contract Value</p>
                        <p className="text-sm font-bold text-slate-900">${stat.totalContractValue.toLocaleString()}</p>
                    </div>
                    <div className="flex justify-between border-b border-dashed border-slate-200 pb-2">
                        <p className="text-sm text-amber-600">Less Agency Comm (5%)</p>
                        <p className="text-sm font-bold text-amber-600">-${stat.agencyCommission.toLocaleString()}</p>
                    </div>
                    <div>
                        <p className="premium-label">Net Due to Developer</p>
                        <p className="text-2xl font-bold text-slate-900">${stat.netDueToDeveloper.toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Collected</p>
                            <p className="text-lg font-bold text-green-600">${stat.totalCollected.toLocaleString()}</p>
                        </div>
                        <div>
                            <p className="text-xs text-slate-500 uppercase font-bold">Outstanding</p>
                            <p className="text-lg font-bold text-red-500">${stat.outstanding.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                <div className="h-40 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                        <Pie
                            data={[
                            { name: 'Collected', value: stat.totalCollected },
                            { name: 'Outstanding Net', value: stat.outstanding > 0 ? stat.outstanding : 0 }
                            ]}
                            innerRadius={50}
                            outerRadius={65}
                            paddingAngle={5}
                            dataKey="value"
                            stroke="none"
                        >
                            <Cell fill={COLORS[0]} />
                            <Cell fill={COLORS[1]} />
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg overflow-y-auto max-h-48 border border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Recent Payments</h4>
                    <div className="space-y-3">
                    {payments
                        .filter(p => sales.find(s => s.id === p.saleId)?.developerId === stat.id)
                        .slice(0, 5)
                        .map(p => (
                        <div key={p.id} className="flex justify-between items-center text-sm border-b border-slate-100 pb-2 last:border-0">
                            <div className="flex flex-col">
                                <span className="text-slate-600 text-xs">{new Date(p.date).toLocaleDateString()}</span>
                                <span className="font-bold text-slate-900">+${p.amount.toLocaleString()}</span>
                            </div>
                            <button 
                                onClick={() => handlePrintReceipt(p)}
                                className="text-slate-400 hover:text-slate-900"
                                title="Print Receipt"
                            >
                                <Printer size={14}/>
                            </button>
                        </div>
                    ))}
                    </div>
                </div>
                </div>
            </div>
            ))}
        </div>
      )}

      {activeTab === 'clients' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                         <tr>
                             <th className="px-6 py-4 uppercase font-semibold text-xs tracking-wider">Client</th>
                             <th className="px-6 py-4 uppercase font-semibold text-xs tracking-wider">Property</th>
                             <th className="px-6 py-4 uppercase font-semibold text-xs tracking-wider text-right">Contract Value</th>
                             <th className="px-6 py-4 uppercase font-semibold text-xs tracking-wider text-right">Total Paid</th>
                             <th className="px-6 py-4 uppercase font-semibold text-xs tracking-wider text-right">Balance</th>
                             <th className="px-6 py-4 uppercase font-semibold text-xs tracking-wider">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-100">
                         {sales.map(sale => {
                             const clientPayments = payments.filter(p => p.saleId === sale.id);
                             const totalPaid = clientPayments.reduce((acc, p) => acc + p.amount, 0);
                             const balance = sale.salePrice - totalPaid;
                             const stand = stands.find(s => s.id === sale.standId);

                             return (
                                 <tr key={sale.id} className="hover:bg-slate-50">
                                     <td className="px-6 py-4 font-medium text-slate-900">{sale.clientName}</td>
                                     <td className="px-6 py-4 text-slate-600">Stand #{stand?.standNumber}</td>
                                     <td className="px-6 py-4 text-right font-mono">${sale.salePrice.toLocaleString()}</td>
                                     <td className="px-6 py-4 text-right font-mono text-green-600">${totalPaid.toLocaleString()}</td>
                                     <td className="px-6 py-4 text-right font-mono text-red-500 font-bold">${balance.toLocaleString()}</td>
                                     <td className="px-6 py-4">
                                         <button 
                                            onClick={() => handleGenerateStatement(sale.id)}
                                            className="flex items-center text-amber-600 hover:text-amber-700 font-medium text-xs border border-amber-200 bg-amber-50 px-3 py-1.5 rounded-md transition-colors"
                                         >
                                             <FileText size={14} className="mr-1.5"/> Statement
                                         </button>
                                     </td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             </div>
          </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-900">Record Payment</h2>
                    <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleRecordPayment} className="space-y-6">
                    <div>
                        <label className="premium-label">Select Sale / Client</label>
                        <select 
                            className="premium-input"
                            value={selectedSaleId}
                            onChange={(e) => setSelectedSaleId(e.target.value)}
                            required
                        >
                            <option value="">-- Choose Account --</option>
                            {sales.map(s => {
                                const stand = stands.find(st => st.id === s.standId);
                                return <option key={s.id} value={s.id}>{s.clientName} - Stand #{stand?.standNumber}</option>
                            })}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="premium-label">Payment Type</label>
                            <select 
                                className="premium-input"
                                value={payType}
                                onChange={(e) => setPayType(e.target.value as any)}
                            >
                                <option value="INSTALLMENT">Installment</option>
                                <option value="DEPOSIT">Initial Deposit</option>
                                <option value="FULL_PAYMENT">Full Settlement</option>
                            </select>
                        </div>
                        <div>
                             <label className="premium-label">Date</label>
                             <input 
                                type="date" 
                                className="premium-input"
                                value={payDate}
                                onChange={(e) => setPayDate(e.target.value)}
                                required
                             />
                        </div>
                    </div>

                    <div>
                        <label className="premium-label">Amount ($)</label>
                        <div className="relative">
                            <input 
                                type="number" 
                                className="premium-input pl-6"
                                placeholder="0.00"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                required
                            />
                            <span className="absolute left-0 bottom-2.5 text-slate-400">$</span>
                        </div>
                    </div>

                    <div>
                        <label className="premium-label">Reference Number</label>
                        <input 
                            type="text" 
                            className="premium-input"
                            placeholder="e.g. EFT-123456"
                            value={payRef}
                            onChange={(e) => setPayRef(e.target.value)}
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all flex items-center">
                            <Receipt size={16} className="mr-2"/> Process & Receipt
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
