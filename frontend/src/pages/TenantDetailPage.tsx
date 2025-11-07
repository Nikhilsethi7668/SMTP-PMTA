import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/spinner';
import { Skeleton } from '../components/ui/Skeleton';
import { UsageChart } from '../components/UsageChart';
import { DollarSign, PlusCircle, Key, Send, BarChart2, Shield, FileText } from 'lucide-react';
import { api } from '../services/mockApi';
import type {
  Tenant,
  CreditBalance,
  SmtpCredential,
  CreditTransaction,
  Message,
  UsageData,
  AuditLog,
} from '../types';
import { useUserStore } from '../store/useUserStore';
import { Table } from '../components/ui/Table';

const TenantDetailPage: React.FC = () => {
  const { tenantId } = useParams<{ tenantId: string }>();
  const user = useUserStore((state) => state.user);

  const [details, setDetails] = useState<{
    tenant: Tenant;
    balance: CreditBalance;
    smtpCredentials: SmtpCredential[];
  } | null>(null);

  const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [usage, setUsage] = useState<UsageData[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isTopUpModalOpen, setTopUpModalOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState(100);
  const [isCreatingCredential, setCreatingCredential] = useState(false);

  const tenantIdOrDefault = "";

  useEffect(() => {
    if (!tenantIdOrDefault) return;
    setLoading(true);

    Promise.all([
      api.getTenantDetails(tenantIdOrDefault),
      api.getCreditTransactions(tenantIdOrDefault),
      api.getMessages(tenantIdOrDefault),
      api.getUsageData(tenantIdOrDefault),
      api.getAuditLogs(tenantIdOrDefault),
    ]).then(
      ([detailsData, transactionsData, messagesData, usageData, auditLogsData]) => {
        setDetails(detailsData);
        setTransactions(transactionsData);
        setMessages(messagesData);
        setUsage(usageData);
        setAuditLogs(auditLogsData);
        setLoading(false);
      }
    );
  }, [tenantIdOrDefault]);

  const handleTopUp = async () => {
    if (!tenantIdOrDefault || !user) return;
    await api.topUpCredits(tenantIdOrDefault, topUpAmount, user);
    const updatedDetails = await api.getTenantDetails(tenantIdOrDefault);
    const updatedTransactions = await api.getCreditTransactions(tenantIdOrDefault);
    setDetails(updatedDetails);
    setTransactions(updatedTransactions);
    setTopUpModalOpen(false);
  };

  const handleCreateCredential = async () => {
    if (!tenantIdOrDefault || !user) return;
    setCreatingCredential(true);
    try {
      await api.createSmtpCredential(tenantIdOrDefault, user);
      const updatedDetails = await api.getTenantDetails(tenantIdOrDefault);
      setDetails(updatedDetails);
    } catch (error) {
      console.error('Failed to create SMTP credential:', error);
    } finally {
      setCreatingCredential(false);
    }
  };

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-1/3 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <div className="p-6 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          </Card>
          <Card>
            <div className="p-6 space-y-3">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-12 w-full mt-2" />
              <Skeleton className="h-9 w-full mt-2" />
            </div>
          </Card>
          <Card>
            <div className="p-6 space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-10 w-16" />
              <Skeleton className="h-5 w-32 mt-1" />
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-80 w-full" />
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <div className="p-6">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </Card>
          <Card>
            <div className="p-6">
              <Skeleton className="h-6 w-1/3 mb-4" />
              <Skeleton className="h-48 w-full" />
            </div>
          </Card>
        </div>

        <Card>
          <div className="p-6">
            <Skeleton className="h-6 w-1/4 mb-4" />
            <Skeleton className="h-64 w-full" />
          </div>
        </Card>
      </div>
    );

  if (!details) return <div>Tenant not found.</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">{details.tenant.name}</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-400" />
              Credits
            </h3>
            <p className="text-4xl font-bold text-green-400">
              ${details.balance.balance.toFixed(2)}
            </p>
            <Button className="mt-4 w-full" onClick={() => setTopUpModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Top Up Credits
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Key className="mr-2 h-5 w-5 text-yellow-400" />
              SMTP Credentials
            </h3>
            {details.smtpCredentials.map((cred) => (
              <div
                key={cred.id}
                className="font-mono text-sm bg-gray-800 p-2 rounded mt-2"
              >
                <p>
                  <strong>User:</strong> {cred.username}
                </p>
                <p>
                  <strong>Key:</strong> {cred.apiKey.substring(0, 12)}...
                </p>
              </div>
            ))}
            <Button
              variant="outline"
              className="mt-4 w-full"
              onClick={handleCreateCredential}
              disabled={isCreatingCredential}
            >
              {isCreatingCredential ? (
                <>
                  <Spinner className="mr-2" />
                  Creating...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" /> New Credential
                </>
              )}
            </Button>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Send className="mr-2 h-5 w-5 text-blue-400" />
              Messages
            </h3>
            <p className="text-4xl font-bold">{messages.length}</p>
            <p className="text-gray-400">Total messages sent</p>
          </div>
        </Card>
      </div>

      {/* Usage */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart2 className="mr-2 h-5 w-5" /> Usage Last 30 Days
          </h3>
          <div className="h-80">
            <UsageChart data={usage} />
          </div>
        </div>
      </Card>

      {/* Transactions & Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <DollarSign className="mr-2 h-5 w-5" /> Credit Transactions
            </h3>
            <Table
              headers={['Date', 'Type', 'Amount', 'Balance After', 'Reference']}
              rows={transactions.slice(0, 5).map((t) => [
                new Date(t.createdAt).toLocaleString(),
                <span
                  className={`${
                    t.type === 'topup' ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {t.type}
                </span>,
                `$${t.amount.toFixed(2)}`,
                `$${t.balanceAfter.toFixed(2)}`,
                t.reference,
              ])}
            />
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center">
              <Shield className="mr-2 h-5 w-5" /> Audit Logs
            </h3>
            <Table
              headers={['Date', 'User', 'Action']}
              rows={auditLogs.slice(0, 5).map((log) => [
                new Date(log.createdAt).toLocaleString(),
                log.userEmail,
                log.action,
              ])}
            />
          </div>
        </Card>
      </div>

      {/* Recent Messages */}
      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" /> Recent Messages
          </h3>
          <Table
            headers={['Date', 'Subject', 'Recipients', 'Status']}
            rows={messages.slice(0, 10).map((m) => [
              new Date(m.createdAt).toLocaleString(),
              m.subject,
              m.recipients.map((r) => r.email).join(', '),
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  m.status === 'delivered' || m.status === 'sent'
                    ? 'bg-green-900 text-green-300'
                    : m.status === 'bounced'
                    ? 'bg-yellow-900 text-yellow-300'
                    : m.status === 'failed'
                    ? 'bg-red-900 text-red-300'
                    : 'bg-blue-900 text-blue-300'
                }`}
              >
                {m.status}
              </span>,
            ])}
          />
        </div>
      </Card>

      {/* Top-Up Modal */}
      <Modal
        isOpen={isTopUpModalOpen}
        onClose={() => setTopUpModalOpen(false)}
        title="Top Up Credits"
      >
        <div className="space-y-4">
          <p>Enter amount to add to {details.tenant.name}'s balance.</p>
          <input
            type="number"
            value={topUpAmount}
            onChange={(e) => setTopUpAmount(parseInt(e.target.value || '0'))}
            className="w-full bg-gray-900 border border-gray-700 rounded-md p-2"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setTopUpModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleTopUp}>Confirm Top Up</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TenantDetailPage;
