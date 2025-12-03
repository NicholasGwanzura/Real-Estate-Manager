
import React from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Trophy, TrendingUp, DollarSign, Users, ArrowRight, UserPlus } from 'lucide-react';

export const Agents: React.FC = () => {
  const { users, getAgentPerformance, navigate, currentUser } = useApp();
  
  const agents = users.filter(u => u.role === UserRole.AGENT);

  if (agents.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 bg-white rounded-2xl shadow-sm border border-slate-100 border-dashed">
              <div className="bg-slate-50 p-6 rounded-full mb-6">
                  <Users size={48} className="text-slate-300" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Agents Found</h2>
              <p className="text-slate-500 max-w-md mb-8">
                  The agents module is currently blank because no user accounts with the 'AGENT' role have been created yet.
              </p>
              
              {currentUser.role === UserRole.ADMIN ? (
                  <button 
                    onClick={() => navigate('/admin')}
                    className="flex items-center space-x-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                  >
                      <UserPlus size={18} />
                      <span>Create Agent Accounts</span>
                  </button>
              ) : (
                  <p className="text-sm bg-amber-50 text-amber-700 px-4 py-2 rounded-lg">
                      Please contact an Administrator to set up agent profiles.
                  </p>
              )}
          </div>
      );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-slate-900">Agent Performance</h1>
          <button 
            onClick={() => navigate('/admin')}
            className="text-sm text-slate-500 flex items-center hover:text-slate-900 font-medium"
          >
              Manage Agents <ArrowRight size={14} className="ml-1"/>
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent, index) => {
          const perf = getAgentPerformance(agent.id);
          // Mock target for demo visualization
          const target = 500000;
          const progress = Math.min((perf.totalSales / target) * 100, 100);

          return (
            <div key={agent.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 relative overflow-hidden group hover:shadow-md transition-shadow">
               {index === 0 && perf.totalSales > 0 && (
                 <div className="absolute top-0 right-0 bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1.5 rounded-bl-xl flex items-center">
                   <Trophy size={12} className="mr-1" /> Top Performer
                 </div>
               )}
               
               <div className="flex items-center space-x-4 mb-6">
                 <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-md">
                   {agent.name.charAt(0)}
                 </div>
                 <div>
                   <h3 className="font-bold text-slate-900">{agent.name}</h3>
                   <p className="text-xs text-slate-500">{agent.email}</p>
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Total Sales</p>
                    <p className="font-bold text-slate-900 text-lg">${perf.totalSales.toLocaleString()}</p>
                  </div>
                  <div className="text-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <p className="text-[10px] text-slate-500 mb-1 uppercase tracking-wider font-bold">Stands Sold</p>
                    <p className="font-bold text-slate-900 text-lg">{perf.count}</p>
                  </div>
               </div>
               
               <div className="mb-6 bg-green-50/50 p-4 rounded-xl flex justify-between items-center border border-green-100">
                  <div className="flex items-center text-green-700">
                    <DollarSign size={16} className="mr-2" />
                    <span className="text-xs font-bold uppercase tracking-wide">Commission</span>
                  </div>
                  <span className="font-bold text-green-700 text-lg">${perf.totalCommission.toLocaleString()}</span>
               </div>

               <div>
                 <div className="flex justify-between text-xs mb-2">
                   <span className="text-slate-500 font-medium">Monthly Target Progress</span>
                   <span className="font-bold text-slate-900">{Math.round(progress)}%</span>
                 </div>
                 <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                   <div className={`h-2 rounded-full transition-all duration-1000 ease-out ${progress >= 100 ? 'bg-green-500' : 'bg-amber-500'}`} style={{ width: `${progress}%` }}></div>
                 </div>
                 <p className="text-[10px] text-slate-400 mt-2 text-right font-mono">Goal: ${target.toLocaleString()}</p>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
