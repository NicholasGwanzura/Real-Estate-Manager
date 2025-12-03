
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { StandStatus, Stand } from '../types';
import { Filter, Search, Building, Maximize2, Tag } from 'lucide-react';

export const Stands: React.FC = () => {
  const { stands, developers } = useApp();
  const [filterDev, setFilterDev] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState<StandStatus | 'ALL'>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStands = stands.filter(stand => {
    const devMatch = filterDev === 'ALL' || stand.developerId === filterDev;
    const statusMatch = filterStatus === 'ALL' || stand.status === filterStatus;
    const searchMatch = stand.standNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return devMatch && statusMatch && searchMatch;
  });

  const totalValue = filteredStands.reduce((acc, s) => acc + s.price, 0);
  const avgPrice = filteredStands.length > 0 ? totalValue / filteredStands.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-2xl font-bold text-slate-900">Stands Inventory</h1>
           <p className="text-slate-500 text-sm">Real-time view of all property units</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center">
         <div className="relative flex-1 w-full">
            <input 
              type="text" 
              placeholder="Search Stand Number..." 
              className="premium-input pl-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute right-0 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
         </div>
         
         <div className="flex gap-6 w-full md:w-auto items-end">
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
                 <div key={stand.id} className={`rounded-xl border p-5 transition-all hover:shadow-lg ${statusColor} group`}>
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
                 </div>
             );
         })}
         
         {filteredStands.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                 No stands found matching your filters.
             </div>
         )}
      </div>
    </div>
  );
};
