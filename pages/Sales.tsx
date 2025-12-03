import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StandStatus, Sale, UserRole } from '../types';
import { CheckCircle, AlertOctagon, Search, Wand2, UserPlus, Users, BadgeDollarSign } from 'lucide-react';

export const Sales: React.FC = () => {
  const { developers, stands, sales, addSale, currentUser, clients, navigate, users } = useApp();
  
  const [selectedDev, setSelectedDev] = useState(developers[0]?.id || '');
  
  // New Sale Form State
  const [targetStandId, setTargetStandId] = useState('');
  const [clientId, setClientId] = useState('');
  const [depositAmount, setDepositAmount] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(currentUser.role === UserRole.AGENT ? currentUser.id : '');

  // Derived state
  const targetStand = stands.find(s => s.id === targetStandId);
  const isAvailable = targetStand?.status === StandStatus.AVAILABLE;
  const agents = users.filter(u => u.role === UserRole.AGENT);

  // Auto Allocate Logic
  const handleAutoAllocate = () => {
      // Filter stands for this developer, that are available
      const availableStands = stands.filter(s => s.developerId === selectedDev && s.status === StandStatus.AVAILABLE);
      
      // Sort them numerically by stand number to find the "next" one
      const sorted = availableStands.sort((a, b) => {
          const numA = parseInt(a.standNumber.replace(/\D/g, '')) || 0;
          const numB = parseInt(b.standNumber.replace(/\D/g, '')) || 0;
          return numA - numB;
      });

      if (sorted.length > 0) {
          setTargetStandId(sorted[0].id);
      } else {
          alert("No available stands found for this developer.");
      }
  };

  const handleSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetStand || !isAvailable || !clientId || !selectedAgentId) return;

    const client = clients.find(c => c.id === clientId);
    if (!client) return;

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      standId: targetStand.id,
      developerId: targetStand.developerId,
      agentId: selectedAgentId,
      clientId: client.id,
      clientName: client.name,
      saleDate: new Date().toISOString().split('T')[0],
      salePrice: targetStand.price,
      depositPaid: Number(depositAmount),
      status: 'PENDING'
    };

    addSale(newSale);
    
    // Reset form
    setClientId('');
    setDepositAmount('');
    setTargetStandId('');
    alert(`Sale recorded for ${client.name}! Agreement draft pending.`);
  };

  const filteredSales = sales.filter(s => s.developerId === selectedDev);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Sales Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Form */}
        <div className="lg:col-span-1 bg-white p-8 rounded-xl shadow-lg border-t-4 border-amber-500 h-fit">
           <h2 className="text-xl font-bold mb-6 text-slate-900 tracking-tight">Record Transaction</h2>
           <form onSubmit={handleSale} className="space-y-6">
             <div>
               <label className="premium-label">Developer</label>
               <select 
                  className="premium-input"
                  value={selectedDev}
                  onChange={(e) => { setSelectedDev(e.target.value); setTargetStandId(''); }}
               >
                 {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
               </select>
             </div>

             <div>
                <label className="premium-label flex justify-between">
                    Stand Selection
                    <button type="button" onClick={handleAutoAllocate} className="text-[10px] text-amber-600 flex items-center hover:underline uppercase tracking-wide font-bold">
                        <Wand2 size={10} className="mr-1"/> Auto Next
                    </button>
                </label>
                <select 
                  className="premium-input"
                  value={targetStandId}
                  onChange={(e) => setTargetStandId(e.target.value)}
                >
                  <option value="">Select a Stand...</option>
                  {stands
                    .filter(s => s.developerId === selectedDev && s.status === StandStatus.AVAILABLE)
                    .map(s => (
                      <option key={s.id} value={s.id}>Stand {s.standNumber} - ${s.price.toLocaleString()}</option>
                  ))}
                  {targetStand && !isAvailable && <option value={targetStand.id}>Stand {targetStand.standNumber} (UNAVAILABLE)</option>}
                </select>
                {targetStandId && !isAvailable && (
                    <div className="text-red-500 text-xs mt-2 flex items-center font-medium">
                        <AlertOctagon size={12} className="mr-1"/> Stand is currently {targetStand?.status.toLowerCase()}.
                    </div>
                )}
             </div>

             <div>
                <label className="premium-label flex justify-between">
                    Client
                    <button type="button" onClick={() => navigate('/clients')} className="text-[10px] text-blue-600 flex items-center hover:underline uppercase tracking-wide font-bold">
                        <UserPlus size={10} className="mr-1"/> New
                    </button>
                </label>
                <select 
                    className="premium-input"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    required
                >
                    <option value="">-- Select Client --</option>
                    {clients.map(c => (
                        <option key={c.id} value={c.id}>{c.name} ({c.idNumber})</option>
                    ))}
                </select>
             </div>
             
             <div>
               <label className="premium-label">Sales Agent (Commission)</label>
               <select 
                    className="premium-input"
                    value={selectedAgentId}
                    onChange={(e) => setSelectedAgentId(e.target.value)}
                    required
                 >
                    <option value="">-- Select Agent --</option>
                    {agents.map(a => (
                        <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
               </select>
             </div>

             <div>
                <label className="premium-label">Deposit Paid ($)</label>
                <input 
                  type="number" required
                  className="premium-input"
                  placeholder="0.00"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                />
             </div>

             <div className="pt-2">
                <button 
                    type="submit" 
                    disabled={!isAvailable || !clientId || !targetStandId || !selectedAgentId}
                    className="w-full bg-slate-900 text-white py-3.5 rounded-lg font-bold hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center shadow-xl shadow-slate-200"
                >
                    <BadgeDollarSign className="mr-2" size={18}/> COMPLETE SALE
                </button>
             </div>
           </form>
        </div>

        {/* Recent Sales List */}
        <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100">
           <h2 className="text-xl font-bold mb-6 text-slate-900">Recent Transactions</h2>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
                 <tr>
                   <th className="px-4 py-4 uppercase font-semibold text-xs tracking-wider">Date</th>
                   <th className="px-4 py-4 uppercase font-semibold text-xs tracking-wider">Stand</th>
                   <th className="px-4 py-4 uppercase font-semibold text-xs tracking-wider">Client</th>
                   <th className="px-4 py-4 uppercase font-semibold text-xs tracking-wider text-right">Price</th>
                   <th className="px-4 py-4 uppercase font-semibold text-xs tracking-wider text-right">Deposit</th>
                   <th className="px-4 py-4 uppercase font-semibold text-xs tracking-wider">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {filteredSales.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400 italic">No recent sales recorded for this development.</td></tr>
                 ) : (
                    filteredSales.map(sale => {
                        const stand = stands.find(s => s.id === sale.standId);
                        return (
                         <tr key={sale.id} className="hover:bg-slate-50 transition-colors">
                           <td className="px-4 py-4 text-slate-500">{sale.saleDate}</td>
                           <td className="px-4 py-4 font-bold text-slate-900">#{stand?.standNumber}</td>
                           <td className="px-4 py-4 text-slate-600">{sale.clientName}</td>
                           <td className="px-4 py-4 text-right font-mono text-slate-700">${sale.salePrice.toLocaleString()}</td>
                           <td className="px-4 py-4 text-right font-mono text-green-600 font-medium">${sale.depositPaid.toLocaleString()}</td>
                           <td className="px-4 py-4">
                             <span className="flex items-center text-[10px] uppercase font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full w-fit">
                                <CheckCircle size={10} className="mr-1"/> {sale.status}
                             </span>
                           </td>
                         </tr>
                        );
                    })
                 )}
               </tbody>
             </table>
           </div>
        </div>
      </div>
    </div>
  );
};