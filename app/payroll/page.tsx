'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { HiOutlineBanknotes, HiOutlineClock, HiOutlineCurrencyDollar } from 'react-icons/hi2';

type StaffMember = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  base_salary?: string | number | null;
  effective_date?: string | null;
  payments: Array<{
    id: string;
    amount: string | number;
    paid_date: string;
    notes?: string | null;
    recorded_by_name?: string;
  }>;
};

const today = () => new Date().toISOString().split('T')[0];

export default function PayrollPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [salaryValues, setSalaryValues] = useState<Record<string, { baseSalary: string; effectiveDate: string }>>({});
  const [paymentStaffId, setPaymentStaffId] = useState<string | null>(null);
  const [paymentForm, setPaymentForm] = useState({ amount: '', paidDate: '', notes: '' });

  useEffect(() => {
    if (!loading && (!user || !['SuperAdmin', 'WorkshopManager'].includes(user.role))) {
      router.push(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router]);

  const { data, isLoading } = useQuery({
    queryKey: ['payroll-staff'],
    queryFn: async () => {
      const { data } = await api.get('/payroll/staff');
      return data;
    },
    enabled: !!user && ['SuperAdmin', 'WorkshopManager'].includes(user.role),
  });

  const salaryMutation = useMutation({
    mutationFn: async ({ userId, values }: { userId: string; values: { baseSalary: string; effectiveDate: string } }) => {
      const { data } = await api.put(`/payroll/staff/${userId}/salary`, values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-staff'] });
      toast.success('Base salary updated.');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update salary.'),
  });

  const paymentMutation = useMutation({
    mutationFn: async ({ userId, values }: { userId: string; values: typeof paymentForm }) => {
      const { data } = await api.post(`/payroll/staff/${userId}/payments`, values);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payroll-staff'] });
      setPaymentStaffId(null);
      setPaymentForm({ amount: '', paidDate: today(), notes: '' });
      toast.success('Payment recorded.');
    },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to record payment.'),
  });

  const getSalaryValues = (staff: StaffMember) => salaryValues[staff.id] || {
    baseSalary: staff.base_salary ? String(staff.base_salary) : '',
    effectiveDate: staff.effective_date?.slice(0, 10) || today(),
  };

  const saveSalary = (staff: StaffMember) => {
    const values = getSalaryValues(staff);
    const salary = Number(values.baseSalary);
    if (!Number.isFinite(salary) || salary < 0) {
      toast.error('Base salary must be a non-negative number.');
      return;
    }
    if (!values.effectiveDate) {
      toast.error('Effective date is required.');
      return;
    }
    salaryMutation.mutate({ userId: staff.id, values });
  };

  const openPaymentForm = (staffId: string) => {
    setPaymentStaffId(staffId);
    setPaymentForm({ amount: '', paidDate: today(), notes: '' });
  };

  const recordPayment = (staffId: string) => {
    const amount = Number(paymentForm.amount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Payment amount must be greater than zero.');
      return;
    }
    if (!paymentForm.paidDate) {
      toast.error('Payment date is required.');
      return;
    }
    paymentMutation.mutate({ userId: staffId, values: paymentForm });
  };

  if (loading || !user || !['SuperAdmin', 'WorkshopManager'].includes(user.role)) return null;

  const staff: StaffMember[] = data?.staff || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50/30">
      <Navbar />
      <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-sm">
              <HiOutlineBanknotes className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
              <p className="text-sm text-gray-500">Manual salary and payment records for this workshop</p>
            </div>
          </div>
          <div className="inline-flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg">
            <HiOutlineClock className="w-4 h-4" />
            MVP: manual entry only
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-32 bg-white rounded-2xl border border-gray-200 animate-pulse" />)}
          </div>
        ) : staff.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-gray-300">
            <HiOutlineBanknotes className="w-10 h-10 mx-auto text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No eligible staff members found</p>
            <p className="text-sm text-gray-400 mt-1">Payroll currently supports WorkshopManagers and Mechanics.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {staff.map((member) => {
              const salary = getSalaryValues(member);
              const isPaymentOpen = paymentStaffId === member.id;
              return (
                <section key={member.id} className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
                  <div className="p-5 flex flex-col lg:flex-row lg:items-center gap-4">
                    <div className="flex items-center gap-3 min-w-0 lg:w-1/4">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                        {member.name?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 truncate">{member.role} · {member.phone || member.email || 'No contact'}</p>
                      </div>
                    </div>

                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Base salary</label>
                        <div className="relative">
                          <HiOutlineCurrencyDollar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={salary.baseSalary}
                            onChange={(e) => setSalaryValues({ ...salaryValues, [member.id]: { ...salary, baseSalary: e.target.value } })}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1">Effective date</label>
                        <input
                          type="date"
                          value={salary.effectiveDate}
                          onChange={(e) => setSalaryValues({ ...salaryValues, [member.id]: { ...salary, effectiveDate: e.target.value } })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={() => saveSalary(member)}
                          disabled={salaryMutation.isPending}
                          className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                        >
                          {salaryMutation.isPending ? 'Saving...' : 'Save Salary'}
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => isPaymentOpen ? setPaymentStaffId(null) : openPaymentForm(member.id)}
                      className="px-4 py-2 border border-indigo-200 text-indigo-700 rounded-lg text-sm font-semibold hover:bg-indigo-50"
                    >
                      {isPaymentOpen ? 'Close' : 'Record Payment'}
                    </button>
                  </div>

                  {isPaymentOpen && (
                    <div className="border-t border-gray-100 bg-indigo-50/40 p-5">
                      <h3 className="text-sm font-semibold text-gray-800 mb-3">Record manual payment for {member.name}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Amount *</label>
                          <input type="number" min="0.01" step="0.01" value={paymentForm.amount} onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="0.00" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Paid date *</label>
                          <input type="date" value={paymentForm.paidDate} onChange={(e) => setPaymentForm({ ...paymentForm, paidDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">Notes</label>
                          <input value={paymentForm.notes} onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Optional note" />
                        </div>
                        <button onClick={() => recordPayment(member.id)} disabled={paymentMutation.isPending} className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 disabled:opacity-50">
                          {paymentMutation.isPending ? 'Recording...' : 'Record Payment'}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-gray-100 px-5 py-4">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Payment history</h3>
                    {member.payments.length === 0 ? (
                      <p className="text-sm text-gray-400">No manual payments recorded.</p>
                    ) : (
                      <div className="space-y-2">
                        {member.payments.map((payment) => (
                          <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-sm">
                            <span className="text-gray-600">{new Date(payment.paid_date).toLocaleDateString()} {payment.notes ? `· ${payment.notes}` : ''}</span>
                            <span className="font-semibold text-gray-900">ETB {Number(payment.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
