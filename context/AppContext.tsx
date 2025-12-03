
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { User, Developer, Stand, Sale, Payment, SalesAgreement, Commission, AuditLog, UserRole, StandStatus, AgreementStatus, Client, AgreementTemplate, AppNotification } from '../types';

interface AppState {
  currentUser: User;
  users: User[];
  clients: Client[];
  developers: Developer[];
  stands: Stand[];
  sales: Sale[];
  payments: Payment[];
  agreements: SalesAgreement[];
  templates: AgreementTemplate[];
  commissions: Commission[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
}

interface AppContextType extends AppState {
  setCurrentUser: (user: User) => void;
  addUser: (user: User) => void;
  addClient: (client: Client) => void;
  addDeveloper: (dev: Developer) => void;
  updateDeveloper: (dev: Developer) => void;
  deleteDeveloper: (id: string) => void;
  addStand: (stand: Stand) => void;
  addSale: (sale: Sale) => void;
  addPayment: (payment: Payment) => void;
  createAgreement: (agreement: SalesAgreement) => void;
  addTemplate: (template: AgreementTemplate) => void;
  updateAgreementStatus: (id: string, status: AgreementStatus) => void;
  markCommissionPaid: (id: string) => void;
  addLog: (action: string, details: string) => void;
  getAgentPerformance: (agentId: string) => { totalSales: number; count: number; totalCommission: number };
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  currentPath: string;
  navigate: (path: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Mock Data
const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'Admin User', role: UserRole.ADMIN, email: 'admin@fineestate.com' },
  { id: 'u2', name: 'John Doe', role: UserRole.AGENT, email: 'john@fineestate.com' },
  { id: 'u3', name: 'Jane Smith', role: UserRole.AGENT, email: 'jane@fineestate.com' },
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Alice Green', email: 'alice@example.com', phone: '555-0101', idNumber: 'ID987654321', address: '123 Maple St', dateAdded: '2023-10-01' },
  { id: 'c2', name: 'Robert Fox', email: 'bob@example.com', phone: '555-0102', idNumber: 'ID123456789', address: '456 Oak Ave', dateAdded: '2023-10-05' },
];

const INITIAL_DEVS: Developer[] = [
  { 
    id: 'd1', name: 'Sunset Properties', contactPerson: 'Mike Ross', email: 'mike@sunset.com', totalStands: 50,
    depositTerms: '10%', financingTerms: '24 Months', mandateHolderId: 'u2'
  },
  { 
    id: 'd2', name: 'Urban Living', contactPerson: 'Rachel Zane', email: 'rachel@urban.com', totalStands: 30,
    depositTerms: '$5000 Flat', financingTerms: '12 Months', mandateHolderId: 'u3'
  },
];

const INITIAL_STANDS: Stand[] = [
  { 
    id: 'd1-101', standNumber: '101', developerId: 'd1', price: 150000, size: 500, status: StandStatus.AVAILABLE,
    depositRequired: 15000, financingTerms: '24 Months'
  },
  { 
    id: 'd1-102', standNumber: '102', developerId: 'd1', price: 160000, size: 550, status: StandStatus.SOLD,
    depositRequired: 16000, financingTerms: '24 Months'
  },
  { 
    id: 'd1-103', standNumber: '103', developerId: 'd1', price: 155000, size: 510, status: StandStatus.AVAILABLE,
    depositRequired: 15500, financingTerms: '24 Months'
  },
  { 
    id: 'd2-201', standNumber: '201', developerId: 'd2', price: 200000, size: 400, status: StandStatus.AVAILABLE,
    depositRequired: 5000, financingTerms: '12 Months'
  },
];

const INITIAL_SALES: Sale[] = [
  { 
    id: 's1', standId: 'd1-102', developerId: 'd1', agentId: 'u2', 
    clientId: 'c1', clientName: 'Alice Green', saleDate: '2023-10-15', 
    salePrice: 160000, depositPaid: 16000, status: 'COMPLETED' 
  }
];

const INITIAL_COMMISSIONS: Commission[] = [
  {
    id: 'c1',
    saleId: 's1',
    agentId: 'u2',
    standId: 'd1-102',
    salePrice: 160000,
    totalAgencyCommission: 160000 * 0.05,
    agentCommission: 160000 * 0.025,
    status: 'PENDING',
    dateCreated: '2023-10-15'
  }
];

const INITIAL_PAYMENTS: Payment[] = [
  { id: 'p1', saleId: 's1', amount: 16000, date: '2023-10-15', reference: 'REF001', type: 'DEPOSIT' }
];

const INITIAL_TEMPLATES: AgreementTemplate[] = [
  {
    id: 't1',
    name: 'Standard Residential Agreement',
    content: `AGREEMENT OF SALE

ENTERED INTO BY AND BETWEEN:
{{DEVELOPER_NAME}} (The "Seller")
AND
{{CLIENT_NAME}} (The "Purchaser")
ID/Registration: {{CLIENT_ID}}

1. PROPERTY
Stand No: {{STAND_NUMBER}}
Development: {{DEVELOPER_NAME}}
Size: {{SIZE}} sqm

2. PURCHASE PRICE
The purchase price is $\{{PRICE}}.

3. DEPOSIT
A deposit of $\{{DEPOSIT}} has been paid.

4. TERMS
{{TERMS}}

5. GENERAL
This agreement constitutes the entire agreement between the parties.`,
    lastModified: '2023-10-01'
  }
];

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'n1',
    title: 'Welcome to FineEstate',
    message: 'System initialization complete. Dashboard is ready.',
    type: 'INFO',
    timestamp: new Date().toISOString(),
    read: false
  }
];

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User>(INITIAL_USERS[0]);
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [clients, setClients] = useState<Client[]>(INITIAL_CLIENTS);
  const [developers, setDevelopers] = useState<Developer[]>(INITIAL_DEVS);
  const [stands, setStands] = useState<Stand[]>(INITIAL_STANDS);
  const [sales, setSales] = useState<Sale[]>(INITIAL_SALES);
  const [payments, setPayments] = useState<Payment[]>(INITIAL_PAYMENTS);
  const [agreements, setAgreements] = useState<SalesAgreement[]>([]);
  const [templates, setTemplates] = useState<AgreementTemplate[]>(INITIAL_TEMPLATES);
  const [commissions, setCommissions] = useState<Commission[]>(INITIAL_COMMISSIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [currentPath, setCurrentPath] = useState('/');

  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      action,
      timestamp: new Date().toISOString(),
      details
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  const triggerNotification = (title: string, message: string, type: AppNotification['type'] = 'INFO', actionUrl?: string) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addUser = (user: User) => {
    setUsers([...users, user]);
    addLog('ADD_USER', `Added user ${user.name}`);
  }

  const addClient = (client: Client) => {
    setClients([...clients, client]);
    addLog('ADD_CLIENT', `Added client ${client.name}`);
  }

  const addDeveloper = (dev: Developer) => {
    setDevelopers([...developers, dev]);
    addLog('ADD_DEVELOPER', `Added developer ${dev.name}`);
  };

  const updateDeveloper = (updatedDev: Developer) => {
    setDevelopers(prev => prev.map(d => d.id === updatedDev.id ? updatedDev : d));
    addLog('UPDATE_DEVELOPER', `Updated developer ${updatedDev.name}`);
  };

  const deleteDeveloper = (id: string) => {
    const dev = developers.find(d => d.id === id);
    if(dev) {
        setDevelopers(prev => prev.filter(d => d.id !== id));
        // Note: Real app would need to handle cascading deletes or warnings
        addLog('DELETE_DEVELOPER', `Deleted developer ${dev.name}`);
    }
  };

  const addStand = (stand: Stand) => {
    setStands([...stands, stand]);
    addLog('ADD_STAND', `Added stand ${stand.standNumber} for developer ${stand.developerId}`);
  };

  const addSale = (sale: Sale) => {
    setSales([...sales, sale]);
    setStands(stands.map(s => s.id === sale.standId ? { ...s, status: StandStatus.SOLD } : s));
    
    const stand = stands.find(s => s.id === sale.standId);
    
    // Create Commission Record
    const totalComm = sale.salePrice * 0.05;
    const agentComm = sale.salePrice * 0.025;
    
    const newCommission: Commission = {
      id: `comm-${Date.now()}`,
      saleId: sale.id,
      agentId: sale.agentId,
      standId: sale.standId,
      salePrice: sale.salePrice,
      totalAgencyCommission: totalComm,
      agentCommission: agentComm,
      status: 'PENDING',
      dateCreated: new Date().toISOString().split('T')[0]
    };
    setCommissions(prev => [...prev, newCommission]);

    addLog('ADD_SALE', `Sold stand ${sale.standId} to ${sale.clientName}. Commission generated.`);

    // TRIGGER ALERTS
    // 1. Stand Availability Alert
    triggerNotification(
      'Stand Sold Alert',
      `Stand #${stand?.standNumber} has been officially SOLD to ${sale.clientName}. Inventory updated.`,
      'ALERT',
      '/developers'
    );

    // 2. Payment Pending Alert
    if (sale.depositPaid > 0) {
      triggerNotification(
        'Payment Pending Verification',
        `A deposit of $${sale.depositPaid.toLocaleString()} was recorded for Stand #${stand?.standNumber}. Please verify receipt in Finance.`,
        'WARNING',
        '/finance'
      );
    }
  };

  const addPayment = (payment: Payment) => {
    setPayments([...payments, payment]);
    if(payment.type === 'DEPOSIT') {
       setSales(prev => prev.map(s => s.id === payment.saleId ? {...s, depositPaid: s.depositPaid + payment.amount} : s));
    }
    addLog('ADD_PAYMENT', `Payment of ${payment.amount} for sale ${payment.saleId}`);
    
    // Notify payment received
    triggerNotification(
      'Payment Received',
      `Payment of $${payment.amount.toLocaleString()} logged for Sale ${payment.reference}.`,
      'SUCCESS'
    );
  };

  const createAgreement = (agreement: SalesAgreement) => {
    setAgreements([...agreements, agreement]);
    addLog('CREATE_AGREEMENT', `Created agreement for sale ${agreement.saleId}`);
  };

  const addTemplate = (template: AgreementTemplate) => {
    setTemplates([...templates, template]);
    addLog('ADD_TEMPLATE', `Added agreement template: ${template.name}`);
  };

  const updateAgreementStatus = (id: string, status: AgreementStatus) => {
    setAgreements(agreements.map(a => a.id === id ? { ...a, status, approvedBy: status === AgreementStatus.APPROVED ? currentUser.id : undefined } : a));
    addLog('UPDATE_AGREEMENT', `Agreement ${id} status changed to ${status}`);
    
    const agr = agreements.find(a => a.id === id);
    if(agr && status === AgreementStatus.APPROVED) {
        triggerNotification('Agreement Approved', `Sales Agreement ${id} has been approved.`, 'SUCCESS');
    }
  };

  const markCommissionPaid = (id: string) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: 'PAID' } : c));
    addLog('PAY_COMMISSION', `Commission ${id} marked as PAID`);
  };

  const getAgentPerformance = (agentId: string) => {
    const agentSales = sales.filter(s => s.agentId === agentId);
    const agentComms = commissions.filter(c => c.agentId === agentId);
    
    return {
      totalSales: agentSales.reduce((acc, curr) => acc + curr.salePrice, 0),
      count: agentSales.length,
      totalCommission: agentComms.reduce((acc, curr) => acc + curr.agentCommission, 0)
    };
  };

  const navigate = (path: string) => {
    setCurrentPath(path);
  };

  return (
    <AppContext.Provider value={{
      currentUser, setCurrentUser, users, addUser, clients, addClient, developers, updateDeveloper, deleteDeveloper, stands, sales, payments, agreements, commissions, auditLogs, templates, notifications,
      addDeveloper, addStand, addSale, addPayment, createAgreement, addTemplate, updateAgreementStatus, markCommissionPaid, addLog, getAgentPerformance, markNotificationRead, clearNotifications,
      currentPath, navigate
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
