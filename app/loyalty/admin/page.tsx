'use client';

import { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { HiOutlineGift, HiOutlinePlusCircle, HiOutlineStar, HiOutlineUsers } from 'react-icons/hi2';
import Navbar from '@/components/Navbar';
import { SkeletonBlock, TableSkeleton } from '@/components/Skeleton';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

type ReferralCode = { id: string; code: string; reward_amount: number | string; max_uses: number; current_uses: number; is_active: boolean; customer_name?: string; created_at: string };
type Referral = { id: string; code: string; reward_amount: number | string; referred_name?: string; created_at: string };
type Customer = { id: string; name: string; phone?: string | null; email?: string | null; is_active: boolean };

const MANAGER_ROLES = ['SuperAdmin', 'WorkshopManager'];

export default function LoyaltyAdminPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [showCodeForm, setShowCodeForm] = useState(false);
  const [codeForm, setCodeForm] = useState({ rewardAmount: '0', maxUses: '10' });
  const [awardForm, setAwardForm] = useState({ customerId: '', points: '', reason: '' });

  useEffect(() => {
    if (!loading && (!user || !MANAGER_ROLES.includes(user.role))) router.push(user ? '/dashboard' : '/login');
  }, [user, loading, router]);

  const canManage = !!user && MANAGER_ROLES.includes(user.role);
  const codesQuery = useQuery({ queryKey: ['loyalty-referral-codes'], queryFn: async () => (await api.get('/loyalty/referral-codes')).data as { codes: ReferralCode[] }, enabled: canManage });
  const referralsQuery = useQuery({ queryKey: ['loyalty-referrals'], queryFn: async () => (await api.get('/loyalty/referrals')).data as { referrals: Referral[] }, enabled: canManage });
  const customersQuery = useQuery({ queryKey: ['loyalty-customers'], queryFn: async () => (await api.get('/auth/users?role=Customer')).data as { users: Customer[] }, enabled: canManage });

  const createCodeMutation = useMutation({
    mutationFn: async () => (await api.post('/loyalty/referral-codes', { rewardAmount: Number(codeForm.rewardAmount), maxUses: Number(codeForm.maxUses) })).data,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loyalty-referral-codes'] }); setCodeForm({ rewardAmount: '0', maxUses: '10' }); setShowCodeForm(false); toast.success('Referral code created.'); },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Unable to create referral code.'),
  });

  const awardMutation = useMutation({
    mutationFn: async () => (await api.post('/loyalty/award-points', { customerId: awardForm.customerId, points: Number(awardForm.points), reason: awardForm.reason || undefined })).data,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['loyalty-customer-points', awardForm.customerId] }); setAwardForm({ customerId: '', points: '', reason: '' }); toast.success('Points awarded.'); },
    onError: (error: any) => toast.error(error.response?.data?.error || 'Unable to award points.'),
  });

  if (loading) return <><Navbar /><main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8"><SkeletonBlock className="h-8 w-56 mb-8" /><TableSkeleton rows={5} cols={5} /></main></>;
  if (!user || !canManage) return null;

  const codes = codesQuery.data?.codes || [];
  const referrals = referralsQuery.data?.referrals || [];
  const customers = (customersQuery.data?.users || []).filter((customer) => customer.is_active !== false);
  const queryError = codesQuery.isError || referralsQuery.isError || customersQuery.isError;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-amber-50/30">
      <Navbar />
      <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"><div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-sm"><HiOutlineGift className="w-5 h-5 text-white" /></div><div><h1 className="text-2xl font-bold text-gray-900">Loyalty & Referrals</h1><p className="text-sm text-gray-500">Manage rewards, referral codes, and customer points</p></div></div><button onClick={() => setShowCodeForm(!showCodeForm)} className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-amber-700 hover:to-orange-700 shadow-sm"><HiOutlinePlusCircle className="w-4 h-4" />{showCodeForm ? 'Cancel' : 'New referral code'}</button></div>

        {queryError && <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">Some loyalty data could not be loaded. Please try again.</div>}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6"><div className="bg-white rounded-2xl border border-gray-200/80 p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Active codes</span><HiOutlineGift className="w-5 h-5 text-amber-600" /></div><div className="text-2xl font-bold text-gray-900 mt-1">{codes.filter((code) => code.is_active).length}</div></div><div className="bg-white rounded-2xl border border-gray-200/80 p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Successful referrals</span><HiOutlineUsers className="w-5 h-5 text-blue-600" /></div><div className="text-2xl font-bold text-gray-900 mt-1">{referrals.length}</div></div><div className="bg-white rounded-2xl border border-gray-200/80 p-4"><div className="flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Value per point</span><HiOutlineStar className="w-5 h-5 text-emerald-600" /></div><div className="text-2xl font-bold text-gray-900 mt-1">10 ETB</div><p className="text-xs text-gray-400">100 referral bonus points</p></div></div>

        {showCodeForm && <form onSubmit={(event) => { event.preventDefault(); createCodeMutation.mutate(); }} className="bg-white rounded-2xl border border-gray-200/80 p-6 mb-6 shadow-sm"><h2 className="font-semibold text-gray-900 mb-1">Create referral code</h2><p className="text-xs text-gray-500 mb-4">The generated code will be associated with your manager account.</p><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-gray-700">Reward amount (ETB)<input required min="0" type="number" value={codeForm.rewardAmount} onChange={(event) => setCodeForm({ ...codeForm, rewardAmount: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-amber-500" /></label><label className="text-sm font-medium text-gray-700">Maximum uses<input required min="1" type="number" value={codeForm.maxUses} onChange={(event) => setCodeForm({ ...codeForm, maxUses: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-amber-500" /></label></div><button type="submit" disabled={createCodeMutation.isPending} className="mt-4 bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-50">{createCodeMutation.isPending ? 'Creating...' : 'Create code'}</button></form>}

        <div className="grid gap-6 xl:grid-cols-2 mb-6"><section className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm"><div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Referral codes</h2><p className="text-xs text-gray-500 mt-1">Codes and their usage limits</p></div>{codesQuery.isLoading ? <TableSkeleton rows={4} cols={4} /> : codes.length === 0 ? <p className="text-sm text-gray-500 text-center py-10">No referral codes found.</p> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50/80"><tr>{['Code', 'Owner', 'Reward', 'Uses', 'Status'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{codes.map((code) => <tr key={code.id} className="hover:bg-gray-50/50"><td className="px-4 py-3 text-sm font-mono font-semibold text-gray-900">{code.code}</td><td className="px-4 py-3 text-sm text-gray-600">{code.customer_name || '—'}</td><td className="px-4 py-3 text-sm text-gray-600">{Number(code.reward_amount).toFixed(2)} ETB</td><td className="px-4 py-3 text-sm text-gray-600">{code.current_uses}/{code.max_uses}</td><td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${code.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'}`}>{code.is_active ? 'Active' : 'Inactive'}</span></td></tr>)}</tbody></table></div>}</section>

        <section className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm"><div className="px-5 py-4 border-b border-gray-100"><h2 className="font-semibold text-gray-900">Recent referrals</h2><p className="text-xs text-gray-500 mt-1">Customers acquired through referral codes</p></div>{referralsQuery.isLoading ? <TableSkeleton rows={4} cols={3} /> : referrals.length === 0 ? <p className="text-sm text-gray-500 text-center py-10">No referrals found.</p> : <div className="overflow-x-auto"><table className="min-w-full divide-y divide-gray-200"><thead className="bg-gray-50/80"><tr>{['Customer', 'Code', 'Reward', 'Date'].map((heading) => <th key={heading} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{heading}</th>)}</tr></thead><tbody className="divide-y divide-gray-100">{referrals.map((referral) => <tr key={referral.id} className="hover:bg-gray-50/50"><td className="px-4 py-3 text-sm font-medium text-gray-900">{referral.referred_name || '—'}</td><td className="px-4 py-3 text-sm font-mono text-gray-600">{referral.code}</td><td className="px-4 py-3 text-sm text-gray-600">{Number(referral.reward_amount).toFixed(2)} ETB</td><td className="px-4 py-3 text-sm text-gray-500">{new Date(referral.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div>}</section></div>

        <section className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-sm"><h2 className="font-semibold text-gray-900">Award customer points</h2><p className="text-sm text-gray-500 mt-1 mb-4">Grant points for a promotion, service recovery, or other workshop-approved reason.</p><form onSubmit={(event) => { event.preventDefault(); awardMutation.mutate(); }} className="grid gap-4 sm:grid-cols-3"><label className="text-sm font-medium text-gray-700 sm:col-span-1">Customer *<select required value={awardForm.customerId} onChange={(event) => setAwardForm({ ...awardForm, customerId: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-amber-500"><option value="">Select a customer</option>{customers.map((customer) => <option key={customer.id} value={customer.id}>{customer.name} · {customer.phone || customer.email || 'No contact'}</option>)}</select></label><label className="text-sm font-medium text-gray-700">Points *<input required min="1" type="number" value={awardForm.points} onChange={(event) => setAwardForm({ ...awardForm, points: event.target.value })} className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-amber-500" /></label><label className="text-sm font-medium text-gray-700">Reason<input value={awardForm.reason} onChange={(event) => setAwardForm({ ...awardForm, reason: event.target.value })} placeholder="e.g. Service recovery" className="mt-1 w-full px-3 py-2.5 border border-gray-300 rounded-xl font-normal outline-none focus:ring-2 focus:ring-amber-500" /></label><div className="sm:col-span-3"><button type="submit" disabled={awardMutation.isPending || customersQuery.isLoading} className="bg-amber-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-amber-700 disabled:opacity-50">{awardMutation.isPending ? 'Awarding...' : 'Award points'}</button></div></form></section>
      </main>
    </div>
  );
}