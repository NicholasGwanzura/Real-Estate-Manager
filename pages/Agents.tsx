
import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Trophy, TrendingUp, DollarSign } from 'lucide-react';

export const Agents: React.FC = () => {
  const { users, getAgentPerformance } = useApp();
  
  const agents = users.filter(u => u.role === UserRole.AGENT);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Agent Performance</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => {
          const perf = getAgentPerformance(agent.id);
          // Mock target
          const target = 500000;
          const progress = Math.min((perf.totalSales / target) * 100, 100);

          return (
            <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
               {index === 0 && (
                 <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-xs font-bold px-2 py-1 rounded-bl-lg flex items-center">
                   <Trophy size={12} className="mr-1" /> Top Performer
                 </div>
               )}
               
               <div className="flex items-center space-x-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg">
                   {agent.name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">{agent.name}</h3>
                   <p className="text-xs text-slate-500">{agent.email}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Total Sales</p>
                    <p className="font-bold text-slate-900">${perf.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-500 mb-1">Stands Sold</p>
                    <p className="font-bold text-slate-900">{perf.count}</p>
                  </div>
               </div>
               
               <div className="mb-6 bg-green-50 p-3 rounded-lg flex justify-between items-center border border-green-100">
                  <div className="flex items-center text-green-700">
                    <DollarSign size={16} className="mr-2" />
                    <span className="text-xs font-semibold uppercase">Commission Earned</span>
                  </div>
                  <span className="font-bold text-green-700 text-lg">${perf.totalCommission.toLocaleString()}</span>
               </div>

               <div>
                 <div className="flex justify-between text-xs mb-1">
                   <span className="text-slate-500">Target Progress</span>
                   <span className="font-bold text-slate-900">{Math.round(progress)}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2">
                   <div className={`h-2 rounded-full transition-all duration-1000 ${progress >= 100 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }}></div>
                 </div>
                 <p className="text-xs text-slate-400 mt-2 text-right">Target: ${target.toLocaleString()}</p>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
