
export enum UserRole {
  ADMIN = 'ADMIN',
  AGENT = 'AGENT',
  DEVELOPER = 'DEVELOPER'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  password?: string; // Added for auth demo
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  idNumber: string; // National ID or Passport
  address: string;
  dateAdded: string;
}

export interface Developer {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  totalStands: number;
  depositTerms?: string; 
  financingTerms?: string; 
  mandateHolderId?: string; 
}

export enum StandStatus {
  AVAILABLE = 'AVAILABLE',
  RESERVED = 'RESERVED',
  SOLD = 'SOLD'
}

export interface Stand {
  id: string; 
  standNumber: string;
  developerId: string;
  price: number;
  size: number; 
  status: StandStatus;
  depositRequired?: number;
  financingTerms?: string;
}

export enum AgreementStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface AgreementTemplate {
  id: string;
  name: string;
  content: string; // Contains placeholders like {{CLIENT_NAME}}
  lastModified: string;
}

export interface SalesAgreement {
  id: string;
  saleId: string;
  content: string; 
  specialConditions: string;
  generatedDate: string;
  status: AgreementStatus;
  approvedBy?: string;
}

export interface Payment {
  id: string;
  saleId: string;
  amount: number;
  date: string;
  reference: string;
  type: 'DEPOSIT' | 'INSTALLMENT' | 'FULL_PAYMENT';
}

export interface Sale {
  id: string;
  standId: string;
  developerId: string;
  agentId: string;
  clientId: string;
  clientName: string;
  saleDate: string;
  salePrice: number;
  depositPaid: number;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface Commission {
  id: string;
  saleId: string;
  agentId: string;
  standId: string;
  salePrice: number;
  totalAgencyCommission: number; // 5%
  agentCommission: number; // 2.5%
  status: 'PENDING' | 'PAID';
  dateCreated: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details: string;
}

export interface SalesTarget {
  agentId: string;
  targetAmount: number;
  targetStands: number;
  period: string; 
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ALERT';
  timestamp: string;
  read: boolean;
  actionUrl?: string;
}

export interface Backup {
  id: string;
  timestamp: string;
  size: string;
  recordCount: number;
}
