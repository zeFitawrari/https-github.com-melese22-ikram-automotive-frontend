'use client';

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { HiOutlineClipboardDocument, HiOutlineStar } from 'react-icons/hi2';

export default function PortalPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'Customer')) {
      router.push(user ? '/dashboard' : '/login');
    }
  }, [user, loading, router]);

  const { data: vehicles } = useQuery({
    queryKey: ['my-vehicles'],
    queryFn: async () => {
      const { data } = await api.get('/vehicles/mine');
      return data.vehicles;
    },
    enabled: !!user && user.role === 'Customer',
  });

  const { data: jobCards } = useQuery({
    queryKey: ['my-job-cards'],
    queryFn: async () => {
      const { data } = await api.get('/job-cards/mine');
      return data.jobCards;
    },
    enabled: !!user && user.role === 'Customer',
    refetchInterval: 15000,
  });

  const { data: appointments } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: async () => {
      const { data } = await api.get('/appointments/mine');
      return data.appointments;
    },
    enabled: !!user && user.role === 'Customer',
  });

  const { data: invoices } = useQuery({
    queryKey: ['my-invoices'],
    queryFn: async () => {
      const { data } = await api.get('/invoices/mine');
      return data.invoices;
    },
    enabled: !!user && user.role === 'Customer',
  });

  const { data: loyalty } = useQuery({
    queryKey: ['my-loyalty'],
    queryFn: async () => {
      const { data } = await api.get('/loyalty/my-loyalty');
      return data;
    },
    enabled: !!user && user.role === 'Customer',
  });

  const copyReferralCode = async () => {
    if (!loyalty?.referralCode?.code) return;
    await navigator.clipboard.writeText(loyalty.referralCode.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'Customer') return null;

  const upcoming = appointments?.filter((a: any) =>
    ['scheduled', 'confirmed'].includes(a.status)
  ).slice(0, 3) || [];

  const unpaidInvoices = invoices?.filter((i: any) =>
    i.status === 'ISSUED'
  ) || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome, {user.name}</h1>
            <p className="text-gray-500 text-sm mt-1">Your automotive service portal</p>
          </div>
          <button
            onClick={() => router.push('/portal/book')}
            className="bg-primary-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-primary-700"
          >
            Book Appointment
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-primary-600">{vehicles?.length || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">My Vehicles</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-blue-600">{jobCards?.length || 0}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Service Records</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{upcoming.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Upcoming Appointments</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
            <div className="text-3xl font-bold text-green-600">{unpaidInvoices.length}</div>
            <div className="text-xs text-gray-500 uppercase tracking-wider mt-1">Pending Invoices</div>
          </div>
        </div>

        <section className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                <HiOutlineStar className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Loyalty &amp; Referrals</h2>
                <p className="text-sm text-gray-600 mt-1">
                  Earn 1 point for every {loyalty?.rules?.etbPerPoint || 10} ETB spent on a completed service. Share your referral code — when a friend completes their first appointment, you both earn {loyalty?.rules?.referralBonusPoints || 100} bonus points.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="bg-white rounded-lg border border-amber-200 px-5 py-3 text-center min-w-32">
                <div className="text-2xl font-bold text-amber-600">{loyalty?.balance ?? 0}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Points balance</div>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-lg border border-amber-200 px-3 py-2">
                <div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wider">Your referral code</div>
                  <div className="font-mono font-semibold text-gray-900">{loyalty?.referralCode?.code || 'Loading...'}</div>
                </div>
                <button
                  type="button"
                  onClick={copyReferralCode}
                  disabled={!loyalty?.referralCode?.code}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 disabled:opacity-40"
                >
                  <HiOutlineClipboardDocument className="w-4 h-4" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Vehicles</h2>
              <button onClick={() => router.push('/portal/vehicles')} className="text-sm text-primary-600 hover:text-primary-700">
                View All
              </button>
            </div>
            {vehicles?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No vehicles registered.</p>
            ) : (
              <div className="space-y-3">
                {vehicles?.slice(0, 3).map((v: any) => {
                  const activeJob = jobCards?.find((j: any) =>
                    j.vehicle_id === v.id && !['COMPLETED', 'CANCELLED'].includes(j.status)
                  );
                  return (
                    <div
                      key={v.id}
                      onClick={() => router.push(`/portal/vehicles/${v.id}`)}
                      className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{v.make} {v.model} {v.year ? `(${v.year})` : ''}</p>
                        <p className="text-xs text-gray-500">{v.plate_number || v.chassis_number || '—'}</p>
                      </div>
                      <div className="text-right">
                        {activeJob ? (
                          <span className="text-xs text-blue-600 font-medium">In Service</span>
                        ) : (
                          <span className="text-xs text-gray-400">No Active Job</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h2>
              <button onClick={() => router.push('/appointments')} className="text-sm text-primary-600 hover:text-primary-700">
                View All
              </button>
            </div>
            {upcoming.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-gray-400">No upcoming appointments.</p>
                <button
                  onClick={() => router.push('/portal/book')}
                  className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                >
                  Book one now
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcoming.map((a: any) => (
                  <div key={a.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{a.title}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(a.scheduled_date).toLocaleDateString()} &middot; {a.start_time?.slice(0, 5)}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                    }`}>{a.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Service History</h2>
            {jobCards?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No service records yet.</p>
            ) : (
              <div className="space-y-3">
                {jobCards?.slice(0, 5).map((j: any) => (
                  <div
                    key={j.id}
                    onClick={() => router.push(`/track/${j.tracking_token || j.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{j.make} {j.model}</p>
                      <p className="text-xs text-gray-500">{new Date(j.created_at).toLocaleDateString()}</p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      j.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                      j.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                      j.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>{j.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Invoices</h2>
            {invoices?.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No invoices yet.</p>
            ) : (
              <div className="space-y-3">
                {invoices?.slice(0, 5).map((inv: any) => (
                  <div
                    key={inv.id}
                    onClick={() => router.push(`/invoices/${inv.id}`)}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:bg-gray-50 cursor-pointer"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{inv.invoice_number}</p>
                      <p className="text-xs text-gray-500">{inv.make} {inv.model} — {inv.plate_number}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">${parseFloat(inv.total).toFixed(2)}</p>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${
                        inv.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        inv.status === 'ISSUED' ? 'bg-blue-100 text-blue-700' :
                        inv.status === 'DRAFT' ? 'bg-gray-100 text-gray-700' :
                        'bg-red-100 text-red-700'
                      }`}>{inv.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}