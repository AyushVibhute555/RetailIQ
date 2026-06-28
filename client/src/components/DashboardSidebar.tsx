"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  Activity,
  Package,
  ListOrdered,
  Users,
  Settings,
  ChevronDown,
} from "lucide-react";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [openOverview, setOpenOverview] = useState(true);

  const navItems = [
    { name: "Analytics", href: "/seller/analytics", icon: Activity },
    { name: "Products", href: "/seller/products", icon: Package },
    { name: "Orders", href: "/seller/orders", icon: ListOrdered },
    { name: "Customers", href: "/seller/customers", icon: Users },
    { name: "Settings", href: "/seller/settings", icon: Settings },
  ];

  const navItemClass = (path: string) =>
    `group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative ${pathname === path
      ? "text-white font-bold bg-white/[0.06]"
      : "text-gray-400 hover:text-white hover:bg-white/[0.04]"
    }`;

  return (
    <>
      {/* --- DESKTOP SIDEBAR --- */}
      <aside className="hidden md:flex w-64 h-screen bg-[#030303] text-white flex-col fixed border-r border-white/5 z-50">
        {/* Logo */}
        <div className="p-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-lg flex items-center justify-center font-black text-white shadow-[0_0_20px_rgba(249,115,22,0.2)]">R</div>
            <span className="font-bold text-xl tracking-tighter">RetailIQ</span>
          </Link>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-4 py-2 space-y-1.5">
          <button
            onClick={() => setOpenOverview(!openOverview)}
            className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors ${openOverview ? "text-white" : "text-gray-400 hover:text-white"}`}
          >
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-4 h-4" /> Overview
            </div>
            <ChevronDown className={`w-3 h-3 transition-transform ${openOverview ? "rotate-180" : ""}`} />
          </button>

          {openOverview && (
            <div className="space-y-1 mb-4">
              <Link href="/seller/dashboard" className={navItemClass("/seller/dashboard")}>
                {pathname === "/seller/dashboard" && <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />}
                <span className="ml-7 text-xs font-medium">Summary</span>
              </Link>
            </div>
          )}

          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className={navItemClass(item.href)}>
              {pathname === item.href && <div className="absolute left-0 w-1 h-6 bg-orange-500 rounded-r-full" />}
              <item.icon className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      {/* --- MOBILE BOTTOM NAVIGATION --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-[#030303]/90 backdrop-blur-xl border-t border-white/10 z-[100] pb-2">
        <div className="flex justify-around items-center h-full px-2">
          {/* Dashboard (Mobile) */}
          <Link href="/seller/dashboard" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${pathname === '/seller/dashboard' ? 'text-orange-500' : 'text-gray-500'}`}>
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Home</span>
          </Link>

          {/* Analytics (Mobile) */}
          <Link href="/seller/analytics" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${pathname === '/seller/analytics' ? 'text-orange-500' : 'text-gray-500'}`}>
            <Activity className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Stats</span>
          </Link>

          {/* Orders (Mobile) */}
          <Link href="/seller/orders" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${pathname === '/seller/orders' ? 'text-orange-500' : 'text-gray-500'}`}>
            <ListOrdered className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Orders</span>
          </Link>

          {/* Settings (Mobile) */}
          <Link href="/seller/setup" className={`flex flex-col items-center justify-center w-full h-full gap-1 ${pathname === '/seller/setup' ? 'text-orange-500' : 'text-gray-500'}`}>
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-black uppercase tracking-widest">Setup</span>
          </Link>
        </div>
      </div>
    </>
  );
}