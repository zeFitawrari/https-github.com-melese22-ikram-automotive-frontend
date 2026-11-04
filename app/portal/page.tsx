'use client';

import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useEffect, useState } from 'react';
import { HiOutlineClipboardDocument, HiOutlineStar, HiOutlineCalendarDays, HiOutlineReceiptPercent, HiOutlineUser } from 'react-icons/hi2';

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
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 mb-4 animate-pulse">
              <HiOutlineUser className="w-6 h-6" />
            </div>
            <p className="text-gray-500">Loading your portal...</p>
          </div>
        </main>
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

  const statCards = [
    {
      label: 'My Vehicles',
      value: vehicles?.length || 0,
      icon: HiOutlineUser,
      color: 'from-primary-500 to-primary-600',
      textColor: 'text-primary-600',
      subtitle: 'Registered in your profile',
    },
    {
      label: 'Service Records',
      value: jobCards?.length || 0,
      icon: HiOutlineClipboardDocument,
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      subtitle: 'Complete job history',
    },
    {
      label: 'Upcoming Appointments',
      value: upcoming.length,
      icon: HiOutlineCalendarDays,
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      subtitle: 'Scheduled & confirmed',
    },
    {
      label: 'Pending Invoices',
      value: unpaidInvoices.length,
      icon: HiOutlineReceiptPercent,
      color: 'from-green-500 to-emerald-600',
      textColor: 'text-green-600',
      subtitle: 'Awaiting payment',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50/30">
      <Navbar />
      <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome back, <span className="text-primary-600">{user.name}</span></h1>
            <p className="text-gray-500 text-sm mt-1">Here's what's happening with your vehicles</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push('/portal/book')}
            className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-xl text-sm font-medium shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300"
          >
            <HiOutlineCalendarDays className="w-4 h-4" />
            Book Appointment
          </motion.button>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {statCards.map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ y: -6, scale: 1.02 }}
              className="bg-white rounded-3xl border border-white/80 p-6 shadow-lg shadow-white/50 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full {stat.color} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500" />
              <div className="relative z-10 flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.color.replace('from-', 'bg-').replace('to-', 'bg-').split(' ')[0]} bg-opacity-20`}>
                  <stat.icon className="w-5 h-5 {stat.textColor}" />
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors" />
              </div>
              <div className="relative z-10">
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm font-medium text-gray-900 mt-1">{stat.label}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stat.subtitle}</div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </motion.div>
          ))}
        </motion.div>

        {/* Loyalty Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-r from-amber-500 to-orange-600 rounded-3xl p-6 sm:p-8 shadow-xl shadow-amber-500/20 mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-sm border border-white/30">
                <HiOutlineStar className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white mb-1">Loyalty &amp; Referrals</h2>
                <p className="text-amber-100 text-sm mt-1">
                  Earn 1 point for every {loyalty?.rules?.etbPerPoint || 10} ETB spent. Share your referral code — when a friend completes their first appointment, you both earn {loyalty?.rules?.referralBonusPoints || 100} bonus points.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <div className="bg-white/10 rounded-2xl px-5 py-3 text-center backdrop-blur-sm border border-white/20 min-w-32">
                <div className="text-3xl font-bold text-white">{loyalty?.balance ?? 0}</div>
                <div className="text-xs text-amber-200 uppercase tracking-wider">Points Balance</div>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-2xl px-4 py-2.5 backdrop-blur-sm border border-white/20">
                <div className="text-[10px] text-amber-200 uppercase tracking-wider">Your Referral Code</div>
                <div className="flex items-center gap-2">
                  <div className="font-mono font-semibold text-white text-sm">{loyalty?.referralCode?.code || 'Loading...'}</div>
                  <button
                    type="button"
                    onClick={copyReferralCode}
                    disabled={!loyalty?.referralCode?.code}
                    className="flex items-center gap-1.5 text-xs font-semibold text-amber-100 hover:text-white disabled:opacity-50 transition-colors"
                  >
                    <HiOutlineClipboardDocument className="w-3 h-3" />
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* My Vehicles */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-3xl border border-white/80 p-0 shadow-lg shadow-white/50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">🚗</span>
                My Vehicles
              </h2>
              <button onClick={() => router.push('/portal/vehicles')} className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
                View All →
              </button>
            </div>
            <div className="p-0">
              {vehicles?.length === 0 ? (
                <div className="p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <span className="text-2xl">🚗</span>
                  </div>
                  <p className="text-sm text-gray-500">No vehicles registered yet.</p>
                  <button onClick={() => router.push('/portal/vehicles')} className="mt-4 text-sm text-primary-600 font-medium hover:text-primary-700">
                    Add Your First Vehicle →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {vehicles.slice(0, 3).map((v: any) => {
                    const activeJob = jobCards?.find((j: any) =>
                      j.vehicle_id === v.id && !['COMPLETED', 'CANCELLED'].includes(j.status)
                    );
                    return (
                      <motion.div
                        key={v.id}
                        whileHover={{ x: -4 }}
                        onClick={() => router.push(`/portal/vehicles/${v.id}`)}
                        className="cursor-pointer flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                            <span className="text-lg">🚗</span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{v.make} {v.model} {v.year ? `(${v.year})` : ''}</p>
                            <p className="text-xs text-gray-500">{v.plate_number || v.chassis_number || '—'}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {activeJob ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                              In Service
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400">No Active Job</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>

          {/* Upcoming Appointments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-white rounded-3xl border border-white/80 p-0 shadow-lg shadow-white/50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">📅</span>
                Upcoming Appointments
              </h2>
              <button onClick={() => router.push('/appointments')} className="text-sm text-primary-600 font-medium hover:text-primary-700 transition-colors">
                View All →
              </button>
            </div>
            <div className="p-0">
              {upcoming.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <HiOutlineCalendarDays className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-500">No upcoming appointments.</p>
                  <button onClick={() => router.push('/portal/book')} className="mt-4 text-sm text-primary-600 font-medium hover:text-primary-700">
                    Book One Now →
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {upcoming.map((a: any) => (
                    <div key={a.id} className="px-6 py-4 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{a.title}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.scheduled_date).toLocaleDateString()} · {a.start_time?.slice(0, 5)}
                        </p>
                      </div>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        a.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>{a.status.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Service History */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-3xl border border-white/80 p-0 shadow-lg shadow-white/50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">🔧</span>
                Recent Service History
              </h2>
            </div>
            <div className="p-0">
              {jobCards?.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <p className="text-sm text-gray-500">No service records yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {jobCards.slice(0, 5).map((j: any) => (
                    <motion.div
                      key={j.id}
                      whileHover={{ x: -4 }}
                      onClick={() => router.push(`/track/${j.tracking_token || j.id}`)}
                      className="cursor-pointer flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
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
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* Invoices */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white rounded-3xl border border-white/80 p-0 shadow-lg shadow-white/50 overflow-hidden"
          >
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">🧾</span>
                Invoices
              </h2>
            </div>
            <div className="p-0">
              {invoices?.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4 text-gray-400">
                    <HiOutlineReceiptPercent className="w-8 h-8" />
                  </div>
                  <p className="text-sm text-gray-500">No invoices yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {invoices.slice(0, 5).map((inv: any) => (
                    <div
                      key={inv.id}
                      onClick={() => router.push(`/invoices/${inv.id}`)}
                      className="cursor-pointer flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50"
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
          </motion.div>
        </div>
      </main>
    </div>
  );
}
