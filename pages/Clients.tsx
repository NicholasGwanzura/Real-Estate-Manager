
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Search, Mail, Phone, MapPin, User as UserIcon, X, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { Client, UserRole } from '../types';

export const Clients: React.FC = () => {
  const { clients, addClient, deleteClient, sales, stands, developers, currentUser } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [historyModalClient, setHistoryModalClient] = useState<Client | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [idNumber, setIdNumber] = useState('');
  const [address, setAddress] = useState('');

  const isAdmin = currentUser.role === UserRole.ADMIN;

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.idNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: `c-${Date.now()}`,
      name,
      email,
      phone,
      idNumber,
      address,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    addClient(newClient);
    setIsModalOpen(false);
    // Reset
    setName(''); setEmail(''); setPhone(''); setIdNumber(''); setAddress('');
  };

  const handleDelete = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm("Are you sure you want to delete this client? This cannot be undone.")) {
          deleteClient(id);
      }
  };

  const getClientSales = (clientId: string) => {
    return sales.filter(s => s.clientId === clientId);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">Client Management</h1>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">
          <Plus size={18} />
          <span>Add Client</span>
        </button>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
          <Search className="text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search clients by name, email or ID..." 
            className="flex-1 focus:outline-none text-slate-700 bg-transparent border-none placeholder-slate-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClients.map(client => {
              const clientSalesCount = getClientSales(client.id).length;
              return (
              <div key={client.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:border-amber-200 transition-colors group relative">
                  {isAdmin && clientSalesCount === 0 && (
                      <button 
                        onClick={(e) => handleDelete(e, client.id)}
                        className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        title="Delete Client"
                      >
                          <Trash2 size={16} />
                      </button>
                  )}
                  
                  <div className="flex items-center space-x-4 mb-4">
                      <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 group-hover:bg-amber-100 group-hover:text-amber-600 transition-colors">
                          <UserIcon size={24} />
                      </div>
                      <div>
                          <h3 className="font-bold text-slate-900">{client.name}</h3>
                          <p className="text-xs text-slate-500">ID: {client.idNumber}</p>
                      </div>
                  </div>
                  
                  <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex items-center">
                          <Mail size={14} className="mr-2 text-slate-400" /> {client.email}
                      </div>
                      <div className="flex items-center">
                          <Phone size={14} className="mr-2 text-slate-400" /> {client.phone}
                      </div>
                      <div className="flex items-center">
                          <MapPin size={14} className="mr-2 text-slate-400" /> {client.address}
                      </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-slate-50 text-xs flex justify-between items-center">
                      <span className="text-slate-400">Purchases: {clientSalesCount}</span>
                      <button 
                        onClick={() => setHistoryModalClient(client)}
                        className="text-amber-600 font-bold uppercase tracking-wider hover:underline"
                      >
                        View History
                      </button>
                  </div>
              </div>
          )})}
      </div>

      {/* New Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white p-8 rounded-2xl w-full max-w-lg shadow-2xl">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-xl font-bold text-slate-900">Add New Client</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="premium-label">Full Name</label>
                        <input required type="text" className="premium-input" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <label className="premium-label">Phone</label>
                            <input required type="tel" className="premium-input" value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                        <div>
                            <label className="premium-label">ID / Passport</label>
                            <input required type="text" className="premium-input" value={idNumber} onChange={e => setIdNumber(e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <label className="premium-label">Email</label>
                        <input required type="email" className="premium-input" value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div>
                        <label className="premium-label">Address</label>
                        <textarea className="premium-input" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    
                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 text-slate-600 hover:bg-slate-50 rounded-lg font-bold text-sm uppercase tracking-wide">Cancel</button>
                        <button type="submit" className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-bold text-sm uppercase tracking-wide shadow-lg">Save Client</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* History Modal */}
      {historyModalClient && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[80vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50">
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">{historyModalClient.name}</h2>
                        <div className="flex items-center text-sm text-slate-500 mt-1 space-x-3">
                           <span className="flex items-center"><Mail size={12} className="mr-1"/> {historyModalClient.email}</span>
                           <span className="flex items-center"><Phone size={12} className="mr-1"/> {historyModalClient.phone}</span>
                        </div>
                    </div>
                    <button onClick={() => setHistoryModalClient(null)} className="text-slate-400 hover:text-slate-600"><X size={24}/></button>
                </div>
                
                <div className="p-6 overflow-y-auto">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">Transaction History</h3>
                    
                    {getClientSales(historyModalClient.id).length === 0 ? (
                        <div className="text-center py-8 text-slate-400 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                            No sales records found for this client.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {getClientSales(historyModalClient.id).map(sale => {
                                const stand = stands.find(s => s.id === sale.standId);
                                const dev = developers.find(d => d.id === sale.developerId);
                                return (
                                    <div key={sale.id} className="border border-slate-100 rounded-lg p-4 hover:bg-slate-50 transition-colors">
                                        <div className="flex justify-between mb-2">
                                            <span className="font-bold text-slate-900">{dev?.name} - Stand {stand?.standNumber}</span>
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${sale.status === 'COMPLETED' ? 'bg-green-100 text-green-700' : sale.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'}`}>{sale.status}</span>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-3">
                                            <div className="text-slate-500 flex items-center">
                                                <Calendar size={14} className="mr-2"/> {sale.saleDate}
                                            </div>
                                            <div className="text-slate-900 font-medium flex items-center justify-end">
                                                <DollarSign size={14} className="mr-1"/> {sale.salePrice.toLocaleString()}
                                            </div>
                                            <div className="text-slate-500 text-xs col-span-2 pt-2 border-t border-slate-100 mt-1">
                                                Terms: {stand?.financingTerms || 'N/A'} • Deposit Paid: ${sale.depositPaid.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center text-sm">
                    <span className="text-slate-500">Client since {historyModalClient.dateAdded}</span>
                    <span className="font-bold text-slate-900">
                        Total Spend: ${getClientSales(historyModalClient.id).filter(s => s.status !== 'CANCELLED').reduce((acc, s) => acc + s.salePrice, 0).toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};
