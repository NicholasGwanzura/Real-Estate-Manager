
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StandStatus, Stand, UserRole } from '../types';
import { Filter, Search, Building, XCircle, X, History, User, Calendar, DollarSign, CreditCard, FileText, Trash2, AlertTriangle, Layers } from 'lucide-react';

export const Stands: React.FC = () => {
  const { stands, developers, sales, payments, clients, users, currentUser, deleteStand } = useApp();
  const [filterDev, setFilterDev] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<StandStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStand, setSelectedStand] = useState<Stand | null>(null);
  
  // Delete Modal State
  const [deleteConfirm, setDeleteConfirm] = useState<{isOpen: boolean, id: string | null, number: string}>({
      isOpen: false, id: null, number: ''
  });

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const filteredStands = stands.filter(stand => {
    const devMatch = filterDev === 'ALL' || stand.developerId === filterDev;
    const statusMatch = filterStatus === 'ALL' || stand.status === filterStatus;
    const searchMatch = stand.standNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return devMatch && statusMatch && searchMatch;
  });

  const totalValue = filteredStands.reduce((acc, s) => acc + s.price, 0);
  const avgPrice = filteredStands.length > 0 ? totalValue / filteredStands.length : 0;

  const hasActiveFilters = filterDev !== 'ALL' || filterStatus !== 'ALL' || searchTerm !== '';

  const clearFilters = () => {
    setFilterDev('ALL');
    setFilterStatus('ALL');
    setSearchTerm('');
  };

  const handleDeleteClick = (e: React.MouseEvent, stand: Stand) => {
      e.stopPropagation();
      setDeleteConfirm({ isOpen: true, id: stand.id, number: stand.standNumber });
  };

  const executeDelete = () => {
      if (deleteConfirm.id) {
          deleteStand(deleteConfirm.id);
          setDeleteConfirm({ isOpen: false, id: null, number: '' });
      }
  };

  // Helper to get history for modal
  const getStandHistory = (stand: Stand) => {
      const standSales = sales.filter(s => s.standId === stand.id).sort((a,b) => new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime());
      const associatedPayments = payments.filter(p => standSales.some(s => s.id === p.saleId)).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      return { standSales, associatedPayments };
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Stands Inventory</h1>
           <p className="text-slate-500 text-sm">Real-time view of all property units</p>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
         <div className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Total Units</p>
            <p className="text-2xl font-bold text-slate-900">{filteredStands.length}</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Inventory Value</p>
            <p className="text-2xl font-bold text-slate-900">${(totalValue / 1000000).toFixed(2)}M</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Avg. Price</p>
            <p className="text-2xl font-bold text-slate-900">${Math.round(avgPrice / 1000)}k</p>
         </div>
         <div className="bg-white p-4 rounded-xl border border-slate-100 text-center shadow-sm">
            <p className="text-xs text-slate-500 uppercase tracking-wide font-semibold">Availability</p>
            <p className="text-2xl font-bold text-green-600">
               {filteredStands.length > 0 ? Math.round((filteredStands.filter(s => s.status === 'AVAILABLE').length / filteredStands.length) * 100) : 0}%
            </p>
         </div>
      </div>

      {/* Inventory by Development Summary Table */}
      {filterDev === 'ALL' && !searchTerm && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
             <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center">
                 <Layers size={16} className="text-amber-500 mr-2" />
                 <h3 className="font-bold text-slate-900 text-sm">Inventory by Development</h3>
             </div>
             <div className="overflow-x-auto">
                 <table className="w-full text-sm text-left">
                     <thead className="bg-white border-b border-slate-200">
                         <tr>
                             <th className="px-6 py-3 text-slate-500 font-semibold text-xs uppercase">Development</th>
                             <th className="px-6 py-3 text-right text-slate-500 font-semibold text-xs uppercase">Total Units</th>
                             <th className="px-6 py-3 text-right text-green-600 font-semibold text-xs uppercase">Available</th>
                             <th className="px-6 py-3 text-right text-slate-900 font-semibold text-xs uppercase">Sold</th>
                             <th className="px-6 py-3 text-right text-amber-600 font-semibold text-xs uppercase">Reserved</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-slate-50">
                         {developers.map(dev => {
                             const devStands = stands.filter(s => s.developerId === dev.id);
                             if(devStands.length === 0) return null;
                             return (
                                 <tr key={dev.id} className="hover:bg-slate-50 cursor-pointer" onClick={() => setFilterDev(dev.id)}>
                                     <td className="px-6 py-3 font-bold text-slate-900">{dev.name}</td>
                                     <td className="px-6 py-3 text-right font-medium">{devStands.length}</td>
                                     <td className="px-6 py-3 text-right font-bold text-green-600 bg-green-50/30">{devStands.filter(s => s.status === 'AVAILABLE').length}</td>
                                     <td className="px-6 py-3 text-right font-medium">{devStands.filter(s => s.status === 'SOLD').length}</td>
                                     <td className="px-6 py-3 text-right font-medium text-amber-600">{devStands.filter(s => s.status === 'RESERVED').length}</td>
                                 </tr>
                             );
                         })}
                     </tbody>
                 </table>
             </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-end">
         <div className="relative flex-1 w-full">
            <label className="premium-label">Search</label>
            <div className="relative">
                <input 
                type="text" 
                placeholder="Search Stand Number..." 
                className="premium-input pl-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="absolute right-0 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
            </div>
         </div>
         
         <div className="w-full md:w-48">
             <label className="premium-label">Development</label>
             <select 
               className="premium-input"
               value={filterDev}
               onChange={(e) => setFilterDev(e.target.value)}
             >
               <option value="ALL">All Developments</option>
               {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
             </select>
         </div>

         <div className="w-full md:w-48">
             <label className="premium-label">Status</label>
             <select 
               className="premium-input"
               value={filterStatus}
               onChange={(e) => setFilterStatus(e.target.value as any)}
             >
               <option value="ALL">All Status</option>
               <option value={StandStatus.AVAILABLE}>Available</option>
               <option value={StandStatus.SOLD}>Sold</option>
               <option value={StandStatus.RESERVED}>Reserved</option>
             </select>
         </div>

         {hasActiveFilters && (
            <button 
                onClick={clearFilters}
                className="h-[42px] px-4 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Clear Filters"
            >
                <XCircle size={20} />
            </button>
         )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
         {filteredStands.map(stand => {
             const dev = developers.find(d => d.id === stand.developerId);
             
             let statusColor = 'bg-white border-slate-200';
             let statusBadge = 'bg-green-100 text-green-700';
             
             if (stand.status === StandStatus.SOLD) {
                 statusColor = 'bg-slate-50 border-slate-200 opacity-60';
                 statusBadge = 'bg-slate-200 text-slate-600';
             } else if (stand.status === StandStatus.RESERVED) {
                 statusColor = 'bg-amber-50 border-amber-200';
                 statusBadge = 'bg-amber-100 text-amber-700';
             }

             return (
                 <div 
                    key={stand.id} 
                    onClick={() => setSelectedStand(stand)}
                    className={`rounded-xl border p-5 transition-all hover:shadow-xl hover:-translate-y-1 cursor-pointer ${statusColor} group relative overflow-hidden`}
                 >
                    {isAdmin && stand.status === StandStatus.AVAILABLE && (
                        <button 
                            onClick={(e) => handleDeleteClick(e, stand)}
                            className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors z-20 opacity-0 group-hover:opacity-100"
                            title="Delete Stand"
                        >
                            <Trash2 size={16} />
                        </button>
                    )}

                    <div className="flex justify-between items-start mb-4">
                        <div>
                           <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full ${statusBadge}`}>
                               {stand.status}
                           </span>
                           <h3 className="text-2xl font-bold text-slate-900 mt-2">#{stand.standNumber}</h3>
                           <p className="text-xs text-slate-500 flex items-center mt-1 font-medium">
                               <Building size={12} className="mr-1"/> {dev?.name}
                           </p>
                        </div>
                        <div className="text-right">
                            <p className="text-lg font-bold text-slate-900">${stand.price.toLocaleString()}</p>
                            <p className="text-xs text-slate-500 font-mono">{stand.size} m²</p>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4 pt-4 border-t border-slate-200/50 text-xs text-slate-600">
                        <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Deposit Req:</span>
                            <span className="font-bold text-slate-700">{stand.depositRequired ? `$${stand.depositRequired.toLocaleString()}` : 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 font-medium">Financing:</span>
                            <span className="font-bold text-slate-700 truncate max-w-[150px]">{stand.financingTerms || 'None'}</span>
                        </div>
                    </div>
                    
                    {/* Hover Hint */}
                    <div className="absolute inset-0 bg-slate-900/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                        <span className="bg-white text-slate-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm">View History</span>
                    </div>
                 </div>
             );
         })}
         
         {filteredStands.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200 flex flex-col items-center justify-center">
                 <Filter size={48} className="mb-4 opacity-10" />
                 <p>No stands found matching your filters.</p>
                 <button onClick={clearFilters} className="mt-4 text-amber-600 hover:text-amber-700 text-sm font-bold">
                    Clear Filters
                 </button>
             </div>
         )}
      </div>

      {/* Transaction History Modal */}
      {selectedStand && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div className="flex items-start space-x-4">
                        <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                            <History className="text-amber-500" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-slate-900">Stand #{selectedStand.standNumber} History</h2>
                            <p className="text-sm text-slate-500 flex items-center">
                                <Building size={14} className="mr-1"/> 
                                {developers.find(d => d.id === selectedStand.developerId)?.name}
                                <span className="mx-2 text-slate-300">|</span>
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    selectedStand.status === 'SOLD' ? 'bg-slate-200 text-slate-600' :
                                    selectedStand.status === 'RESERVED' ? 'bg-amber-100 text-amber-700' :
                                    'bg-green-100 text-green-700'
                                }`}>{selectedStand.status}</span>
                            </p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setSelectedStand(null)} 
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto custom-scrollbar">
                    {(() => {
                        const { standSales, associatedPayments } = getStandHistory(selectedStand);

                        if (standSales.length === 0) {
                            return (
                                <div className="text-center py-12 flex flex-col items-center justify-center text-slate-400">
                                    <div className="bg-slate-50 p-4 rounded-full mb-3">
                                        <FileText size={32} className="opacity-20"/>
                                    </div>
                                    <p className="font-medium">No transaction history found.</p>
                                    <p className="text-sm mt-1">This stand has not been sold yet.</p>
                                </div>
                            );
                        }

                        return (
                            <div className="space-y-8">
                                {/* Sales Records */}
                                <section>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                                        <User size={16} className="mr-2 text-slate-400"/> Sales Ownership
                                    </h3>
                                    <div className="space-y-3">
                                        {standSales.map(sale => {
                                            const client = clients.find(c => c.id === sale.clientId);
                                            const agent = users.find(u => u.id === sale.agentId);
                                            return (
                                                <div key={sale.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <div className="flex items-center space-x-2">
                                                                <p className="font-bold text-slate-900 text-lg">{client?.name || sale.clientName}</p>
                                                                {sale.status === 'CANCELLED' && <span className="text-[10px] bg-red-100 text-red-600 font-bold px-2 rounded-full">CANCELLED</span>}
                                                            </div>
                                                            <p className="text-xs text-slate-500">Sold by Agent: {agent?.name || 'Unknown'}</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-bold text-slate-900">${sale.salePrice.toLocaleString()}</p>
                                                            <p className="text-xs text-slate-500 font-mono">{sale.saleDate}</p>
                                                        </div>
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4 text-xs text-slate-600 pt-3 border-t border-slate-200/60">
                                                        <div className="flex items-center">
                                                            <CreditCard size={12} className="mr-1.5 text-slate-400"/>
                                                            Deposit: <span className="font-semibold ml-1">${sale.depositPaid.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center justify-end">
                                                            Status: <span className="font-bold ml-1 uppercase">{sale.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Payment History */}
                                <section>
                                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center">
                                        <DollarSign size={16} className="mr-2 text-slate-400"/> Payment Ledger
                                    </h3>
                                    {associatedPayments.length > 0 ? (
                                        <div className="border border-slate-100 rounded-xl overflow-hidden">
                                            <table className="w-full text-sm text-left">
                                                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                                                    <tr>
                                                        <th className="px-4 py-3">Date</th>
                                                        <th className="px-4 py-3">Reference</th>
                                                        <th className="px-4 py-3">Type</th>
                                                        <th className="px-4 py-3 text-right">Amount</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {associatedPayments.map(payment => (
                                                        <tr key={payment.id} className="hover:bg-slate-50/50">
                                                            <td className="px-4 py-3 text-slate-600 flex items-center">
                                                                <Calendar size={12} className="mr-2 text-slate-300"/> {payment.date}
                                                            </td>
                                                            <td className="px-4 py-3 font-mono text-xs text-slate-500">{payment.reference}</td>
                                                            <td className="px-4 py-3 text-xs font-medium text-slate-700">
                                                                {payment.type === 'DEPOSIT' ? 'Deposit' : 
                                                                 payment.type === 'FULL_PAYMENT' ? 'Settlement' : 'Installment'}
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-mono text-green-600 font-medium">
                                                                +${payment.amount.toLocaleString()}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                    <tr className="bg-slate-50 font-bold text-slate-900">
                                                        <td colSpan={3} className="px-4 py-3 text-right">Total Paid</td>
                                                        <td className="px-4 py-3 text-right">
                                                            ${associatedPayments.reduce((acc, p) => acc + p.amount, 0).toLocaleString()}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400">
                                            No payments recorded yet.
                                        </div>
                                    )}
                                </section>
                            </div>
                        );
                    })()}
                </div>
                
                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                    <button 
                        onClick={() => setSelectedStand(null)}
                        className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                    >
                        Close History
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.isOpen && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-in fade-in duration-200">
              <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl border border-red-100">
                  <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                          <AlertTriangle className="text-red-600" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mb-2">Confirm Deletion</h3>
                      <p className="text-sm text-slate-500 mb-6">
                          Are you sure you want to delete <span className="font-bold text-slate-900">Stand #{deleteConfirm.number}</span>? 
                          This action cannot be undone and will be permanently logged.
                      </p>
                      
                      <div className="flex gap-3 w-full">
                          <button 
                              onClick={() => setDeleteConfirm({ isOpen: false, id: null, number: '' })}
                              className="flex-1 px-4 py-2.5 bg-slate-100 text-slate-700 rounded-lg font-bold text-sm hover:bg-slate-200 transition-colors"
                          >
                              Cancel
                          </button>
                          <button 
                              onClick={executeDelete}
                              className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-bold text-sm hover:bg-red-700 transition-colors shadow-lg shadow-red-200"
                          >
                              Delete Stand
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
