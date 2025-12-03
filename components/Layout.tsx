
import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Users, Building2, BadgeDollarSign, FileText, PieChart, Menu, Settings, Wallet, Contact, BarChart2, Bell, AlertTriangle, CheckCircle, Info, Grid3X3, LogOut, CalendarClock, Receipt, Cloud, CloudOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const NavItem = ({ to, icon: Icon, label, active, onClick }: { to: string; icon: any; label: string; active: boolean; onClick: (path: string) => void }) => (
  <button 
    onClick={() => onClick(to)} 
    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 group ${
      active 
        ? 'bg-gradient-to-r from-amber-50 to-white text-amber-900 shadow-sm border-l-4 border-amber-500' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon size={20} className={`transition-colors duration-300 ${active ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600"}`} />
    <span className={`text-sm font-medium ${active ? 'font-bold' : ''}`}>{label}</span>
  </button>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, setCurrentUser, users, currentPath, navigate, notifications, markNotificationRead, clearNotifications, logout, lastSaved } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;
  const isAdmin = currentUser.role === UserRole.ADMIN;

  // Mock Switch User for Demo
  const handleSwitchUser = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const user = users.find(u => u.id === e.target.value);
    if(user) setCurrentUser(user);
  };

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

  const handleNavClick = (path: string) => {
      navigate(path);
      setSidebarOpen(false); // Close sidebar on mobile after click
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-inter selection:bg-amber-100 selection:text-amber-900">
      
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl border-r border-slate-200 transform transition-transform duration-300 ease-out lg:relative lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-2xl lg:shadow-none`}>
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-dark rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 ring-4 ring-white">
                <span className="text-amber-500 font-bold text-xl">F</span>
              </div>
              <div>
                <span className="block text-lg font-bold text-slate-900 tracking-tight leading-none">FineEstate</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Manager</span>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors">
               <Menu size={20} />
            </button>
          </div>

          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto custom-scrollbar">
            {isAdmin && (
                <NavItem to="/" icon={LayoutDashboard} label="Dashboard" active={currentPath === '/'} onClick={handleNavClick} />
            )}
            
            <div className="mt-6 mb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <span className="w-full border-b border-slate-100 pb-1">Inventory & Sales</span>
            </div>
            <NavItem to="/developers" icon={Building2} label="Developments" active={currentPath === '/developers'} onClick={handleNavClick} />
            <NavItem to="/stands" icon={Grid3X3} label="Stands Inventory" active={currentPath === '/stands'} onClick={handleNavClick} />
            <NavItem to="/clients" icon={Contact} label="Client CRM" active={currentPath === '/clients'} onClick={handleNavClick} />
            <NavItem to="/sales" icon={BadgeDollarSign} label="Sales Desk" active={currentPath === '/sales'} onClick={handleNavClick} />
            <NavItem to="/agreements" icon={FileText} label="Agreements" active={currentPath === '/agreements'} onClick={handleNavClick} />
            
            {/* Financials - Available to Admins AND Agents (Cashiers) */}
            <div className="mt-6 mb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                <span className="w-full border-b border-slate-100 pb-1">Financials</span>
            </div>
            <NavItem to="/cashier" icon={Receipt} label="Transactions" active={currentPath === '/cashier'} onClick={handleNavClick} />
            
            {isAdmin && (
                <>
                    <NavItem to="/installments" icon={CalendarClock} label="Installment Tracker" active={currentPath === '/installments'} onClick={handleNavClick} />
                    <NavItem to="/commissions" icon={Wallet} label="Commissions" active={currentPath === '/commissions'} onClick={handleNavClick} />
                    <NavItem to="/finance" icon={PieChart} label="Reconciliation" active={currentPath === '/finance'} onClick={handleNavClick} />
                    <NavItem to="/reports" icon={BarChart2} label="Reports" active={currentPath === '/reports'} onClick={handleNavClick} />
                    
                    <div className="mt-6 mb-2 px-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
                        <span className="w-full border-b border-slate-100 pb-1">Administration</span>
                    </div>
                    <NavItem to="/agents" icon={Users} label="Agents" active={currentPath === '/agents'} onClick={handleNavClick} />
                    <NavItem to="/admin" icon={Settings} label="Control Panel" active={currentPath === '/admin'} onClick={handleNavClick} />
                </>
            )}
          </nav>

          <div className="p-4 border-t border-slate-100 bg-slate-50/50">
            {isAdmin && (
             <div className="mb-4">
                <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">Simulate User View</label>
                <select 
                    className="w-full text-xs bg-white border border-slate-200 rounded-lg text-slate-600 font-medium focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer py-2.5 px-3 shadow-sm"
                    value={currentUser.id}
                    onChange={handleSwitchUser}
                >
                    {users.map(u => <option key={u.id} value={u.id}>{u.name} - {u.role}</option>)}
                </select>
             </div>
            )}
            <div className="flex items-center space-x-3 text-slate-600 bg-white p-3 rounded-xl shadow-sm border border-slate-100">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs border border-white shadow-sm">
                {currentUser.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-500 truncate font-medium">{currentUser.role} • v1.1.0</p>
              </div>
              <button 
                onClick={logout}
                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Log Out"
              >
                  <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative bg-[#f8fafc]">
        <header className="glass-header sticky top-0 z-30">
          <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
                <button 
                    onClick={() => setSidebarOpen(true)} 
                    className="lg:hidden text-slate-500 mr-4 p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors"
                >
                    <Menu size={24} />
                </button>
                <span className="font-bold text-slate-900 lg:hidden text-lg">FineEstate</span>
            </div>
            
            <div className="flex items-center space-x-4">
                {/* Auto Save Indicator */}
                <div className="hidden md:flex items-center text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-full font-bold border border-green-100">
                    <Cloud size={14} className="mr-1.5" />
                    <span>Saved {lastSaved.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notifRef}>
                    <button 
                        onClick={() => setNotifOpen(!notifOpen)}
                        className={`p-2.5 rounded-full relative transition-all duration-200 ${notifOpen ? 'bg-amber-50 text-amber-600' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse"></span>
                        )}
                    </button>

                    {notifOpen && (
                        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-4 border-b border-slate-50 flex justify-between items-center bg-slate-50/50 backdrop-blur-md">
                                <h3 className="font-bold text-slate-900 text-sm">Notifications</h3>
                                <button onClick={clearNotifications} className="text-[10px] font-bold text-slate-400 hover:text-amber-600 uppercase tracking-wider transition-colors">Clear All</button>
                            </div>
                            <div className="max-h-[24rem] overflow-y-auto custom-scrollbar">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center text-slate-400 text-sm italic">
                                        No new notifications.
                                    </div>
                                ) : (
                                    notifications.map(notif => (
                                        <div 
                                            key={notif.id} 
                                            onClick={() => handleNotifClick(notif.id, notif.actionUrl)}
                                            className={`p-4 border-b border-slate-50 cursor-pointer hover:bg-slate-50 transition-colors flex items-start space-x-3 ${notif.read ? 'opacity-60' : 'bg-blue-50/10'}`}
                                        >
                                            <div className={`mt-0.5 p-1.5 rounded-full flex-shrink-0 shadow-sm ${
                                                notif.type === 'ALERT' ? 'bg-red-100 text-red-600' :
                                                notif.type === 'WARNING' ? 'bg-amber-100 text-amber-600' :
                                                notif.type === 'SUCCESS' ? 'bg-green-100 text-green-600' :
                                                'bg-blue-100 text-blue-600'
                                            }`}>
                                                {notif.type === 'ALERT' && <AlertTriangle size={14} />}
                                                {notif.type === 'WARNING' && <Info size={14} />}
                                                {notif.type === 'SUCCESS' && <CheckCircle size={14} />}
                                                {notif.type === 'INFO' && <Info size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{notif.title}</p>
                                                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                                                <p className="text-[10px] text-slate-400 mt-2 font-mono flex items-center">
                                                    {new Date(notif.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                            {!notif.read && <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 ring-2 ring-white"></div>}
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

        <div className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
           <div className="max-w-7xl mx-auto">
               {children}
           </div>
        </div>
      </main>
    </div>
  );
};
