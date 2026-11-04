'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { HiOutlineArrowRight, HiOutlineClock, HiOutlineWrenchScrewdriver } from 'react-icons/hi2';
import api from '@/lib/api';

type PublicService = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  base_price?: number | string | null;
  estimated_minutes?: number | null;
  workshop_name?: string | null;
};

function formatCategory(category?: string | null) {
  return category ? category.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()) : 'Automotive service';
}

const CATEGORY_COLORS: Record<string, string> = {
  battery: 'from-red-500 to-red-600',
  motor: 'from-blue-500 to-blue-600',
  software: 'from-purple-500 to-purple-600',
  charging: 'from-emerald-500 to-emerald-600',
  diagnostic: 'from-amber-500 to-amber-600',
  detailing: 'from-pink-500 to-pink-600',
  general: 'from-gray-500 to-gray-600',
};

export default function PricingPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-service-catalog'],
    queryFn: async () => (await api.get('/services/public')).data as { services: PublicService[] },
  });

  const services = data?.services || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-[800px] h-[800px] bg-red-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/3 -translate-x-1/2 w-[900px] h-[900px] bg-gray-900/30 rounded-full blur-[120px] pointer-events-none" />

      <nav className="relative z-20 border-b border-white/10 bg-gray-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-300">
              <span className="text-xl">🚗</span>
            </div>
            <span className="text-xl font-bold tracking-tight">Ikram <span className="text-red-400">Automotive</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-300 hover:text-white px-3 py-2 rounded-lg transition-colors hover:bg-white/10">Home</Link>
            <Link href="/book" className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-all duration-300">Book Now</Link>
          </div>
        </div>
      </nav>

      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16 text-center"
        >
          <p className="text-red-400 text-xs font-semibold uppercase tracking-widest mb-3">Service Catalog</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white mb-5">
            Transparent Pricing<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-primary-400 to-red-400">for Every Journey</span>
          </h1>
          <p className="text-gray-300 text-lg max-w-md mx-auto leading-relaxed">
            Explore our current services and estimated pricing. Final pricing may vary after a vehicle inspection.
          </p>
        </motion.div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <motion.div
                key={index}
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="h-64 rounded-3xl bg-white/5 border border-white/10 animate-pulse"
              />
            ))}
          </div>
        ) : isError ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-red-500/30 bg-red-500/10 p-10 text-center shadow-2xl shadow-red-500/10"
          >
            <HiOutlineWrenchScrewdriver className="w-12 h-12 mx-auto text-red-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Catalog Unavailable</h3>
            <p className="text-red-200 text-sm mb-6">We could not load the service catalog right now.</p>
            <Link href="/book" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
              Contact us to book <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : services.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-3xl border border-white/10 bg-white/5 p-12 text-center shadow-2xl"
          >
            <HiOutlineWrenchScrewdriver className="w-12 h-12 mx-auto text-gray-500 mb-4" />
            <h3 className="text-lg font-bold text-white mb-2">Catalog Being Updated</h3>
            <p className="text-gray-400 text-sm mb-6">Our service catalog is being updated.</p>
            <Link href="/book" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors">
              Book an appointment <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6"
          >
            {services.map((service) => {
              const categoryKey = (service.category || 'general').toLowerCase();
              const gradient = CATEGORY_COLORS[categoryKey] || CATEGORY_COLORS.general;
              const price = service.base_price == null ? null : Number(service.base_price);
              return (
                <motion.article
                  key={service.id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group relative rounded-3xl border border-white/10 bg-white/5 p-6 pt-8 hover:bg-white/10 hover:border-white/20 transition-all duration-300 shadow-lg shadow-black/20"
                >
                  {/* Top gradient accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-start justify-between gap-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-red-300 shadow-lg shadow-red-500/20">
                      <HiOutlineWrenchScrewdriver className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-semibold uppercase tracking-wider px-2 py-1 rounded-lg ${gradient} opacity-90`}>
                      {formatCategory(service.category)}
                    </span>
                  </div>

                  <h2 className="text-xl font-bold text-white mb-2 leading-tight">{service.name}</h2>
                  {service.description && (
                    <p className="text-sm text-gray-400 mb-6 leading-relaxed">{service.description}</p>
                  )}

                  <div className="mt-auto pt-6 border-t border-white/10">
                    <div className="flex items-baseline justify-between gap-3 mb-1">
                      <div>
                        <p className="text-xs text-gray-400 uppercase tracking-wider">Starting from</p>
                        {price != null ? (
                          <p className="text-2xl font-bold text-white">{price.toFixed(2)} ETB</p>
                        ) : (
                          <p className="text-2xl font-bold text-white">Contact us</p>
                        )}
                      </div>
                      {service.estimated_minutes && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300">
                          <HiOutlineClock className="w-3 h-3" />
                          {service.estimated_minutes} min
                        </div>
                      )}
                    </div>
                    <Link
                      href="/book"
                      className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 group-hover:bg-red-700"
                    >
                      Book Now <HiOutlineArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-20 relative z-10 rounded-3xl border border-white/10 bg-white/5 p-8 sm:p-12 shadow-2xl overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-primary-500 to-red-500" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Ready to get started?</h2>
              <p className="text-gray-300 text-sm">Choose a convenient time and let our certified technicians take care of the rest.</p>
            </div>
            <Link href="/book" className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5 transition-all duration-300">
              Book an Appointment <HiOutlineArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
