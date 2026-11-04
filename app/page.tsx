'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import Footer from '@/components/Footer';
import { FaMapLocationDot, FaClock } from 'react-icons/fa6';

type PublicService = {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  base_price?: number | string | null;
  estimated_minutes?: number | null;
};

const TESTIMONIALS = [
  {
    name: 'Abrar M.',
    text: "Ikram Automotive transformed my Tesla Model 3 with a custom wrap and performance tune. Exceptional quality!",
    role: 'EV Owner',
  },
  {
    name: 'Daniel K.',
    text: 'Best workshop in Addis for both EV and traditional vehicles. The real-time job tracking gives me peace of mind.',
    role: 'Fleet Manager',
  },
  {
    name: 'Sara T.',
    text: 'Quick diagnostics, fair pricing, and they kept me updated every step. Highly recommend for any auto service.',
    role: 'Customer',
  },
];

export default function Home() {
  const { user, loading } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const revealVariant = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
  };
  const router = useRouter();
  const { data: serviceData, isLoading: servicesLoading } = useQuery({
    queryKey: ['public-service-catalog'],
    queryFn: async () =>
      (await api.get('/services/public')).data as { services: PublicService[] },
  });

  useEffect(() => {
    if (!loading && user) {
      if (user.role === 'Customer') router.push('/portal');
      else if (user.role === 'SuperAdmin') router.push('/superadmin');
      else router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    );
  }
  if (user) return null;

  const services = serviceData?.services || [];

  return (
    <div className="min-h-screen bg-white">
      <nav
        className="fixed top-0 w-full bg-white/90 backdrop-blur-md z-50 border-b border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <span
              className="inline-flex items-center justify-center w-9 h-9 bg-red-50 text-red-600 rounded-md text-lg shadow-sm"
              aria-hidden="true"
            >
              🚗
            </span>
            <span className="text-xl font-bold text-gray-900">
              Ikram Automotive
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600">
            <a href="#services" className="hover:text-gray-900 transition">
              Services
            </a>
            <a href="#testimonials" className="hover:text-gray-900 transition">
              Testimonials
            </a>
            <a href="#locations" className="hover:text-gray-900 transition">
              Locations
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition px-3 py-2"
            >
              Login
            </Link>
            <Link
              href="/book"
              className="bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Book Now
            </Link>
          </div>
        </div>
      </nav>

      <motion.section
        className="pt-24 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
        initial={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'
        }
        whileInView={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'
        }
        variants={revealVariant}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.4,
        }}
      >
        <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[600px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 -translate-x-1/2 w-[700px] h-[700px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10 flex flex-col lg:flex-row items-center gap-12 py-12">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 space-y-6"
          >
            <div
              className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-xs font-semibold px-3 py-1.5 rounded-full uppercase tracking-wider border border-red-500/20 backdrop-blur-sm"
            >
              <span className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
              Ethiopia's #1 EV Workshop
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight text-white">
              Expert Auto{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-primary-500 to-red-500">
                Repair
              </span>
              <br />
              &amp; EV Service
            </h1>
            <p className="text-lg text-gray-300 max-w-lg leading-relaxed">
              From precision diagnostics to full customization — trust Ikram Automotive for professional vehicle service with real-time tracking, transparent pricing, and certified EV technicians.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/book"
                className="group relative inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-1"
              >
                <span>Book Appointment</span>
                <span className="text-sm">→</span>
              </Link>
              <a
                href="#services"
                className="group relative inline-flex items-center gap-2 border border-white/20 hover:border-white/40 text-gray-300 hover:text-white font-semibold px-8 py-3.5 rounded-xl transition-all duration-300 bg-white/5 hover:bg-white/10 backdrop-blur-sm"
              >
                <span>Our Services</span>
                <span className="text-sm">→</span>
              </a>
            </div>
            <div className="flex gap-6 pt-8">
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-white">500+</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Vehicles Serviced
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-white">98%</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Customer Satisfaction
                </div>
              </div>
              <div className="flex flex-col">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-xs text-gray-400 uppercase tracking-wider">
                  Job Tracking
                </div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex-1 max-w-md w-full relative"
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-red-500 via-primary-500 to-red-500" />
              <div className="relative z-10 flex flex-col items-center gap-4">
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-red-500/20 to-primary-500/20 flex items-center justify-center text-4xl border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <span>🔋</span>
                </div>
                <h3 className="text-xl font-bold text-white">
                  EV-Ready Workshop
                </h3>
                <p className="text-sm text-gray-400 text-center max-w-xs">
                  Specialized in Tesla, BYD, and all major EV brands with certified high-voltage technicians.
                </p>
              </div>
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors group-hover:border-primary-500/50">
                  <div className="font-semibold text-white">Battery Health</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Full diagnostics
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors group-hover:border-primary-500/50">
                  <div className="font-semibold text-white">Motor Service</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Performance tuning
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors group-hover:border-primary-500/50">
                  <div className="font-semibold text-white">Software Update</div>
                  <div className="text-xs text-gray-400 mt-1">
                    OTA management
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 text-center border border-white/10 hover:bg-white/10 transition-colors group-hover:border-primary-500/50">
                  <div className="font-semibold text-white">Charging</div>
                  <div className="text-xs text-gray-400 mt-1">
                    Installation &amp; repair
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        id="services"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'
        }
        whileInView={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'
        }
        variants={revealVariant}
        viewport={{ once: true, amount: 0.15 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.30,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Our Services
            </h2>
            <p className="text-gray-500 mt-2 max-w-xl mx-auto">
              Comprehensive automotive care with transparent, backend-managed pricing
            </p>
          </div>
          {servicesLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="h-44 rounded-xl bg-white border border-gray-100 animate-pulse"
                />
              ))}
            </div>
          ) : services.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center border border-gray-100">
              <p className="text-gray-500">
                Our service catalog is being updated.
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center mt-3 text-sm font-semibold text-red-600 hover:text-red-700"
              >
                View pricing catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
              {services.slice(0, 6).map((service) => (
                <motion.div
                  key={service.id}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition"
                  initial={
                    prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'
                  }
                  whileInView={
                    prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'
                  }
                  variants={revealVariant}
                  viewport={{ once: true, amount: 0.15 }}
                  transition={{
                    duration: prefersReducedMotion ? 0 : 0.25,
                  }}
                  whileHover={
                    prefersReducedMotion
                      ? {}
                      : { y: -6, scale: 1.02 }
                  }
                  aria-roledescription="service card"
                >
                  <div className="mb-3">
                    <span
                      className="inline-flex items-center justify-center w-12 h-12 bg-gray-50 rounded-md text-xl text-gray-700"
                    >
                      🔧
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-gray-500 min-h-10">
                    {service.description ||
                      service.category ||
                      'Professional automotive service'}
                  </p>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100">
                    <span className="text-sm font-semibold text-gray-900">
                      {service.base_price == null
                        ? 'Contact us'
                        : `${Number(service.base_price).toFixed(2)} ETB`}
                    </span>
                    {service.estimated_minutes ? (
                      <span className="text-xs text-gray-400">
                        {service.estimated_minutes} min
                      </span>
                    ) : null}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          <div className="text-center mt-8">
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700"
            >
              View full pricing catalog{' '}
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </motion.section>

      <motion.section
        className="py-20 px-4 sm:px-6 lg:px-8"
        initial={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'
        }
        whileInView={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'
        }
        variants={revealVariant}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.25,
        }}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How It Works
          </h2>
          <p className="text-gray-500 mb-12">
            Book in minutes, track in real-time
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { step: '1', title: 'Book Online', desc: 'Choose your service and preferred time slot.' },
              { step: '2', title: 'Drop Off', desc: 'Bring your vehicle to the workshop.' },
              { step: '3', title: 'Track Progress', desc: 'Monitor repairs in real-time from your phone.' },
              { step: '4', title: 'Pay &amp; Drive', desc: 'Pay online or at the workshop. Drive happy!' },
            ].map((item) => (
              <motion.div
                key={item.step}
                className="flex flex-col items-center"
                initial={
                  prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'
                }
                whileInView={
                  prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'
                }
                variants={revealVariant}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.25,
                }}
              >
                <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center text-lg font-bold mb-3">
                  {item.step}
                </div>
                <h4 className="font-semibold text-gray-900 mb-1">
                  {item.title}
                </h4>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section
        id="testimonials"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
        initial={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'
        }
        whileInView={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'
        }
        variants={revealVariant}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.30,
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              What Our Customers Say
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
                initial={
                  prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'
                }
                whileInView={
                  prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'
                }
                variants={revealVariant}
                viewport={{ once: true, amount: 0.2 }}
                transition={{
                  duration: prefersReducedMotion ? 0 : 0.25,
                }}
              >
                <div
                  className="flex items-center gap-1 text-yellow-500 mb-3"
                  aria-hidden="true"
                >
                  ⭐️⭐️⭐️⭐️⭐️
                </div>
                <p className="text-gray-600 text-sm mb-4 italic">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">
                    {t.name}
                  </div>
                  <div className="text-xs text-gray-400">{t.role}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <section
        id="locations"
        className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-red-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] bg-primary-500/10 rounded-full blur-[120px] pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5 }}
          className="max-w-7xl mx-auto text-center relative z-10"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Visit Us
            </h2>
            <span
              className="w-2 h-2 bg-red-500 rounded-full animate-pulse"
              style={{ animationDelay: '0.2s' }}
            />
          </div>
          <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-8">
            Conveniently located in Addis Ababa
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/60 p-8 sm:p-10 max-w-2xl mx-auto shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-500 to-primary-500" />
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl shadow-lg shadow-red-500/30">
                📍
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 leading-tight">
                  Ikram Automotive{' '}
                  <span className="text-primary-500">Workshop</span>
                </h3>
                <p className="text-xs text-gray-400 font-medium mt-1">
                  Addis Ababa, Ethiopia
                </p>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center gap-3 px-4">
                <FaMapLocationDot className="w-5 h-5 text-primary-500" />
                <a
                  href="https://maps.app.goo.gl/NeKWiXeiqiGy25pF6"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 hover:underline transition-colors"
                >
                  Bole Road, Addis Ababa, Ethiopia
                </a>
                <motion.a
                  href="https://maps.app.goo.gl/NeKWiXeiqiGy25pF6"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.05 }}
                  className="ml-2 p-2 rounded-lg bg-gray-100 text-primary-600 hover:bg-primary-500 hover:text-white transition-colors"
                  aria-label="Open in Maps"
                >
                  <span className="text-xs">🔗</span>
                </motion.a>
              </div>
              <div className="flex items-center justify-center gap-3 px-4">
                <FaClock className="w-5 h-5 text-primary-500" />
                <span className="text-sm text-gray-600">
                  Open Mon–Sat: 8:00 AM – 5:00 PM
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 px-4 mb-8">
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600">
                  📞
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Phone
                  </div>
                  <a
                    href="tel:+251911111112"
                    className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    +251 911 111 112
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                <div className="w-8 h-8 rounded-lg bg-gray-200 flex items-center justify-center text-gray-600">
                  ✉️
                </div>
                <div>
                  <div className="text-xs text-gray-400 uppercase tracking-wider">
                    Email
                  </div>
                  <a
                    href="mailto:info@ikramauto.com"
                    className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors"
                  >
                    info@ikramauto.com
                  </a>
                </div>
              </div>
            </div>
            <div className="pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Follow our journey
              </p>
              <div className="flex items-center justify-center gap-4">
                <motion.a
                  href="https://www.tiktok.com/@ikram_automotive"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium shadow-lg shadow-black/20 hover:shadow-black/30 transition-all duration-300"
                >
                  <span className="text-xs">🎵</span> TikTok
                </motion.a>
                <motion.a
                  href="https://m.youtube.com/@IkramIdris-ij4rz"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.05 }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="text-xs">▶️</span> YouTube
                </motion.a>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white"
        initial={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'hidden'
        }
        whileInView={
          prefersReducedMotion ? { opacity: 1, y: 0 } : 'visible'
        }
        variants={revealVariant}
        viewport={{ once: true, amount: 0.2 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.30,
        }}
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2 className="text-3xl font-bold">
            Ready to Service Your Vehicle?
          </h2>
          <p className="text-gray-400">
            Book an appointment today and experience transparent, professional auto service.
          </p>
          <Link
            href="/book"
            className="inline-block bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-lg transition text-lg"
          >
            Book Now
          </Link>
        </div>
      </motion.section>

      <Footer />
    </div>
  );
}
