
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Printer, TrendingUp, DollarSign, Wallet, Building2, Filter } from 'lucide-react';

export const Reports: React.FC = () => {
  const { sales, developers, commissions, payments, stands } = useApp();
  const [activeTab, setActiveTab] = useState<'sales' | 'finance' | 'commissions' | 'developments'>('sales');

  const handlePrint = () => {
    window.print();
  };

  // --- REPORT DATA PREP ---
  
  // SALES DATA
  const salesByMonth = sales.reduce((acc: any, sale) => {
    const month = sale.saleDate.substring(0, 7);
    acc[month] = (acc[month] || 0) + sale.salePrice;
    return acc;
  }, {});
  const salesChartData = Object.keys(salesByMonth).sort().map(date => ({ name: date, value: salesByMonth[date] }));
  const totalSalesValue = sales.reduce((acc, s) => acc + s.salePrice, 0);

  // FINANCE DATA
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalOutstanding = totalSalesValue - totalCollected; // Simplified

  // INVENTORY DATA
  const inventoryStatus = [
      { name: 'Available', value: stands.filter(s => s.status === 'AVAILABLE').length, color: '#10b981' },
      { name: 'Sold', value: stands.filter(s => s.status === 'SOLD').length, color: '#1e293b' },
      { name: 'Reserved', value: stands.filter(s => s.status === 'RESERVED').length, color: '#f59e0b' }
  ];

  // COMMISSIONS DATA
  const totalCommissions = commissions.reduce((acc, c) => acc + c.agentCommission, 0);
  const paidCommissions = commissions.filter(c => c.status === 'PAID').reduce((acc, c) => acc + c.agentCommission, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 border border-slate-100 shadow rounded text-xs">
           <span className="font-bold text-slate-800">{payload[0].name}: </span>
           {payload[0].value.toLocaleString()}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex justify-between items-center print:hidden">
         <h1 className="text-2xl font-bold text-slate-900">System Reports</h1>
         <button onClick={handlePrint} className="flex items-center space-x-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 font-medium">
             <Printer size={18} />
             <span>Print Report</span>
         </button>
      </div>

      <div className="hidden print:block text-center mb-8 border-b border-black pb-4">
          <h1 className="text-2xl font-bold">FineEstate Management Report</h1>
          <p className="text-sm">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit print:hidden">
          {['sales', 'finance', 'commissions', 'developments'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
          ))}
      </div>

      {/* SALES REPORT */}
      {(activeTab === 'sales') && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Total Sales Value</p>
                      <p className="text-2xl font-bold text-slate-900">${totalSalesValue.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Units Sold</p>
                      <p className="text-2xl font-bold text-slate-900">{sales.length}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Avg Deal Size</p>
                      <p className="text-2xl font-bold text-slate-900">${sales.length > 0 ? Math.round(totalSalesValue / sales.length).toLocaleString() : 0}</p>
                  </div>
              </div>
              
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                  <h3 className="font-bold mb-4">Sales Trend</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={salesChartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis 
                              dataKey="name" 
                              tick={{fontSize: 12, fill: '#94a3b8'}} 
                              axisLine={false} 
                              tickLine={false} 
                              dy={10}
                            />
                            <YAxis 
                              tick={{fontSize: 12, fill: '#94a3b8'}} 
                              axisLine={false} 
                              tickLine={false}
                              tickFormatter={(val) => `$${val/1000}k`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeDasharray: '4 4' }} />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#d97706" 
                              strokeWidth={3} 
                              dot={false} 
                              activeDot={{r: 6, fill: '#d97706', stroke: 'white', strokeWidth: 2}}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:border-black print:shadow-none">
                  <table className="w-full text-sm text-left">
                      <thead className="bg-slate-50 border-b border-slate-200 print:bg-slate-100">
                          <tr>
                              <th className="px-6 py-3">Date</th>
                              <th className="px-6 py-3">Client</th>
                              <th className="px-6 py-3">Developer</th>
                              <th className="px-6 py-3 text-right">Amount</th>
                              <th className="px-6 py-3">Status</th>
                          </tr>
                      </thead>
                      <tbody>
                          {sales.map(s => {
                              const dev = developers.find(d => d.id === s.developerId);
                              return (
                                  <tr key={s.id} className="border-b border-slate-50">
                                      <td className="px-6 py-3 text-slate-600">{s.saleDate}</td>
                                      <td className="px-6 py-3 font-medium">{s.clientName}</td>
                                      <td className="px-6 py-3 text-slate-600">{dev?.name}</td>
                                      <td className="px-6 py-3 text-right">${s.salePrice.toLocaleString()}</td>
                                      <td className="px-6 py-3"><span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">{s.status}</span></td>
                                  </tr>
                              );
                          })}
                      </tbody>
                  </table>
              </div>
          </div>
      )}

      {/* FINANCE REPORT */}
      {(activeTab === 'finance') && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                    <h3 className="font-bold mb-4 flex items-center"><DollarSign className="mr-2 text-green-600"/> Collection Summary</h3>
                    <div className="h-64 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie 
                                  data={[
                                    { name: 'Collected', value: totalCollected },
                                    { name: 'Outstanding', value: totalOutstanding }
                                  ]} 
                                  innerRadius={70} 
                                  outerRadius={85} 
                                  paddingAngle={5} 
                                  dataKey="value"
                                  stroke="none"
                                >
                                    <Cell fill="#10b981" />
                                    <Cell fill="#ef4444" />
                                </Pie>
                                <Tooltip content={<CustomTooltip />}/>
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex justify-center gap-6 mt-2 text-sm">
                        <div className="flex items-center"><div className="w-3 h-3 bg-green-500 rounded mr-2"></div> Collected (${totalCollected.toLocaleString()})</div>
                        <div className="flex items-center"><div className="w-3 h-3 bg-red-500 rounded mr-2"></div> Outstanding (${totalOutstanding.toLocaleString()})</div>
                    </div>
                 </div>
                 
                 <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                    <h3 className="font-bold mb-4">Payment Breakdown by Developer</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={developers.map(d => {
                                const devSales = sales.filter(s => s.developerId === d.id);
                                const devCollected = payments.filter(p => devSales.some(s => s.id === p.saleId)).reduce((acc, p) => acc + p.amount, 0);
                                return { name: d.name, collected: devCollected };
                            })} barSize={20}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                                <XAxis 
                                  dataKey="name" 
                                  tick={{fontSize: 12, fill: '#94a3b8'}} 
                                  axisLine={false} 
                                  tickLine={false} 
                                />
                                <YAxis hide />
                                <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />}/>
                                <Bar dataKey="collected" fill="#3b82f6" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                 </div>
              </div>
          </div>
      )}

      {/* COMMISSIONS REPORT */}
      {(activeTab === 'commissions') && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Total Commissions</p>
                      <p className="text-2xl font-bold text-slate-900">${totalCommissions.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Paid Out</p>
                      <p className="text-2xl font-bold text-green-600">${paidCommissions.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Pending Payout</p>
                      <p className="text-2xl font-bold text-amber-600">${(totalCommissions - paidCommissions).toLocaleString()}</p>
                  </div>
              </div>
          </div>
      )}

      {/* DEVELOPMENTS REPORT */}
      {(activeTab === 'developments') && (
          <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <h3 className="font-bold mb-4">Stock Availability</h3>
                      <div className="h-64">
                         <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                 <Pie 
                                   data={inventoryStatus} 
                                   innerRadius={65} 
                                   outerRadius={80} 
                                   paddingAngle={4} 
                                   dataKey="value"
                                   stroke="none"
                                 >
                                     {inventoryStatus.map((entry, index) => (
                                         <Cell key={`cell-${index}`} fill={entry.color} />
                                     ))}
                                 </Pie>
                                 <Tooltip content={<CustomTooltip />}/>
                             </PieChart>
                         </ResponsiveContainer>
                      </div>
                      <div className="flex justify-center gap-4 mt-2 text-sm">
                          {inventoryStatus.map(s => (
                              <div key={s.name} className="flex items-center">
                                  <div className="w-2.5 h-2.5 rounded-full mr-2" style={{backgroundColor: s.color}}></div>
                                  {s.name} ({s.value})
                              </div>
                          ))}
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <h3 className="font-bold mb-4">Inventory by Developer</h3>
                      <div className="space-y-4">
                          {developers.map(dev => {
                              const devStands = stands.filter(s => s.developerId === dev.id);
                              const sold = devStands.filter(s => s.status === 'SOLD').length;
                              const pct = devStands.length > 0 ? (sold / devStands.length) * 100 : 0;
                              
                              return (
                                  <div key={dev.id}>
                                      <div className="flex justify-between text-sm mb-1">
                                          <span className="font-medium text-slate-700">{dev.name}</span>
                                          <span className="text-slate-500">{sold} / {devStands.length} Sold</span>
                                      </div>
                                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                                          <div className="bg-slate-800 h-1.5 rounded-full" style={{width: `${pct}%`}}></div>
                                      </div>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
