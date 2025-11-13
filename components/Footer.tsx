import Link from "next/link";
import Image from "next/image";
import { Mail, MapPin, Phone } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="mt-auto border-t border-gsv-slate-200 bg-gradient-to-b from-white via-gsv-slate-50 to-gsv-slate-100">
      <div className="container py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-block mb-6 group">
              <Image src="/logo.svg" alt="Green Silicon Valley" width={140} height={70} className="h-10 w-auto group-hover:scale-105 transition-transform" />
            </Link>
            <p className="text-gsv-slate-600 leading-relaxed max-w-md mb-6">
              A student-led nonprofit empowering environmental STEM education through peer-to-peer presentations across the Bay Area.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-3 mb-6">
              <a href="mailto:greensiliconvalley27@gmail.com" className="flex items-center gap-3 text-gsv-slate-600 hover:text-gsv-green transition-colors group">
                <div className="w-10 h-10 bg-gsv-greenSoft rounded-lg flex items-center justify-center group-hover:bg-gsv-green group-hover:text-white transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <span className="text-sm font-medium">greensiliconvalley27@gmail.com</span>
              </a>
              <div className="flex items-center gap-3 text-gsv-slate-600">
                <div className="w-10 h-10 bg-gsv-greenSoft rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-gsv-green" />
                </div>
                <span className="text-sm font-medium">Bay Area, California</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-gsv-slate-200 hover:bg-gsv-green text-gsv-slate-600 hover:text-white rounded-lg flex items-center justify-center transition-all hover:scale-110" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gsv-slate-200 hover:bg-gsv-green text-gsv-slate-600 hover:text-white rounded-lg flex items-center justify-center transition-all hover:scale-110" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gsv-slate-200 hover:bg-gsv-green text-gsv-slate-600 hover:text-white rounded-lg flex items-center justify-center transition-all hover:scale-110" aria-label="Instagram">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" /></svg>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gsv-charcoal mb-6 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">About Us</span></Link></li>
              <li><Link href="/impact" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">Our Impact</span></Link></li>
              <li><Link href="/blog" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">Blog</span></Link></li>
              <li><Link href="/contact" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">Contact</span></Link></li>
              <li><Link href="/gallery" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">Gallery</span></Link></li>
            </ul>
          </div>

          {/* Get Involved */}
          <div>
            <h3 className="font-bold text-gsv-charcoal mb-6 text-lg">Get Involved</h3>
            <ul className="space-y-3">
              <li><Link href="/get-involved" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">Volunteer</span></Link></li>
              <li><Link href="/teachers/request" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">Request Presentation</span></Link></li>
              <li><Link href="/donate" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">Donate</span></Link></li>
              <li><Link href="/resources" className="text-gsv-slate-600 hover:text-gsv-green transition-colors inline-flex items-center group"><span className="group-hover:translate-x-1 transition-transform">Resources</span></Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gsv-slate-300">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gsv-slate-600">
            <p className="font-medium">© {currentYear} Green Silicon Valley. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-gsv-green transition-colors font-medium">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gsv-green transition-colors font-medium">Terms of Service</Link>
              <Link href={("/sitemap.xml" as any)} className="hover:text-gsv-green transition-colors font-medium">Sitemap</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
