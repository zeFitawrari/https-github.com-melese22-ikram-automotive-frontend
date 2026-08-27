'use client';

import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import {
  HiOutlineArrowsRightLeft,
  HiOutlineCheckCircle,
  HiOutlineClock,
  HiOutlineCube,
  HiOutlinePlusCircle,
  HiOutlineXCircle,
} from 'react-icons/hi2';
import Navbar from '@/components/Navbar';
import { SkeletonBlock, TableSkeleton } from '@/components/Skeleton';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

type Transfer = {
  id: string;
  part_id: string;
  from_workshop_id: string;
  to_workshop_id: string;
  quantity: number;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  notes?: string | null;
  created_at: string;
  part_name?: string;
  part_sku?: string;
  from_workshop_name?: string;
  to_workshop_name?: string;
  requested_by_name?: string;
};

const MANAGER_ROLES = ['SuperAdmin', 'WorkshopManager'];
const STATUS_STYLES: Record<Transfer['status'], string> = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-blue-50 text-blue-700',
  rejected: 'bg-red-50 text-red-700',
  completed: 'bg-emerald-50 text-emerald-700',
};

export default function TransfersPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [form, setForm] = useState({ partId: '', toWorkshopId: '', quantity: '1', notes: '' });

  useEffect(() => {
    if (!loading && (!user || !MANAGER_ROLES.includes(user.role))) {
      router.push(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router]);

  const canManage = !!user && MANAGER_ROLES.includes(user.role);
  const { data: transferData, isLoading: transfersLoading, isError: transfersError } = useQuery({
    queryKey: ['transfers', statusFilter],
    queryFn: async () => {
      const { data } = await api.get(`/transfers${statusFilter ? `?status=${statusFilter}` : ''}`);
      return data as { transfers: Transfer[] };
    },
    enabled: canManage,
  });

  const { data: partsData } = useQuery({
    queryKey: ['transfer-parts'],
    queryFn: async () => (await api.get('/parts?page=1&limit=100')).data,
    enabled: canManage && showForm,
  });

  const { data: workshopsData } = useQuery({
    queryKey: ['public-workshops'],
    queryFn: async () => (await api.get('/workshops/public')).data,
    enabled: canManage && showForm,
  });

  const actionMutation = useMutation({
    mutationFn: async ({ id, action }: { id: string; action: 'approve' | 'reject' | 'complete' }) =>
      (await api.patch(`/transfers/${id}/${action}`)).data,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      toast.success(`Transfer ${variables.action}d.`);
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Unable to update transfer.'),
  });

  const createMutation = useMutation({
    mutationFn: async () =>
      (await api.post('/transfers', {
        partId: form.partId,
        toWorkshopId: form.toWorkshopId,
        quantity: Number(form.quantity),
        notes: form.notes || undefined,
      })).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transfers'] });
      setForm({ partId: '', toWorkshopId: '', quantity: '1', notes: '' });
      setShowForm(false);
      toast.success('Transfer request created.');
    },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Unable to create transfer request.'),
  });

  const transfers = transferData?.transfers || [];
  const stats = useMemo(() => ({
    pending: transfers.filter((transfer) => transfer.status === 'pending').length,
    approved: transfers.filter((transfer) => transfer.status === 'approved').length,
    completed: transfers.filter((transfer) => transfer.status === 'completed').length,
  }), [transfers]);
  const parts = partsData?.parts || [];
  const workshops = (workshopsData?.workshops || []).filter((workshop: any) => workshop.id !== user?.workshop_id && workshop.is_active !== false);

  if (loading) {
    return <><Navbar /><main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8"><SkeletonBlock className="h-8 w-56 mb-8" /><TableSkeleton rows={5} cols={6} /></main></>;
  }

  if (!user || !canManage) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />
      <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm"><HiOutlineArrowsRightLeft className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-2xl font-bold text-gray-900">Parts Transfers</h1><p className="text-sm text-gray-500">Move inventory between workshops and review requests</p></div>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 shadow-sm transition-all"><HiOutlinePlusCircle className="w-4 h-4" />{showForm ? 'Cancel' : 'New Transfer'}</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          {[['pending', 'Pending requests', HiOutlineClock, 'text-amber-600'], ['approved', 'Approved to send', HiOutlineCheckCircle, 'text-blue-600'], ['completed', 'Completed transfers', HiOutlineCheckCircle, 'text-emerald-600']].map(([key, label, Icon, color]) => (
            <button key={key as string} onClick={() => setStatusFilter(statusFilter === key ? '' : key as string)} className={`bg-white rounded-2xl border p-4 text-left transition-all ${statusFilter === key ? 'border-blue-400 ring-2 ring-blue-100' : 'border-gray-200/80 hover:border-gray-300'}`}>
              <div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label as string}</span><Icon className={`w-5 h-5 ${color as string}`} /></div><div className="text-2xl font-bold text-gray-900 mt-1">{stats[key as keyof typeof stats]}</div>
            </button>
          ))}
        </div>

        {showForm && <form onSubmit={(event) => { event.preventDefault(); createMutation.mutate(); }} className="bg-white rounded-2xl border border-gray-200/80 p-6 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-900 mb-4">Request an inventory transfer</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <label className="text-sm font-medium text-gray-700">Part *<select required value={form.partId} onChange={(event) => setForm({ ...form, partId: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-blue-500"><option value="">Select a part</option>{parts.map((part: any) => <option key={part.id} value={part.id}>{part.name} ({part.sku}) · {part.quantity} available</option>)}</select></label>
            <label className="text-sm font-medium text-gray-700">Destination workshop *<select required value={form.toWorkshopId} onChange={(event) => setForm({ ...form, toWorkshopId: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-blue-500"><option value="">Select a workshop</option>{workshops.map((workshop: any) => <option key={workshop.id} value={workshop.id}>{workshop.name}</option>)}</select></label>
            <label className="text-sm font-medium text-gray-700">Quantity *<input required min="1" type="number" value={form.quantity} onChange={(event) => setForm({ ...form, quantity: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-blue-500" /></label>
            <label className="text-sm font-medium text-gray-700 sm:col-span-3">Notes<textarea value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} rows={2} placeholder="Add context for the receiving workshop" className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-blue-500" /></label>
          </div>
          <button type="submit" disabled={createMutation.isPending} className="mt-4 bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">{createMutation.isPending ? 'Submitting...' : 'Submit request'}</button>
        </form>}

        {transfersError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">Unable to load transfer requests.</div>}
        {transfersLoading ? <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm"><TableSkeleton rows={6} cols={6} /></div> : transfers.length === 0 ? <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300"><HiOutlineCube className="w-10 h-10 mx-auto text-gray-300 mb-3" /><p className="text-gray-500 font-medium">No transfer requests found</p><p className="text-sm text-gray-400 mt-1">Create a request to move stock to another workshop.</p></div> : <div className="bg-white rounded-2xl border border-gray-200/80 overflow-x-auto shadow-sm"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50/80"><tr>{['Part', 'Direction', 'Quantity', 'Requested', 'Status', 'Actions'].map((heading) => <th key={heading} className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{transfers.map((transfer) => { const incoming = transfer.to_workshop_id === user.workshop_id; return <tr key={transfer.id} className="hover:bg-gray-50/50"><td className="px-5 py-4"><div className="text-sm font-semibold text-gray-900">{transfer.part_name || 'Unknown part'}</div><div className="text-xs text-gray-400 font-mono">{transfer.part_sku || transfer.part_id}</div></td><td className="px-5 py-4"><div className={`text-sm font-medium ${incoming ? 'text-emerald-700' : 'text-blue-700'}`}>{incoming ? 'Incoming' : 'Outgoing'}</div><div className="text-xs text-gray-400">{incoming ? transfer.from_workshop_name : transfer.to_workshop_name}</div></td><td className="px-5 py-4 text-sm font-bold text-gray-900">{transfer.quantity}</td><td className="px-5 py-4"><div className="text-sm text-gray-700">{transfer.requested_by_name || '—'}</div><div className="text-xs text-gray-400">{new Date(transfer.created_at).toLocaleDateString()}</div></td><td className="px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLES[transfer.status]}`}>{transfer.status}</span></td><td className="px-5 py-4"><div className="flex items-center gap-2">{incoming && transfer.status === 'pending' && <><button disabled={actionMutation.isPending} onClick={() => actionMutation.mutate({ id: transfer.id, action: 'approve' })} className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 disabled:opacity-50">Approve</button><button disabled={actionMutation.isPending} onClick={() => actionMutation.mutate({ id: transfer.id, action: 'reject' })} className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-800 disabled:opacity-50"><HiOutlineXCircle className="w-4 h-4" />Reject</button></>}{!incoming && transfer.status === 'approved' && <button disabled={actionMutation.isPending} onClick={() => actionMutation.mutate({ id: transfer.id, action: 'complete' })} className="text-xs font-semibold text-blue-700 hover:text-blue-900 disabled:opacity-50">Mark complete</button>}{(transfer.status !== 'pending' || !incoming) && transfer.status !== 'approved' && <span className="text-xs text-gray-400">No actions</span>}</div></td></tr>; })}</tbody></table></div>}
      </main>
    </div>
  );
}