import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Skeleton } from '../components/ui/Skeleton';
import { domainApi } from '../services/domainApi';
import type { DomainResponse, VerifyDomainResponse } from '../services/domainApi';
import { Globe, Clipboard, CheckCircle, Clock, Trash2, AlertCircle, XCircle } from 'lucide-react';

const DomainsPage: React.FC = () => {
  const [domains, setDomains] = useState<DomainResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [dkimSelector, setDkimSelector] = useState('email');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isRecordsModalOpen, setRecordsModalOpen] = useState(false);
  const [isVerificationModalOpen, setVerificationModalOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<DomainResponse | null>(null);
  const [verificationResults, setVerificationResults] = useState<VerifyDomainResponse | null>(null);

  const fetchDomains = useCallback(async () => {
    try {
      setLoading(true);
      const data = await domainApi.getDomains();
      setDomains(data);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch domains.');
      console.error('Error fetching domains:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDomains();
  }, [fetchDomains]);

  const handleAddDomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDomain.trim()) return;
    
    setIsAdding(true);
    setError('');
    setSuccess('');
    
    try {
      const createdDomain = await domainApi.createDomain(newDomain.trim(), dkimSelector.trim() || 'email');
      setNewDomain('');
      setDkimSelector('email');
      setSuccess(`Domain ${createdDomain.domain_name} added successfully! DNS records are ready to configure.`);
      await fetchDomains();
      
      // Auto-open records modal for the newly created domain
      setSelectedDomain(createdDomain);
      setRecordsModalOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add domain.');
      console.error('Error adding domain:', err);
    } finally {
      setIsAdding(false);
    }
  };

  const handleVerifyDomain = async (domainId: string) => {
    setVerifyingId(domainId);
    setError('');
    setSuccess('');
    
    try {
      const result = await domainApi.verifyDomain(domainId);
      setVerificationResults(result);
      setSelectedDomain(result.domain);
      setVerificationModalOpen(true);
      await fetchDomains();
      
      if (result.verified) {
        setSuccess('All DNS records verified successfully!');
      } else {
        setError('Some DNS records failed verification. Please check the details.');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to verify domain.');
      console.error('Error verifying domain:', err);
    } finally {
      setVerifyingId(null);
    }
  };

  const handleDeleteDomain = async (domainId: string) => {
    if (!window.confirm('Are you sure you want to delete this domain? This action cannot be undone.')) {
      return;
    }

    setDeletingId(domainId);
    setError('');
    setSuccess('');
    
    try {
      await domainApi.deleteDomain(domainId);
      setSuccess('Domain deleted successfully.');
      await fetchDomains();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete domain.');
      console.error('Error deleting domain:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const showRecords = (domain: DomainResponse) => {
    setSelectedDomain(domain);
    setRecordsModalOpen(true);
  };

  const DnsRecordRow = ({ type, host, value, instructions }: { type: string; host: string; value: string; instructions?: string }) => {
    const [copied, setCopied] = useState(false);
    const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    };

    return (
      <div className="space-y-2 mb-4">
        <div className="grid grid-cols-3 gap-2 text-sm items-center">
          <div className="font-mono text-gray-400">{type}</div>
          <div className="font-mono text-gray-300 col-span-2 flex justify-between items-center bg-gray-900 p-2 rounded border border-gray-700">
            <span className="truncate">{host}</span>
            <button 
              onClick={() => copyToClipboard(host)} 
              className="text-gray-400 hover:text-white ml-2 shrink-0"
              title="Copy host"
            >
              {copied ? <CheckCircle size={16} className="text-green-500" /> : <Clipboard size={16} />}
            </button>
          </div>
        </div>
        <div className="font-mono text-gray-300 text-sm break-all bg-gray-900 p-2 rounded border border-gray-700 flex justify-between items-start gap-2">
          <span className="flex-1">{value}</span>
          <button
            onClick={() => copyToClipboard(value)}
            className="text-gray-400 hover:text-white shrink-0"
            title="Copy value"
          >
            {copied ? <CheckCircle size={16} className="text-green-500" /> : <Clipboard size={16} />}
          </button>
        </div>
        {instructions && (
          <p className="text-xs text-gray-400 italic">{instructions}</p>
        )}
      </div>
    );
  };

  if (loading)
    return (
      <Card>
        <div className="p-6">
          <h2 className="text-2xl font-semibold mb-4 flex items-center">
            <Globe className="mr-3 h-6 w-6" /> Sending Domains
          </h2>
          <div className="mb-4">
            <Skeleton className="h-10 w-full max-w-lg" />
          </div>
          <Table
            headers={['Domain', 'Status', 'Last Verified', 'Actions']}
            rows={Array.from({ length: 3 }).map((_, i) => [
              <Skeleton key={`domain-${i}`} className="h-4 w-48" />,
              <Skeleton key={`status-${i}`} className="h-6 w-24 rounded-full" />,
              <Skeleton key={`date-${i}`} className="h-4 w-32" />,
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
          <h2 className="text-2xl font-semibold mb-4 flex items-center text-white">
            <Globe className="mr-3 h-6 w-6" /> Sending Domains
          </h2>
          <p className="text-gray-400 mb-6">
            Verify your domains to start sending emails. Add the provided DNS records to your domain's
            registrar. It may take some time for DNS changes to propagate.
          </p>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded-md text-green-300 text-sm flex items-center">
              <CheckCircle className="mr-2 h-4 w-4" />
              {success}
            </div>
          )}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded-md text-red-300 text-sm flex items-center">
              <AlertCircle className="mr-2 h-4 w-4" />
              {error}
            </div>
          )}

          {/* Add domain form */}
          <form onSubmit={handleAddDomain} className="mb-6 space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder="example.com"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                required
                className="grow"
                disabled={isAdding}
              />
              <Input
                type="text"
                placeholder="DKIM Selector (default: email)"
                value={dkimSelector}
                onChange={(e) => setDkimSelector(e.target.value)}
                className="w-48"
                disabled={isAdding}
              />
              <Button type="submit" disabled={isAdding}>
                {isAdding ? 'Adding...' : 'Add Domain'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              The DKIM selector is used to identify your DKIM key. Default is "email".
            </p>
          </form>

          {domains.length === 0 && !loading ? (
            <div className="text-center py-12 text-gray-400">
              <Globe className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No domains added yet. Add your first domain to get started.</p>
            </div>
          ) : (
            <Table
              headers={['Domain', 'Status', 'Last Verified', 'Actions']}
              rows={domains.map((d) => [
                <span className="font-medium text-white">{d.domain_name}</span>,
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    d.status === 'verified'
                      ? 'bg-green-900 text-green-300'
                      : d.status === 'pending'
                      ? 'bg-yellow-900 text-yellow-300'
                      : d.status === 'failed'
                      ? 'bg-red-900 text-red-300'
                      : 'bg-gray-700 text-gray-300'
                  }`}
                >
                  {d.status === 'verified' && <CheckCircle className="mr-1.5 h-3 w-3" />}
                  {d.status === 'pending' && <Clock className="mr-1.5 h-3 w-3" />}
                  {d.status === 'failed' && <XCircle className="mr-1.5 h-3 w-3" />}
                  <span className="capitalize">{d.status}</span>
                </span>,
                <span className="text-gray-400 text-sm">
                  {d.last_verified_at 
                    ? new Date(d.last_verified_at).toLocaleString() 
                    : 'Never'}
                </span>,
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => showRecords(d)}>
                    View Records
                  </Button>
                  {d.status !== 'verified' && (
                    <Button
                      size="sm"
                      onClick={() => handleVerifyDomain(d._id)}
                      disabled={verifyingId === d._id}
                    >
                      {verifyingId === d._id ? 'Verifying...' : 'Verify'}
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-400 hover:bg-red-900/50 hover:text-red-300"
                    onClick={() => handleDeleteDomain(d._id)}
                    disabled={deletingId === d._id}
                    title="Delete domain"
                  >
                    {deletingId === d._id ? (
                      'Deleting...'
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>,
              ])}
            />
          )}
        </div>
      </Card>

      {/* DNS Records Modal */}
      <Modal
        isOpen={isRecordsModalOpen}
        onClose={() => {
          setRecordsModalOpen(false);
          setSelectedDomain(null);
        }}
        title={`DNS Records for ${selectedDomain?.domain_name || ''}`}
      >
        {selectedDomain && (
          <div className="space-y-6 py-3 overflow-y-auto px-6 max-h-[80vh]">
            <p className="text-gray-300 text-sm">
              Add these DNS records to your domain's DNS settings. It may take some time for them to
              propagate (usually 5-30 minutes, but can take up to 48 hours).
            </p>

            {selectedDomain.dnsRecords ? (
              <>
                <div>
                  <h4 className="font-semibold text-lg pt-2 text-white mb-3">SPF Record</h4>
                  <DnsRecordRow
                    type="TXT"
                    host={selectedDomain.dnsRecords.spf.host}
                    value={selectedDomain.dnsRecords.spf.value}
                    instructions={selectedDomain.dnsRecords.spf.instructions}
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-lg pt-2 text-white mb-3">DKIM Record</h4>
                  <DnsRecordRow
                    type="TXT"
                    host={selectedDomain.dnsRecords.dkim.host}
                    value={selectedDomain.dnsRecords.dkim.value}
                    instructions={selectedDomain.dnsRecords.dkim.instructions}
                  />
                </div>

                <div>
                  <h4 className="font-semibold text-lg pt-2 text-white mb-3">DMARC Record</h4>
                  <DnsRecordRow
                    type="TXT"
                    host={selectedDomain.dnsRecords.dmarc.host}
                    value={selectedDomain.dnsRecords.dmarc.value}
                    instructions={selectedDomain.dnsRecords.dmarc.instructions}
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                {selectedDomain.spf_record && (
                  <div>
                    <h4 className="font-semibold text-lg pt-2 text-white mb-3">SPF Record</h4>
                    <DnsRecordRow
                      type="TXT"
                      host={selectedDomain.domain_name}
                      value={selectedDomain.spf_record}
                      instructions="Add this TXT record at the root (@) of your domain"
                    />
                  </div>
                )}
                {selectedDomain.dkim_public_key && (
                  <div>
                    <h4 className="font-semibold text-lg pt-2 text-white mb-3">DKIM Record</h4>
                    <DnsRecordRow
                      type="TXT"
                      host={`${selectedDomain.dkim_selector}._domainkey.${selectedDomain.domain_name}`}
                      value={selectedDomain.dkim_public_key}
                      instructions={`Add this TXT record at ${selectedDomain.dkim_selector}._domainkey.${selectedDomain.domain_name}`}
                    />
                  </div>
                )}
                {selectedDomain.dmarc_record && (
                  <div>
                    <h4 className="font-semibold text-lg pt-2 text-white mb-3">DMARC Record</h4>
                    <DnsRecordRow
                      type="TXT"
                      host={`_dmarc.${selectedDomain.domain_name}`}
                      value={selectedDomain.dmarc_record}
                      instructions={`Add this TXT record at _dmarc.${selectedDomain.domain_name}`}
                    />
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-4 border-t border-gray-700">
              <Button onClick={() => {
                setRecordsModalOpen(false);
                setSelectedDomain(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Verification Results Modal */}
      <Modal
        isOpen={isVerificationModalOpen}
        onClose={() => {
          setVerificationModalOpen(false);
          setVerificationResults(null);
        }}
        title={`Verification Results for ${selectedDomain?.domain_name || ''}`}
      >
        {verificationResults && (
          <div className="space-y-4 py-3 overflow-y-auto max-h-[90vh]">
            <div className={`p-4 rounded-md border ${
              verificationResults.verified
                ? 'bg-green-900/50 border-green-700 text-green-300'
                : 'bg-yellow-900/50 border-yellow-700 text-yellow-300'
            }`}>
              <div className="flex items-center">
                {verificationResults.verified ? (
                  <CheckCircle className="mr-2 h-5 w-5" />
                ) : (
                  <AlertCircle className="mr-2 h-5 w-5" />
                )}
                <span className="font-semibold">
                  {verificationResults.verified
                    ? 'All DNS records verified successfully!'
                    : 'Some DNS records failed verification'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-900 rounded border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">DKIM</span>
                  {verificationResults.verificationResults.dkim.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {verificationResults.verificationResults.dkim.message}
                </p>
                {verificationResults.verificationResults.dkim.recordValue && (
                  <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                    Found: {verificationResults.verificationResults.dkim.recordValue}
                  </p>
                )}
              </div>

              <div className="p-3 bg-gray-900 rounded border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">SPF</span>
                  {verificationResults.verificationResults.spf.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {verificationResults.verificationResults.spf.message}
                </p>
                {verificationResults.verificationResults.spf.recordValue && (
                  <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                    Found: {verificationResults.verificationResults.spf.recordValue}
                  </p>
                )}
              </div>

              <div className="p-3 bg-gray-900 rounded border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-white">DMARC</span>
                  {verificationResults.verificationResults.dmarc.verified ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <p className="text-sm text-gray-400">
                  {verificationResults.verificationResults.dmarc.message}
                </p>
                {verificationResults.verificationResults.dmarc.recordValue && (
                  <p className="text-xs text-gray-500 mt-1 font-mono break-all">
                    Found: {verificationResults.verificationResults.dmarc.recordValue}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-700">
              <Button onClick={() => {
                setVerificationModalOpen(false);
                setVerificationResults(null);
              }}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default DomainsPage;
