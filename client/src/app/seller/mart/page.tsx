"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  Settings,
} from "lucide-react";

export default function MartPage() {
  const pathname = usePathname();

  const mobileNavItems = [
    { name: "Dashboard", href: "/seller/dashboard", icon: LayoutDashboard },
    { name: "Orders", href: "/seller/orders", icon: ListOrdered },
    { name: "Analytics", href: "/seller/analytics", icon: BarChart3 },
    { name: "Settings", href: "/seller/setup", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-0">
      {/* Placeholder content */}
      <div className="p-8 flex items-center justify-center h-[calc(100vh-5rem)]">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Mart Dashboard</h1>
          <p className="text-gray-500">This page is under construction.</p>
        </div>
      </div>

      {/* 📱 MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/80 backdrop-blur-xl border-t border-gray-200 z-[100] pb-safe">
        <div className="flex justify-around items-center h-full px-2">
          {mobileNavItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 relative group"
              >
                <div
                  className={`p-1.5 rounded-xl transition-all duration-300 ${isActive
                    ? "bg-orange-50 text-orange-600"
                    : "text-gray-500 group-hover:text-gray-900"
                    }`}
                >
                  <item.icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold tracking-wide transition-colors ${isActive
                    ? "text-orange-600"
                    : "text-gray-500 group-hover:text-gray-900"
                    }`}
                >
                  {item.name}
                </span>
                {isActive && (
                  <div className="absolute top-0 w-8 h-1 bg-orange-500 rounded-b-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}