
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, UserPlus, FileText, Search, Activity } from 'lucide-react';
import { User, UserRole } from '../types';

export const Admin: React.FC = () => {
  const { auditLogs, users, addUser } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'audit'>('audit');
  
  // New User State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.AGENT);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    addUser({
        id: `u-${Date.now()}`,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole
    });
    setNewUserName('');
    setNewUserEmail('');
    alert("User Added!");
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Administration</h1>

      <div className="flex space-x-6 border-b border-slate-200">
         <button 
            className={`pb-3 font-medium text-sm transition-colors ${activeTab === 'audit' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('audit')}
         >
            Audit Logs
         </button>
         <button 
            className={`pb-3 font-medium text-sm transition-colors ${activeTab === 'users' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
            onClick={() => setActiveTab('users')}
         >
            User Management
         </button>
      </div>

      {activeTab === 'audit' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                    <Activity size={20} className="mr-2 text-amber-500"/> System Activity
                </h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs">
                        <tr>
                            <th className="px-6 py-4 font-bold">Timestamp</th>
                            <th className="px-6 py-4 font-bold">Action</th>
                            <th className="px-6 py-4 font-bold">User ID</th>
                            <th className="px-6 py-4 font-bold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {auditLogs.length === 0 ? (
                            <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No logs recorded yet.</td></tr>
                        ) : (
                            auditLogs.map(log => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-bold text-slate-800">{log.action}</td>
                                    <td className="px-6 py-4 text-slate-500 font-mono text-xs">{log.userId}</td>
                                    <td className="px-6 py-4 text-slate-600">{log.details}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {activeTab === 'users' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             {/* User List */}
             <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                 <h2 className="text-lg font-bold text-slate-900 mb-6">Authorized Users</h2>
                 <div className="space-y-4">
                    {users.map(user => (
                        <div key={user.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-xl hover:border-slate-300 transition-all group">
                            <div className="flex items-center space-x-4">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-md ${user.role === 'ADMIN' ? 'bg-slate-900' : 'bg-amber-500'}`}>
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${user.role === 'ADMIN' ? 'bg-slate-100 text-slate-700' : 'bg-blue-50 text-blue-700'}`}>
                                {user.role}
                            </span>
                        </div>
                    ))}
                 </div>
             </div>

             {/* Add User Form */}
             <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 h-fit">
                 <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                    <UserPlus size={20} className="mr-2 text-amber-500"/> Add User
                 </h2>
                 <form onSubmit={handleAddUser} className="space-y-6">
                     <div>
                         <label className="premium-label">Full Name</label>
                         <input required type="text" className="premium-input" placeholder="e.g. Sarah Connor" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                     </div>
                     <div>
                         <label className="premium-label">Email Address</label>
                         <input required type="email" className="premium-input" placeholder="user@company.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                     </div>
                     <div>
                         <label className="premium-label">Role</label>
                         <select className="premium-input" value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)}>
                             <option value={UserRole.AGENT}>Agent</option>
                             <option value={UserRole.ADMIN}>Admin</option>
                             <option value={UserRole.DEVELOPER}>Developer</option>
                         </select>
                     </div>
                     <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all">
                        Create Account
                     </button>
                 </form>
             </div>
          </div>
      )}
    </div>
  );
};
