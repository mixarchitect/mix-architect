"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Menu, X } from "lucide-react";

export function LandingNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  return (
    <nav aria-label="Main" className="fixed top-6 left-1/2 -translate-x-1/2 z-50" ref={navRef}>
      <div className="w-[calc(100vw-24px)] sm:w-[92vw] md:w-[78vw] lg:w-[1100px] max-w-6xl flex items-center gap-3 bg-[#1a1a1a] border border-white/10 rounded-full px-3 py-3 shadow-float">
        <Link href="/" className="flex items-center shrink-0 pl-2 pr-2 sm:pr-4">
          <Image
            src="/mix-architect-logo-white.svg"
            alt="Mix Architect"
            width={180}
            height={36}
            priority
            className="h-7 sm:h-8 w-auto"
          />
        </Link>

        <div className="hidden md:flex flex-1 items-center justify-center gap-1 text-sm">
          <a
            href="#features"
            className="px-4 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            className="px-4 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Pricing
          </a>
          <Link
            href="/featured"
            className="px-4 py-2 rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Featured
          </Link>
        </div>

        <div className="flex items-center gap-2 ml-auto md:ml-0">
          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="md:hidden w-9 h-9 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/8 transition-colors"
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>

          <Link
            href="/auth/sign-in"
            className="hidden sm:inline-flex px-4 py-2 text-sm text-white/60 hover:text-white transition-colors whitespace-nowrap"
          >
            Sign in
          </Link>
          <Link
            href="/auth/sign-in"
            className="px-5 py-2 text-sm font-semibold text-white bg-[#0D9488] rounded-full hover:bg-[#0fb9ab] transition-colors whitespace-nowrap"
          >
            Start Free
          </Link>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 mx-3 rounded-xl bg-[#1a1a1a] border border-white/10 p-2 shadow-float">
          <a
            href="#features"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Features
          </a>
          <a
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Pricing
          </a>
          <Link
            href="/featured"
            onClick={() => setMenuOpen(false)}
            className="block px-4 py-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Featured
          </Link>
          <Link
            href="/auth/sign-in"
            onClick={() => setMenuOpen(false)}
            className="sm:hidden block px-4 py-3 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/8 transition-colors"
          >
            Sign in
          </Link>
        </div>
      )}
    </nav>
  );
}
