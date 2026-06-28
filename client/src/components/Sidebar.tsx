"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Activity,
  ListOrdered,
  Settings,
  LogOut,
  Store
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [userEmail, setUserEmail] = useState<string | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const email = localStorage.getItem("userEmail");
      if (email) setUserEmail(email);
    }, 0);

    const handleAuthChange = (event: any) => {
      const { email } = event.detail;
      if (email) {
        localStorage.setItem("userEmail", email);
        setUserEmail(email);
      } else {
        localStorage.removeItem("userEmail");
        setUserEmail(null);
      }
    };

    window.addEventListener("authStateChanged", handleAuthChange);
    return () => window.removeEventListener("authStateChanged", handleAuthChange);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    window.dispatchEvent(new CustomEvent("authStateChanged", { detail: { email: null } }));
  };

  // Modern Nav Item Class
  const navItem = (href: string) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${pathname === href
      ? "text-white font-bold"
      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
    }`;

  return (
    <aside className="w-64 h-screen bg-[#030303] text-white flex flex-col fixed border-r border-white/5 z-50">

      {/* Brand Logo */}
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-lg flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            R
          </div>
          <span className="font-bold text-xl tracking-tighter">RetailIQ</span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-2 space-y-1.5">
        <Link href="/seller/dashboard" className={navItem("/seller/dashboard")}>
          {pathname === "/seller/dashboard" && <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />}
          <LayoutDashboard className="w-4 h-4" />
          Dashboard
        </Link>

        <Link href="/seller/analytics" className={navItem("/seller/analytics")}>
          {pathname === "/seller/analytics" && <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />}
          <Activity className="w-4 h-4" />
          Analytics
        </Link>

        <Link href="/seller/orders" className={navItem("/seller/orders")}>
          {pathname === "/seller/orders" && <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />}
          <ListOrdered className="w-4 h-4" />
          Orders
        </Link>

        <Link href="/seller/setup" className={navItem("/seller/setup")}>
          {pathname === "/seller/setup" && <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />}
          <Settings className="w-4 h-4" />
          Settings
        </Link>
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/5 bg-white/[0.02]">
        {userEmail && (
          <div className="px-4 py-3 mb-2 rounded-xl bg-black/40 border border-white/5">
            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-500 mb-0.5">Instance</p>
            <p className="text-xs font-medium truncate text-gray-300">{userEmail}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all duration-300 text-xs font-bold uppercase tracking-wider"
        >
          <LogOut className="w-4 h-4" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
// Add this component to Sidebar.tsx or a new file
export function MobileNav() {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Analytics", href: "/seller/analytics", icon: Activity },
    { name: "Orders", href: "/seller/orders", icon: ListOrdered },
    { name: "Settings", href: "/seller/setup", icon: Settings },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#030303]/90 backdrop-blur-xl border-t border-white/10 z-[100] pb-2">
      <div className="flex justify-around items-center h-full px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full gap-1"
            >
              <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-orange-500' : 'text-gray-500'}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}