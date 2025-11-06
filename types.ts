import { UserRole } from './constants';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  tenantId: string;
}

export interface Tenant {
  id: string;
  name: string;
  contactEmail: string;
  createdAt: string;
}

export interface SmtpCredential {
  id: string;
  tenantId: string;
  username: string;
  apiKey: string;
  createdAt: string;
  revokedAt?: string;
}

export interface CreditBalance {
  id: string;
  tenantId: string;
  balance: number;
  currency: string;
}

export interface CreditTransaction {
  id: string;
  tenantId: string;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  type: 'topup' | 'send_charge' | 'refund';
  reference: string;
  createdByUser: string; // User name
  createdAt: string;
}

export type MessageStatus = 'queued' | 'sent' | 'bounced' | 'failed' | 'delivered';

export interface MessageEvent {
  timestamp: string;
  status: MessageStatus;
  description: string;
}

export interface Message {
  id: string;
  tenantId: string;
  smtpCredentialId: string;
  recipients: { email: string, name?: string }[];
  subject: string;
  status: MessageStatus;
  powermtaMessageId: string;
  cost: number;
  createdAt: string;
  updatedAt: string;
  events: MessageEvent[];
}

export interface AuditLog {
  id: string;
  userId: string;
  userEmail: string;
  tenantId: string;
  action: string;
  metadata: Record<string, any>;
  createdAt: string;
}

export interface UsageData {
  date: string;
  sent: number;
  bounced: number;
  failed: number;
}

export interface Suppression {
  id: string;
  tenantId: string;
  email: string;
  reason: 'bounce' | 'complaint' | 'unsubscribe' | 'manual';
  createdAt: string;
}

export interface Domain {
  id: string;
  tenantId: string;
  domainName: string;
  status: 'pending' | 'verified' | 'failed';
  spfRecord: string;
  dkimRecord: string;
  dkimPublicKey: string;
  trackingCname: string;
  createdAt: string;
}

export interface Template {
  id: string;
  tenantId: string;
  name: string;
  subject: string;
  body: string; // HTML content
  createdAt: string;
  updatedAt: string;
}
