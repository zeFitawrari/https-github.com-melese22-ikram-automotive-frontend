'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { FaTiktok, FaYoutube, FaMapLocationDot, FaPhone, FaEnvelope, FaClock } from 'react-icons/fa6';

const SOCIAL_LINKS = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@ikram_automotive', icon: FaTiktok, color: 'text-black hover:bg-black' },
  { label: 'YouTube', href: 'https://m.youtube.com/@IkramIdris-ij4rz', icon: FaYoutube, color: 'text-red-600 hover:bg-red-600' },
];

const FOOTER_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Book Appointment', href: '/book' },
  { label: 'Track Job', href: '/track' },
];

const COMPANY_LINKS = [
  { label: 'About Us', href: '/' },
  { label: 'Contact', href: '#locations' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
];

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-16">
        {/* Top decorative gradient */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-full max-w-7xl h-1 bg-gradient-to-r from-transparent via-primary-500/40 to-transparent rounded-full pointer-events-none" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 lg:gap-12 mb-10 sm:mb-12">
          {/* Brand Column */}
          <div className="col-span-1 lg:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20">
                <span className="text-xl">🚗</span>
              </div>
              <span className="text-xl font-bold text-white tracking-tight">Ikram <span className="text-primary-400">Automotive</span></span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6 max-w-xs">
              Ethiopia's #1 EV-Centric Workshop. Expert auto repair, diagnostics, and customization with transparent pricing and real-time tracking.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.tiktok.com/@ikram_automotive" target="_blank" rel="noopener noreferrer" className={SOCIAL_LINKS[0].color + ' w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-rotate-12'}>
                <FaTiktok className="w-5 h-5" />
              </a>
              <a href="https://m.youtube.com/@IkramIdris-ij4rz" target="_blank" rel="noopener noreferrer" className={SOCIAL_LINKS[1].color + ' w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-rotate-12'}>
                <FaYoutube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Quick Links</h3>
            <ul className="space-y-3">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: -4 }}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Company</h3>
            <ul className="space-y-3">
              {COMPANY_LINKS.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: -4 }}
                    className="text-sm text-gray-400 hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-6">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-primary-400 shrink-0">
                  <FaMapLocationDot className="w-5 h-5" />
                </div>
                <div className="text-sm text-gray-400 leading-tight">
                  <p className="text-white font-medium">Bole Road, Addis Ababa</p>
                  <p className="text-xs text-gray-500 mt-1">Ethiopia</p>
                </div>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-primary-400 shrink-0">
                  <FaPhone className="w-5 h-5" />
                </div>
                <a href="tel:+251911111112" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">+251 911 111 112</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-primary-400 shrink-0">
                  <FaEnvelope className="w-5 h-5" />
                </div>
                <a href="mailto:info@ikramauto.com" className="text-sm text-gray-400 hover:text-primary-400 transition-colors">info@ikramauto.com</a>
              </li>
              <li className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center text-primary-400 shrink-0">
                  <FaClock className="w-5 h-5" />
                </div>
                <div className="text-sm text-gray-400">Mon – Sat · 8:00 AM – 5:00 PM</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Section Highlight */}
        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-gray-900/80 rounded-2xl border border-gray-700 p-6 sm:p-8 mb-8 sm:mb-10 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-red-500" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="text-center sm:text-left">
              <h3 className="text-lg font-bold text-white mb-1">Follow Our Journey</h3>
              <p className="text-sm text-gray-400">Watch our transformations, tips, and behind-the-scenes.</p>
            </div>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon, color }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ y: -4, scale: 1.05 }}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all duration-300 ${color.replace('hover:bg-', 'hover:')}`}
                >
                  <Icon className="w-6 h-6" />
                </motion.a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>© {new Date().getFullYear()} Ikram Automotive. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="hover:text-primary-400 transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy</Link>
              <span className="h-3 w-px bg-gray-700" aria-hidden="true" />
              <Link href="/login" className="hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
