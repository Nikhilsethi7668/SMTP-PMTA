import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/mockApi';
import { Message, MessageStatus } from '../types';
import { useAuth } from '../hooks/useAuth';
import { FileText, Search, XCircle } from 'lucide-react';

const MessageLogsPage: React.FC = () => {
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

export default MessageLogsPage;