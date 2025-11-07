import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Spinner } from '../components/ui/Spinner';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/mockApi';
import type { Suppression } from '../types';
import { useAuthStore } from '../store/useAuthStore';

const SuppressionsPage: React.FC = () => {
    const [suppressions, setSuppressions] = useState<Suppression[]>([]);
    const [loading, setLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState('');

    const user = useAuthStore((state) => state.user);
    const tenantId = user?.tenantId!;

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
        if (!newEmail || !tenantId || !user) return;
        setIsAdding(true);
        setError('');
        try {
            await api.addSuppression(tenantId, newEmail, 'manual', user);
            setNewEmail('');
            await fetchSuppressions();
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
                    <h2 className="text-2xl font-semibold mb-4">Suppression List</h2>
                    <p className="text-gray-400 mb-6">
                        Emails on this list will be blocked from receiving messages. 
                        This includes automatic additions from bounces and complaints.
                    </p>
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
                            {isAdding ? (
                                <>
                                    <Spinner size="sm" className="mr-2" /> Adding...
                                </>
                            ) : (
                                'Add to List'
                            )}
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

export default SuppressionsPage;
