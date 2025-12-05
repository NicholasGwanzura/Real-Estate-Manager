
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Printer, TrendingUp, DollarSign, Wallet, Building2, Filter, AlertCircle, CheckCircle, ArrowUpDown, Trophy, Users, CalendarDays, Calendar } from 'lucide-react';
import { UserRole } from '../types';

export const Reports: React.FC = () => {
  const { sales, developers, commissions, payments, stands, users } = useApp();
  const [activeTab, setActiveTab] = useState<'sales' | 'finance' | 'commissions' | 'developments' | 'reconciliation' | 'agents' | 'weekly'>('sales');
  const [reconDevId, setReconDevId] = useState<string>('');
  const [weeklyDevId, setWeeklyDevId] = useState<string>('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

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

  // WEEKLY REPORT DATA PROCESSING
  const getWeeklyReport = () => {
      // 1. Filter Sales by Developer
      const filteredSales = weeklyDevId ? sales.filter(s => s.developerId === weeklyDevId && s.status !== 'CANCELLED') : sales.filter(s => s.status !== 'CANCELLED');
      
      // 2. Helper to get Week Start Date (Monday)
      const getWeekStart = (dateStr: string) => {
          const d = new Date(dateStr);
          const day = d.getDay();
          const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
          const weekStart = new Date(d.setDate(diff));
          return weekStart.toISOString().split('T')[0];
      };

      // 3. Aggregate
      const weeks: Record<string, { weekStart: string, salesCount: number, grossValue: number, collected: number }> = {};

      filteredSales.forEach(sale => {
          const weekKey = getWeekStart(sale.saleDate);
          if (!weeks[weekKey]) weeks[weekKey] = { weekStart: weekKey, salesCount: 0, grossValue: 0, collected: 0 };
          
          weeks[weekKey].salesCount += 1;
          weeks[weekKey].grossValue += sale.salePrice;
      });

      // Add payments aggregation (mapped by sale date week, or payment date week? Usually payment date for cashflow)
      // Let's do Cashflow view: When was money collected?
      const filteredPayments = payments.filter(p => {
          const sale = sales.find(s => s.id === p.saleId);
          return weeklyDevId ? sale?.developerId === weeklyDevId : true;
      });

      filteredPayments.forEach(pay => {
           const weekKey = getWeekStart(pay.date);
           if (!weeks[weekKey]) weeks[weekKey] = { weekStart: weekKey, salesCount: 0, grossValue: 0, collected: 0 };
           weeks[weekKey].collected += pay.amount;
      });

      // Convert to array and sort
      return Object.values(weeks).sort((a,b) => b.weekStart.localeCompare(a.weekStart));
  };
  
  const weeklyData = getWeeklyReport();

  // AGENT DATA PROCESSING
  const agentStats = useMemo(() => {
    const agents = users.filter(u => u.role === UserRole.AGENT);
    return agents.map(agent => {
        const agentSales = sales.filter(s => s.agentId === agent.id && s.status !== 'CANCELLED');
        const totalValue = agentSales.reduce((acc, s) => acc + s.salePrice, 0);
        const units = agentSales.length;
        const agentComms = commissions.filter(c => c.agentId === agent.id);
        const totalComm = agentComms.reduce((acc, c) => acc + c.agentCommission, 0);
        
        // Calculate Average Sale Price
        const avgSale = units > 0 ? totalValue / units : 0;

        return { 
            id: agent.id, 
            name: agent.name, 
            email: agent.email,
            totalValue, 
            units, 
            totalComm,
            avgSale
        };
    });
  }, [users, sales, commissions]);

  const sortedAgents = useMemo(() => {
    let sortableItems = [...agentStats];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // @ts-ignore
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        // @ts-ignore
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
        // Default sort by Total Value Desc
        sortableItems.sort((a,b) => b.totalValue - a.totalValue);
    }
    return sortableItems;
  }, [agentStats, sortConfig]);

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // RECONCILIATION DATA
  const getReconData = () => {
      let filteredSales = sales.filter(s => s.status !== 'CANCELLED');
      if (reconDevId) {
          filteredSales = filteredSales.filter(s => s.developerId === reconDevId);
      }

      const rows = filteredSales.map(sale => {
          const stand = stands.find(s => s.id === sale.standId);
          const dev = developers.find(d => d.id === sale.developerId);
          const salePayments = payments.filter(p => p.saleId === sale.id);
          const totalPaid = salePayments.reduce((sum, p) => sum + p.amount, 0);
          
          // Calculate Net
          const agencyFee = sale.salePrice * 0.05;
          const netToDev = sale.salePrice - agencyFee;
          const balance = netToDev - totalPaid; // Outstanding NET balance
          
          const percentPaid = netToDev > 0 ? (totalPaid / netToDev) * 100 : 0;

          return {
              id: sale.id,
              standNumber: stand?.standNumber || 'N/A',
              devName: dev?.name || 'Unknown',
              clientName: sale.clientName,
              saleDate: sale.saleDate,
              price: sale.salePrice,
              netToDev: netToDev,
              agencyFee: agencyFee,
              paid: totalPaid,
              balance: balance,
              percentPaid
          };
      });

      const summary = {
          totalExpected: rows.reduce((acc, r) => acc + r.price, 0),
          totalNetExpected: rows.reduce((acc, r) => acc + r.netToDev, 0),
          totalCollected: rows.reduce((acc, r) => acc + r.paid, 0),
          totalOutstanding: rows.reduce((acc, r) => acc + r.balance, 0), // Net Outstanding
          count: rows.length
      };

      return { rows, summary };
  };

  const reconData = getReconData();

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
          <h1 className="text-2xl font-bold">Real Estate Plus Management Report</h1>
          <p className="text-sm">Generated on {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit print:hidden overflow-x-auto">
          {['sales', 'weekly', 'finance', 'commissions', 'agents', 'developments', 'reconciliation'].map((tab) => (
              <button 
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                  {tab.charAt(0).toUpperCase() + tab.slice(1).replace('weekly', 'Weekly Sales')}
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

      {/* RECONCILIATION REPORT (Updated for Net Revenue) */}
      {(activeTab === 'reconciliation') && (
          <div className="space-y-6">
              <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row items-center justify-between print:border-black">
                  <div className="flex items-center space-x-4 w-full md:w-auto">
                      <Filter className="text-slate-400 hidden md:block" size={20}/>
                      <div className="flex-1 md:flex-none">
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Filter by Developer</label>
                          <select 
                            className="bg-slate-50 border border-slate-200 text-slate-900 text-sm rounded-lg focus:ring-amber-500 focus:border-amber-500 block w-full p-2.5"
                            value={reconDevId}
                            onChange={(e) => setReconDevId(e.target.value)}
                          >
                            <option value="">All Developments</option>
                            {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                          </select>
                      </div>
                  </div>
                  <div className="mt-4 md:mt-0 text-right">
                      <span className="text-xs text-slate-400 block">Total Records Found</span>
                      <span className="font-bold text-slate-900 text-lg">{reconData.summary.count}</span>
                  </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Gross Contract Value</p>
                      <p className="text-2xl font-bold text-slate-900">${reconData.summary.totalExpected.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Net Due (Less 5%)</p>
                      <p className="text-2xl font-bold text-blue-600">${reconData.summary.totalNetExpected.toLocaleString()}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none">
                      <p className="text-sm text-slate-500 uppercase tracking-wide">Outstanding (Net)</p>
                      <p className="text-2xl font-bold text-red-500">${reconData.summary.totalOutstanding.toLocaleString()}</p>
                  </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:border-black print:shadow-none">
                  <div className="p-4 bg-slate-50 border-b border-slate-100 print:bg-white print:border-black">
                      <h3 className="font-bold text-slate-900">Developer Net Reconciliation Schedule</h3>
                      <p className="text-xs text-slate-500 mt-1">Net amounts reflect deduction of 5% Agency Commission from Gross Sale Price.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 print:bg-slate-100">
                            <tr>
                                <th className="px-6 py-3 font-bold text-slate-600">Stand</th>
                                {!reconDevId && <th className="px-6 py-3 font-bold text-slate-600">Development</th>}
                                <th className="px-6 py-3 font-bold text-slate-600">Client</th>
                                <th className="px-6 py-3 font-bold text-right text-slate-600">Gross Price</th>
                                <th className="px-6 py-3 font-bold text-right text-amber-600">Ag. Comm (5%)</th>
                                <th className="px-6 py-3 font-bold text-right text-slate-900">Net Due</th>
                                <th className="px-6 py-3 font-bold text-right text-green-600">Paid</th>
                                <th className="px-6 py-3 font-bold text-right text-red-600">Bal (Net)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {reconData.rows.length === 0 ? (
                                <tr><td colSpan={8} className="p-8 text-center text-slate-400 italic">No records found for the selected criteria.</td></tr>
                            ) : (
                                reconData.rows.map(row => (
                                    <tr key={row.id} className="hover:bg-slate-50">
                                        <td className="px-6 py-3 font-mono text-slate-900 font-medium">#{row.standNumber}</td>
                                        {!reconDevId && <td className="px-6 py-3 text-slate-500">{row.devName}</td>}
                                        <td className="px-6 py-3 text-slate-700">{row.clientName}</td>
                                        <td className="px-6 py-3 text-right text-slate-500">${row.price.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right text-amber-600 text-xs">-${row.agencyFee.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right font-bold text-slate-900">${row.netToDev.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right font-medium text-green-600">${row.paid.toLocaleString()}</td>
                                        <td className="px-6 py-3 text-right font-bold font-mono">
                                            {row.balance > 0 ? (
                                                <span className="text-red-500">${row.balance.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 print:bg-slate-100">
                            <tr>
                                <td colSpan={!reconDevId ? 3 : 2} className="px-6 py-3 text-right">TOTALS</td>
                                <td className="px-6 py-3 text-right">${reconData.summary.totalExpected.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right text-amber-600">-${(reconData.summary.totalExpected * 0.05).toLocaleString()}</td>
                                <td className="px-6 py-3 text-right">${reconData.summary.totalNetExpected.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right text-green-700">${reconData.summary.totalCollected.toLocaleString()}</td>
                                <td className="px-6 py-3 text-right text-red-600">${reconData.summary.totalOutstanding.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                  </div>
              </div>
          </div>
      )}

      {/* AGENTS REPORT */}
      {(activeTab === 'agents') && (
        <div className="space-y-6">
            {/* Agent Summary Cards */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide font-bold">Top Performing Agent</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{sortedAgents[0]?.name || 'N/A'}</h3>
                        <p className="text-xs text-green-600 font-bold mt-1">
                            ${sortedAgents[0]?.totalValue.toLocaleString() || 0} Sales Volume
                        </p>
                    </div>
                    <div className="bg-amber-100 p-4 rounded-full text-amber-600">
                        <Trophy size={28} />
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:border-black print:shadow-none flex items-center justify-between">
                    <div>
                        <p className="text-sm text-slate-500 uppercase tracking-wide font-bold">Total Sales Force</p>
                        <h3 className="text-2xl font-bold text-slate-900 mt-1">{agentStats.length} Agents</h3>
                        <p className="text-xs text-blue-600 font-bold mt-1">
                            {sales.length} Active Deals Closed
                        </p>
                    </div>
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                        <Users size={28} />
                    </div>
                </div>
             </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden print:border-black print:shadow-none">
                <div className="p-4 bg-slate-50 border-b border-slate-100 print:bg-white print:border-black">
                    <h3 className="font-bold text-slate-900">Agent Performance Breakdown</h3>
                    <p className="text-xs text-slate-500 mt-1">Click table headers to sort by metric.</p>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 border-b border-slate-200 print:bg-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => requestSort('name')}>
                                    <div className="flex items-center">Agent Name <ArrowUpDown size={12} className="ml-1 opacity-40"/></div>
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors text-right" onClick={() => requestSort('units')}>
                                    <div className="flex items-center justify-end">Units Sold <ArrowUpDown size={12} className="ml-1 opacity-40"/></div>
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors text-right" onClick={() => requestSort('totalValue')}>
                                    <div className="flex items-center justify-end">Total Sales Value <ArrowUpDown size={12} className="ml-1 opacity-40"/></div>
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors text-right" onClick={() => requestSort('avgSale')}>
                                    <div className="flex items-center justify-end">Avg. Deal Size <ArrowUpDown size={12} className="ml-1 opacity-40"/></div>
                                </th>
                                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer hover:bg-slate-100 transition-colors text-right" onClick={() => requestSort('totalComm')}>
                                    <div className="flex items-center justify-end">Commission Earned <ArrowUpDown size={12} className="ml-1 opacity-40"/></div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedAgents.length === 0 ? (
                                <tr><td colSpan={5} className="p-8 text-center text-slate-400 italic">No agent data available.</td></tr>
                            ) : (
                                sortedAgents.map((agent, index) => (
                                    <tr key={agent.id} className={`hover:bg-slate-50 ${index < 3 ? 'bg-amber-50/20' : ''}`}>
                                        <td className="px-6 py-4 font-medium text-slate-900 flex items-center">
                                            {index === 0 && <Trophy size={14} className="text-amber-500 mr-2" />}
                                            {agent.name}
                                        </td>
                                        <td className="px-6 py-4 text-right text-slate-600 font-bold">{agent.units}</td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-900 font-medium">${agent.totalValue.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-mono text-slate-500">${Math.round(agent.avgSale).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right font-mono text-green-600 font-bold">${agent.totalComm.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        <tfoot className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 print:bg-slate-100">
                            <tr>
                                <td className="px-6 py-4">TOTALS</td>
                                <td className="px-6 py-4 text-right">{sales.length}</td>
                                <td className="px-6 py-4 text-right">${totalSalesValue.toLocaleString()}</td>
                                <td className="px-6 py-4 text-right">-</td>
                                <td className="px-6 py-4 text-right text-green-700">${totalCommissions.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
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
