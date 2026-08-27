'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiOutlineCheckCircle, HiOutlineClock, HiOutlinePencilSquare, HiOutlinePlusCircle, HiOutlineWrenchScrewdriver, HiOutlineXCircle } from 'react-icons/hi2';
import Navbar from '@/components/Navbar';
import { SkeletonBlock, TableSkeleton } from '@/components/Skeleton';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

type ServiceTemplate = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  base_price?: number | string | null;
  estimated_minutes?: number | null;
  is_active: boolean;
};

const MANAGER_ROLES = ['SuperAdmin', 'WorkshopManager'];

const emptyForm = { name: '', description: '', category: '', basePrice: '', estimatedMinutes: '' };

export default function ServiceTemplatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showInactive, setShowInactive] = useState(true);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (!loading && (!user || !MANAGER_ROLES.includes(user.role))) router.push(user ? '/dashboard' : '/login');
  }, [user, loading, router]);

  const canManage = !!user && MANAGER_ROLES.includes(user.role);
  const { data, isLoading, isError } = useQuery({
    queryKey: ['service-templates'],
    queryFn: async () => (await api.get('/services')).data as { services: ServiceTemplate[] },
    enabled: canManage,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        ...(form.basePrice ? { basePrice: Number(form.basePrice) } : {}),
        ...(form.estimatedMinutes ? { estimatedMinutes: Number(form.estimatedMinutes) } : {}),
      };
      return editingId ? (await api.patch(`/services/${editingId}`, {
        ...payload,
        base_price: form.basePrice ? Number(form.basePrice) : null,
        estimated_minutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : null,
      })).data : (await api.post('/services', payload)).data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['service-templates'] });
      setForm(emptyForm); setEditingId(null); setShowForm(false);
      toast.success(editingId ? 'Service template updated.' : 'Service template created.');
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Unable to save service template.'),
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => (await api.patch(`/services/${id}`, { is_active: !isActive })).data,
    onSuccess: (_, variables) => { queryClient.invalidateQueries({ queryKey: ['service-templates'] }); toast.success(variables.isActive ? 'Template deactivated.' : 'Template activated.'); },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Unable to change template status.'),
  });

  const templates = (data?.services || []).filter((template) => showInactive || template.is_active);
  const beginEdit = (template: ServiceTemplate) => {
    setEditingId(template.id);
    setForm({ name: template.name, description: template.description || '', category: template.category || '', basePrice: template.base_price?.toString() || '', estimatedMinutes: template.estimated_minutes?.toString() || '' });
    setShowForm(true);
  };

  if (loading) return <><Navbar /><main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8"><SkeletonBlock className="h-8 w-64 mb-8" /><TableSkeleton rows={5} cols={6} /></main></>;
  if (!user || !canManage) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-violet-50/30">
      <Navbar />
      <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-sm"><HiOutlineWrenchScrewdriver className="w-5 h-5 text-white" /></div><div><h1 className="text-2xl font-bold text-gray-900">Service Templates</h1><p className="text-sm text-gray-500">Standardize services offered by your workshop</p></div></div>
          <button onClick={() => { setEditingId(null); setForm(emptyForm); setShowForm(!showForm); }} className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 shadow-sm"><HiOutlinePlusCircle className="w-4 h-4" />{showForm ? 'Cancel' : 'New Template'}</button>
        </div>

        <div className="flex items-center justify-between mb-4"><p className="text-sm text-gray-500">{templates.length} template{templates.length === 1 ? '' : 's'}</p><button onClick={() => setShowInactive(!showInactive)} className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold border ${showInactive ? 'bg-violet-50 border-violet-200 text-violet-700' : 'bg-white border-gray-200 text-gray-600'}`}>{showInactive ? <HiOutlineCheckCircle className="w-4 h-4" /> : <HiOutlineXCircle className="w-4 h-4" />} {showInactive ? 'Showing inactive' : 'Active only'}</button></div>

        {showForm && <form onSubmit={(event) => { event.preventDefault(); saveMutation.mutate(); }} className="bg-white rounded-2xl border border-gray-200/80 p-6 mb-6 shadow-sm"><h2 className="font-semibold text-gray-900 mb-4">{editingId ? 'Edit service template' : 'Create service template'}</h2><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700">Name *<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-violet-500" /></label><label className="text-sm font-medium text-gray-700">Category<input value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} placeholder="e.g. Maintenance" className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-violet-500" /></label><label className="text-sm font-medium text-gray-700">Base price<input min="0" step="0.01" type="number" value={form.basePrice} onChange={(event) => setForm({ ...form, basePrice: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-violet-500" /></label><label className="text-sm font-medium text-gray-700">Estimated minutes<input min="0" type="number" value={form.estimatedMinutes} onChange={(event) => setForm({ ...form, estimatedMinutes: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-violet-500" /></label><label className="text-sm font-medium text-gray-700 sm:col-span-2">Description<textarea rows={2} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-violet-500" /></label></div><button type="submit" disabled={saveMutation.isPending} className="mt-4 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 disabled:opacity-50">{saveMutation.isPending ? 'Saving...' : editingId ? 'Save changes' : 'Create template'}</button></form>}

        {isError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">Unable to load service templates.</div>}
        {isLoading ? <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm"><TableSkeleton rows={6} cols={6} /></div> : templates.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><HiOutlineWrenchScrewdriver className="w-10 h-10 mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No service templates found</p><p className="text-sm text-gray-400 mt-1">Create reusable services for faster job card setup.</p></div> : <div className="bg-white rounded-2xl border border-gray-200/80 overflow-x-auto shadow-sm"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50/80"><tr>{['Service', 'Category', 'Base price', 'Duration', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{templates.map((template) => <tr key={template.id} className={`hover:bg-gray-50/50 ${!template.is_active ? 'bg-gray-50/70' : ''}`}><td className="px-5 py-4"><div className="text-sm font-semibold text-gray-900">{template.name}</div>{template.description && <div className="text-xs text-gray-400 max-w-xs truncate">{template.description}</div>}</td><td className="px-5 py-4 text-sm text-gray-600">{template.category || '—'}</td><td className="px-5 py-4 text-sm font-semibold text-gray-800">{template.base_price == null ? '—' : Number(template.base_price).toFixed(2)}</td><td className="px-5 py-4 text-sm text-gray-600">{template.estimated_minutes ? <span className="inline-flex items-center gap-1"><HiOutlineClock className="w-4 h-4 text-gray-400" />{template.estimated_minutes} min</span> : '—'}</td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${template.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{template.is_active ? 'Active' : 'Inactive'}</span></td><td className="px-5 py-4"><div className="flex items-center gap-3"><button onClick={() => beginEdit(template)} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-700 hover:text-violet-900"><HiOutlinePencilSquare className="w-4 h-4" />Edit</button><button disabled={toggleMutation.isPending} onClick={() => toggleMutation.mutate({ id: template.id, isActive: template.is_active })} className={`text-xs font-semibold disabled:opacity-50 ${template.is_active ? 'text-red-600 hover:text-red-800' : 'text-emerald-700 hover:text-emerald-900'}`}>{template.is_active ? 'Deactivate' : 'Activate'}</button></div></td></tr>)}</tbody></table></div>}
      </main>
    </div>
  );
}