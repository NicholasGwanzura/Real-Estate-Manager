
import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { User, Developer, Stand, Sale, Payment, SalesAgreement, Commission, AuditLog, UserRole, StandStatus, AgreementStatus, Client, AgreementTemplate, AppNotification, Backup, ReleaseNote } from '../types';

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
  backups: Backup[];
  releaseNotes: ReleaseNote[];
  isAutoBackupEnabled: boolean;
  isAuthenticated: boolean;
}

interface AppContextType extends AppState {
  setCurrentUser: (user: User) => void;
  addUser: (user: User) => void;
  deleteUser: (id: string) => void;
  addClient: (client: Client) => void;
  deleteClient: (id: string) => void;
  addDeveloper: (dev: Developer) => void;
  updateDeveloper: (dev: Developer) => void;
  deleteDeveloper: (id: string) => void;
  addStand: (stand: Stand) => void;
  deleteStand: (id: string) => void;
  addSale: (sale: Sale) => void;
  cancelSale: (id: string) => void;
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
  createBackup: () => void;
  toggleAutoBackup: (enabled: boolean) => void;
  downloadBackup: (backupId?: string) => void;
  importDatabase: (jsonString: string) => boolean;
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  register: (name: string, email: string, pass: string) => void;
  addReleaseNote: (note: ReleaseNote) => void;
  lastSaved: Date;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// --- MOCK DATA SEEDING (Zimbabwe Context) ---

const INITIAL_USERS: User[] = [
  { id: 'u1', name: 'System Admin', role: UserRole.ADMIN, email: 'admin', password: 'admin123' },
  { id: 'u2', name: 'Sarah Mahachi', role: UserRole.AGENT, email: 'sarah@fineestate.co.zw', password: 'password' },
  { id: 'u3', name: 'Tonderai Gumbo', role: UserRole.AGENT, email: 'tonderai@fineestate.co.zw', password: 'password' }
];

const INITIAL_DEVS: Developer[] = [
  { id: 'dev1', name: 'WestProp Holdings', contactPerson: 'Michael M.', email: 'sales@westprop.co.zw', totalStands: 150, depositTerms: '30%', financingTerms: '12 Months Interest Free', mandateHolderId: 'u2' },
  { id: 'dev2', name: 'ZimRe Properties', contactPerson: 'Rudo N.', email: 'info@zimre.co.zw', totalStands: 300, depositTerms: '$5000 Fixed', financingTerms: '36 Months @ 12% p.a', mandateHolderId: 'u3' },
  { id: 'dev3', name: 'Shelter Zimbabwe', contactPerson: 'Francis B.', email: 'projects@shelter.co.zw', totalStands: 500, depositTerms: '25%', financingTerms: '24 Months', mandateHolderId: 'u2' }
];

const INITIAL_CLIENTS: Client[] = [
  { id: 'c1', name: 'Tendai Mhofu', email: 'tendai.m@gmail.com', phone: '0772123456', idNumber: '63-123456-F-12', address: '12 Samora Machel Ave, Harare', dateAdded: '2023-08-15' },
  { id: 'c2', name: 'Farai Gwaradzimba', email: 'farai.g@hotmail.com', phone: '0712987654', idNumber: '42-987654-H-42', address: '45 Borrowdale Brooke', dateAdded: '2023-09-01' },
  { id: 'c3', name: 'Chipo Moyo', email: 'chipo.moyo@yahoo.com', phone: '0733555444', idNumber: '29-555444-Y-29', address: '56 Jason Moyo, Bulawayo', dateAdded: '2023-09-10' },
  { id: 'c4', name: 'Kudzai Tsvangirai', email: 'kudzai.t@gmail.com', phone: '0774000111', idNumber: '63-000111-K-63', address: '89 The Grange, Harare', dateAdded: '2023-09-20' },
  { id: 'c5', name: 'Blessing Dube', email: 'b.dube@corporate.co.zw', phone: '0782222333', idNumber: '08-222333-B-08', address: '12 Hillside, Bulawayo', dateAdded: '2023-10-01' },
  { id: 'c6', name: 'Nyasha Zhou', email: 'nyasha.z@gmail.com', phone: '0773999888', idNumber: '48-999888-N-48', address: '15 Highlands, Harare', dateAdded: '2023-10-15' },
  { id: 'c7', name: 'Tinashe Mutasa', email: 'tinashe.m@outlook.com', phone: '0712777666', idNumber: '75-777666-T-75', address: '33 Greystone Park', dateAdded: '2023-11-01' },
  { id: 'c8', name: 'Simba Chiwenga', email: 'simba.c@gmail.com', phone: '0772333222', idNumber: '63-333222-S-63', address: '14 Glen Lorne, Harare', dateAdded: '2023-11-05' },
  { id: 'c9', name: 'Rudo Katsande', email: 'rudo.k@gmail.com', phone: '0733111000', idNumber: '50-111000-R-50', address: '90 Avondale, Harare', dateAdded: '2023-11-20' },
  { id: 'c10', name: 'Tanaka Biti', email: 'tanaka.b@gmail.com', phone: '0774555666', idNumber: '24-555666-T-24', address: '22 Mt Pleasant', dateAdded: '2023-12-01' },
  { id: 'c11', name: 'Mercy Ndlovu', email: 'mercy.n@gmail.com', phone: '0712888999', idNumber: '08-888999-M-08', address: '5 Famona, Bulawayo', dateAdded: '2023-12-10' },
  { id: 'c12', name: 'John Doe (Investor)', email: 'john.d@invest.com', phone: '0772000000', idNumber: '63-000000-J-63', address: '101 Rolf Valley', dateAdded: '2024-01-05' }
];

// Generate Stands
const generateStands = () => {
  const stands: Stand[] = [];
  // WestProp (High Value) - Pokugara
  for(let i=100; i<=115; i++) {
    stands.push({ id: `wp-${i}`, standNumber: i.toString(), developerId: 'dev1', price: 120000, size: 2000, status: StandStatus.AVAILABLE, depositRequired: 36000, financingTerms: '12 Months Interest Free' });
  }
  // ZimRe (Mid Range) - Ruwa
  for(let i=500; i<=530; i++) {
    stands.push({ id: `zr-${i}`, standNumber: i.toString(), developerId: 'dev2', price: 45000, size: 800, status: StandStatus.AVAILABLE, depositRequired: 5000, financingTerms: '36 Months @ 12% p.a' });
  }
  // Shelter (Affordable) - Sunway
  for(let i=1200; i<=1250; i++) {
    stands.push({ id: `sz-${i}`, standNumber: i.toString(), developerId: 'dev3', price: 25000, size: 400, status: StandStatus.AVAILABLE, depositRequired: 6250, financingTerms: '24 Months' });
  }
  return stands;
};

const INITIAL_STANDS = generateStands();

// Sales & Payments seeding
const seedTransactions = (stands: Stand[]) => {
    const sales: Sale[] = [];
    const payments: Payment[] = [];
    const commissions: Commission[] = [];
    
    // Helper to create transaction
    const createTrans = (
        clientIdx: number, 
        standId: string, 
        saleDate: string, 
        amountPaid: number, 
        isFinished: boolean,
        agentId: string = 'u2'
    ) => {
        const stand = stands.find(s => s.id === standId);
        if(!stand) return;
        const client = INITIAL_CLIENTS[clientIdx];
        
        // Update stand status
        stand.status = StandStatus.SOLD;
        
        const saleId = `sale-${Date.now()}-${clientIdx}`;
        const totalComm = stand.price * 0.05;
        const agentComm = stand.price * 0.025;

        sales.push({
            id: saleId,
            standId: stand.id,
            developerId: stand.developerId,
            agentId: agentId,
            clientId: client.id,
            clientName: client.name,
            saleDate: saleDate,
            salePrice: stand.price,
            depositPaid: stand.depositRequired || 0,
            status: 'COMPLETED'
        });

        commissions.push({
            id: `comm-${saleId}`,
            saleId: saleId,
            agentId: agentId,
            standId: stand.id,
            salePrice: stand.price,
            totalAgencyCommission: totalComm,
            agentCommission: agentComm,
            status: isFinished ? 'PAID' : 'PENDING',
            dateCreated: saleDate
        });

        // Add Payments
        // 1. Deposit
        payments.push({
            id: `pay-${saleId}-dep`,
            saleId: saleId,
            amount: stand.depositRequired || (stand.price * 0.25),
            date: saleDate,
            reference: `DEP-${Math.floor(Math.random()*10000)}`,
            manualReceiptNo: `BK-${Math.floor(Math.random()*1000)}`,
            type: 'DEPOSIT'
        });

        // 2. Installments if applicable
        const remaining = amountPaid - (stand.depositRequired || 0);
        if (remaining > 0) {
             const installments = isFinished ? 1 : 3; 
             const amtPerInst = remaining / installments;
             
             for(let k=1; k<=installments; k++) {
                 // dates 1 month apart
                 const pDate = new Date(saleDate);
                 pDate.setMonth(pDate.getMonth() + k);
                 
                 payments.push({
                    id: `pay-${saleId}-inst-${k}`,
                    saleId: saleId,
                    amount: amtPerInst,
                    date: pDate.toISOString().split('T')[0],
                    reference: `INST-${Math.floor(Math.random()*10000)}`,
                    manualReceiptNo: `BK-${Math.floor(Math.random()*1000)+1000}`,
                    type: k === installments && isFinished ? 'FULL_PAYMENT' : 'INSTALLMENT'
                 });
             }
        }
    };

    // --- WestProp Sales ---
    createTrans(0, 'wp-100', '2023-08-20', 120000, true, 'u2'); // Tendai (Paid Full)
    createTrans(1, 'wp-101', '2023-09-05', 50000, false, 'u2'); // Farai (Active)
    createTrans(11, 'wp-105', '2024-01-15', 36000, false, 'u3'); // Investor (New, Deposit Only)

    // --- ZimRe Sales ---
    createTrans(2, 'zr-500', '2023-09-12', 45000, true, 'u3'); // Chipo (Paid Full)
    createTrans(3, 'zr-501', '2023-09-25', 10000, false, 'u3'); // Kudzai (Active)
    createTrans(4, 'zr-502', '2023-10-05', 5000, false, 'u2'); // Blessing (Arrears - only deposit paid long ago)
    createTrans(5, 'zr-510', '2023-12-01', 15000, false, 'u2'); // Nyasha (Active)

    // --- Shelter Sales ---
    createTrans(6, 'sz-1200', '2023-11-02', 25000, true, 'u2'); // Tinashe (Paid Full)
    createTrans(7, 'sz-1201', '2023-11-10', 12000, false, 'u3'); // Simba (Active)
    createTrans(8, 'sz-1202', '2023-12-05', 6250, false, 'u2'); // Rudo (New)
    createTrans(9, 'sz-1203', '2024-01-20', 6250, false, 'u3'); // Tanaka (New)

    return { sales, payments, commissions };
};

const { sales: INITIAL_SALES, payments: INITIAL_PAYMENTS, commissions: INITIAL_COMMISSIONS } = seedTransactions(INITIAL_STANDS);

const INITIAL_TEMPLATES: AgreementTemplate[] = [];
const INITIAL_NOTIFICATIONS: AppNotification[] = [
    { id: 'n1', title: 'System Update', message: 'Database populated with Zimbabwe Mock Data.', type: 'INFO', timestamp: new Date().toISOString(), read: false }
];

const INITIAL_RELEASE_NOTES: ReleaseNote[] = [
    {
        id: 'rn-1.4.2',
        version: "v1.4.2",
        date: new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        features: [
            { feature: "System Data", detail: "Populated database with Zimbabwe Real Estate data (WestProp, ZimRe, Shelter)." },
            { feature: "Reporting", detail: "Added 'Weekly Sales Report' module for tracking developer cashflow." },
            { feature: "Agent Performance", detail: "Added Agent Performance Leaderboard with sortable metrics." }
        ]
    }
];

const STORAGE_KEY = 'FINE_ESTATE_DB_V1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistence Helper
  const getPersistedState = <T,>(key: string, defaultValue: T): T => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed[key] !== undefined) {
            return parsed[key];
        }
      }
    } catch (err) {
      console.warn("Failed to load persisted data:", err);
    }
    return defaultValue;
  };

  const [currentUser, setCurrentUser] = useState<User>(() => getPersistedState('currentUser', INITIAL_USERS[0]));
  const [users, setUsers] = useState<User[]>(() => getPersistedState('users', INITIAL_USERS));
  const [clients, setClients] = useState<Client[]>(() => getPersistedState('clients', INITIAL_CLIENTS));
  const [developers, setDevelopers] = useState<Developer[]>(() => getPersistedState('developers', INITIAL_DEVS));
  const [stands, setStands] = useState<Stand[]>(() => getPersistedState('stands', INITIAL_STANDS));
  const [sales, setSales] = useState<Sale[]>(() => getPersistedState('sales', INITIAL_SALES));
  const [payments, setPayments] = useState<Payment[]>(() => getPersistedState('payments', INITIAL_PAYMENTS));
  const [agreements, setAgreements] = useState<SalesAgreement[]>(() => getPersistedState('agreements', []));
  const [templates, setTemplates] = useState<AgreementTemplate[]>(() => getPersistedState('templates', INITIAL_TEMPLATES));
  const [commissions, setCommissions] = useState<Commission[]>(() => getPersistedState('commissions', INITIAL_COMMISSIONS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => getPersistedState('auditLogs', []));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => getPersistedState('notifications', INITIAL_NOTIFICATIONS));
  const [releaseNotes, setReleaseNotes] = useState<ReleaseNote[]>(() => getPersistedState('releaseNotes', INITIAL_RELEASE_NOTES));
  const [currentPath, setCurrentPath] = useState('/');
  const [isAuthenticated, setIsAuthenticated] = useState(() => getPersistedState('isAuthenticated', false));
  
  // Backup State
  const [backups, setBackups] = useState<Backup[]>(() => getPersistedState('backups', []));
  const [isAutoBackupEnabled, setIsAutoBackupEnabled] = useState(() => getPersistedState('isAutoBackupEnabled', false));
  const [lastSaved, setLastSaved] = useState(new Date());

  // Safety Guard: Prevent overwriting local storage on initial mount if state is empty
  const [isInitialized, setIsInitialized] = useState(false);

  // Refs for consistent state in intervals/backups
  const stateRef = useRef({ users, clients, developers, stands, sales, payments, agreements });

  useEffect(() => {
    stateRef.current = { users, clients, developers, stands, sales, payments, agreements };
  }, [users, clients, developers, stands, sales, payments, agreements]);

  // Initialization Effect
  useEffect(() => {
    // Mark as initialized after first render to allow saving
    setIsInitialized(true);
  }, []);

  // Persist State Effect
  useEffect(() => {
    // CRITICAL: Don't save if we haven't finished initializing, or if we are about to save empty/default data over existing data
    if (!isInitialized) return;

    const db = {
        currentUser, users, clients, developers, stands, sales, payments, agreements, templates, commissions, auditLogs, notifications, backups, releaseNotes, isAutoBackupEnabled, isAuthenticated
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
    setLastSaved(new Date());
  }, [currentUser, users, clients, developers, stands, sales, payments, agreements, templates, commissions, auditLogs, notifications, backups, releaseNotes, isAutoBackupEnabled, isAuthenticated, isInitialized]);

  // Auto Backup Effect (Hourly)
  useEffect(() => {
    let interval: any;
    if (isAutoBackupEnabled) {
      setTimeout(() => createBackup(), 1000);
      interval = setInterval(() => {
        createBackup();
      }, 3600000); 
    }
    return () => clearInterval(interval);
  }, [isAutoBackupEnabled]);

  const login = (email: string, pass: string): boolean => {
      const user = users.find(u => (u.email === email || (u.email === 'admin' && email === 'admin')) && u.password === pass);
      if (user) {
          setCurrentUser(user);
          setIsAuthenticated(true);
          addLog('LOGIN', `User ${user.name} logged in`);
          navigate('/');
          return true;
      }
      return false;
  };

  const logout = () => {
      addLog('LOGOUT', `User ${currentUser.name} logged out`);
      setIsAuthenticated(false);
      setCurrentUser(INITIAL_USERS[0]); 
      navigate('/');
  };

  const register = (name: string, email: string, pass: string) => {
      const newUser: User = {
          id: `u-${Date.now()}`,
          name,
          email,
          password: pass,
          role: UserRole.AGENT 
      };
      setUsers([...users, newUser]);
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      addLog('REGISTER', `New user registered: ${name}`);
      navigate('/');
  };

  const createBackup = () => {
    const currentState = stateRef.current;
    const recordCount = currentState.users.length + currentState.clients.length + currentState.developers.length + currentState.stands.length + currentState.sales.length;
    const size = JSON.stringify(currentState).length;
    
    const newBackup: Backup = {
      id: `bk-${Date.now()}`,
      timestamp: new Date().toISOString(),
      size: `${(size / 1024).toFixed(2)} KB`,
      recordCount
    };
    
    setBackups(prev => [newBackup, ...prev].slice(0, 10)); 
  };

  const toggleAutoBackup = (enabled: boolean) => {
    setIsAutoBackupEnabled(enabled);
    addLog('SYSTEM_SETTINGS', `Auto-backup ${enabled ? 'enabled' : 'disabled'}`);
  };

  const downloadBackup = (backupId?: string) => {
    const dataToDownload = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: "1.0",
        generatedBy: currentUser.name
      },
      data: {
        users, clients, developers, stands, sales, payments, agreements, commissions, templates, auditLogs, notifications, backups, releaseNotes
      }
    };

    const blob = new Blob([JSON.stringify(dataToDownload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FineEstate_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    addLog('DATA_EXPORT', 'Manual backup downloaded');
  };

  const importDatabase = (jsonString: string): boolean => {
    try {
        const parsed = JSON.parse(jsonString);
        // Supports two formats: Full backup with metadata, or raw DB dump
        const db = parsed.data || parsed;

        if (db.users && Array.isArray(db.users)) setUsers(db.users);
        if (db.clients && Array.isArray(db.clients)) setClients(db.clients);
        if (db.developers && Array.isArray(db.developers)) setDevelopers(db.developers);
        if (db.stands && Array.isArray(db.stands)) setStands(db.stands);
        if (db.sales && Array.isArray(db.sales)) setSales(db.sales);
        if (db.payments && Array.isArray(db.payments)) setPayments(db.payments);
        if (db.agreements && Array.isArray(db.agreements)) setAgreements(db.agreements);
        if (db.commissions && Array.isArray(db.commissions)) setCommissions(db.commissions);
        if (db.auditLogs && Array.isArray(db.auditLogs)) setAuditLogs(db.auditLogs);
        if (db.releaseNotes && Array.isArray(db.releaseNotes)) setReleaseNotes(db.releaseNotes);
        
        addLog('DATA_IMPORT', 'Database restored from backup file');
        return true;
    } catch (e) {
        console.error("Import failed", e);
        return false;
    }
  };

  const addReleaseNote = (note: ReleaseNote) => {
      setReleaseNotes(prev => [note, ...prev]);
      triggerNotification('System Update', `New version ${note.version} notes released.`, 'INFO', '/');
  };

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

  const deleteUser = (id: string) => {
      const user = users.find(u => u.id === id);
      if(user) {
          setUsers(prev => prev.filter(u => u.id !== id));
          addLog('DELETE_USER', `Deleted user ${user.name}`);
      }
  }

  const addClient = (client: Client) => {
    setClients([...clients, client]);
    addLog('ADD_CLIENT', `Added client ${client.name}`);
  }

  const deleteClient = (id: string) => {
    if(sales.some(s => s.clientId === id)) {
        alert("Cannot delete client with active transaction history.");
        return;
    }
    const client = clients.find(c => c.id === id);
    setClients(prev => prev.filter(c => c.id !== id));
    addLog('DELETE_CLIENT', `Deleted client ${client?.name || id}`);
  };

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
    if(stands.some(s => s.developerId === id)) {
        alert("Cannot delete developer with registered stands. Clear inventory first.");
        return;
    }
    if(dev) {
        setDevelopers(prev => prev.filter(d => d.id !== id));
        addLog('DELETE_DEVELOPER', `Deleted developer ${dev.name}`);
    }
  };

  const addStand = (stand: Stand) => {
    setStands([...stands, stand]);
    addLog('ADD_STAND', `Added stand ${stand.standNumber} for developer ${stand.developerId}`);
  };

  const deleteStand = (id: string) => {
     if(sales.some(s => s.standId === id && s.status !== 'CANCELLED')) {
        alert("Cannot delete stand that has been sold.");
        return;
    }
     const stand = stands.find(s => s.id === id);
     setStands(prev => prev.filter(s => s.id !== id));
     addLog('DELETE_STAND', `Deleted stand #${stand?.standNumber}`);
  };

  const addSale = (sale: Sale) => {
    setSales([...sales, sale]);
    setStands(stands.map(s => s.id === sale.standId ? { ...s, status: StandStatus.SOLD } : s));
    
    const stand = stands.find(s => s.id === sale.standId);
    
    // Create Commission based on TOTAL SALE PRICE (not deposit)
    // 5% Agency Commission
    const totalComm = sale.salePrice * 0.05;
    // 2.5% Agent Commission
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

    addLog('ADD_SALE', `Sold stand ${sale.standId} to ${sale.clientName}.`);

    // Alerts
    triggerNotification('Stand Sold Alert', `Stand #${stand?.standNumber} sold to ${sale.clientName}.`, 'ALERT', '/developers');
    if (sale.depositPaid > 0) {
      triggerNotification('Payment Verification', `Deposit of $${sale.depositPaid.toLocaleString()} logged.`, 'WARNING', '/finance');
    }
  };

  const cancelSale = (id: string) => {
      const sale = sales.find(s => s.id === id);
      if(!sale) return;
      
      setSales(prev => prev.map(s => s.id === id ? {...s, status: 'CANCELLED'} : s));
      setStands(prev => prev.map(s => s.id === sale.standId ? {...s, status: StandStatus.AVAILABLE} : s));
      
      // Void commission
      setCommissions(prev => prev.filter(c => c.saleId !== id));

      addLog('CANCEL_SALE', `Cancelled sale ${id} - Stand released`);
      triggerNotification('Sale Cancelled', `Sale for Stand ${sale.standId} cancelled. Stand is now AVAILABLE.`, 'WARNING');
  };

  const addPayment = (payment: Payment) => {
    setPayments([...payments, payment]);
    if(payment.type === 'DEPOSIT') {
       setSales(prev => prev.map(s => s.id === payment.saleId ? {...s, depositPaid: s.depositPaid + payment.amount} : s));
    }
    
    const receiptInfo = payment.manualReceiptNo ? ` (Manual Ref: ${payment.manualReceiptNo})` : '';
    addLog('ADD_PAYMENT', `Payment of ${payment.amount} for sale ${payment.saleId}${receiptInfo}`);
    triggerNotification('Payment Received', `Payment of $${payment.amount.toLocaleString()} logged${receiptInfo}.`, 'SUCCESS');
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
    
    if(status === AgreementStatus.APPROVED) {
        triggerNotification('Agreement Approved', `Sales Agreement ${id} has been approved.`, 'SUCCESS');
    }
  };

  const markCommissionPaid = (id: string) => {
    setCommissions(prev => prev.map(c => c.id === id ? { ...c, status: 'PAID' } : c));
    addLog('PAY_COMMISSION', `Commission ${id} marked as PAID`);
  };

  const getAgentPerformance = (agentId: string) => {
    const agentSales = sales.filter(s => s.agentId === agentId && s.status !== 'CANCELLED');
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
      currentUser, setCurrentUser, users, addUser, deleteUser, clients, addClient, deleteClient, developers, updateDeveloper, deleteDeveloper, stands, sales, payments, agreements, commissions, auditLogs, templates, notifications, backups, releaseNotes, isAutoBackupEnabled, isAuthenticated,
      addDeveloper, addStand, deleteStand, addSale, cancelSale, addPayment, createAgreement, addTemplate, updateAgreementStatus, markCommissionPaid, addLog, getAgentPerformance, markNotificationRead, clearNotifications,
      currentPath, navigate, createBackup, toggleAutoBackup, downloadBackup, importDatabase, addReleaseNote, login, logout, register, lastSaved
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
