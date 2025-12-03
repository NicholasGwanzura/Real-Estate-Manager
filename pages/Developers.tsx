
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, User as UserIcon, LayoutGrid, Info, Calculator, Briefcase, Trash2, Edit2, X, Check, AlertTriangle, BarChart3 } from 'lucide-react';
import { StandStatus, Stand, UserRole, Developer } from '../types';

export const Developers: React.FC = () => {
  const { developers, stands, addDeveloper, updateDeveloper, deleteDeveloper, addStand, currentUser, users } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Developer Form State
  const [devId, setDevId] = useState('');
  const [devName, setDevName] = useState('');
  const [devContact, setDevContact] = useState('');
  const [devEmail, setDevEmail] = useState('');
  const [devTotalStands, setDevTotalStands] = useState('');
  const [devDepositTerms, setDevDepositTerms] = useState('');
  const [devFinancingTerms, setDevFinancingTerms] = useState('');
  const [devMandateHolder, setDevMandateHolder] = useState('');

  // Stand adding state
  const [selectedDevId, setSelectedDevId] = useState<string>(developers[0]?.id || '');
  const [batchStart, setBatchStart] = useState('');
  const [batchEnd, setBatchEnd] = useState('');
  const [batchPrice, setBatchPrice] = useState('');
  const [batchSize, setBatchSize] = useState('500');
  const [batchDeposit, setBatchDeposit] = useState('');
  const [batchTerms, setBatchTerms] = useState('');

  const activeDeveloper = developers.find(d => d.id === selectedDevId);
  const agents = users.filter(u => u.role === UserRole.AGENT);

  const openCreateModal = () => {
    setIsEditMode(false);
    setDevId('');
    setDevName('');
    setDevContact('');
    setDevEmail('');
    setDevTotalStands('');
    setDevDepositTerms('');
    setDevFinancingTerms('');
    setDevMandateHolder('');
    setIsModalOpen(true);
  };

  const openEditModal = (dev: Developer) => {
    setIsEditMode(true);
    setDevId(dev.id);
    setDevName(dev.name);
    setDevContact(dev.contactPerson);
    setDevEmail(dev.email);
    setDevTotalStands(dev.totalStands.toString());
    setDevDepositTerms(dev.depositTerms || '');
    setDevFinancingTerms(dev.financingTerms || '');
    setDevMandateHolder(dev.mandateHolderId || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this development? This action cannot be undone.")) {
      deleteDeveloper(id);
      if (selectedDevId === id) setSelectedDevId('');
    }
  };

  const handleSubmitDeveloper = (e: React.FormEvent) => {
    e.preventDefault();
    const developerData: Developer = {
      id: isEditMode ? devId : `d${Date.now()}`,
      name: devName,
      contactPerson: devContact || 'Pending',
      email: devEmail || 'pending@example.com',
      totalStands: parseInt(devTotalStands) || 0,
      depositTerms: devDepositTerms,
      financingTerms: devFinancingTerms,
      mandateHolderId: devMandateHolder || undefined
    };

    if (isEditMode) {
      updateDeveloper(developerData);
    } else {
      addDeveloper(developerData);
    }
    
    setIsModalOpen(false);
  };

  const handleBatchAddStands = () => {
    const start = parseInt(batchStart);
    const end = parseInt(batchEnd);
    const price = parseInt(batchPrice);
    const size = parseInt(batchSize);
    
    if (start && end && price && selectedDevId && end >= start) {
      // Resolve Defaults
      let resolvedFinancing = batchTerms;
      if (!resolvedFinancing && activeDeveloper?.financingTerms) {
        resolvedFinancing = activeDeveloper.financingTerms;
      }

      let resolvedDeposit = parseInt(batchDeposit);
      if (isNaN(resolvedDeposit) && activeDeveloper?.depositTerms) {
        if (activeDeveloper.depositTerms.includes('%')) {
             const pct = parseFloat(activeDeveloper.depositTerms);
             if (!isNaN(pct)) {
                 resolvedDeposit = (price * pct) / 100;
             }
        } else {
            const num = parseInt(activeDeveloper.depositTerms.replace(/[^0-9]/g, ''));
            if (!isNaN(num)) resolvedDeposit = num;
        }
      }

      let addedCount = 0;
      let skippedCount = 0;

      for (let i = start; i <= end; i++) {
        // Check for duplicates
        const exists = stands.some(s => s.developerId === selectedDevId && s.standNumber === i.toString());
        
        if (exists) {
            skippedCount++;
            continue;
        }

        const stand: Stand = {
          id: `${selectedDevId}-${i}`,
          standNumber: i.toString(),
          developerId: selectedDevId,
          price: price,
          size: size || 500,
          status: StandStatus.AVAILABLE,
          depositRequired: isNaN(resolvedDeposit) ? undefined : resolvedDeposit,
          financingTerms: resolvedFinancing || undefined
        };
        addStand(stand);
        addedCount++;
      }
      
      setBatchStart('');
      setBatchEnd('');
      setBatchPrice('');
      setBatchDeposit('');
      setBatchTerms('');
      
      if (skippedCount > 0) {
          alert(`Added ${addedCount} stands. Skipped ${skippedCount} duplicates.`);
      } else {
          alert(`Successfully generated ${addedCount} stands!`);
      }
    }
  };

  const getDepositPreview = () => {
    if (batchDeposit) return `$${parseInt(batchDeposit).toLocaleString()}`;
    if (!batchPrice || !activeDeveloper?.depositTerms) return 'N/A';
    
    if (activeDeveloper.depositTerms.includes('%')) {
        const pct = parseFloat(activeDeveloper.depositTerms);
        const price = parseInt(batchPrice);
        if (!isNaN(pct) && !isNaN(price)) return `$${((price * pct) / 100).toLocaleString()} (${pct}%)`;
    }
    return activeDeveloper.depositTerms;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Development Management</h1>
        <button onClick={openCreateModal} className="flex items-center space-x-2 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors shadow-lg shadow-amber-200">
          <Plus size={18} />
          <span>New Development</span>
        </button>
      </div>

      {/* Developer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {developers.map(dev => {
            const devStands = stands.filter(s => s.developerId === dev.id);
            const soldCount = devStands.filter(s => s.status === StandStatus.SOLD).length;
            const reservedCount = devStands.filter(s => s.status === StandStatus.RESERVED).length;
            const availableCount = devStands.filter(s => s.status === StandStatus.AVAILABLE).length;
            
            const mandateHolder = users.find(u => u.id === dev.mandateHolderId);
            const isAdmin = currentUser.role === UserRole.ADMIN;
            
            return (
              <div key={dev.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-amber-200 transition-colors group relative">
                {isAdmin && (
                  <div className="absolute top-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditModal(dev)} className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => handleDelete(dev.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}

                <div className="flex items-start justify-between pr-10">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg group-hover:text-amber-600 transition-colors">{dev.name}</h3>
                    <p className="text-sm text-slate-500">{dev.contactPerson}</p>
                  </div>
                </div>
                
                <div className="mt-4 space-y-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  <div className="flex justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                     <span>Total Inventory</span>
                     <span className="font-semibold text-slate-900">{devStands.length} Units</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                     <span>Available</span>
                     <span className="font-bold text-green-600">{availableCount} Units</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-600 border-b border-slate-200 pb-2">
                     <span>Sold</span>
                     <span className="font-semibold text-slate-900">{soldCount} Units</span>
                  </div>
                   <div className="flex justify-between text-xs text-slate-600">
                     <span>Projected Total</span>
                     <span className="font-medium text-slate-400">{dev.totalStands} (Planned)</span>
                  </div>
                </div>

                {mandateHolder ? (
                  <div className="mt-3 flex items-center text-xs text-slate-500 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                    <Briefcase size={14} className="mr-2 text-amber-500"/>
                    <span>Mandate: <strong>{mandateHolder.name}</strong></span>
                  </div>
                ) : (
                  <div className="mt-3 flex items-center text-xs text-slate-400 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 border-dashed">
                    <Briefcase size={14} className="mr-2"/>
                    <span>No Mandate Assigned</span>
                  </div>
                )}

                <div className="mt-4 pt-2">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-slate-500 text-xs uppercase tracking-wider font-bold">Sales Progress</span>
                    <span className="font-bold text-slate-900 text-xs">{devStands.length > 0 ? Math.round((soldCount / devStands.length) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full transition-all duration-500" style={{ width: `${devStands.length > 0 ? (soldCount / devStands.length) * 100 : 0}%` }}></div>
                  </div>
                </div>
              </div>
            );
        })}
      </div>

      {/* Quick Add Stands Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
            <LayoutGrid className="mr-2 text-amber-500" size={20}/> Batch Add Stands
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="md:col-span-1">
                <label className="premium-label">Select Development</label>
                <select className="premium-input" value={selectedDevId} onChange={(e) => setSelectedDevId(e.target.value)}>
                    {developers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
            </div>
             <div className="md:col-span-3">
                 {activeDeveloper ? (
                     <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-sm text-slate-600 flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-8 h-full">
                         <div className="flex items-center">
                            <Info size={16} className="mr-2 text-amber-500"/> 
                            <span className="font-semibold mr-2 text-slate-900">Default Terms:</span> 
                            {activeDeveloper.financingTerms || 'None defined'}
                         </div>
                         <div className="flex items-center">
                            <span className="font-semibold mr-2 text-slate-900">Deposit Config:</span> 
                            {activeDeveloper.depositTerms || 'None defined'}
                         </div>
                         <div className="flex items-center text-blue-600 font-medium">
                            <BarChart3 size={16} className="mr-2"/>
                            Current Inventory: {stands.filter(s => s.developerId === selectedDevId).length} Units
                         </div>
                     </div>
                 ) : (
                    <div className="h-full flex items-center text-slate-400 text-sm italic p-2">Select a development to see defaults</div>
                 )}
             </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-start">
            <div>
                <label className="premium-label">Start #</label>
                <input type="number" className="premium-input" placeholder="1" value={batchStart} onChange={(e) => setBatchStart(e.target.value)} />
            </div>
            <div>
                <label className="premium-label">End #</label>
                <input type="number" className="premium-input" placeholder="10" value={batchEnd} onChange={(e) => setBatchEnd(e.target.value)} />
            </div>
            <div>
                <label className="premium-label">Size (m²)</label>
                <input type="number" className="premium-input" placeholder="500" value={batchSize} onChange={(e) => setBatchSize(e.target.value)} />
            </div>
            <div>
                <label className="premium-label">Price ($)</label>
                <input type="number" className="premium-input" placeholder="150000" value={batchPrice} onChange={(e) => setBatchPrice(e.target.value)} />
            </div>
            <div>
                 <label className="premium-label flex justify-between">
                    Req. Deposit ($) 
                    {activeDeveloper && !batchDeposit && <span className="text-amber-600 text-[10px] flex items-center"><Calculator size={10} className="mr-0.5"/> Auto</span>}
                 </label>
                 <input 
                    type="number" 
                    className={`premium-input ${!batchDeposit && activeDeveloper ? 'text-amber-700 placeholder-amber-400' : ''}`}
                    placeholder={getDepositPreview()}
                    value={batchDeposit} 
                    onChange={(e) => setBatchDeposit(e.target.value)} 
                 />
            </div>
             <div>
                 <label className="premium-label">Terms</label>
                 <input 
                    type="text" 
                    className="premium-input"
                    placeholder={activeDeveloper?.financingTerms || "e.g. 36 Months"} 
                    value={batchTerms} 
                    onChange={(e) => setBatchTerms(e.target.value)} 
                 />
            </div>
        </div>
        
        <div className="mt-8 flex justify-between items-center">
             <div className="flex items-center text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                <AlertTriangle size={14} className="mr-2"/>
                Duplicate stand numbers will be automatically skipped.
             </div>
            <button onClick={handleBatchAddStands} className="bg-slate-900 text-white px-8 py-3 rounded-lg hover:bg-slate-800 text-sm font-bold shadow-lg shadow-slate-200 transition-all active:scale-95">
                GENERATE STANDS
            </button>
        </div>
      </div>

      {/* Add/Edit Development Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl transform transition-all">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900">{isEditMode ? 'Edit Development' : 'Create New Development'}</h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleSubmitDeveloper} className="space-y-6">
              <div>
                 <label className="premium-label">Development Name</label>
                 <input 
                    type="text" 
                    placeholder="e.g. Sunset Heights" 
                    className="premium-input"
                    value={devName}
                    onChange={(e) => setDevName(e.target.value)}
                    required
                 />
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="premium-label">Contact Person</label>
                    <input 
                        type="text" 
                        placeholder="Full Name" 
                        className="premium-input"
                        value={devContact}
                        onChange={(e) => setDevContact(e.target.value)}
                    />
                  </div>
                   <div>
                    <label className="premium-label">Total Stands (Planned)</label>
                    <input 
                        type="number" 
                        placeholder="e.g. 100" 
                        className="premium-input"
                        value={devTotalStands}
                        onChange={(e) => setDevTotalStands(e.target.value)}
                    />
                  </div>
              </div>

              <div>
                 <label className="premium-label">Email Address</label>
                 <input 
                    type="email" 
                    placeholder="contact@developer.com" 
                    className="premium-input"
                    value={devEmail}
                    onChange={(e) => setDevEmail(e.target.value)}
                 />
              </div>
              
              <div>
                 <label className="premium-label">Mandate Holder (Agent)</label>
                 <select 
                    className="premium-input"
                    value={devMandateHolder}
                    onChange={(e) => setDevMandateHolder(e.target.value)}
                 >
                    <option value="">-- Select Agent --</option>
                    {agents.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                 </select>
              </div>

              <div className="pt-6 border-t border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900 mb-6 uppercase tracking-wider flex items-center"><Calculator size={14} className="mr-2"/> Financial & Contract Terms</h3>
                  
                  <div className="space-y-6">
                      <div>
                        <label className="premium-label">Required Deposit Terms</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 10% or $5000" 
                            className="premium-input"
                            value={devDepositTerms}
                            onChange={(e) => setDevDepositTerms(e.target.value)}
                        />
                      </div>
                      
                      <div>
                        <label className="premium-label">Standard Financing Terms</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 36 Months Interest Free" 
                            className="premium-input"
                            value={devFinancingTerms}
                            onChange={(e) => setDevFinancingTerms(e.target.value)}
                        />
                      </div>
                  </div>
              </div>

              <div className="flex justify-end space-x-3 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-bold text-sm transition-colors uppercase tracking-wide">Cancel</button>
                <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm shadow-lg transition-colors uppercase tracking-wide">
                    {isEditMode ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
