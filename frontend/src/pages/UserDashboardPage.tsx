import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { Skeleton } from '../components/ui/Skeleton';
import { UsageChart } from '../components/UsageChart';
import { Table } from '../components/ui/Table';
import { api } from '../services/mockApi';
import type { CreditBalance, Message, UsageData } from '../types';
import { useUserStore } from '../store/useUserStore';
import { DollarSign, Send, FileText, BarChart2 } from 'lucide-react';

const UserDashboardPage: React.FC = () => {
  const user = useUserStore((state) => state.user);
  const [data, setData] = useState<{
    balance: CreditBalance;
    messages: Message[];
    usage: UsageData[];
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);

    Promise.all([
      api.getTenantDetails(user.user_id),
      api.getMessages(user.user_id),
      api.getUsageData(user.user_id),
    ]).then(([{ balance }, messagesData, usageData]) => {
      setData({ balance, messages: messagesData, usage: usageData });
      setLoading(false);
    });
  }, [user]);

  if (loading || !data)
    return (
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
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <DollarSign className="mr-2 h-5 w-5 text-green-400" />
              Available Credits
            </h3>
            <p className="text-4xl font-bold text-green-400">
              ${data.balance.balance.toFixed(2)}
            </p>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <Send className="mr-2 h-5 w-5 text-blue-400" />
              Messages Sent
            </h3>
            <p className="text-4xl font-bold">{data.messages.length}</p>
            <p className="text-gray-400">Total in the last 30 days</p>
          </div>
        </Card>
      </div>

      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <BarChart2 className="mr-2 h-5 w-5" />
            Sending Volume
          </h3>
          <div className="h-80">
            <UsageChart data={data.usage} />
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h3 className="text-xl font-semibold mb-4 flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Recent Messages
          </h3>
          <Table
            headers={['Date', 'Subject', 'Recipients', 'Status']}
            rows={recentMessages.map((m) => [
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
    </div>
  );
};

export default UserDashboardPage;
