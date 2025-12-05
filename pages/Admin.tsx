
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Shield, UserPlus, FileText, Search, Activity, Database, Download, Clock, CheckCircle, Trash2, User as UserIcon, UploadCloud, AlertTriangle, Megaphone, PlusCircle } from 'lucide-react';
import { User, UserRole } from '../types';

export const Admin: React.FC = () => {
  const { auditLogs, users, addUser, deleteUser, backups, isAutoBackupEnabled, toggleAutoBackup, createBackup, downloadBackup, importDatabase, releaseNotes, addReleaseNote } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'audit' | 'backup' | 'updates'>('users');
  
  // New User State
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>(UserRole.AGENT);

  // Release Note State
  const [rnVersion, setRnVersion] = useState('');
  const [rnFeature1, setRnFeature1] = useState('');
  const [rnDetail1, setRnDetail1] = useState('');
  const [rnFeature2, setRnFeature2] = useState('');
  const [rnDetail2, setRnDetail2] = useState('');

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if(!newUserName || !newUserEmail) return;

    addUser({
        id: `u-${Date.now()}`,
        name: newUserName,
        email: newUserEmail,
        role: newUserRole
    });
    setNewUserName('');
    setNewUserEmail('');
    alert("User Added Successfully! New Agent can now log in.");
  };

  const handleDeleteUser = (id: string, name: string) => {
      if(window.confirm(`Are you sure you want to remove ${name}? This will revoke their system access immediately.`)) {
          deleteUser(id);
      }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        if(window.confirm("WARNING: Restoring a backup will OVERWRITE all current data. Are you sure?")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    const success = importDatabase(event.target.result as string);
                    if(success) alert("System restored successfully!");
                    else alert("Failed to restore. Invalid file format.");
                }
            };
            reader.readAsText(file);
        }
    }
  };

  const publishReleaseNote = (e: React.FormEvent) => {
      e.preventDefault();
      if (!rnVersion || !rnFeature1) return;

      const features = [];
      if (rnFeature1) features.push({ feature: rnFeature1, detail: rnDetail1 });
      if (rnFeature2) features.push({ feature: rnFeature2, detail: rnDetail2 });

      addReleaseNote({
          id: `rn-${Date.now()}`,
          version: rnVersion,
          date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          features
      });

      // Reset
      setRnVersion('');
      setRnFeature1('');
      setRnDetail1('');
      setRnFeature2('');
      setRnDetail2('');
      alert("Release Note Published! It will now appear on all user dashboards.");
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
           <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Administration</h1>
           <p className="text-slate-500 mt-1">Manage users, security settings, and system backups.</p>
        </div>
      </div>

      {/* Modern Tabs */}
      <div className="flex p-1 bg-white border border-slate-200 rounded-xl w-full md:w-fit shadow-sm overflow-x-auto">
         <button 
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center whitespace-nowrap ${activeTab === 'users' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('users')}
         >
            <UserIcon size={16} className="mr-2"/> User Management
         </button>
         <button 
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center whitespace-nowrap ${activeTab === 'backup' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('backup')}
         >
            <Database size={16} className="mr-2"/> Backups & Data
         </button>
         <button 
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center whitespace-nowrap ${activeTab === 'updates' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('updates')}
         >
            <Megaphone size={16} className="mr-2"/> System Updates
         </button>
         <button 
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center whitespace-nowrap ${activeTab === 'audit' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('audit')}
         >
            <Activity size={16} className="mr-2"/> Audit Logs
         </button>
      </div>

      {/* USERS TAB */}
      {activeTab === 'users' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
             {/* User List */}
             <div className="xl:col-span-2 space-y-6">
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Active Accounts</h2>
                    <p className="text-sm text-slate-500 mb-6">Manage access levels for agents and staff members.</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {users.map(user => (
                            <div key={user.id} className="card-premium p-5 rounded-xl flex items-center justify-between group">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-lg ${
                                        user.role === 'ADMIN' ? 'bg-gradient-dark' : 
                                        user.role === 'DEVELOPER' ? 'bg-gradient-to-br from-indigo-500 to-purple-600' :
                                        'bg-gradient-amber'
                                    }`}>
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{user.name}</p>
                                        <p className="text-xs text-slate-500 font-medium">{user.email}</p>
                                        <div className={`mt-1.5 inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                            user.role === 'ADMIN' ? 'bg-slate-100 text-slate-700 border-slate-200' : 
                                            user.role === 'DEVELOPER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            'bg-amber-50 text-amber-700 border-amber-100'
                                        }`}>
                                            {user.role}
                                        </div>
                                    </div>
                                </div>
                                {user.role !== 'ADMIN' && (
                                    <button 
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                        title="Revoke Access"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                 </div>
             </div>

             {/* Add User Form */}
             <div className="xl:col-span-1">
                <div className="bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 sticky top-24">
                     <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mb-6">
                        <UserPlus size={24} className="text-amber-600"/>
                     </div>
                     <h2 className="text-xl font-bold text-slate-900 mb-2">Add New User</h2>
                     <p className="text-sm text-slate-500 mb-8">Create a new profile for an agent or staff member to grant system access.</p>
                     
                     <form onSubmit={handleAddUser} className="space-y-6">
                         <div>
                             <label className="premium-label">Full Name</label>
                             <input required type="text" className="premium-input" placeholder="e.g. John Doe" value={newUserName} onChange={e => setNewUserName(e.target.value)} />
                         </div>
                         <div>
                             <label className="premium-label">Email Address</label>
                             <input required type="email" className="premium-input" placeholder="john@fineestate.com" value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} />
                         </div>
                         <div>
                             <label className="premium-label">System Role</label>
                             <select className="premium-input" value={newUserRole} onChange={e => setNewUserRole(e.target.value as UserRole)}>
                                 <option value={UserRole.AGENT}>Agent (Standard Access)</option>
                                 <option value={UserRole.ADMIN}>Admin (Full Control)</option>
                                 <option value={UserRole.DEVELOPER}>Developer (View Only)</option>
                             </select>
                             <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                                * <strong>Agents</strong> can manage sales and clients.<br/>
                                * <strong>Admins</strong> have full system control.<br/>
                                * <strong>Developers</strong> can only view their own projects.
                             </p>
                         </div>
                         <button type="submit" className="w-full btn-gradient-dark text-white py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all active:scale-95 mt-4">
                            Create Account
                         </button>
                     </form>
                </div>
             </div>
          </div>
      )}

      {/* BACKUP TAB */}
      {activeTab === 'backup' && (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Auto Backup Config */}
                    <div className="space-y-6">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center">
                                <Clock size={20} className="mr-2 text-amber-500"/> Automated Backup System
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Configure the system to automatically snapshot your data every hour.</p>
                        </div>
                        
                        <div className="flex items-center space-x-4 bg-slate-50 p-2 rounded-xl border border-slate-100 w-fit">
                            <span className={`text-xs font-bold px-3 py-1 rounded-lg ${isAutoBackupEnabled ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                                {isAutoBackupEnabled ? 'ACTIVE' : 'DISABLED'}
                            </span>
                            <button 
                                onClick={() => toggleAutoBackup(!isAutoBackupEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAutoBackupEnabled ? 'bg-slate-900' : 'bg-slate-300'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoBackupEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        <div className="text-sm text-slate-600 flex items-center bg-slate-50 p-3 rounded-lg border border-slate-200/50">
                            <Clock size={16} className="mr-2 text-slate-400"/>
                            <span className="font-bold mr-2">Next Scheduled Backup:</span> {isAutoBackupEnabled ? 'In ~1 Hour' : 'Not Scheduled'}
                        </div>
                    </div>

                    {/* Restore Zone */}
                    <div className="space-y-6 border-l border-slate-100 pl-0 md:pl-12">
                        <div>
                            <h2 className="text-lg font-bold text-slate-900 flex items-center">
                                <UploadCloud size={20} className="mr-2 text-blue-500"/> Restore Data
                            </h2>
                            <p className="text-sm text-slate-500 mt-1">Recover lost data by uploading a previous backup file.</p>
                        </div>

                         <div className="bg-red-50 border border-red-100 rounded-lg p-4 text-xs text-red-700 flex items-start">
                             <AlertTriangle size={16} className="mr-2 flex-shrink-0 mt-0.5"/>
                             <span>Warning: Importing a file will completely overwrite all current system data.</span>
                         </div>

                        <div className="relative group">
                            <input 
                                type="file" 
                                accept=".json"
                                onChange={handleRestore}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="w-full bg-white border-2 border-dashed border-slate-300 rounded-xl p-4 text-center group-hover:border-slate-900 transition-colors">
                                <span className="text-sm font-bold text-slate-600 group-hover:text-slate-900">Click to Select Backup File (.json)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-lg font-bold text-slate-900 flex items-center">
                            <Database size={20} className="mr-2 text-slate-400"/> Backup History
                        </h2>
                        <button 
                            onClick={() => createBackup()}
                            className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-bold transition-colors"
                        >
                            + Manual Snapshot
                        </button>
                    </div>
                    <button 
                        onClick={() => downloadBackup()} 
                        className="btn-gradient-dark text-white px-5 py-2.5 rounded-xl hover:shadow-lg transition-all text-sm font-bold flex items-center"
                    >
                        <Download size={16} className="mr-2" /> Download Full Export
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-bold">Backup ID</th>
                                <th className="px-6 py-4 font-bold">Timestamp</th>
                                <th className="px-6 py-4 font-bold">Size</th>
                                <th className="px-6 py-4 font-bold">Records</th>
                                <th className="px-6 py-4 font-bold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {backups.length === 0 ? (
                                <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">No backups available. Enable auto-backup or trigger manually.</td></tr>
                            ) : (
                                backups.map(bk => (
                                    <tr key={bk.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-600 font-mono text-xs bg-slate-50/50">{bk.id}</td>
                                        <td className="px-6 py-4 text-slate-900 font-medium">{new Date(bk.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{bk.size}</td>
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">{bk.recordCount}</td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center text-green-600 text-xs font-bold uppercase">
                                                <CheckCircle size={14} className="mr-1.5"/> Stored
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
      )}

      {/* UPDATES TAB */}
      {activeTab === 'updates' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-1 space-y-6">
                  <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                      <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center">
                          <PlusCircle size={20} className="mr-2 text-amber-500"/> Draft Release Note
                      </h2>
                      <form onSubmit={publishReleaseNote} className="space-y-5">
                          <div>
                              <label className="premium-label">Version Number</label>
                              <input 
                                className="premium-input" 
                                placeholder="e.g. v2.0.1" 
                                value={rnVersion}
                                onChange={(e) => setRnVersion(e.target.value)}
                                required
                              />
                          </div>
                          
                          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                              <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Update Highlights</label>
                              
                              <div className="mb-4">
                                  <input 
                                    className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-amber-500 outline-none pb-1 mb-1 placeholder-slate-400" 
                                    placeholder="Feature 1 Title"
                                    value={rnFeature1}
                                    onChange={(e) => setRnFeature1(e.target.value)}
                                    required
                                  />
                                  <textarea 
                                    className="w-full text-xs text-slate-600 bg-transparent border-0 focus:ring-0 p-0 resize-none placeholder-slate-400"
                                    placeholder="Description details..."
                                    rows={2}
                                    value={rnDetail1}
                                    onChange={(e) => setRnDetail1(e.target.value)}
                                  />
                              </div>

                              <div>
                                  <input 
                                    className="w-full text-sm font-bold text-slate-900 bg-transparent border-b border-slate-200 focus:border-amber-500 outline-none pb-1 mb-1 placeholder-slate-400" 
                                    placeholder="Feature 2 Title (Optional)"
                                    value={rnFeature2}
                                    onChange={(e) => setRnFeature2(e.target.value)}
                                  />
                                  <textarea 
                                    className="w-full text-xs text-slate-600 bg-transparent border-0 focus:ring-0 p-0 resize-none placeholder-slate-400"
                                    placeholder="Description details..."
                                    rows={2}
                                    value={rnDetail2}
                                    onChange={(e) => setRnDetail2(e.target.value)}
                                  />
                              </div>
                          </div>

                          <button className="w-full btn-gradient-dark text-white py-3 rounded-xl font-bold uppercase tracking-wider text-sm transition-all shadow-lg hover:translate-y-[-1px]">
                              Publish Update
                          </button>
                      </form>
                  </div>
              </div>

              <div className="xl:col-span-2">
                  <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                      <div className="p-6 border-b border-slate-100">
                          <h2 className="text-lg font-bold text-slate-900">Release History</h2>
                          <p className="text-sm text-slate-500">Log of all system updates broadcasted to users.</p>
                      </div>
                      <div className="divide-y divide-slate-100">
                          {releaseNotes.length === 0 ? (
                              <div className="p-8 text-center text-slate-400 italic">No release notes published yet.</div>
                          ) : (
                              releaseNotes.map(rn => (
                                  <div key={rn.id} className="p-6 hover:bg-slate-50 transition-colors">
                                      <div className="flex justify-between items-center mb-4">
                                          <div className="flex items-center">
                                              <span className="bg-slate-900 text-white text-xs font-bold px-2 py-1 rounded shadow-sm mr-3">{rn.version}</span>
                                              <span className="text-sm text-slate-500 flex items-center font-mono"><Clock size={12} className="mr-1.5"/> {rn.date}</span>
                                          </div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                          {rn.features.map((f, idx) => (
                                              <div key={idx} className="flex items-start">
                                                  <div className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                                  <div>
                                                      <p className="text-sm font-bold text-slate-900">{f.feature}</p>
                                                      <p className="text-xs text-slate-500 leading-relaxed">{f.detail}</p>
                                                  </div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              ))
                          )}
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* AUDIT TAB */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center">
                    <Activity size={20} className="mr-2 text-amber-500"/> System Activity Log
                </h2>
                <p className="text-sm text-slate-500 mt-1">Immutable record of all system actions.</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-100">
                        <tr>
                            <th className="px-6 py-4 font-bold">Timestamp</th>
                            <th className="px-6 py-4 font-bold">Action</th>
                            <th className="px-6 py-4 font-bold">User</th>
                            <th className="px-6 py-4 font-bold">Details</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                        {auditLogs.length === 0 ? (
                            <tr><td colSpan={4} className="p-12 text-center text-slate-400 italic">No logs recorded yet.</td></tr>
                        ) : (
                            auditLogs.map(log => {
                                const actor = users.find(u => u.id === log.userId);
                                return (
                                    <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                                        <td className="px-6 py-4 font-bold text-slate-800">
                                            <span className="px-2 py-1 rounded bg-slate-100 text-[10px] tracking-wide uppercase border border-slate-200">{log.action}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold text-xs">{actor?.name || 'Unknown User'}</span>
                                                <span className="text-slate-400 font-mono text-[10px]">{log.userId}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600">{log.details}</td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
};
