'use client';

import Link from 'next/link';
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

export default function PricingPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['public-service-catalog'],
    queryFn: async () => (await api.get('/services/public')).data as { services: PublicService[] },
  });

  const services = data?.services || [];

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-red-950 text-white">
      <nav className="border-b border-white/10 bg-gray-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2"><span className="text-2xl">🚗</span><span className="text-xl font-bold">Ikram Automotive</span></Link>
          <div className="flex items-center gap-3"><Link href="/" className="text-sm text-gray-300 hover:text-white px-3 py-2">Home</Link><Link href="/book" className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">Book Now</Link></div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="max-w-2xl mb-12"><p className="text-red-400 text-sm font-semibold uppercase tracking-wider mb-3">Service catalog</p><h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">Transparent pricing for every journey.</h1><p className="text-gray-300 text-lg mt-5">Explore our current services and estimated pricing. Final pricing may vary after a vehicle inspection.</p></div>

        {isLoading ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-56 rounded-2xl bg-white/10 animate-pulse" />)}</div> : isError ? <div className="rounded-2xl border border-red-400/30 bg-red-500/10 p-8 text-center"><p className="text-red-200">We could not load the service catalog right now.</p><Link href="/book" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-white hover:text-red-200">Contact us to book <HiOutlineArrowRight className="w-4 h-4" /></Link></div> : services.length === 0 ? <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center"><HiOutlineWrenchScrewdriver className="w-10 h-10 mx-auto text-gray-500 mb-3" /><p className="text-gray-300">Our service catalog is being updated.</p><Link href="/book" className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-red-300 hover:text-red-200">Book an appointment <HiOutlineArrowRight className="w-4 h-4" /></Link></div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">{services.map((service) => <article key={service.id} className="rounded-2xl border border-white/10 bg-white/[0.07] p-6 hover:bg-white/10 transition-colors"><div className="flex items-start justify-between gap-3"><div className="w-11 h-11 rounded-xl bg-red-500/15 flex items-center justify-center"><HiOutlineWrenchScrewdriver className="w-5 h-5 text-red-300" /></div><span className="text-xs font-semibold uppercase tracking-wider text-red-300">{formatCategory(service.category)}</span></div><h2 className="text-xl font-bold mt-5">{service.name}</h2>{service.description && <p className="text-sm text-gray-400 mt-2 min-h-10">{service.description}</p>}<div className="flex items-center justify-between gap-4 mt-6 pt-4 border-t border-white/10"><div><p className="text-xs text-gray-400">Starting from</p><p className="text-lg font-bold text-white">{service.base_price == null ? 'Contact us' : `${Number(service.base_price).toFixed(2)} ETB`}</p></div>{service.estimated_minutes ? <div className="flex items-center gap-1 text-xs text-gray-400"><HiOutlineClock className="w-4 h-4" />{service.estimated_minutes} min</div> : null}</div></article>)}</div>}

        <div className="mt-16 rounded-2xl border border-white/10 bg-white/5 p-8 sm:p-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"><div><h2 className="text-2xl font-bold">Ready to get started?</h2><p className="text-gray-400 mt-2">Choose a convenient time and let our technicians take care of the rest.</p></div><Link href="/book" className="inline-flex items-center gap-2 shrink-0 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg">Book an appointment <HiOutlineArrowRight className="w-4 h-4" /></Link></div>
      </section>
    </main>
  );
}