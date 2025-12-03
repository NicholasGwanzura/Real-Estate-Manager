
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { CheckCircle, Clock, Wallet, DollarSign, Filter } from 'lucide-react';

export const Commissions: React.FC = () => {
  const { commissions, users, stands, markCommissionPaid, currentUser } = useApp();
  const [filterAgent, setFilterAgent] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const agents = users.filter(u => u.role === UserRole.AGENT);

  const filteredCommissions = commissions.filter(comm => {
    const agentMatch = filterAgent === 'ALL' || comm.agentId === filterAgent;
    const statusMatch = filterStatus === 'ALL' || comm.status === filterStatus;
    return agentMatch && statusMatch;
  });

  // Calculate totals based on filtered view
  const totalSalesVolume = filteredCommissions.reduce((acc, c) => acc + c.salePrice, 0);
  const totalAgencyRevenue = filteredCommissions.reduce((acc, c) => acc + c.totalAgencyCommission, 0);
  const totalAgentPayout = filteredCommissions.reduce((acc, c) => acc + c.agentCommission, 0);
  const pendingPayout = filteredCommissions.filter(c => c.status === 'PENDING').reduce((acc, c) => acc + c.agentCommission, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Commissions Module</h1>
          <p className="text-sm text-slate-500">Track 5% Agency Fees and 2.5% Agent Allocations</p>
        </div>
        
        <div className="flex gap-4 items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100 px-4">
          <div className="flex items-center border-r border-slate-100 pr-4">
             <Filter className="text-slate-400 mr-2" size={16} />
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Filters</span>
          </div>
          <select 
               className="bg-transparent text-sm font-medium text-slate-700 border-none focus:ring-0 cursor-pointer hover:text-amber-600 transition-colors"
               value={filterAgent}
               onChange={(e) => setFilterAgent(e.target.value)}
             >
               <option value="ALL">All Agents</option>
               {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
             </select>
          <div className="w-px h-4 bg-slate-200"></div>
          <select 
            className="bg-transparent text-sm font-medium text-slate-700 border-none focus:ring-0 cursor-pointer hover:text-amber-600 transition-colors"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="PAID">Paid</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-600">
               <DollarSign size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sales Volume</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">${totalSalesVolume.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
               <Wallet size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agency Fee (5%)</span>
          </div>
          <p className="text-2xl font-bold text-slate-900">${totalAgencyRevenue.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-green-50 rounded-lg text-green-600">
               <Wallet size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Agent Earnings (2.5%)</span>
          </div>
          <p className="text-2xl font-bold text-green-600">${totalAgentPayout.toLocaleString()}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
               <Clock size={20} />
            </div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Payouts</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">${pendingPayout.toLocaleString()}</p>
        </div>
      </div>

      {/* Commissions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Date</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Stand / Property</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Agent</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Sale Price</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Agency (5% of Value)</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider text-right">Agent (2.5% of Value)</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Status</th>
                <th className="px-6 py-4 font-bold uppercase text-xs tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCommissions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-slate-400 italic">
                    No commissions found based on current filters.
                  </td>
                </tr>
              ) : (
                filteredCommissions.map(comm => {
                  const agent = users.find(u => u.id === comm.agentId);
                  const stand = stands.find(s => s.id === comm.standId);

                  return (
                    <tr key={comm.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 text-slate-600">{comm.dateCreated}</td>
                      <td className="px-6 py-4 font-medium text-slate-900">
                        Stand #{stand?.standNumber}
                      </td>
                      <td className="px-6 py-4 text-slate-600">{agent?.name || 'Unknown Agent'}</td>
                      <td className="px-6 py-4 text-right text-slate-600 font-mono">
                        ${comm.salePrice.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-blue-600 font-mono bg-blue-50/10 font-medium">
                        ${comm.totalAgencyCommission.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-green-600 font-mono font-bold bg-green-50/20">
                        ${comm.agentCommission.toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        {comm.status === 'PAID' ? (
                          <span className="inline-flex items-center text-green-700 bg-green-50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-green-100">
                            <CheckCircle size={10} className="mr-1" /> Paid
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border border-amber-100">
                            <Clock size={10} className="mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {comm.status === 'PENDING' && currentUser.role === UserRole.ADMIN && (
                          <button 
                            onClick={() => markCommissionPaid(comm.id)}
                            className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-800 transition-colors font-bold uppercase tracking-wider"
                          >
                            Mark Paid
                          </button>
                        )}
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
  );
};
