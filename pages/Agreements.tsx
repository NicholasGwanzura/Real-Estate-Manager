
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { SalesAgreement, AgreementStatus, AgreementTemplate } from '../types';
import { FileCheck, PenTool, Loader2, Download, Printer, Plus, FileText as FileIcon, Sparkles } from 'lucide-react';
import { generateAgreementClause } from '../services/geminiService';

export const Agreements: React.FC = () => {
  const { sales, agreements, createAgreement, updateAgreementStatus, currentUser, stands, developers, clients, templates, addTemplate } = useApp();
  
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState('');
  const [specialConditions, setSpecialConditions] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Template Form
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateContent, setNewTemplateContent] = useState('');

  // Filter sales that don't have agreements yet
  const salesWithoutAgreement = sales.filter(s => !agreements.some(a => a.saleId === s.id));

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
        content = `
    AGREEMENT OF SALE
    
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
    ${stand?.financingTerms || 'Standard terms apply.'}
    `;
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
    setSelectedSaleId('');
    setSpecialConditions('');
    setSelectedTemplateId('');
    alert("Agreement sent for approval.");
  };

  const handleDownloadPDF = (agreement: SalesAgreement) => {
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
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Agreement of Sale</h1>
            <p>${dev?.name} | FineEstate Management</p>
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
      <div className="flex justify-between items-center">
         <h1 className="text-2xl font-bold text-slate-900">Sales Agreements</h1>
         <button onClick={() => setShowTemplateModal(true)} className="flex items-center text-sm bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 shadow-md transition-all active:scale-95">
             <FileIcon size={16} className="mr-2"/> Manage Templates
         </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creation Panel */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100 h-fit">
          <h2 className="text-lg font-bold mb-6 flex items-center text-slate-900 tracking-tight">
            <PenTool className="mr-2 text-amber-500" size={20}/> Draft New Agreement
          </h2>
          
          <div className="space-y-6">
            <div>
              <label className="premium-label">Select Pending Sale</label>
              <select 
                className="premium-input"
                value={selectedSaleId}
                onChange={(e) => setSelectedSaleId(e.target.value)}
              >
                <option value="">-- Choose Sale --</option>
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
              <label className="premium-label">Special Conditions</label>
              <textarea 
                className="premium-input h-32 resize-none"
                value={specialConditions}
                onChange={(e) => setSpecialConditions(e.target.value)}
                placeholder="Enter manual clauses or use AI assistant..."
              />
            </div>

            <button 
              onClick={handleCreateAgreement}
              disabled={!selectedSaleId}
              className="w-full bg-slate-900 text-white py-4 rounded-lg font-bold uppercase tracking-wider text-sm hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200 mt-4"
            >
              Generate Agreement
            </button>
          </div>
        </div>

        {/* List Panel */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-100">
           <h2 className="text-lg font-bold mb-6 text-slate-900">Agreements Status</h2>
           <div className="space-y-4">
             {agreements.length === 0 ? (
                <div className="text-slate-400 text-center py-12 flex flex-col items-center border border-dashed border-slate-200 rounded-xl">
                   <FileIcon size={48} className="mb-4 opacity-20"/>
                   <p>No agreements created yet.</p>
                </div>
             ) : (
                agreements.map(agreement => {
                   const sale = sales.find(s => s.id === agreement.saleId);
                   const isApprover = currentUser.role === 'ADMIN';

                   return (
                     <div key={agreement.id} className="border border-slate-100 rounded-xl p-5 hover:border-slate-300 transition-colors group">
                        <div className="flex justify-between items-start mb-3">
                           <div>
                              <p className="font-bold text-slate-900">{sale?.clientName}</p>
                              <p className="text-xs text-slate-500 mt-1">{new Date(agreement.generatedDate).toLocaleDateString()}</p>
                           </div>
                           <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wide ${
                             agreement.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 
                             agreement.status === 'REJECTED' ? 'bg-red-100 text-red-700' : 
                             'bg-amber-100 text-amber-700'
                           }`}>
                             {agreement.status.replace('_', ' ')}
                           </span>
                        </div>
                        
                        {agreement.specialConditions && (
                          <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-lg mb-4 italic font-serif border border-slate-100/50">
                            "{agreement.specialConditions.substring(0, 100)}..."
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-2">
                           <button 
                             onClick={() => handleDownloadPDF(agreement)}
                             className="text-slate-600 hover:text-slate-900 text-xs flex items-center font-bold uppercase tracking-wider group-hover:underline"
                           >
                              <Printer size={14} className="mr-1.5"/> Print PDF
                           </button>
                           
                           {isApprover && agreement.status === AgreementStatus.PENDING_APPROVAL && (
                             <div className="flex space-x-2">
                               <button 
                                 onClick={() => updateAgreementStatus(agreement.id, AgreementStatus.APPROVED)}
                                 className="bg-slate-900 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md hover:bg-slate-800 transition-colors"
                               >
                                 Approve
                               </button>
                               <button 
                                 onClick={() => updateAgreementStatus(agreement.id, AgreementStatus.REJECTED)}
                                 className="bg-white border border-red-200 text-red-600 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md hover:bg-red-50 transition-colors"
                               >
                                 Reject
                               </button>
                             </div>
                           )}
                        </div>
                     </div>
                   );
                })
             )}
           </div>
        </div>
      </div>

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
                         <p className="text-[10px] text-slate-400 mb-2">Available variables: {'{{CLIENT_NAME}}, {{PRICE}}, {{DEVELOPER_NAME}}, {{STAND_NUMBER}}, {{SIZE}}'}</p>
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
