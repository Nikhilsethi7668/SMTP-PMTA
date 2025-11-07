import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '../components/ui/Card';
import { Table } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Spinner } from '../components/ui/Spinner';
import { Skeleton } from '../components/ui/Skeleton';
import { api } from '../services/mockApi';
import type { Template } from '../types';
import { FileCode, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

const TemplatesPage: React.FC = () => {
    const user = useAuthStore((state) => state.user); // ✅ from Zustand
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTemplate, setSelectedTemplate] = useState<Partial<Template> | null>(null);
    const [isEditorOpen, setEditorOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const tenantId = user?.tenantId; // ✅ safer check

    const fetchTemplates = useCallback(async () => {
        if (!tenantId) return;
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
        if (!tenantId || !selectedTemplate) return;
        setIsSaving(true);
        try {
            await api.saveTemplate(
                tenantId,
                selectedTemplate as Omit<Template, 'tenantId' | 'createdAt' | 'updatedAt'>
            );
            await fetchTemplates();
            closeEditor();
        } catch (error) {
            console.error("Failed to save template", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (templateId: string) => {
        if (!tenantId) return;
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
                    <p className="text-gray-400 mb-6">
                        Create and manage reusable email templates with dynamic content.
                    </p>
                    <Table
                        headers={['Name', 'Subject', 'Last Updated', 'Actions']}
                        rows={templates.map((t) => [
                            <span className="font-medium">{t.name}</span>,
                            <span>{t.subject}</span>,
                            new Date(t.updatedAt).toLocaleString(),
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => openEditor(t)}
                                >
                                    <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-400 hover:bg-red-900/50 hover:text-red-300"
                                    onClick={() => handleDelete(t.id)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>,
                        ])}
                    />
                </div>
            </Card>

            <Modal
                isOpen={isEditorOpen}
                onClose={closeEditor}
                title={selectedTemplate?.id ? 'Edit Template' : 'Create New Template'}
            >
                {selectedTemplate && (
                    <div className="space-y-4">
                        <div>
                            <label
                                htmlFor="template-name"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Template Name
                            </label>
                            <input
                                id="template-name"
                                value={selectedTemplate.name}
                                onChange={(e) =>
                                    setSelectedTemplate((p) =>
                                        p ? { ...p, name: e.target.value } : null
                                    )
                                }
                                placeholder="e.g., Welcome Email"
                                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="template-subject"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                Subject
                            </label>
                            <input
                                id="template-subject"
                                value={selectedTemplate.subject}
                                onChange={(e) =>
                                    setSelectedTemplate((p) =>
                                        p ? { ...p, subject: e.target.value } : null
                                    )
                                }
                                placeholder="Welcome to our platform, {{name}}!"
                                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2"
                            />
                        </div>
                        <div>
                            <label
                                htmlFor="template-body"
                                className="block text-sm font-medium text-gray-300 mb-2"
                            >
                                HTML Body
                            </label>
                            <textarea
                                id="template-body"
                                rows={12}
                                value={selectedTemplate.body}
                                onChange={(e) =>
                                    setSelectedTemplate((p) =>
                                        p ? { ...p, body: e.target.value } : null
                                    )
                                }
                                className="w-full bg-gray-900 border border-gray-700 rounded-md p-2 font-mono text-sm"
                                placeholder="<h1>Hello {{name}}!</h1>"
                            />
                            <p className="text-xs text-gray-400 mt-1">
                                Use Handlebars-style variables like {'{{name}}'} for
                                personalization.
                            </p>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <Button variant="outline" onClick={closeEditor}>
                                Cancel
                            </Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? (
                                    <>
                                        <Spinner size="sm" className="mr-2" /> Saving...
                                    </>
                                ) : (
                                    'Save Template'
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default TemplatesPage;
