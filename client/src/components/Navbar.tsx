"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  LayoutDashboard,
  ListOrdered,
  ChevronDown,
  BarChart3 // 🆕 Added for Analytics
} from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync Auth State
  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);

    const handleAuthChange = (event: any) => {
      const { email } = event.detail;
      setUserEmail(email || null);
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    return () => window.removeEventListener("authStateChanged", handleAuthChange);
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // HIDE LOGIC: Don't show Navbar on Home
  if (pathname === "/") return null;

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setIsDropdownOpen(false);
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: { email: null } }));
  };

  const getUserInitials = (email: string) => {
    return email.split("@")[0].charAt(0).toUpperCase();
  };

  return (
    <nav className="h-[70px] w-full bg-white/70 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 md:px-10 z-[100] sticky top-0">
      
      {/* Optional: Add a minimal logo branding if needed, or leave empty for clean right-aligned look */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-black tracking-widest text-gray-900 uppercase">Retail<span className="text-orange-600">IQ</span></span>
      </div>

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-3 px-3 py-1.5 rounded-2xl transition-all border ${
            isDropdownOpen 
              ? "bg-gray-100 border-gray-200" 
              : "bg-gray-50 border-gray-100 hover:bg-gray-100"
          }`}
        >
          {userEmail ? (
            <>
              <div className="w-8 h-8 bg-gray-900 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {getUserInitials(userEmail)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[9px] text-gray-400 font-black uppercase leading-none mb-1">Authenticated</p>
                <p className="text-xs font-bold text-gray-900 leading-none truncate max-w-[100px]">
                  {userEmail.split("@")[0]}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
                <User size={16} />
              </div>
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider px-2">Account</span>
            </>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-orange-600" : ""}`} />
        </button>

        {/* Premium Dropdown Menu */}
        <AnimatePresence>
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-gray-100 rounded-3xl shadow-2xl overflow-hidden z-[100]">
              {userEmail ? (
                <>
                  <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Active Instance</p>
                    <p className="text-sm font-bold text-gray-900 truncate">{userEmail}</p>
                  </div>

                  <div className="p-2">
                    <NavItem href="/seller/dashboard" icon={LayoutDashboard} label="Core Dashboard" onClick={() => setIsDropdownOpen(false)} />
                    <NavItem href="/seller/orders" icon={ListOrdered} label="Order Fulfillment" onClick={() => setIsDropdownOpen(false)} />
                    <NavItem href="/seller/analytics" icon={BarChart3} label="Sales Intelligence" onClick={() => setIsDropdownOpen(false)} />
                    <NavItem href="/seller/setup" icon={Settings} label="Infrastructure" onClick={() => setIsDropdownOpen(false)} />
                  </div>

                  <div className="p-2 border-t border-gray-50">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-2xl transition-colors text-xs font-bold uppercase tracking-wider"
                    >
                      <LogOut size={16} /> Logout Session
                    </button>
                  </div>
                </>
              ) : (
                <div className="p-2 space-y-1">
                  <NavItem href="/login" icon={LogIn} label="Access Gateway" onClick={() => setIsDropdownOpen(false)} />
                  <Link href="/signup" className="block p-1">
                    <button className="w-full bg-gray-900 hover:bg-black text-white py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all">
                      Sign Up Free
                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}

function NavItem({ href, icon: Icon, label, onClick }: { href: string, icon: any, label: string, onClick: () => void }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-2xl transition-all text-xs font-bold uppercase tracking-wider"
      onClick={onClick}
    >
      <Icon size={16} /> {label}
    </Link>
  );
}