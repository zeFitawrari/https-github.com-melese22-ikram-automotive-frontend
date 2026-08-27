'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Footer from '@/components/Footer';

type PublicService = { id: string; name: string; description?: string | null; category?: string | null; base_price?: number | string | null; estimated_minutes?: number | null };

const TESTIMONIALS = [
  { name: 'Abrar M.', text: 'Ikram Automotive transformed my Tesla Model 3 with a custom wrap and performance tune. Exceptional quality!', role: 'EV Owner' },
  { name: 'Daniel K.', text: 'Best workshop in Addis for both EV and traditional vehicles. The real-time job tracking gives me peace of mind.', role: 'Fleet Manager' },
  { name: 'Sara T.', text: 'Quick diagnostics, fair pricing, and they kept me updated every step. Highly recommend for any auto service.', role: 'Customer' },
];

export default function Home() {
  const { user, loading } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const revealVariant = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } };
  const router = useRouter();
  const { data: serviceData, isLoading: servicesLoading } = useQuery({
    queryKey: ['public-service-catalog'],
    queryFn: async () => (await api.get('/services/public')).data as { services: PublicService[] },
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Customer') router.push('/portal');
      else if (user.role === 'SuperAdmin') router.push('/superadmin');
      else router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-400">Loading...</div></div>;
  }
  if (user) return null;

  const services = serviceData?.services || [];

  return (
    <div className="min-h-screen bg-white">
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-9 h-9 bg-red-50 text-red-600 rounded-md text-lg shadow-sm" aria-hidden="true">🚗</span>
            <span className="text-xl font-bold text-gray-900">Ikram Automotive</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:text-gray-900 transition">Services</a>
            <a href="#testimonials" className="hover:text-gray-900 transition">Testimonials</a>
            <a href="#locations" className="hover:text-gray-900 transition">Locations</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition px-3 py-2">Login</Link>
            <Link href="/book" className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition">Book Now</Link>
          </div>
        </div>
      </nav>

      <motion.section
        className="pt-24 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white"
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'}
        whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'}
        variants={revealVariant}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.30 }}
      >
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 py-12">
          <div className="flex-1 space-y-6">
            <div className="inline-block bg-red-600/20 text-red-400 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wider">Ethiopia&apos;s #1 EV Workshop</div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight">
              Expert Auto Repair<br /><span className="text-red-500">& EV Service</span>
            </h1>
            <p className="text-lg text-gray-300 max-w-lg">
              From diagnostics to full customization — trust Ikram Automotive for professional vehicle service with real-time tracking and transparent pricing.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/book" className="bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition text-center">
                Book Appointment
              </Link>
              <a href="#services" className="border border-gray-600 hover:border-gray-400 text-gray-300 font-semibold px-6 py-3 rounded-lg transition text-center">
                Our Services
              </a>
            </div>
            <div className="flex gap-8 pt-4">
              <div><div className="text-2xl font-bold">500+</div><div className="text-sm text-gray-400">Vehicles Serviced</div></div>
              <div><div className="text-2xl font-bold">98%</div><div className="text-sm text-gray-400">Customer Satisfaction</div></div>
              <div><div className="text-2xl font-bold">24/7</div><div className="text-sm text-gray-400">Job Tracking</div></div>
            </div>
          </div>
          <div className="flex-1 bg-gray-800/50 rounded-2xl p-8 border border-gray-700 max-w-md w-full">
            <div className="text-center space-y-4">
              <div className="mx-auto w-20 h-20 bg-gradient-to-tr from-red-600/10 to-red-600/5 rounded-xl flex items-center justify-center text-5xl text-red-400 shadow-inner">🔋</div>
              <h3 className="text-xl font-bold">EV-Ready Workshop</h3>
              <p className="text-gray-400 text-sm">Specialized in Tesla, BYD, and all major EV brands with certified high-voltage technicians.</p>
              <div className="grid grid-cols-2 gap-3 text-sm pt-2">
                <div className="bg-gray-700/50 rounded-lg p-3 text-center"><div className="font-semibold">Battery Health</div><div className="text-xs text-gray-400">Full diagnostics</div></div>
                <div className="bg-gray-700/50 rounded-lg p-3 text-center"><div className="font-semibold">Motor Service</div><div className="text-xs text-gray-400">Performance tuning</div></div>
                <div className="bg-gray-700/50 rounded-lg p-3 text-center"><div className="font-semibold">Software Update</div><div className="text-xs text-gray-400">OTA management</div></div>
                <div className="bg-gray-700/50 rounded-lg p-3 text-center"><div className="font-semibold">Charging</div><div className="text-xs text-gray-400">Installation & repair</div></div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section
        id="services"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'}
        whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'}
        variants={revealVariant}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.30 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Our Services</h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">Comprehensive automotive care with transparent, backend-managed pricing</p>
          </div>
          {servicesLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-44 rounded-xl bg-white border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <p className="text-gray-500">Our service catalog is being updated.</p>
              <Link href="/pricing" className="inline-flex items-center mt-3 text-sm font-semibold text-red-600 hover:text-red-700">View pricing catalog</Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((service) => (
                <motion.div
                  key={service.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
                  initial={prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'}
                  whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'}
                  variants={revealVariant}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
                  whileHover={prefersReducedMotion ? {} : { y: -6, scale: 1.02 }}
                  aria-roledescription="service card"
                >
                  <div className="mb-3">
                    <span className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-md text-xl text-gray-700">🔧</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{service.name}</h3>
                  <p className="text-sm text-gray-500 min-h-10">{service.description || service.category || 'Professional automotive service'}</p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">{service.base_price == null ? 'Contact us' : `${Number(service.base_price).toFixed(2)} ETB`}</span>
                    {service.estimated_minutes ? <span className="text-xs text-gray-400">{service.estimated_minutes} min</span> : null}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-8"><Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700">View full pricing catalog <span aria-hidden="true">→</span></Link></div>
        </div>
      </motion.section>

      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'}
        whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'}
        variants={revealVariant}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-gray-500 mb-12">Book in minutes, track in real-time</p>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Book Online', desc: 'Choose your service and preferred time slot.' },
              { step: '2', title: 'Drop Off', desc: 'Bring your vehicle to the workshop.' },
              { step: '3', title: 'Track Progress', desc: 'Monitor repairs in real-time from your phone.' },
              { step: '4', title: 'Pay & Drive', desc: 'Pay online or at the workshop. Drive happy!' },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex flex-col items-center"
                initial={prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'}
                whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'}
                variants={revealVariant}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}
              >
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-3">{item.step}</div>
                <h4 className="font-semibold text-gray-900 mb-1">{item.title}</h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'}
        whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'}
        variants={revealVariant}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.30 }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">What Our Customers Say</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div key={t.name} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100" initial={prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'} whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'} variants={revealVariant} viewport={{ once: true, amount: 0.2 }} transition={{ duration: prefersReducedMotion ? 0 : 0.25 }}>
                <div className="flex items-center gap-1 text-yellow-500 mb-3" aria-hidden="true">⭐️⭐️⭐️⭐️⭐️</div>
                <p className="text-gray-600 text-sm mb-4 italic">&ldquo;{t.text}&rdquo;</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <section id="locations" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Visit Us</h2>
          <p className="text-gray-500 mb-8">Conveniently located in Addis Ababa</p>
          <div className="bg-gray-100 rounded-xl p-8 max-w-2xl mx-auto">
            <div className="mx-auto mb-4 w-12 h-12 bg-red-50 rounded-full flex items-center justify-center text-2xl text-red-500">📍</div>
            <h3 className="text-lg font-semibold text-gray-900">Ikram Automotive Workshop</h3>
            <p className="text-gray-500 text-sm mt-1">Bole Road, Addis Ababa, Ethiopia</p>
            <p className="text-gray-500 text-sm">Open Mon–Sat: 8:00 AM – 5:00 PM</p>
            <p className="text-gray-500 text-sm mt-2"><span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 rounded-sm text-sm mr-2">📞</span>+251 911 111 112 &nbsp;|&nbsp; <span className="inline-flex items-center justify-center w-5 h-5 bg-gray-200 rounded-sm text-sm mr-2">✉️</span>info@ikramauto.com</p>
          </div>
        </div>
      </section>

      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white"
        initial={prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'}
        whileInView={prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'}
        variants={revealVariant}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.30 }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">Ready to Service Your Vehicle?</h2>
          <p className="text-gray-400">Book an appointment today and experience transparent, professional auto service.</p>
          <Link href="/book" className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition text-lg">
            Book Now
          </Link>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
