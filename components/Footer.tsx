import Link from 'next/link';
import { FaTiktok, FaYoutube } from 'react-icons/fa6';

const SOCIAL_LINKS = [
  { label: 'TikTok', href: 'https://www.tiktok.com/@your-handle', icon: FaTiktok },
  { label: 'YouTube', href: 'https://www.youtube.com/@your-channel', icon: FaYoutube },
];

export default function Footer() {
  return (
    <footer className="py-8 px-4 sm:px-6 lg:px-8 border-t border-gray-100">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <span>🚗</span>
          <span className="font-medium text-gray-600">Ikram Automotive</span>
        </div>
        <div>© {new Date().getFullYear()} Ikram Automotive. All rights reserved.</div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hover:text-gray-700 transition">Login</Link>
          <Link href="/book" className="hover:text-gray-700 transition">Book</Link>
          <span className="h-4 w-px bg-gray-200" aria-hidden="true" />
          {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
            <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label} className="text-gray-400 hover:text-gray-700 transition">
              <Icon className="w-5 h-5" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}