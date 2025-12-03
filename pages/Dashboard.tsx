
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Users, Building, AlertCircle, Sparkles, TrendingUp, Calendar, ArrowRight, X } from 'lucide-react';
import { analyzeSalesData } from '../services/geminiService';

const StatCard = ({ title, value, subValue, icon: Icon, gradient }: any) => (
  <div className={`card-premium p-6 rounded-2xl relative overflow-hidden group`}>
    <div className={`absolute top-0 right-0 p-16 opacity-10 rounded-full transform translate-x-1/2 -translate-y-1/2 transition-transform group-hover:scale-110 ${gradient}`}></div>
    
    <div className="relative z-10 flex flex-col justify-between h-full">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${gradient.replace('bg-', 'bg-opacity-10 text-')}`}>
                <Icon className={`w-6 h-6 ${gradient.replace('bg-', 'text-')}`} />
            </div>
            <span className="text-xs font-bold px-2 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-100">{subValue}</span>
        </div>
        <div>
            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
            <p className="text-sm font-medium text-slate-500 mt-1">{title}</p>
        </div>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { sales, stands, developers, payments } = useApp();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(true);

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.salePrice, 0);
  const totalStands = stands.length;
  const soldStands = stands.filter(s => s.status === 'SOLD').length;
  const occupancyRate = totalStands > 0 ? Math.round((soldStands / totalStands) * 100) : 0;

  // Modern Chart Data Preparation
  const salesByMonth = sales.reduce((acc: any, sale) => {
    const month = sale.saleDate.substring(0, 7);
    acc[month] = (acc[month] || 0) + sale.salePrice;
    return acc;
  }, {});
  
  const chartData = Object.keys(salesByMonth).sort().map(date => ({
    name: date,
    revenue: salesByMonth[date],
    salesCount: sales.filter(s => s.saleDate.startsWith(date)).length
  }));
  
  if (chartData.length === 0) {
      const currentMonth = new Date().toISOString().slice(0, 7);
      chartData.push({ name: currentMonth, revenue: 0, salesCount: 0 });
  }

  const salesByDev = developers.map(dev => {
    const devSales = sales.filter(s => s.developerId === dev.id);
    return { name: dev.name, revenue: devSales.reduce((acc, s) => acc + s.salePrice, 0) };
  });

  const handleAiAsk = async () => {
    if(!aiQuery.trim()) return;
    setLoadingAi(true);
    setAiResponse('Thinking...');
    const contextData = { sales, developers, payments };
    const result = await analyzeSalesData(aiQuery, contextData);
    setAiResponse(result);
    setLoadingAi(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm backdrop-blur-sm bg-opacity-90">
          <p className="font-bold text-slate-900 mb-1">{label}</p>
          <p className="text-amber-600 font-mono font-bold">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      {/* Release Notes Banner */}
      {showReleaseNotes && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-4 text-white shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center relative animate-in slide-in-from-top-4">
              <div>
                  <h3 className="font-bold text-lg flex items-center">
                      <span className="bg-amber-500 text-xs px-2 py-0.5 rounded text-white mr-2">v1.1.0</span> 
                      System Update: Live Release Notes
                  </h3>
                  <div className="text-sm text-slate-300 mt-1 space-y-1">
                      <p>• <strong>Cashier Module:</strong> Now available for all agents to process payments and issue physical receipts.</p>
                      <p>• <strong>Commission Fix:</strong> Calculations explicitly set to 5% of Total Stand Value (ignoring deposits).</p>
                      <p>• <strong>Safety Guard:</strong> Auto-save protected to prevent data loss on reload. Database Restore enabled.</p>
                  </div>
              </div>
              <button 
                onClick={() => setShowReleaseNotes(false)} 
                className="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                  <X size={16}/>
              </button>
          </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
           <p className="text-slate-500 mt-1">Real-time performance and inventory insights.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm bg-white border border-slate-200 rounded-xl px-4 py-2 shadow-sm text-slate-600 font-medium">
           <Calendar size={16} className="text-amber-500" />
           <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Revenue" 
            value={`$${(totalRevenue / 1000000).toFixed(2)}M`} 
            subValue="YTD"
            icon={DollarSign} 
            gradient="bg-slate-900" 
        />
        <StatCard 
            title="Inventory Status" 
            value={`${soldStands} / ${totalStands}`} 
            subValue="Units Sold"
            icon={Building} 
            gradient="bg-blue-600" 
        />
        <StatCard 
            title="Occupancy Rate" 
            value={`${occupancyRate}%`} 
            subValue="Target: 80%"
            icon={Users} 
            gradient="bg-indigo-600" 
        />
        <StatCard 
            title="Avg. Sale Price" 
            value={`$${soldStands > 0 ? Math.round(totalRevenue / soldStands / 1000) : 0}k`} 
            subValue="Per Unit"
            icon={TrendingUp} 
            gradient="bg-amber-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Revenue Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-lg font-bold text-slate-900">Revenue Trend</h3>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  dy={10} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}} 
                  tickFormatter={(val) => `$${val/1000}k`} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#0f172a" 
                  strokeWidth={3} 
                  dot={false} 
                  activeDot={{ r: 6, fill: "#0f172a", strokeWidth: 2, stroke: "#fff" }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* AI Insight Panel */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden ring-1 ring-slate-100">
           {/* Decorative bg */}
           <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-amber-100 to-orange-50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

          <div className="flex items-center space-x-2 mb-4 relative z-10">
             <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg shadow-lg shadow-amber-200">
                <Sparkles className="w-4 h-4 text-white" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">AI Analyst</h3>
          </div>
          
          <div className="flex-1 bg-slate-50/80 backdrop-blur rounded-xl p-5 mb-4 overflow-y-auto max-h-60 text-sm text-slate-700 border border-slate-100 custom-scrollbar shadow-inner">
            {aiResponse ? (
                <div className="prose prose-sm prose-amber" dangerouslySetInnerHTML={{__html: aiResponse.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}} />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                    <Sparkles size={28} className="text-slate-200" />
                    <p className="italic text-center text-xs font-medium">"Analyze top performing agents"</p>
                    <p className="italic text-center text-xs font-medium">"Show me revenue breakdown by developer"</p>
                </div>
            )}
          </div>

          <div className="mt-auto relative z-10">
              <div className="relative">
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-t-lg px-3 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-0 transition-colors placeholder-slate-400 font-medium"
                    placeholder="Ask about your data..."
                    value={aiQuery}
                    onChange={(e) => setAiQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                  />
                  <button 
                    onClick={handleAiAsk}
                    disabled={loadingAi}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 p-2 text-slate-400 hover:text-amber-600 disabled:opacity-50 transition-colors"
                  >
                    {loadingAi ? <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin"></div> : <ArrowRight size={18}/>}
                  </button>
              </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="text-lg font-bold text-slate-900 mb-6">Revenue by Development</h3>
             <div className="h-64">
                {salesByDev.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={salesByDev} layout="vertical" barSize={12}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="transparent" />
                          <XAxis type="number" hide />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={100} 
                            tick={{fill: '#475569', fontSize: 13, fontWeight: 500}} 
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip cursor={{fill: '#f8fafc'}} content={<CustomTooltip />} />
                          <Bar dataKey="revenue" fill="#1e293b" radius={[0, 4, 4, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400 italic text-sm">
                     <Building size={32} className="mb-2 opacity-20"/>
                     No developments with sales data yet.
                  </div>
                )}
             </div>
          </div>
           {/* Widget */}
           <div className="btn-gradient-dark rounded-2xl shadow-lg p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-32 bg-amber-500 rounded-full blur-3xl opacity-10 transform translate-x-1/2 -translate-y-1/2 transition-transform duration-1000 group-hover:scale-125"></div>
                <div className="absolute bottom-0 left-0 p-32 bg-blue-600 rounded-full blur-3xl opacity-10 transform -translate-x-1/2 translate-y-1/2 transition-transform duration-1000 group-hover:scale-125"></div>
                
                <h3 className="text-2xl font-bold mb-2 relative z-10">Sales Goals 2024</h3>
                <p className="text-slate-400 mb-6 max-w-xs relative z-10 text-sm">Target acquisition phase initiated.</p>
                <div className="w-full max-w-xs bg-white/10 rounded-full h-2 mb-2 relative z-10 overflow-hidden">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)] w-0 group-hover:w-1/4 transition-all duration-1000"></div>
                </div>
                <p className="text-xs text-slate-400 font-mono relative z-10 tracking-widest mt-2">SYSTEM ACTIVE</p>
           </div>
      </div>
    </div>
  );
};
