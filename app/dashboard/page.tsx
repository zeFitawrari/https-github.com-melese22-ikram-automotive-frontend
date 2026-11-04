'use client';

import { motion } from 'framer-motion';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { useSocket } from '@/lib/socket';
import Navbar from '@/components/Navbar';
import JobCardCard from '@/components/JobCardCard';
import { StatCardSkeleton, CardSkeleton, SkeletonBlock } from '@/components/Skeleton';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import {
  HiOutlineWrenchScrewdriver,
  HiOutlineClock,
  HiOutlinePlayCircle,
  HiOutlineUsers,
  HiOutlineTruck,
  HiOutlineCurrencyDollar,
  HiOutlineFire,
  HiOutlineArrowTrendingUp,
} from 'react-icons/hi2';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const queryClient = useQueryClient();
  const { socket, connected } = useSocket();
  const canViewAdminDashboard = !!user && ['SuperAdmin', 'WorkshopManager'].includes(user.role);
  const isMechanic = user?.role === 'Mechanic';

  useEffect(() => {
    if (!loading && (!user || user.role === 'Customer')) {
      router.push(user ? '/job-cards' : '/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!socket) return;
    const invalidate = () => {
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.invalidateQueries({ queryKey: ['job-cards', 'active'] });
    };
    socket.on('jobCard:created', invalidate);
    socket.on('jobCard:statusChanged', invalidate);
    socket.on('jobCard:assigned', invalidate);
    socket.on('appointment:created', invalidate);
    socket.on('appointment:statusChanged', invalidate);
    return () => {
      socket.off('jobCard:created', invalidate);
      socket.off('jobCard:statusChanged', invalidate);
      socket.off('jobCard:assigned', invalidate);
      socket.off('appointment:created', invalidate);
      socket.off('appointment:statusChanged', invalidate);
    };
  }, [socket, queryClient]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await api.get('/reports/dashboard');
      return data;
    },
    enabled: canViewAdminDashboard,
    refetchInterval: connected ? false : 30000,
  });

  const { data: activeData, isLoading: activeLoading } = useQuery({
    queryKey: ['job-cards', 'active'],
    queryFn: async () => {
      const { data } = await api.get('/job-cards/active');
      return data.jobCards;
    },
    enabled: !!user && user.role !== 'Customer',
    refetchInterval: connected ? false : 15000,
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
          <SkeletonBlock className="h-7 w-64 mb-2" />
          <SkeletonBlock className="h-4 w-48 mb-8" />
          <StatCardSkeleton count={6} />
        </main>
      </div>
    );
  }

  if (!user || user.role === 'Customer') return null;

  if (isMechanic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
        <Navbar />
        <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                <HiOutlineWrenchScrewdriver className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">My Work Queue</h2>
                <p className="text-sm text-gray-500">Focus on the jobs that need your attention today</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
              ${activeData?.length && activeData.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}`}>
              <span className={`w-2 h-2 rounded-full ${activeData?.length && activeData.length > 0 ? 'bg-indigo-500 animate-pulse' : 'bg-gray-400'}`} />
              {activeData?.length || 0} Active Jobs
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-white/80 p-6 shadow-sm mb-8">
            <p className="text-sm text-gray-500 italic">
              Management reports are hidden for mechanics — this view keeps you focused on active work.
            </p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HiOutlineWrenchScrewdriver className="w-5 h-5 text-indigo-500" />
                Active Job Cards
              </h3>
            </div>
            {activeLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div key={i} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="h-4 w-1/3 bg-gray-100 rounded-full mb-4" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded-full mb-2" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                  </motion.div>
                ))}
              </div>
            ) : activeData?.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-500">
                  <HiOutlineWrenchScrewdriver className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">All Caught Up</h3>
                <p className="text-gray-500 text-sm mb-6">No active job cards right now. You're ready for your next assignment.</p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeData?.map((jobCard: any) => (
                  <JobCardCard key={jobCard.id} jobCard={jobCard} />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    );
  }

  const sb = stats?.statusBreakdown || [];
  const statusCounts: Record<string, number> = {};
  sb.forEach((s: any) => { statusCounts[s.status] = s.count; });

  const statDefs = [
    { label: 'Active Jobs', count: stats?.activeJobs || 0, color: 'from-indigo-500 to-indigo-600', icon: HiOutlineWrenchScrewdriver },
    { label: 'Pending', count: statusCounts.PENDING || 0, color: 'from-amber-500 to-yellow-600', icon: HiOutlineClock },
    { label: 'In Progress', count: statusCounts.IN_PROGRESS || 0, color: 'from-blue-500 to-blue-600', icon: HiOutlinePlayCircle },
    { label: 'Customers', count: stats?.totalCustomers || 0, color: 'from-emerald-500 to-emerald-600', icon: HiOutlineUsers },
    { label: 'Vehicles', count: stats?.totalVehicles || 0, color: 'from-purple-500 to-purple-600', icon: HiOutlineTruck },
    { label: 'Revenue', count: `$${Math.round(stats?.revenue?.total || 0).toLocaleString()}`, color: 'from-green-500 to-green-600', icon: HiOutlineCurrencyDollar },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <Navbar />
      <main className="w-full lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-sm">
            <HiOutlineFire className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Workshop Dashboard</h2>
            <p className="text-sm text-gray-500">Real-time overview of workshop activity</p>
          </div>
        </div>

        {statsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="relative bg-white rounded-3xl border border-white p-6 shadow-sm overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full bg-gray-100/50" />
                <div className="flex items-start justify-between mb-3">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center">
                    <SkeletonBlock className="w-4 h-4" />
                  </div>
                </div>
                <div className="h-8 w-32 bg-gray-100 rounded-full mt-2" />
                <div className="h-4 w-20 bg-gray-100 rounded-full mt-3" />
              </motion.div>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
          {statDefs.map(({ label, count, color, icon: Icon }) => {
            const bgColor = color.replace('from-', 'bg-').replace('to-', 'bg-').split(' ')[0];
            const textColor = color.replace('from-', 'text-').replace('to-', 'text-').split(' ')[0];
            return (
              <motion.div
                key={label}
                whileHover={{ y: -6, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="relative bg-white rounded-3xl border border-white/80 p-6 shadow-lg shadow-white/50 transition-all duration-300 overflow-hidden group"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 -mr-6 -mt-6 rounded-full ${color} opacity-[0.08] group-hover:opacity-[0.15] transition-opacity duration-500`} />
                <div className="relative z-10 flex items-start justify-between mb-3">
                  <div className={`p-2.5 rounded-xl ${bgColor} bg-opacity-20`}>
                    <Icon className={`w-5 h-5 ${textColor}`} />
                  </div>
                </div>
                <div className="relative z-10">
                  <div className="text-2xl font-bold text-gray-900">{count}</div>
                  <div className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mt-1">{label}</div>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            );
          })}
        </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                  <HiOutlineWrenchScrewdriver className="w-5 h-5 text-indigo-500" />
                  Active Bays
                </h3>
                <p className="text-sm text-gray-500">{activeData?.length || 0} vehicles currently in service</p>
              </div>
              <span className={`
                inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold
                ${activeData?.length && activeData.length > 0 ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-500'}
              `}>
                <span className={`w-2 h-2 rounded-full ${activeData?.length && activeData.length > 0 ? 'bg-indigo-500 animate-pulse' : 'bg-gray-400'}`} />
                {activeData?.length && activeData.length > 0 ? 'Bays Occupied' : 'All Bays Clear'}
              </span>
            </div>
            {activeLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[...Array(4)].map((_, i) => (
                  <motion.div key={i} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                    className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                    <div className="h-4 w-1/3 bg-gray-100 rounded-full mb-4" />
                    <div className="h-3 w-1/2 bg-gray-100 rounded-full mb-2" />
                    <div className="h-3 w-3/4 bg-gray-100 rounded-full" />
                  </motion.div>
                ))}
              </div>
            ) : activeData?.length === 0 ? (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-10 text-center shadow-sm hover:shadow-md transition-all duration-300">
                <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-4 text-indigo-500">
                  <HiOutlineWrenchScrewdriver className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">All Bays Clear</h3>
                <p className="text-gray-500 text-sm mb-6">No active job cards right now. Your workshop is ready for new vehicles.</p>
                <button
                  onClick={() => router.push('/job-cards')}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:from-indigo-700 hover:to-purple-700 hover:-translate-y-0.5 transition-all duration-300 shadow-lg shadow-indigo-500/25"
                >
                  <HiOutlineWrenchScrewdriver className="w-4 h-4" />
                  Create a Job Card
                </button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {activeData?.map((jobCard: any) => (
                  <JobCardCard key={jobCard.id} jobCard={jobCard} />
                ))}
              </div>
            )}
          </div>

          {statsLoading ? (
            <div className="space-y-4">
              {[...Array(4)].map((_, i) => (
                <motion.div key={i} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="h-3 w-1/3 bg-gray-100 rounded-full mb-3" />
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-24 bg-gray-100 rounded-full" />
                    <div className="h-3 w-12 bg-gray-100 rounded-full" />
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HiOutlineArrowTrendingUp className="w-5 h-5 text-emerald-500" />
                Top Mechanics
              </h3>
            </div>
            <div className="bg-white rounded-3xl border border-white/80 shadow-sm overflow-hidden">
              {stats?.topMechanics?.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-400">No data yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {stats?.topMechanics?.map((m: any, i: number) => (
                    <motion.div
                      key={m.id}
                      whileHover={{ x: -4 }}
                      className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50/50"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold ${
                          i === 0 ? 'bg-amber-100 text-amber-700' :
                          i === 1 ? 'bg-gray-100 text-gray-600' :
                          i === 2 ? 'bg-amber-50 text-amber-600' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          #{i + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{m.name}</p>
                          <p className="text-xs text-gray-500">{m.jobs_completed} jobs completed</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700">{m.jobs_completed}</span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}

          {statsLoading ? (
            <div className="mt-8 space-y-3">
              {[...Array(4)].map((_, i) => (
                <motion.div key={i} animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.5, repeat: Infinity }}
                  className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                  <div className="h-3 w-32 bg-gray-100 rounded-full mb-2" />
                  <div className="h-3 w-16 bg-gray-100 rounded-full" />
                </motion.div>
              ))}
            </div>
          ) : (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <HiOutlineClock className="w-5 h-5 text-blue-500" />
                Recent Jobs
              </h3>
            </div>
            <div className="bg-white rounded-3xl border border-white/80 shadow-sm overflow-hidden">
              {stats?.recentJobCards?.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-gray-400">No recent jobs.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {stats?.recentJobCards?.map((j: any) => (
                    <div
                      key={j.id}
                      onClick={() => router.push(`/job-cards/${j.id}`)}
                      className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50/50 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-sm font-medium text-gray-900 truncate w-32">
                          {j.make} {j.model}
                        </div>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          j.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                          j.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>{j.status}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{j.customer_name}</span>
                        <span className="hidden sm:inline">·</span>
                        <span>{j.plate_number || '—'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      </main>
    </div>
  );
}

