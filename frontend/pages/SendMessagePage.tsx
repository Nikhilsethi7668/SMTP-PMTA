import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { api } from '../services/mockApi';
import { useAuth } from '../hooks/useAuth';
import { Send } from 'lucide-react';

const SendMessagePage: React.FC = () => {
    const [subject, setSubject] = useState('');
    const [recipients, setRecipients] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const { user } = useAuth();

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

export default SendMessagePage;