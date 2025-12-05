
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SalesAgreement, AgreementStatus, AgreementTemplate } from '../types';
import { FileCheck, PenTool, Loader2, Download, Printer, Plus, FileText as FileIcon, Sparkles, Search, Eye, Archive, Clock, CheckCircle, XCircle, Layout } from 'lucide-react';
import { generateAgreementClause } from '../services/geminiService';

export const Agreements: React.FC = () => {
  const { sales, agreements, createAgreement, updateAgreementStatus, currentUser, stands, developers, clients, templates, addTemplate } = useApp();
  
  const [activeTab, setActiveTab] = useState<'draft' | 'repository'>('repository');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drafting State
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [specialConditions, setSpecialConditions] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Template Modal State
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  // View Document State
  const [viewDocument, setViewDocument] = useState<SalesAgreement | null>(null);

  // Filter sales that don't have agreements yet
  const salesWithoutAgreement = sales.filter(s => !agreements.some(a => a.saleId === s.id) && s.status !== 'CANCELLED');

  // Filter Agreements for Repository
  const filteredAgreements = agreements.filter(a => {
      const sale = sales.find(s => s.id === a.saleId);
      const client = clients.find(c => c.id === sale?.clientId);
      const stand = stands.find(s => s.id === sale?.standId);
      const search = searchTerm.toLowerCase();

      return (
          client?.name.toLowerCase().includes(search) ||
          stand?.standNumber.toLowerCase().includes(search) ||
          a.id.toLowerCase().includes(search)
      );
  }).sort((a,b) => new Date(b.generatedDate).getTime() - new Date(a.generatedDate).getTime());

  const handleGenerateClause = async () => {
    if (!aiPrompt) return;
    setIsGenerating(true);
    const clause = await generateAgreementClause(aiPrompt);
    setSpecialConditions(prev => prev ? `${prev}\n\n${clause}` : clause);
    setIsGenerating(false);
    setAiPrompt('');
  };

  const handleSaveTemplate = () => {
    if (!newTemplateName || !newTemplateContent) return;
    addTemplate({
      id: `tpl-${Date.now()}`,
      name: newTemplateName,
      content: newTemplateContent,
      lastModified: new Date().toISOString()
    });
    setNewTemplateName('');
    setNewTemplateContent('');
    setShowTemplateModal(false);
  };

  const handleCreateAgreement = () => {
    if (!selectedSaleId) return;
    
    // Auto-populate some content
    const sale = sales.find(s => s.id === selectedSaleId);
    const stand = stands.find(s => s.id === sale?.standId);
    const dev = developers.find(d => d.id === sale?.developerId);
    const client = clients.find(c => c.id === sale?.clientId);
    
    let content = '';

    if (selectedTemplateId) {
       const template = templates.find(t => t.id === selectedTemplateId);
       if (template) {
         content = template.content
           .replace(/{{CLIENT_NAME}}/g, client?.name || '')
           .replace(/{{CLIENT_ID}}/g, client?.idNumber || '')
           .replace(/{{DEVELOPER_NAME}}/g, dev?.name || '')
           .replace(/{{STAND_NUMBER}}/g, stand?.standNumber || '')
           .replace(/{{SIZE}}/g, stand?.size.toString() || '')
           .replace(/{{PRICE}}/g, sale?.salePrice.toLocaleString() || '')
           .replace(/{{DEPOSIT}}/g, sale?.depositPaid.toLocaleString() || '')
           .replace(/{{TERMS}}/g, stand?.financingTerms || 'Standard terms apply.');
       }
    } else {
        // Fallback default content
        content = `AGREEMENT OF SALE

ENTERED INTO BY AND BETWEEN:
${dev?.name} (The "Seller")
AND
${client?.name} (The "Purchaser")
ID/Registration: ${client?.idNumber}

1. PROPERTY
Stand No: ${stand?.standNumber}
Development: ${dev?.name}
Size: ${stand?.size} sqm

2. PURCHASE PRICE
The purchase price is $${sale?.salePrice.toLocaleString()}.

3. DEPOSIT
A deposit of $${sale?.depositPaid.toLocaleString()} has been paid.

4. TERMS
${stand?.financingTerms || 'Standard terms apply.'}`;
    }

    const newAgreement: SalesAgreement = {
      id: `agr-${Date.now()}`,
      saleId: selectedSaleId,
      content: content, 
      specialConditions,
      generatedDate: new Date().toISOString(),
      status: AgreementStatus.PENDING_APPROVAL
    };
    
    createAgreement(newAgreement);
    
    // Reset and Move to Repository
    setSelectedSaleId('');
    setSpecialConditions('');
    setSelectedTemplateId('');
    setActiveTab('repository');
    alert("Agreement successfully generated and saved to the Repository.");
  };

  const handlePrintPDF = (agreement: SalesAgreement) => {
    const sale = sales.find(s => s.id === agreement.saleId);
    const client = clients.find(c => c.id === sale?.clientId);
    const dev = developers.find(d => d.id === sale?.developerId);

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        alert("Please allow popups to download PDF");
        return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Agreement - ${client?.name}</title>
          <style>
            body { font-family: 'Times New Roman', serif; padding: 40px; line-height: 1.6; color: #333; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px; }
            h1 { font-size: 24px; text-transform: uppercase; letter-spacing: 2px; }
            .section { margin-bottom: 20px; }
            .section-title { font-weight: bold; text-decoration: underline; font-size: 14px; margin-bottom: 10px; }
            .conditions { background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; font-style: italic; }
            .signatures { margin-top: 60px; display: flex; justify-content: space-between; }
            .sign-box { border-top: 1px solid #000; width: 40%; padding-top: 10px; }
            .content { white-space: pre-wrap; font-family: inherit; }
            .footer { margin-top: 40px; font-size: 10px; text-align: center; color: #888; border-top: 1px solid #eee; padding-top: 10px;}
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Agreement of Sale</h1>
            <p>${dev?.name} | Real Estate Plus</p>
          </div>
          
          <div class="content">${agreement.content}</div>

          ${agreement.specialConditions ? `
          <div class="section">
             <div class="section-title">SPECIAL CONDITIONS</div>
             <div class="conditions">
                <div class="content">${agreement.specialConditions}</div>
             </div>
          </div>` : ''}

          <div class="signatures">
            <div class="sign-box">Signed by Purchaser<br/>Date:</div>
            <div class="sign-box">Signed by Seller<br/>Date:</div>
          </div>

          <div class="footer">
             Generated by Real Estate Plus System | Ref: ${agreement.id} | ${agreement.generatedDate}
          </div>

          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-900">Agreements & Contracts</h1>
            <p className="text-sm text-slate-500">Generate, store, and manage legal documentation.</p>
         </div>
         <div className="flex gap-2">
             <button onClick={() => setShowTemplateModal(true)} className="flex items-center text-sm bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-50 transition-all font-medium">
                 <Layout size={16} className="mr-2"/> Templates
             </button>
         </div>
      </div>
      
      {/* Tabs */}
      <div className="flex p-1 bg-white border border-slate-200 rounded-xl w-full md:w-fit shadow-sm">
         <button 
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center whitespace-nowrap ${activeTab === 'draft' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('draft')}
         >
            <PenTool size={16} className="mr-2"/> Drafting Desk
         </button>
         <button 
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold transition-all duration-200 flex items-center justify-center whitespace-nowrap ${activeTab === 'repository' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}`}
            onClick={() => setActiveTab('repository')}
         >
            <Archive size={16} className="mr-2"/> Document Repository
         </button>
      </div>

      {/* DRAFTING DESK */}
      {activeTab === 'draft' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4">
            <div className="lg:col-span-2 bg-white p-8 rounded-xl shadow-sm border border-slate-100 h-fit">
                <div className="border-b border-slate-100 pb-4 mb-6">
                    <h2 className="text-lg font-bold text-slate-900">Draft New Agreement</h2>
                    <p className="text-sm text-slate-500">Select a sale transaction to begin.</p>
                </div>
            
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                        <label className="premium-label">Select Pending Sale</label>
                        <select 
                            className="premium-input"
                            value={selectedSaleId}
                            onChange={(e) => setSelectedSaleId(e.target.value)}
                        >
                            <option value="">-- Choose Sale --</option>
                            {salesWithoutAgreement.length === 0 && <option disabled>No pending sales found</option>}
                            {salesWithoutAgreement.map(s => {
                                const stand = stands.find(st => st.id === s.standId);
                                return <option key={s.id} value={s.id}>{s.clientName} - Stand {stand?.standNumber}</option>;
                            })}
                        </select>
                        </div>

                        <div>
                        <label className="premium-label">Select Template</label>
                        <select 
                            className="premium-input"
                            value={selectedTemplateId}
                            onChange={(e) => setSelectedTemplateId(e.target.value)}
                        >
                            <option value="">-- Use Default Format --</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        </div>
                    </div>

                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                    <label className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-2 flex items-center">
                        <Sparkles size={12} className="mr-1.5"/> AI Legal Assistant
                    </label>
                    <div className="flex gap-2">
                        <input 
                        type="text" 
                        className="flex-1 bg-white border-0 rounded-lg p-2 text-sm shadow-sm focus:ring-2 focus:ring-amber-500 placeholder-slate-400"
                        placeholder="e.g. 'Draft a clause for 6 months delay penalty'"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <button 
                        onClick={handleGenerateClause}
                        disabled={isGenerating}
                        className="bg-amber-500 text-white px-3 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 disabled:opacity-50 transition-colors"
                        >
                        {isGenerating ? <Loader2 className="animate-spin" size={16}/> : 'Draft'}
                        </button>
                    </div>
                    </div>

                    <div>
                    <label className="premium-label">Special Conditions / Clauses</label>
                    <textarea 
                        className="premium-input h-48 resize-none"
                        value={specialConditions}
                        onChange={(e) => setSpecialConditions(e.target.value)}
                        placeholder="Enter manual clauses or use AI assistant..."
                    />
                    </div>

                    <button 
                    onClick={handleCreateAgreement}
                    disabled={!selectedSaleId}
                    className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200 flex justify-center items-center"
                    >
                       <FileCheck size={18} className="mr-2" /> Generate & Save to Repository
                    </button>
                </div>
            </div>
            
            <div className="lg:col-span-1 bg-slate-50 p-6 rounded-xl border border-slate-200/60 h-fit">
                <h3 className="font-bold text-slate-900 mb-4">Process Guide</h3>
                <ul className="space-y-4 text-sm text-slate-600">
                    <li className="flex items-start">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">1</span>
                        Select a sale transaction that requires an agreement.
                    </li>
                    <li className="flex items-start">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">2</span>
                        Choose a pre-defined template or start with the standard legal boilerplate.
                    </li>
                    <li className="flex items-start">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">3</span>
                        Add any specific clauses. You can use the AI Assistant to draft legal phrasing for you.
                    </li>
                    <li className="flex items-start">
                        <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold mr-3 flex-shrink-0">4</span>
                        Click "Generate & Save". The document will be moved to the Repository for tracking and printing.
                    </li>
                </ul>
            </div>
        </div>
      )}

      {/* DOCUMENT REPOSITORY */}
      {activeTab === 'repository' && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center text-amber-500 font-bold">
                    <Archive size={20} className="mr-2"/> Stored Documents
                </div>
                <div className="relative w-full md:w-64">
                    <input 
                        type="text" 
                        placeholder="Search Repository..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4 font-bold">Generated Date</th>
                            <th className="px-6 py-4 font-bold">Reference</th>
                            <th className="px-6 py-4 font-bold">Client / Property</th>
                            <th className="px-6 py-4 font-bold text-center">Status</th>
                            <th className="px-6 py-4 font-bold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredAgreements.length === 0 ? (
                             <tr><td colSpan={5} className="p-12 text-center text-slate-400 italic">No agreements found in repository.</td></tr>
                        ) : (
                            filteredAgreements.map(agreement => {
                                const sale = sales.find(s => s.id === agreement.saleId);
                                const stand = stands.find(st => st.id === sale?.standId);
                                const isApprover = currentUser.role === 'ADMIN';

                                return (
                                    <tr key={agreement.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4 text-slate-500 font-mono text-xs">
                                            {new Date(agreement.generatedDate).toLocaleDateString()}
                                            <span className="block text-[10px] text-slate-400">{new Date(agreement.generatedDate).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                            {agreement.id}
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-slate-900">{sale?.clientName}</p>
                                            <p className="text-xs text-slate-500">Stand #{stand?.standNumber}</p>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {agreement.status === 'APPROVED' ? (
                                                <span className="inline-flex items-center text-green-700 bg-green-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase border border-green-100">
                                                    <CheckCircle size={10} className="mr-1"/> Signed
                                                </span>
                                            ) : agreement.status === 'REJECTED' ? (
                                                <span className="inline-flex items-center text-red-700 bg-red-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase border border-red-100">
                                                    <XCircle size={10} className="mr-1"/> Void
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center text-amber-700 bg-amber-50 px-2 py-1 rounded-full text-[10px] font-bold uppercase border border-amber-100">
                                                    <Clock size={10} className="mr-1"/> Draft
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end items-center space-x-3">
                                                <button 
                                                    onClick={() => setViewDocument(agreement)}
                                                    className="text-slate-500 hover:text-amber-600 flex items-center text-xs font-bold uppercase tracking-wider transition-colors"
                                                    title="View Document"
                                                >
                                                    <Eye size={16} className="mr-1"/> View
                                                </button>
                                                
                                                {isApprover && agreement.status === AgreementStatus.PENDING_APPROVAL && (
                                                    <div className="flex space-x-1 border-l border-slate-200 pl-3">
                                                        <button 
                                                            onClick={() => updateAgreementStatus(agreement.id, AgreementStatus.APPROVED)}
                                                            className="p-1 text-green-600 hover:bg-green-50 rounded"
                                                            title="Mark Signed/Approved"
                                                        >
                                                            <CheckCircle size={16}/>
                                                        </button>
                                                        <button 
                                                            onClick={() => updateAgreementStatus(agreement.id, AgreementStatus.REJECTED)}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                            title="Reject"
                                                        >
                                                            <XCircle size={16}/>
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* VIEW DOCUMENT MODAL */}
      {viewDocument && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
             <div className="bg-white h-[85vh] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                 {/* Toolbar */}
                 <div className="p-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
                     <div>
                         <h3 className="font-bold text-lg">Document Viewer</h3>
                         <p className="text-xs text-slate-400 font-mono">{viewDocument.id}</p>
                     </div>
                     <div className="flex items-center gap-3">
                         <button 
                            onClick={() => handlePrintPDF(viewDocument)}
                            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center transition-colors"
                         >
                             <Printer size={16} className="mr-2"/> Print / Download
                         </button>
                         <button 
                            onClick={() => setViewDocument(null)}
                            className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded-lg transition-colors"
                         >
                             <XCircle size={20}/>
                         </button>
                     </div>
                 </div>

                 {/* Paper Preview */}
                 <div className="flex-1 overflow-y-auto bg-slate-100 p-8 flex justify-center">
                     <div className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-xl p-[20mm] text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">
                         <div className="text-center border-b-2 border-black pb-4 mb-8">
                            <h1 className="text-2xl font-bold uppercase tracking-widest">Agreement of Sale</h1>
                            <p className="text-slate-500 font-serif italic">Real Estate Plus Management</p>
                         </div>
                         {viewDocument.content}
                         
                         {viewDocument.specialConditions && (
                             <div className="mt-8 pt-4 border-t border-slate-200">
                                 <h4 className="font-bold underline mb-2">SPECIAL CONDITIONS</h4>
                                 <div className="italic text-slate-600 bg-slate-50 p-4 border border-slate-100">
                                     {viewDocument.specialConditions}
                                 </div>
                             </div>
                         )}

                         <div className="mt-16 flex justify-between pt-8 border-t border-black">
                            <div className="w-1/3 border-t border-black pt-2 text-center text-xs uppercase">Purchaser Signature</div>
                            <div className="w-1/3 border-t border-black pt-2 text-center text-xs uppercase">Seller Signature</div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all">
            <div className="bg-white p-8 rounded-2xl w-full max-w-2xl shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-slate-900">Manage Agreement Templates</h3>
                    <button onClick={() => setShowTemplateModal(false)} className="text-slate-400 hover:text-slate-600 transition-colors"><Plus className="rotate-45" size={24}/></button>
                </div>
                
                <div className="space-y-6">
                    <div>
                        <label className="premium-label">Template Name</label>
                        <input 
                            type="text" 
                            className="premium-input" 
                            placeholder="e.g. Standard Commercial Lease"
                            value={newTemplateName}
                            onChange={(e) => setNewTemplateName(e.target.value)}
                        />
                    </div>
                    <div>
                         <label className="premium-label flex justify-between">
                            Template Content 
                         </label>
                         <p className="text-[10px] text-slate-400 mb-2">Available variables: {'{{CLIENT_NAME}}, {{PRICE}}, {{DEVELOPER_NAME}}, {{STAND_NUMBER}}, {{SIZE}}, {{TERMS}}'}</p>
                         <textarea 
                            className="premium-input h-48 font-mono text-sm leading-relaxed"
                            placeholder="Paste agreement text here..."
                            value={newTemplateContent}
                            onChange={(e) => setNewTemplateContent(e.target.value)}
                         />
                    </div>
                    <button 
                        onClick={handleSaveTemplate}
                        className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-800 shadow-lg shadow-slate-200"
                    >
                        Save Template
                    </button>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Existing Templates</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {templates.map(t => (
                            <div key={t.id} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100 hover:border-slate-300 transition-colors">
                                <span className="font-medium text-slate-700">{t.name}</span>
                                <span className="text-slate-400 text-[10px] font-mono">{t.id}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
