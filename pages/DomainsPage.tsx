import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/mockApi';
import { Domain } from '../types';
import { useAuth } from '../hooks/useAuth';
import { Globe, Clipboard, CheckCircle, Clock } from 'lucide-react';

const DomainsPage: React.FC = () => {
    const [domains, setDomains] = useState<Domain[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDomain, setNewDomain] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    const [isRecordsModalOpen, setRecordsModalOpen] = useState(false);
    const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);

    const { user } = useAuth();
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
                            {isAdding ? 'Adding...' : 'Add Domain'}
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
                                        {verifyingId === d.id ? 'Verifying...' : 'Verify'}
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

export default DomainsPage;