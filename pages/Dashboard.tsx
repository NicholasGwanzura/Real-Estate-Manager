
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, Users, Building, AlertCircle, Sparkles, TrendingUp, Calendar, ArrowRight, X, Cloud, Sun, Wind, Droplets, Newspaper, MapPin, Clock } from 'lucide-react';
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

const WeatherWidget = () => (
  <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden h-full min-h-[200px] flex flex-col justify-between ring-1 ring-blue-400/20">
    <div className="absolute top-0 right-0 p-20 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
    
    <div className="flex justify-between items-start relative z-10">
      <div>
        <h3 className="font-bold text-lg flex items-center"><MapPin size={16} className="mr-1" /> Harare, ZW</h3>
        <p className="text-blue-100 text-xs mt-1">{new Date().toLocaleDateString(undefined, {weekday:'long', month:'long', day:'numeric'})}</p>
      </div>
      <Sun size={32} className="text-yellow-300 animate-[pulse_3s_ease-in-out_infinite]" />
    </div>

    <div className="relative z-10 mt-4">
      <div className="flex items-center">
        <span className="text-5xl font-bold tracking-tighter">28°</span>
        <span className="text-xl mt-2 ml-1 opacity-80 font-medium">C</span>
      </div>
      <p className="font-medium text-blue-100 mt-1 flex items-center"><Cloud size={14} className="mr-1.5"/> Partly Cloudy</p>
    </div>

    <div className="grid grid-cols-3 gap-2 mt-6 pt-4 border-t border-white/20 text-center relative z-10">
      <div>
         <div className="flex justify-center mb-1 text-blue-200"><Wind size={14}/></div>
         <span className="text-xs font-bold">12km/h</span>
      </div>
      <div>
         <div className="flex justify-center mb-1 text-blue-200"><Droplets size={14}/></div>
         <span className="text-xs font-bold">45%</span>
      </div>
      <div>
         <div className="flex justify-center mb-1 text-blue-200"><Sun size={14}/></div>
         <span className="text-xs font-bold">UV 6</span>
      </div>
    </div>
  </div>
);

const NewsWidget = () => {
  const [selectedNews, setSelectedNews] = useState<any>(null);

  const news = [
    { 
        id: 1, 
        title: "Borrowdale Brooke demand surges by 15% in Q3", 
        source: "Property ZW", 
        time: "2h ago",
        content: "Demand for luxury properties in Borrowdale Brooke has seen a significant uptake in the third quarter of 2024. Real estate analysts attribute this to increased diaspora remittances and a flight to quality assets amidst local currency volatility. Prices have firmed up by an average of 12% in USD terms compared to the same period last year. Security and reliable water supply remain the top drivers for high-net-worth individuals seeking residence in this gated community."
    },
    { 
        id: 2, 
        title: "ZIMRA gazettes new capital gains tax structure for developers", 
        source: "Gov Gazette", 
        time: "5h ago",
        content: "The Zimbabwe Revenue Authority (ZIMRA) has released Statutory Instrument 142 of 2024, detailing a revised Capital Gains Tax (CGT) framework specifically targeting large-scale property developers. The new structure introduces a sliding scale based on the holding period of land banks, aiming to discourage speculative hoarding. Developers who develop and sell within 24 months of land acquisition will now enjoy a preferential tax rate, stimulating faster housing delivery."
    },
    { 
        id: 3, 
        title: "Diaspora investment drives residential boom in Harare North", 
        source: "Financial Gazette", 
        time: "1d ago",
        content: "Investment from Zimbabweans living abroad is fueling a construction boom in Harare North suburbs including Mount Pleasant Heights and parts of Hatcliffe. Local construction firms report that over 60% of their current residential projects are funded by diaspora capital. This trend is expected to continue as mortgage availability remains constrained locally."
    },
    { 
        id: 4, 
        title: "Bulawayo industrial sector revival sparks warehousing demand", 
        source: "Chronicle", 
        time: "1d ago",
        content: "Renewed activity in Bulawayo's industrial sites has led to a shortage of quality warehousing space. Logistics companies serving the mining sector are snapping up available leasehold properties, driving rental yields up by approximately 8% quarter-on-quarter. Property developers are now looking at rehabilitating old factories to meet this specific demand."
    },
  ];

  return (
    <>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-slate-900 flex items-center"><Newspaper size={18} className="mr-2 text-amber-500"/> Zimbabwe News</h3>
            <button className="text-[10px] text-amber-600 font-bold hover:underline uppercase tracking-wide">View All</button>
        </div>
        <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar space-y-4">
            {news.map(item => (
                <div key={item.id} onClick={() => setSelectedNews(item)} className="group cursor-pointer">
                <h4 className="text-sm font-bold text-slate-800 group-hover:text-amber-600 transition-colors leading-snug">{item.title}</h4>
                <div className="flex justify-between items-center mt-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 px-2 py-0.5 rounded border border-slate-100">{item.source}</span>
                    <span className="text-[10px] text-slate-400">{item.time}</span>
                </div>
                <div className="h-px bg-slate-50 mt-3 group-last:hidden"></div>
                </div>
            ))}
        </div>
        </div>

        {/* News Reader Modal */}
        {selectedNews && (
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4 animate-in fade-in duration-200" onClick={() => setSelectedNews(null)}>
                <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                    <div className="relative h-32 bg-slate-900 overflow-hidden shrink-0">
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
                        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-200 via-amber-600 to-amber-900"></div>
                        <button 
                            onClick={() => setSelectedNews(null)}
                            className="absolute top-4 right-4 z-20 bg-black/20 hover:bg-black/40 text-white p-1.5 rounded-full backdrop-blur-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                        <div className="absolute bottom-4 left-6 z-20">
                            <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm mb-2 inline-block">
                                {selectedNews.source}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-6 overflow-y-auto custom-scrollbar">
                        <h2 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{selectedNews.title}</h2>
                        <div className="flex items-center text-slate-400 text-xs mb-6 font-medium">
                            <Clock size={12} className="mr-1"/> {selectedNews.time}
                            <span className="mx-2">•</span>
                            <span>Property News</span>
                        </div>
                        
                        <div className="prose prose-sm prose-slate text-slate-600 leading-relaxed">
                            <p>{selectedNews.content}</p>
                        </div>
                    </div>
                    
                    <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
                        <button 
                            onClick={() => setSelectedNews(null)}
                            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-colors"
                        >
                            Close Article
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};

export const Dashboard: React.FC = () => {
  const { sales, stands, developers, payments, releaseNotes } = useApp();
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);
  const [showReleaseNotes, setShowReleaseNotes] = useState(true);

  // Get the latest release note from context
  const latestRelease = releaseNotes.length > 0 ? releaseNotes[0] : null;

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
      {showReleaseNotes && latestRelease && (
          <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg relative animate-in slide-in-from-top-4 mb-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                  <div className="flex-1">
                      <div className="flex items-center flex-wrap gap-3 mb-3">
                          <span className="bg-amber-500 text-xs font-bold px-2 py-0.5 rounded text-white shadow-sm ring-1 ring-white/20">{latestRelease.version}</span>
                          <h3 className="font-bold text-lg tracking-tight">System Update Successfully Applied</h3>
                          <div className="hidden md:block w-px h-4 bg-slate-600"></div>
                          <span className="text-xs text-slate-400 font-mono flex items-center bg-slate-800/50 px-2 py-0.5 rounded border border-slate-700">
                             <Clock size={10} className="mr-1.5"/>
                             {latestRelease.date}
                          </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1">
                          {latestRelease.features.map((item, idx) => (
                              <div key={idx} className="flex items-start text-sm text-slate-300">
                                  <span className="text-amber-500 mr-2 mt-1.5">●</span>
                                  <span>
                                      <strong className="text-white font-semibold">{item.feature}:</strong> {item.detail}
                                  </span>
                              </div>
                          ))}
                      </div>
                  </div>
                  <button 
                    onClick={() => setShowReleaseNotes(false)} 
                    className="absolute top-3 right-3 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  >
                      <X size={18}/>
                  </button>
              </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue By Dev */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-full">
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

          {/* Real Estate News */}
          <NewsWidget />

          {/* Weather & Goals */}
          <div className="space-y-6 flex flex-col">
              <div className="flex-1">
                 <WeatherWidget />
              </div>
              
               <div className="bg-slate-900 rounded-2xl shadow-lg p-5 text-white relative overflow-hidden group">
                    <div className="flex justify-between items-start relative z-10">
                        <div>
                            <p className="text-[10px] text-amber-500 font-bold uppercase tracking-wider mb-1">Q3 Sales Target</p>
                            <h3 className="text-xl font-bold">85% Achieved</h3>
                        </div>
                        <TrendingUp className="text-green-400" size={20}/>
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-1.5 mt-3 relative z-10 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-1.5 rounded-full w-[85%]"></div>
                    </div>
               </div>
          </div>
      </div>
    </div>
  );
};
