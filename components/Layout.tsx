
import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, Building2, BadgeDollarSign, FileText, PieChart, Menu, Settings, Wallet, Contact, BarChart2, Bell, X, Check, Info, AlertTriangle, CheckCircle, Grid3X3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const NavItem = ({ to, icon: Icon, label, active, onClick }: { to: string; icon: any; label: string; active: boolean; onClick: (path: string) => void }) => (
  <button 
    onClick={() => onClick(to)} 
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${active ? 'bg-amber-50 text-amber-900 font-semibold shadow-sm' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}
  >
    <Icon size={18} className={active ? "text-amber-600" : "text-slate-400"} />
    <span className="text-sm">{label}</span>
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, setCurrentUser, users, currentPath, navigate, notifications, markNotificationRead, clearNotifications } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Mock Switch User for Demo
  const handleSwitchUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = users.find(u => u.id === e.target.value);
    if(user) setCurrentUser(user);
  };

  // Click outside to close notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [notifRef]);

  const handleNotifClick = (id: string, actionUrl?: string) => {
      markNotificationRead(id);
      if(actionUrl) {
          navigate(actionUrl);
          setNotifOpen(false);
      }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-100 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center shadow-lg shadow-slate-200">
                <span className="text-amber-500 font-bold text-lg">F</span>
              </div>
              <span className="text-lg font-bold text-slate-900 tracking-tight">FineEstate</span>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-500">
               <Menu size={24} />
            </button>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto custom-scrollbar">
            <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={currentPath === '/'} onClick={navigate} />
            <div className="pt-4 pb-1 pl-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Modules</div>
            <NavItem to="/developers" icon={Building2} label="Developments" active={currentPath === '/developers'} onClick={navigate} />
            <NavItem to="/stands" icon={Grid3X3} label="Stands Inventory" active={currentPath === '/stands'} onClick={navigate} />
            <NavItem to="/clients" icon={Contact} label="Client CRM" active={currentPath === '/clients'} onClick={navigate} />
            <NavItem to="/sales" icon={BadgeDollarSign} label="Sales Desk" active={currentPath === '/sales'} onClick={navigate} />
            <NavItem to="/agreements" icon={FileText} label="Agreements" active={currentPath === '/agreements'} onClick={navigate} />
            <div className="pt-4 pb-1 pl-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Financials</div>
            <NavItem to="/commissions" icon={Wallet} label="Commissions" active={currentPath === '/commissions'} onClick={navigate} />
            <NavItem to="/finance" icon={PieChart} label="Reconciliation" active={currentPath === '/finance'} onClick={navigate} />
            <NavItem to="/reports" icon={BarChart2} label="Reports" active={currentPath === '/reports'} onClick={navigate} />
            <div className="pt-4 pb-1 pl-4 text-xs font-bold text-slate-400 uppercase tracking-widest">System</div>
            <NavItem to="/agents" icon={Users} label="Agents" active={currentPath === '/agents'} onClick={navigate} />
            {currentUser.role === UserRole.ADMIN && (
              <NavItem to="/admin" icon={Settings} label="Admin Settings" active={currentPath === '/admin'} onClick={navigate} />
            )}
          </nav>

          <div className="p-4 border-t border-slate-50">
            <div className="mb-4">
               <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Simulate View</label>
               <select 
                className="w-full text-xs bg-slate-50 border-0 rounded-lg text-slate-600 font-medium focus:ring-0 cursor-pointer py-2 px-2"
                value={currentUser.id}
                onChange={handleSwitchUser}
               >
                 {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.role}</option>)}
               </select>
            </div>
            <div className="flex items-center space-x-3 text-slate-600 bg-slate-50 p-2 rounded-lg">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{currentUser.role}</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-30 border-b border-slate-100">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-500 mr-4">
                    <Menu size={24} />
                </button>
                <span className="font-bold text-slate-900 lg:hidden">FineEstate</span>
            </div>
            
            <div className="flex items-center space-x-4">
                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setNotifOpen(!notifOpen)}
                        className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full relative transition-colors"
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 border-2 border-white rounded-full"></span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50">
                            <div className="p-3 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-semibold text-slate-900 text-sm pl-2">Notifications</h3>
                                <button onClick={clearNotifications} className="text-[10px] font-bold text-slate-400 hover:text-slate-600 uppercase tracking-wider pr-2">Clear All</button>
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm italic">
                                        No new notifications.
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            onClick={() => handleNotifClick(notif.id, notif.actionUrl)}
                                            className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex items-start space-x-3 ${notif.read ? 'opacity-60' : 'bg-blue-50/20'}`}
                                        >
                                            <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 ${
                                                notif.type === 'ALERT' ? 'bg-red-100 text-red-600' :
                                                notif.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                                notif.type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                                {notif.type === 'ALERT' && <AlertTriangle size={12} />}
                                                {notif.type === 'WARNING' && <Info size={12} />}
                                                {notif.type === 'SUCCESS' && <CheckCircle size={12} />}
                                                {notif.type === 'INFO' && <Info size={12} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{notif.title}</p>
                                                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-mono">{new Date(notif.timestamp).toLocaleTimeString()} · {new Date(notif.timestamp).toLocaleDateString()}</p>
                                            </div>
                                            {!notif.read && <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 sm:p-8 custom-scrollbar">
           {children}
        </div>
      </main>
    </div>
  );
};
