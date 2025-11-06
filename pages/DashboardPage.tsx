import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../constants';
import { api } from '../services/mockApi';
import { Tenant, CreditBalance, SmtpCredential, CreditTransaction, Message, UsageData, AuditLog, Suppression, Domain, MessageStatus, Template, User } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table } from '../components/ui/Table';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { UsageChart } from '../components/UsageChart';
import { PlusCircle, DollarSign, Key, Send, FileText, Shield, BarChart2, Ban, Globe, Clipboard, CheckCircle, Clock, Search, XCircle, FileCode, Trash2, Edit, Users } from 'lucide-react';
import { Skeleton } from '../components/ui/Skeleton';

// Admin: Tenant List
const TenantList = () => {
    const [tenants, setTenants] = useState<Tenant[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        api.getTenants().then(data => {
            setTenants(data);
            setLoading(false);
        });
    }, []);

    if (loading) return (
        <Card>
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Tenants</h2>
                <Table
                    headers={['Name', 'Contact Email', 'Created At', 'Actions']}
                    rows={Array.from({ length: 5 }).map((_, i) => [
                        <Skeleton key={`name-${i}`} className="h-4 w-40" />,
                        <Skeleton key={`email-${i}`} className="h-4 w-48" />,
                        <Skeleton key={`date-${i}`} className="h-4 w-24" />,
                        <Skeleton key={`action-${i}`} className="h-8 w-16 rounded-md" />,
                    ])}
                />
            </div>
        </Card>
    );


    return (
        <Card>
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Tenants</h2>
                <Table
                    headers={['Name', 'Contact Email', 'Created At', 'Actions']}
                    rows={tenants.map(t => [
                        t.name,
                        t.contactEmail,
                        new Date(t.createdAt).toLocaleDateString(),
                        <Button size="sm" onClick={() => navigate(`/tenants/${t.id}`)}>View</Button>
                    ])}
                />
            </div>
        </Card>
    );
};

// Admin: Tenant Details
const TenantDetail = () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    const { user } = useAuth();
    const [details, setDetails] = useState<{ tenant: Tenant, balance: CreditBalance, smtpCredentials: SmtpCredential[] } | null>(null);
    const [transactions, setTransactions] = useState<CreditTransaction[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [usage, setUsage] = useState<UsageData[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [isTopUpModalOpen, setTopUpModalOpen] = useState(false);
    const [topUpAmount, setTopUpAmount] = useState(100);
    const [isCreatingCredential, setCreatingCredential] = useState(false);

    const tenantIdOrDefault = tenantId || user!.tenantId;

    useEffect(() => {
        if (!tenantIdOrDefault) return;
        setLoading(true);
        Promise.all([
            api.getTenantDetails(tenantIdOrDefault),
            api.getCreditTransactions(tenantIdOrDefault),
            api.getMessages(tenantIdOrDefault),
            api.getUsageData(tenantIdOrDefault),
            api.getAuditLogs(tenantIdOrDefault)
        ]).then(([detailsData, transactionsData, messagesData, usageData, auditLogsData]) => {
            setDetails(detailsData);
            setTransactions(transactionsData);
            setMessages(messagesData);
            setUsage(usageData);
            setAuditLogs(auditLogsData);
            setLoading(false);
        });
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
            console.error("Failed to create SMTP credential:", error);
        } finally {
            setCreatingCredential(false);
        }
    };

    if (loading) return (
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-400" />Credits</h3>
                        <p className="text-4xl font-bold text-green-400">${details.balance.balance.toFixed(2)}</p>
                        <Button className="mt-4 w-full" onClick={() => setTopUpModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Top Up Credits
                        </Button>
                    </div>
                </Card>
                <Card>
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 flex items-center"><Key className="mr-2 h-5 w-5 text-yellow-400" />SMTP Credentials</h3>
                        {details.smtpCredentials.map(cred => (
                             <div key={cred.id} className="font-mono text-sm bg-gray-800 p-2 rounded mt-2">
                                <p><strong>User:</strong> {cred.username}</p>
                                <p><strong>Key:</strong> {cred.apiKey.substring(0, 12)}...</p>
                            </div>
                        ))}
                         <Button 
                            variant="outline" 
                            className="mt-4 w-full" 
                            onClick={handleCreateCredential}
                            disabled={isCreatingCredential}
                         >
                            {isCreatingCredential ? (
                                <><Spinner size="sm" className="mr-2" />Creating...</>
                            ) : (
                                <><PlusCircle className="mr-2 h-4 w-4" /> New Credential</>
                            )}
                        </Button>
                    </div>
                </Card>
                 <Card>
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 flex items-center"><Send className="mr-2 h-5 w-5 text-blue-400" />Messages</h3>
                        <p className="text-4xl font-bold">{messages.length}</p>
                        <p className="text-gray-400">Total messages sent</p>
                    </div>
                </Card>
            </div>
            
            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center"><BarChart2 className="mr-2 h-5 w-5" />Usage Last 30 Days</h3>
                    <div className="h-80">
                        <UsageChart data={usage} />
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                     <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center"><DollarSign className="mr-2 h-5 w-5" />Credit Transactions</h3>
                        <Table
                            headers={['Date', 'Type', 'Amount', 'Balance After', 'Reference']}
                            rows={transactions.slice(0, 5).map(t => [
                                new Date(t.createdAt).toLocaleString(),
                                <span className={`${t.type === 'topup' ? 'text-green-400' : 'text-red-400'}`}>{t.type}</span>,
                                `$${t.amount.toFixed(2)}`,
                                `$${t.balanceAfter.toFixed(2)}`,
                                t.reference
                            ])}
                        />
                     </div>
                </Card>
                <Card>
                     <div className="p-6">
                        <h3 className="text-xl font-semibold mb-4 flex items-center"><Shield className="mr-2 h-5 w-5" />Audit Logs</h3>
                         <Table
                            headers={['Date', 'User', 'Action']}
                            rows={auditLogs.slice(0, 5).map(log => [
                                new Date(log.createdAt).toLocaleString(),
                                log.userEmail,
                                log.action,
                            ])}
                        />
                    </div>
                </Card>
            </div>

             <Card>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center"><FileText className="mr-2 h-5 w-5" />Recent Messages</h3>
                    <Table
                        headers={['Date', 'Subject', 'Recipients', 'Status']}
                        rows={messages.slice(0, 10).map(m => [
                            new Date(m.createdAt).toLocaleString(),
                            m.subject,
                            m.recipients.map(r => r.email).join(', '),
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                m.status === 'delivered' || m.status === 'sent' ? 'bg-green-900 text-green-300' :
                                m.status === 'bounced' ? 'bg-yellow-900 text-yellow-300' :
                                m.status === 'failed' ? 'bg-red-900 text-red-300' :
                                'bg-blue-900 text-blue-300'
                            }`}>{m.status}</span>
                        ])}
                    />
                </div>
            </Card>

            <Modal isOpen={isTopUpModalOpen} onClose={() => setTopUpModalOpen(false)} title="Top Up Credits">
                <div className="space-y-4">
                    <p>Enter amount to add to {details.tenant.name}'s balance.</p>
                    <Input 
                        type="number"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(parseInt(e.target.value))}
                    />
                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setTopUpModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleTopUp}>Confirm Top Up</Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};


// User: Dashboard
const UserDashboard = () => {
    const { user } = useAuth();
    const [data, setData] = useState<{ balance: CreditBalance, messages: Message[], usage: UsageData[] } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        Promise.all([
            api.getTenantDetails(user.tenantId),
            api.getMessages(user.tenantId),
            api.getUsageData(user.tenantId)
        ]).then(([{ balance }, messagesData, usageData]) => {
            setData({ balance, messages: messagesData, usage: usageData });
            setLoading(false);
        });
    }, [user]);

    if (loading || !data) return (
         <div className="space-y-6">
            <Skeleton className="h-10 w-1/4 rounded-lg" />
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <div className="p-6 space-y-3">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-10 w-24" />
                    </div>
                </Card>
                <Card>
                    <div className="p-6 space-y-3">
                        <Skeleton className="h-5 w-24" />
                        <Skeleton className="h-10 w-16" />
                        <Skeleton className="h-4 w-32 mt-1" />
                    </div>
                </Card>
            </div>
            <Card>
                <div className="p-6">
                    <Skeleton className="h-6 w-1/4 mb-4" />
                    <Skeleton className="h-80 w-full" />
                </div>
            </Card>
            <Card>
                <div className="p-6">
                     <Skeleton className="h-6 w-1/4 mb-4" />
                     <Skeleton className="h-48 w-full" />
                </div>
            </Card>
        </div>
    );

    const recentMessages = data.messages.slice(0, 5);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Dashboard</h1>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 flex items-center"><DollarSign className="mr-2 h-5 w-5 text-green-400" />Available Credits</h3>
                        <p className="text-4xl font-bold text-green-400">${data.balance.balance.toFixed(2)}</p>
                    </div>
                </Card>
                <Card>
                    <div className="p-6">
                        <h3 className="font-semibold text-lg mb-2 flex items-center"><Send className="mr-2 h-5 w-5 text-blue-400" />Messages Sent</h3>
                        <p className="text-4xl font-bold">{data.messages.length}</p>
                        <p className="text-gray-400">Total in the last 30 days</p>
                    </div>
                </Card>
            </div>
            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center"><BarChart2 className="mr-2 h-5 w-5" />Sending Volume</h3>
                    <div className="h-80">
                        <UsageChart data={data.usage} />
                    </div>
                </div>
            </Card>
            <Card>
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center"><FileText className="mr-2 h-5 w-5" />Recent Messages</h3>
                    <Table
                        headers={['Date', 'Subject', 'Recipients', 'Status']}
                        rows={recentMessages.map(m => [
                            new Date(m.createdAt).toLocaleString(),
                            m.subject,
                            m.recipients.map(r => r.email).join(', '),
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                m.status === 'delivered' || m.status === 'sent' ? 'bg-green-900 text-green-300' :
                                m.status === 'bounced' ? 'bg-yellow-900 text-yellow-300' :
                                m.status === 'failed' ? 'bg-red-900 text-red-300' :
                                'bg-blue-900 text-blue-300'
                            }`}>{m.status}</span>
                        ])}
                    />
                </div>
            </Card>
        </div>
    );
};


const SendMessagePage = () => {
    const { user } = useAuth();
    const [subject, setSubject] = useState('');
    const [recipients, setRecipients] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setSending(true);
        setError('');
        setSuccess('');
        try {
            await api.sendMessage(user.tenantId, `smtp_${user.tenantId}`, subject, recipients);
            setSuccess('Message queued for sending!');
            setSubject('');
            setRecipients('');
        } catch (err: any) {
            setError(err.message || 'Failed to send message.');
        } finally {
            setSending(false);
        }
    };

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Compose Message</h2>
                <form onSubmit={handleSend} className="space-y-4">
                    <div>
                        <label htmlFor="recipients" className="block text-sm font-medium text-gray-300 mb-2">Recipients (comma-separated)</label>
                        <Input id="recipients" value={recipients} onChange={e => setRecipients(e.target.value)} placeholder="test1@example.com, test2@example.com" required/>
                    </div>
                     <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                        <Input id="subject" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Your email subject" required/>
                    </div>
                     <div>
                        <label htmlFor="body" className="block text-sm font-medium text-gray-300 mb-2">Body (HTML)</label>
                        <textarea id="body" rows={10} className="w-full bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2" placeholder="<html>...</html>"></textarea>
                    </div>
                    {error && <p className="text-red-400">{error}</p>}
                    {success && <p className="text-green-400">{success}</p>}
                    <div className="text-right">
                        <Button type="submit" disabled={sending}>
                           {sending ? <><Spinner size="sm" className="mr-2"/> Sending...</> : <><Send className="mr-2 h-4 w-4"/>Send Message</>}
                        </Button>
                    </div>
                </form>
            </div>
        </Card>
    );
};

const SuppressionsPage = () => {
    const { user } = useAuth();
    const [suppressions, setSuppressions] = useState<Suppression[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const tenantId = user!.tenantId;

    const fetchSuppressions = useCallback(async () => {
        const data = await api.getSuppressions(tenantId);
        setSuppressions(data);
    }, [tenantId]);

    useEffect(() => {
        setLoading(true);
        fetchSuppressions().finally(() => setLoading(false));
    }, [fetchSuppressions]);

    const handleAddSuppression = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail || !user) return;
        setIsAdding(true);
        setError('');
        try {
            await api.addSuppression(tenantId, newEmail, 'manual', user);
            setNewEmail('');
            await fetchSuppressions(); // Refresh list
        } catch (err: any) {
            setError(err.message || 'Failed to add email.');
        } finally {
            setIsAdding(false);
        }
    };

    if (loading) return (
        <Card>
            <div className="p-6">
                 <h2 className="text-2xl font-semibold mb-4">Suppression List</h2>
                 <div className="mb-4">
                    <Skeleton className="h-10 w-full max-w-lg" />
                 </div>
                 <Table
                    headers={['Email Address', 'Reason', 'Date Added']}
                    rows={Array.from({ length: 5 }).map((_, i) => [
                        <Skeleton key={`email-${i}`} className="h-4 w-48" />,
                        <Skeleton key={`reason-${i}`} className="h-4 w-24" />,
                        <Skeleton key={`date-${i}`} className="h-4 w-40" />,
                    ])}
                />
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <Ban className="mr-3 h-6 w-6" /> Suppression List
                    </h2>
                    <p className="text-gray-400 mb-6">Emails on this list will be blocked from receiving messages. This includes automatic additions from bounces and complaints.</p>
                    <form onSubmit={handleAddSuppression} className="flex items-center gap-2 mb-6 max-w-lg">
                        <Input 
                            type="email" 
                            placeholder="email@example.com"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            required
                            className="flex-grow"
                        />
                         <Button type="submit" disabled={isAdding}>
                            {isAdding ? <><Spinner size="sm" className="mr-2" /> Adding...</> : 'Add to List'}
                        </Button>
                    </form>
                    {error && <p className="text-red-400 mb-4">{error}</p>}
                    <Table
                        headers={['Email Address', 'Reason', 'Date Added']}
                        rows={suppressions.map(s => [
                            s.email,
                            <span className="capitalize">{s.reason}</span>,
                            new Date(s.createdAt).toLocaleString()
                        ])}
                    />
                </div>
            </Card>
        </div>
    );
};

const DomainsPage = () => {
    const { user } = useAuth();
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDomain, setNewDomain] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const [isRecordsModalOpen, setRecordsModalOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

    const tenantId = user!.tenantId;

    const fetchDomains = useCallback(async () => {
        const data = await api.getDomains(tenantId);
        setDomains(data);
    }, [tenantId]);

    useEffect(() => {
        setLoading(true);
        fetchDomains().finally(() => setLoading(false));
    }, [fetchDomains]);

    const handleAddDomain = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newDomain || !user) return;
        setIsAdding(true);
        setError('');
        try {
            await api.addDomain(tenantId, newDomain, user);
            setNewDomain('');
            await fetchDomains();
        } catch (err: any) {
            setError(err.message || 'Failed to add domain.');
        } finally {
            setIsAdding(false);
        }
    };
    
    const handleVerifyDomain = async (domainId: string) => {
        setVerifyingId(domainId);
        try {
            await api.verifyDomain(domainId);
            await fetchDomains();
        } catch (err) {
            console.error(err);
        } finally {
            setVerifyingId(null);
        }
    };

    const showRecords = (domain: Domain) => {
        setSelectedDomain(domain);
        setRecordsModalOpen(true);
    };
    
    const DnsRecordRow = ({ type, host, value }: { type: string, host: string, value: string }) => {
        const [copied, setCopied] = useState(false);
        const copyToClipboard = (text: string) => {
            navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        };

        return (
            <div className="grid grid-cols-3 gap-2 text-sm mb-3 items-center">
                <div className="font-mono text-gray-400">{type}</div>
                <div className="font-mono text-gray-300 col-span-2 flex justify-between items-center bg-gray-900 p-2 rounded">
                    <span>{host}</span>
                    <button onClick={() => copyToClipboard(host)} className="text-gray-400 hover:text-white">
                        <Clipboard size={16} />
                    </button>
                </div>
                <div className="font-mono text-gray-300 col-span-3 break-all bg-gray-900 p-2 rounded flex justify-between items-center">
                    <span className="mr-2">{value}</span>
                    <button onClick={() => copyToClipboard(value)} className="text-gray-400 hover:text-white flex-shrink-0">
                        {copied ? <CheckCircle size={16} className="text-green-500"/> : <Clipboard size={16} />}
                    </button>
                </div>
            </div>
        );
    };

    if (loading) return (
        <Card>
            <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4">Domains</h2>
                <div className="mb-4">
                    <Skeleton className="h-10 w-full max-w-lg" />
                </div>
                <Table
                    headers={['Domain', 'Status', 'Actions']}
                    rows={Array.from({ length: 3 }).map((_, i) => [
                        <Skeleton key={`domain-${i}`} className="h-4 w-48" />,
                        <Skeleton key={`status-${i}`} className="h-6 w-24 rounded-full" />,
                        <div className="flex gap-2" key={`actions-${i}`}>
                            <Skeleton className="h-8 w-20 rounded-md" />
                            <Skeleton className="h-8 w-20 rounded-md" />
                        </div>,
                    ])}
                />
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <Globe className="mr-3 h-6 w-6" /> Sending Domains
                    </h2>
                    <p className="text-gray-400 mb-6">Verify your domains to start sending emails. Add the provided DNS records to your domain's registrar.</p>
                    <form onSubmit={handleAddDomain} className="flex items-center gap-2 mb-6 max-w-lg">
                        <Input
                            type="text"
                            placeholder="example.com"
                            value={newDomain}
                            onChange={(e) => setNewDomain(e.target.value)}
                            required
                            className="flex-grow"
                        />
                        <Button type="submit" disabled={isAdding}>
                            {isAdding ? <><Spinner size="sm" className="mr-2" /> Adding...</> : 'Add Domain'}
                        </Button>
                    </form>
                    {error && <p className="text-red-400 mb-4">{error}</p>}
                    <Table
                        headers={['Domain', 'Status', 'Actions']}
                        rows={domains.map(d => [
                            <span className="font-medium">{d.domainName}</span>,
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                d.status === 'verified' ? 'bg-green-900 text-green-300' :
                                d.status === 'pending' ? 'bg-yellow-900 text-yellow-300' : 'bg-red-900 text-red-300'
                            }`}>
                                {d.status === 'verified' && <CheckCircle className="mr-1.5 h-3 w-3" />}
                                {d.status === 'pending' && <Clock className="mr-1.5 h-3 w-3" />}
                                <span className="capitalize">{d.status}</span>
                            </span>,
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => showRecords(d)}>View Records</Button>
                                {d.status !== 'verified' && (
                                    <Button size="sm" onClick={() => handleVerifyDomain(d.id)} disabled={verifyingId === d.id}>
                                        {verifyingId === d.id ? <><Spinner size="sm" className="mr-2" />Verifying...</> : 'Verify'}
                                    </Button>
                                )}
                            </div>
                        ])}
                    />
                </div>
            </Card>
             <Modal isOpen={isRecordsModalOpen} onClose={() => setRecordsModalOpen(false)} title={`DNS Records for ${selectedDomain?.domainName}`}>
                {selectedDomain && (
                    <div className="space-y-4">
                        <p className="text-gray-300">Add these records to your domain's DNS settings. It may take some time for them to propagate.</p>
                        
                        <h4 className="font-semibold text-lg pt-2">SPF</h4>
                        <DnsRecordRow type="TXT" host="@" value={selectedDomain.spfRecord} />

                        <h4 className="font-semibold text-lg pt-2">DKIM</h4>
                        <DnsRecordRow type="TXT" host={selectedDomain.dkimRecord} value={selectedDomain.dkimPublicKey} />
                        
                        <h4 className="font-semibold text-lg pt-2">Tracking CNAME</h4>
                        <DnsRecordRow type="CNAME" host="tracking" value={selectedDomain.trackingCname} />

                        <div className="flex justify-end">
                            <Button onClick={() => setRecordsModalOpen(false)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const MessageLogsPage = () => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ status: '' as MessageStatus | '', search: '' });
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    const tenantId = user!.tenantId;

    useEffect(() => {
        setLoading(true);
        api.getMessages(tenantId, filters).then(data => {
            setMessages(data);
            setLoading(false);
        });
    }, [tenantId, filters]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const clearFilters = () => {
        setFilters({ status: '', search: '' });
    };

    const StatusBadge = ({ status }: { status: MessageStatus }) => (
         <span className={`px-2 py-1 text-xs font-medium rounded-full ${
            status === 'delivered' || status === 'sent' ? 'bg-green-900 text-green-300' :
            status === 'bounced' ? 'bg-yellow-900 text-yellow-300' :
            status === 'failed' ? 'bg-red-900 text-red-300' :
            'bg-blue-900 text-blue-300'
        }`}>{status}</span>
    );
    
    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <h2 className="text-2xl font-semibold mb-4 flex items-center">
                        <FileText className="mr-3 h-6 w-6" /> Message Logs
                    </h2>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                             <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                             <Input 
                                name="search"
                                value={filters.search}
                                onChange={handleFilterChange}
                                placeholder="Search by recipient or subject..."
                                className="pl-10"
                            />
                        </div>
                        <select
                            name="status"
                            value={filters.status}
                            onChange={handleFilterChange}
                             className="bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">All Statuses</option>
                            <option value="delivered">Delivered</option>
                            <option value="sent">Sent</option>
                            <option value="bounced">Bounced</option>
                            <option value="failed">Failed</option>
                            <option value="queued">Queued</option>
                        </select>
                        <Button variant="ghost" onClick={clearFilters}><XCircle className="mr-2 h-4 w-4"/>Clear</Button>
                    </div>

                    {loading ? (
                        <Table
                            headers={['Date', 'Recipient', 'Subject', 'Status', 'Actions']}
                             rows={Array.from({ length: 10 }).map((_, i) => [
                                <Skeleton key={`date-${i}`} className="h-4 w-32" />,
                                <Skeleton key={`rec-${i}`} className="h-4 w-40" />,
                                <Skeleton key={`sub-${i}`} className="h-4 w-48" />,
                                <Skeleton key={`status-${i}`} className="h-6 w-20 rounded-full" />,
                                <Skeleton key={`action-${i}`} className="h-8 w-16 rounded-md" />,
                            ])}
                        />
                    ) : (
                         <Table
                            headers={['Date', 'Recipient', 'Subject', 'Status', 'Actions']}
                            rows={messages.map(m => [
                                new Date(m.createdAt).toLocaleString(),
                                m.recipients.map(r => r.email).join(', '),
                                m.subject,
                                <StatusBadge status={m.status} />,
                                <Button size="sm" variant="outline" onClick={() => setSelectedMessage(m)}>View</Button>
                            ])}
                        />
                    )}
                </div>
            </Card>

            <Modal isOpen={!!selectedMessage} onClose={() => setSelectedMessage(null)} title="Message Details">
                {selectedMessage && (
                    <div className="space-y-4 text-sm">
                       <div>
                            <h4 className="font-semibold text-gray-400">Subject</h4>
                            <p>{selectedMessage.subject}</p>
                       </div>
                        <div>
                            <h4 className="font-semibold text-gray-400">Recipients</h4>
                            <p>{selectedMessage.recipients.map(r => r.email).join(', ')}</p>
                       </div>
                        <div>
                            <h4 className="font-semibold text-gray-400">Status</h4>
                            <StatusBadge status={selectedMessage.status} />
                       </div>
                        <div>
                            <h4 className="font-semibold text-gray-400">PowerMTA ID</h4>
                            <p className="font-mono">{selectedMessage.powermtaMessageId}</p>
                       </div>
                       
                        <h4 className="font-semibold text-lg pt-4">Event Timeline</h4>
                        <div className="border-l-2 border-gray-700 pl-4 space-y-4">
                            {selectedMessage.events.map((event, index) => (
                                <div key={index} className="relative">
                                    <div className="absolute -left-[23px] top-1 h-3 w-3 rounded-full bg-blue-500"></div>
                                    <p className="font-semibold capitalize">{event.status}</p>
                                    <p className="text-xs text-gray-400">{new Date(event.timestamp).toLocaleString()}</p>
                                    <p className="text-gray-300">{event.description}</p>
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={() => setSelectedMessage(null)}>Close</Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    )
};


const SettingsPage = () => {
    const { user } = useAuth();
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Settings</h1>
            <Card>
                <div className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                    <form className="space-y-4 max-w-lg">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                            <Input id="name" defaultValue={user?.name} />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <Input id="email" type="email" defaultValue={user?.email} disabled />
                        </div>
                        <Button>Save Changes</Button>
                    </form>
                </div>
            </Card>
            <Card>
                <div className="p-6">
                     <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                     <form className="space-y-4 max-w-lg">
                        <div>
                            <label htmlFor="current-password"  className="block text-sm font-medium text-gray-300 mb-2">Current Password</label>
                            <Input id="current-password" type="password" />
                        </div>
                         <div>
                            <label htmlFor="new-password"  className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                            <Input id="new-password" type="password" />
                        </div>
                         <div>
                            <label htmlFor="confirm-password"  className="block text-sm font-medium text-gray-300 mb-2">Confirm New Password</label>
                            <Input id="confirm-password" type="password" />
                        </div>
                        <Button>Update Password</Button>
                     </form>
                </div>
            </Card>
        </div>
    );
};

const TemplatesPage = () => {
    const { user } = useAuth();
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Partial<Template> | null>(null);
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    
    const tenantId = user!.tenantId;

    const fetchTemplates = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getTemplates(tenantId);
            setTemplates(data);
        } catch (error) {
            console.error("Failed to fetch templates", error);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchTemplates();
    }, [fetchTemplates]);

    const openEditor = (template?: Template) => {
        setSelectedTemplate(template || { name: '', subject: '', body: '' });
        setEditorOpen(true);
    };

    const closeEditor = () => {
        setEditorOpen(false);
        setSelectedTemplate(null);
    };

    const handleSave = async () => {
        if (!selectedTemplate) return;
        setIsSaving(true);
        try {
            await api.saveTemplate(tenantId, selectedTemplate as Omit<Template, 'tenantId' | 'createdAt' | 'updatedAt'>);
            await fetchTemplates();
            closeEditor();
        } catch (error) {
            console.error("Failed to save template", error);
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async (templateId: string) => {
        if (window.confirm("Are you sure you want to delete this template?")) {
            try {
                await api.deleteTemplate(tenantId, templateId);
                await fetchTemplates();
            } catch (error) {
                console.error("Failed to delete template", error);
            }
        }
    };

    if (loading) return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                 <Table
                    headers={['Name', 'Subject', 'Last Updated', 'Actions']}
                    rows={Array.from({ length: 3 }).map((_, i) => [
                        <Skeleton key={`name-${i}`} className="h-4 w-32" />,
                        <Skeleton key={`sub-${i}`} className="h-4 w-48" />,
                        <Skeleton key={`date-${i}`} className="h-4 w-40" />,
                        <div className="flex gap-2" key={`actions-${i}`}>
                            <Skeleton className="h-8 w-16 rounded-md" />
                            <Skeleton className="h-8 w-16 rounded-md" />
                        </div>,
                    ])}
                />
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold flex items-center">
                            <FileCode className="mr-3 h-6 w-6" /> Email Templates
                        </h2>
                        <Button onClick={() => openEditor()}>
                            <PlusCircle className="mr-2 h-4 w-4" /> New Template
                        </Button>
                    </div>
                    <p className="text-gray-400 mb-6">Create and manage reusable email templates with dynamic content.</p>
                     <Table
                        headers={['Name', 'Subject', 'Last Updated', 'Actions']}
                        rows={templates.map(t => [
                            <span className="font-medium">{t.name}</span>,
                            <span>{t.subject}</span>,
                            new Date(t.updatedAt).toLocaleString(),
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => openEditor(t)}><Edit className="h-4 w-4" /></Button>
                                <Button size="sm" variant="ghost" className="text-red-400 hover:bg-red-900/50 hover:text-red-300" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4" /></Button>
                            </div>
                        ])}
                    />
                </div>
            </Card>

            <Modal isOpen={isEditorOpen} onClose={closeEditor} title={selectedTemplate?.id ? 'Edit Template' : 'Create New Template'}>
                {selectedTemplate && (
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="template-name" className="block text-sm font-medium text-gray-300 mb-2">Template Name</label>
                            <Input id="template-name" value={selectedTemplate.name} onChange={e => setSelectedTemplate(p => p ? {...p, name: e.target.value} : null)} placeholder="e.g., Welcome Email" />
                        </div>
                        <div>
                            <label htmlFor="template-subject" className="block text-sm font-medium text-gray-300 mb-2">Subject</label>
                            <Input id="template-subject" value={selectedTemplate.subject} onChange={e => setSelectedTemplate(p => p ? {...p, subject: e.target.value} : null)} placeholder="Welcome to our platform, {{name}}!" />
                        </div>
                        <div>
                            <label htmlFor="template-body" className="block text-sm font-medium text-gray-300 mb-2">HTML Body</label>
                            <textarea
                                id="template-body"
                                rows={12}
                                value={selectedTemplate.body}
                                onChange={e => setSelectedTemplate(p => p ? {...p, body: e.target.value} : null)}
                                className="w-full bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 p-2 font-mono text-sm"
                                placeholder="<h1>Hello {{name}}!</h1>"
                            />
                            <p className="text-xs text-gray-400 mt-1">Use Handlebars-style variables like `{'{{name}}'}` for personalization.</p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={closeEditor}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <><Spinner size="sm" className="mr-2"/> Saving...</> : 'Save Template'}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

const TeamPage = () => {
    const { user } = useAuth();
    const [team, setTeam] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [isInviteModalOpen, setInviteModalOpen] = useState(false);
    const [newUser, setNewUser] = useState({ email: '', role: UserRole.USER });
    const [isInviting, setIsInviting] = useState(false);
    const [error, setError] = useState('');

    const tenantId = user!.tenantId;

    const fetchTeam = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getUsersForTenant(tenantId);
            setTeam(data);
        } catch (e) {
            console.error("Failed to fetch team members", e);
        } finally {
            setLoading(false);
        }
    }, [tenantId]);

    useEffect(() => {
        fetchTeam();
    }, [fetchTeam]);
    
    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        setIsInviting(true);
        setError('');
        try {
            await api.inviteUser(tenantId, newUser.email, newUser.role, user);
            await fetchTeam();
            setInviteModalOpen(false);
            setNewUser({ email: '', role: UserRole.USER });
        } catch(err: any) {
            setError(err.message || 'Failed to invite user.');
        } finally {
            setIsInviting(false);
        }
    };
    
    const handleDelete = async (userId: string) => {
        if (!user) return;
        if (window.confirm("Are you sure you want to remove this user from the team?")) {
            try {
                await api.deleteUser(tenantId, userId, user);
                await fetchTeam();
            } catch (err: any) {
                alert(err.message || 'Failed to delete user.');
            }
        }
    };

    if (loading) return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <Skeleton className="h-8 w-48" />
                    <Skeleton className="h-10 w-32" />
                </div>
                <Table
                    headers={['Name', 'Email', 'Role', 'Status', 'Actions']}
                    rows={Array.from({ length: 4 }).map((_, i) => [
                        <Skeleton key={`name-${i}`} className="h-4 w-32" />,
                        <Skeleton key={`email-${i}`} className="h-4 w-48" />,
                        <Skeleton key={`role-${i}`} className="h-4 w-20" />,
                        <Skeleton key={`status-${i}`} className="h-6 w-24 rounded-full" />,
                        <Skeleton key={`action-${i}`} className="h-8 w-16 rounded-md" />,
                    ])}
                />
            </div>
        </Card>
    );

    return (
        <div className="space-y-6">
            <Card>
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-semibold flex items-center">
                            <Users className="mr-3 h-6 w-6" /> Team Management
                        </h2>
                        <Button onClick={() => setInviteModalOpen(true)}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Invite User
                        </Button>
                    </div>
                    <p className="text-gray-400 mb-6">Manage your team members and their roles within the tenant.</p>
                    <Table
                        headers={['Name', 'Email', 'Role', 'Status', 'Actions']}
                        rows={team.map(member => [
                            <span className="font-medium">{member.name}</span>,
                            member.email,
                            <span className="capitalize">{member.role}</span>,
                             <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                member.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                            }`}>
                                {member.isActive ? 'Active' : 'Inactive'}
                            </span>,
                            <Button 
                                size="sm" 
                                variant="ghost" 
                                className="text-red-400 hover:bg-red-900/50 hover:text-red-300"
                                onClick={() => handleDelete(member.id)}
                                disabled={member.id === user?.id} // Can't delete yourself
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        ])}
                    />
                </div>
            </Card>

            <Modal isOpen={isInviteModalOpen} onClose={() => setInviteModalOpen(false)} title="Invite New User">
                <form onSubmit={handleInvite} className="space-y-4">
                    <div>
                        <label htmlFor="invite-email" className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                        <Input 
                            id="invite-email" 
                            type="email" 
                            value={newUser.email}
                            onChange={e => setNewUser(p => ({...p, email: e.target.value}))}
                            placeholder="teammate@example.com"
                            required
                        />
                    </div>
                     <div>
                        <label htmlFor="invite-role" className="block text-sm font-medium text-gray-300 mb-2">Role</label>
                        <select
                            id="invite-role"
                            value={newUser.role}
                            onChange={e => setNewUser(p => ({...p, role: e.target.value as UserRole}))}
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value={UserRole.USER}>User (can send, view logs)</option>
                            <option value={UserRole.BILLING}>Billing (can view usage)</option>
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-400">{error}</p>}
                    <div className="flex justify-end gap-2 pt-2">
                        <Button variant="outline" type="button" onClick={() => setInviteModalOpen(false)}>Cancel</Button>
                        <Button type="submit" disabled={isInviting}>
                            {isInviting ? <><Spinner size="sm" className="mr-2"/> Sending Invite...</> : 'Send Invite'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};


const DashboardPage: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    return (
        <Layout>
            <Routes>
                {user.role === UserRole.SUPERADMIN && <Route path="/" element={<TenantList />} />}
                {user.role === UserRole.SUPERADMIN && <Route path="/tenants/:tenantId" element={<TenantDetail />} />}

                {user.role === UserRole.ADMIN && <Route path="/" element={<TenantDetail />} />}
                {user.role === UserRole.ADMIN && <Route path="/logs" element={<MessageLogsPage />} />}
                {user.role === UserRole.ADMIN && <Route path="/domains" element={<DomainsPage />} />}
                {user.role === UserRole.ADMIN && <Route path="/templates" element={<TemplatesPage />} />}
                {user.role === UserRole.ADMIN && <Route path="/suppressions" element={<SuppressionsPage />} />}
                {user.role === UserRole.ADMIN && <Route path="/team" element={<TeamPage />} />}
                
                {user.role === UserRole.USER && <Route path="/" element={<UserDashboard />} />}
                {user.role === UserRole.USER && <Route path="/send" element={<SendMessagePage />} />}
                {user.role === UserRole.USER && <Route path="/logs" element={<MessageLogsPage />} />}
                {user.role === UserRole.USER && <Route path="/domains" element={<DomainsPage />} />}
                {user.role === UserRole.USER && <Route path="/templates" element={<TemplatesPage />} />}
                {user.role === UserRole.USER && <Route path="/suppressions" element={<SuppressionsPage />} />}

                <Route path="/settings" element={<SettingsPage />} />
                <Route path="*" element={<div>Page Not Found</div>} />
            </Routes>
        </Layout>
    );
};

export default DashboardPage;