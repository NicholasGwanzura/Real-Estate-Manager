
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Users, Building, AlertCircle, Sparkles, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
import { analyzeSalesData } from '../services/geminiService';

const StatCard = ({ title, value, subValue, icon: Icon, gradient }: any) => (
  <div className={`rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between text-white ${gradient}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium opacity-80">{title}</p>
        <h3 className="text-3xl font-bold mt-2">{value}</h3>
      </div>
      <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
    <div className="mt-4 text-sm font-medium flex items-center bg-white/10 w-fit px-2 py-1 rounded-full">
        {subValue}
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const { sales, stands, developers, payments } = useApp();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const totalRevenue = sales.reduce((acc, sale) => acc + sale.salePrice, 0);
  const totalStands = stands.length;
  const soldStands = stands.filter(s => s.status === 'SOLD').length;
  const occupancyRate = totalStands > 0 ? Math.round((soldStands / totalStands) * 100) : 0;

  // Modern Chart Data Preparation
  // 1. Sales Trend (Mocked for monthly trend based on existing sales)
  // Group sales by month
  const salesByMonth = sales.reduce((acc: any, sale) => {
    const month = sale.saleDate.substring(0, 7); // YYYY-MM
    acc[month] = (acc[month] || 0) + sale.salePrice;
    return acc;
  }, {});
  
  // Fill in gaps roughly for the demo
  const chartData = Object.keys(salesByMonth).sort().map(date => ({
    name: date,
    revenue: salesByMonth[date],
    salesCount: sales.filter(s => s.saleDate.startsWith(date)).length
  }));
  
  if (chartData.length === 0) {
      // Add a dummy point if no data so chart renders with current month
      const currentMonth = new Date().toISOString().slice(0, 7);
      chartData.push({ name: currentMonth, revenue: 0, salesCount: 0 });
  }

  // 2. Sales by Developer
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
        <div className="bg-white p-3 border border-slate-100 shadow-xl rounded-lg text-sm">
          <p className="font-bold text-slate-900 mb-1">{label}</p>
          <p className="text-amber-600 font-mono">
            ${payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h1>
           <p className="text-slate-500">Overview of performance and inventory metrics.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm bg-white border border-slate-200 rounded-lg px-3 py-1.5 shadow-sm text-slate-600">
           <Calendar size={16} />
           <span>{new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            title="Total Revenue" 
            value={`$${(totalRevenue / 1000000).toFixed(2)}M`} 
            subValue="+0% vs last month"
            icon={DollarSign} 
            gradient="bg-slate-900" 
        />
        <StatCard 
            title="Inventory Status" 
            value={`${soldStands} / ${totalStands}`} 
            subValue={`${totalStands - soldStands} Available`}
            icon={Building} 
            gradient="bg-slate-800" 
        />
        <StatCard 
            title="Occupancy" 
            value={`${occupancyRate}%`} 
            subValue="Target: 80%"
            icon={Users} 
            gradient="bg-slate-900" 
        />
        <StatCard 
            title="Avg. Sale Price" 
            value={`$${soldStands > 0 ? Math.round(totalRevenue / soldStands / 1000) : 0}k`} 
            subValue="Per Unit"
            icon={TrendingUp} 
            gradient="bg-amber-600" 
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
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full relative overflow-hidden">
           {/* Decorative bg */}
           <div className="absolute top-0 right-0 w-32 h-32 bg-amber-50 rounded-bl-full opacity-50 pointer-events-none"></div>

          <div className="flex items-center space-x-2 mb-4 relative z-10">
             <div className="p-1.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-md shadow-lg shadow-amber-200">
                <Sparkles className="w-4 h-4 text-white" />
             </div>
             <h3 className="text-lg font-bold text-slate-900">AI Analyst</h3>
          </div>
          
          <div className="flex-1 bg-slate-50/50 rounded-xl p-4 mb-4 overflow-y-auto max-h-60 text-sm text-slate-700 border border-slate-100 custom-scrollbar">
            {aiResponse ? (
                <div className="prose prose-sm prose-amber" dangerouslySetInnerHTML={{__html: aiResponse.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}} />
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
                    <Sparkles size={24} className="opacity-10" />
                    <p className="italic text-center text-xs">"Analyze top performing agents"</p>
                    <p className="italic text-center text-xs">"Show me revenue breakdown by developer"</p>
                </div>
            )}
          </div>

          <div className="mt-auto relative z-10">
              <div className="relative">
                  <input 
                    type="text" 
                    className="w-full bg-slate-50 border-0 border-b-2 border-slate-200 rounded-none px-2 py-3 text-sm focus:outline-none focus:border-amber-500 focus:ring-0 transition-colors placeholder-slate-400"
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
           <div className="bg-slate-900 rounded-2xl shadow-sm p-8 text-white flex flex-col justify-center items-center text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-32 bg-amber-500 rounded-full blur-3xl opacity-10 transform translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 p-32 bg-blue-600 rounded-full blur-3xl opacity-10 transform -translate-x-1/2 translate-y-1/2"></div>
                
                <h3 className="text-2xl font-bold mb-2 relative z-10">Sales Goals 2024</h3>
                <p className="text-slate-400 mb-6 max-w-xs relative z-10 text-sm">System ready for new data input.</p>
                <div className="w-full max-w-xs bg-white/10 rounded-full h-2 mb-2 relative z-10">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]" style={{width: '0%'}}></div>
                </div>
                <p className="text-xs text-slate-400 font-mono relative z-10 tracking-widest mt-2">0% COMPLETE</p>
           </div>
      </div>
    </div>
  );
};
