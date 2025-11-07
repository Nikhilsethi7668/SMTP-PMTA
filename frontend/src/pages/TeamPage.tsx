import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Spinner } from '../components/ui/Spinner';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/mockApi';
import  { type User } from '../types';
import { UserRole } from '../types';
import { Users } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore'; // ✅ Zustand store import

const TeamPage: React.FC = () => {
  const user = useAuthStore((state) => state.user); // ✅ from Zustand store
  const [team, setTeam] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInviteModalOpen, setInviteModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: UserRole.USER });
  const [isInviting, setIsInviting] = useState(false);
  const [error, setError] = useState('');

  const tenantId = user?.tenantId;

  const fetchTeam = useCallback(async () => {
    if (!tenantId) return;
    setLoading(true);
    try {
      const data = await api.getUsersForTenant(tenantId);
      setTeam(data);
    } catch (e) {
      console.error('Failed to fetch team members', e);
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
      await api.inviteUser(tenantId!, newUser.email, newUser.role, user);
      await fetchTeam();
      setInviteModalOpen(false);
      setNewUser({ email: '', role: UserRole.USER });
    } catch (err: any) {
      setError(err.message || 'Failed to invite user.');
    } finally {
      setIsInviting(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!user) return;
    if (window.confirm('Are you sure you want to remove this user from the team?')) {
      try {
        await api.deleteUser(tenantId!, userId, user);
        await fetchTeam();
      } catch (err: any) {
        alert(err.message || 'Failed to delete user.');
      }
    }
  };

  if (loading)
    return (
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
            <Button onClick={() => setInviteModalOpen(true)}>Invite User</Button>
          </div>
          <p className="text-gray-400 mb-6">
            Manage your team members and their roles within the tenant.
          </p>
          <Table
            headers={['Name', 'Email', 'Role', 'Status', 'Actions']}
            rows={team.map((member) => [
              <span className="font-medium">{member.name}</span>,
              member.email,
              <span className="capitalize">{member.role}</span>,
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  member.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
                }`}
              >
                {member.isActive ? 'Active' : 'Inactive'}
              </span>,
              <Button
                size="sm"
                variant="ghost"
                className="text-red-400 hover:bg-red-900/50 hover:text-red-300"
                onClick={() => handleDelete(member.id)}
                disabled={member.id === user?.id}
              >
                Remove
              </Button>,
            ])}
          />
        </div>
      </Card>

      <Modal
        isOpen={isInviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        title="Invite New User"
      >
        <form onSubmit={handleInvite} className="space-y-4">
          <div>
            <label
              htmlFor="invite-email"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Email Address
            </label>
            <Input
              id="invite-email"
              type="email"
              value={newUser.email}
              onChange={(e) => setNewUser((p) => ({ ...p, email: e.target.value }))}
              placeholder="teammate@example.com"
              required
            />
          </div>
          <div>
            <label
              htmlFor="invite-role"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Role
            </label>
            <select
              id="invite-role"
              value={newUser.role}
              onChange={(e) => setNewUser((p) => ({ ...p, role: e.target.value as UserRole }))}
              className="w-full px-4 py-2 bg-gray-900 border border-gray-700 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value={UserRole.USER}>User (can send, view logs)</option>
              <option value={UserRole.BILLING}>Billing (can view usage)</option>
            </select>
          </div>
          {error && <p className="text-sm text-red-400">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setInviteModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isInviting}>
              {isInviting ? (
                <>
                  <Spinner size="sm" className="mr-2" /> Sending Invite...
                </>
              ) : (
                'Send Invite'
              )}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default TeamPage;
