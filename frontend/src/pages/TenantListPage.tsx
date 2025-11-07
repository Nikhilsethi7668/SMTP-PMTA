import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/mockApi';
import type { Tenant } from '../types';

const TenantListPage: React.FC = () => {
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

export default TenantListPage;