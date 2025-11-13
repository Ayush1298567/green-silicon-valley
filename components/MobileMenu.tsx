"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { X, Menu } from "lucide-react";

interface MobileMenuProps {
  links: Array<{ label: string; href: string }>;
  isAuthenticated: boolean;
}

export default function MobileMenu({ links, isAuthenticated }: MobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [isOpen]);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6 text-gsv-charcoal" />
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-modal"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-2xl z-modal transform transition-transform duration-300 ease-out">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gsv-charcoal">Menu</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close menu"
              >
                <X className="w-6 h-6 text-gsv-gray" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-6 space-y-2">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href as any}
                  onClick={() => setIsOpen(false)}
                  className="block px-4 py-3 text-gsv-charcoal font-medium rounded-lg hover:bg-gsv-greenSoft hover:text-gsv-green transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Action Buttons */}
            <div className="p-6 border-t space-y-3">
              {isAuthenticated ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="btn btn-ghost w-full"
                  >
                    Dashboard
                  </Link>
                  <a
                    href="/logout"
                    className="btn btn-primary w-full"
                  >
                    Logout
                  </a>
                </>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="btn btn-primary w-full"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

