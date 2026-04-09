// "use client";

// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { useState, useEffect, useRef } from "react";
// import {
//   User,
//   LogIn,
//   UserPlus,
//   LogOut,
//   Settings,
//   LayoutDashboard,
//   ShoppingCart,
//   ListOrdered, // 🆕 icon for Orders
// } from "lucide-react";

// export default function Navbar() {
//   const pathname = usePathname();
//   const [userEmail, setUserEmail] = useState(null);
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const email = localStorage.getItem("userEmail");
//     if (email) setUserEmail(email);

//     const handleAuthChange = (event) => {
//       const { email } = event.detail;
//       if (email) {
//         localStorage.setItem("userEmail", email);
//         setUserEmail(email);
//       } else {
//         localStorage.removeItem("userEmail");
//         setUserEmail(null);
//       }
//     };

//     window.addEventListener("authStateChanged", handleAuthChange);
//     return () => window.removeEventListener("authStateChanged", handleAuthChange);
//   }, []);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsDropdownOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("userEmail");
//     setUserEmail(null);
//     setIsDropdownOpen(false);
//     window.dispatchEvent(
//       new CustomEvent("authStateChanged", { detail: { email: null } })
//     );
//   };

//   const getUserInitials = (email) => {
//     if (!email) return "U";
//     const name = email.split("@")[0];
//     return name.charAt(0).toUpperCase();
//   };

//   return (
//     <nav className="bg-gradient-to-r from-slate-900 via-black to-slate-900 shadow-lg fixed w-full z-50">
//       <div className="max-w-7x2 mx-auto px-6 py-4 flex justify-between items-center">
//         {/* LOGO */}
//         <Link href="/" className="flex items-center gap-2 group">
//           <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
//             <span className="text-white font-bold text-xl">R</span>
//           </div>
//           <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600 tracking-tight">
//             RetailIQ
//           </span>
//         </Link>

//         {/* RIGHT SIDE */}
//         <div className="flex items-center gap-4">
          

//           {/* Profile Dropdown */}
//           <div className="relative" ref={dropdownRef}>
//             <button
//               onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//               className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all ${
//                 isDropdownOpen
//                   ? "bg-slate-800 ring-2 ring-orange-500/50"
//                   : "hover:bg-slate-800"
//               }`}
//             >
//               {userEmail ? (
//                 <>
//                   <div className="w-9 h-9 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center text-white font-semibold">
//                     {getUserInitials(userEmail)}
//                   </div>
//                   <span className="text-white font-medium hidden sm:block max-w-[120px] truncate">
//                     {userEmail.split("@")[0]}
//                   </span>
//                 </>
//               ) : (
//                 <>
//                   <div className="w-9 h-9 bg-slate-700 rounded-full flex items-center justify-center text-slate-400">
//                     <User className="w-5 h-5" />
//                   </div>
//                   <span className="text-slate-400 font-medium hidden sm:block">
//                     Account
//                   </span>
//                 </>
//               )}
//               <svg
//                 className={`w-4 h-4 text-slate-400 transition-transform ${
//                   isDropdownOpen ? "rotate-180" : ""
//                 }`}
//                 fill="none"
//                 viewBox="0 0 24 24"
//                 stroke="currentColor"
//               >
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//               </svg>
//             </button>

//             {/* Dropdown Menu */}
//             {isDropdownOpen && (
//               <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
//                 {userEmail ? (
//                   <>
//                     <div className="px-4 py-3 border-b border-slate-700 bg-slate-800/50">
//                       <p className="text-xs text-slate-400 mb-1">Signed in as</p>
//                       <p className="text-sm font-medium text-white truncate">{userEmail}</p>
//                     </div>

//                     <div className="py-2">
//                       <Link
//                         href="/seller/dashboard"
//                         className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
//                         onClick={() => setIsDropdownOpen(false)}
//                       >
//                         <LayoutDashboard className="w-4 h-4" />
//                         <span className="text-sm font-medium">Dashboard</span>
//                       </Link>

//                       {/* 🆕 Orders Page Link */}
//                       <Link
//                         href="/seller/orders"
//                         className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
//                         onClick={() => setIsDropdownOpen(false)}
//                       >
//                         <ListOrdered className="w-4 h-4" />
//                         <span className="text-sm font-medium">Orders</span>
//                       </Link>

//                       <Link
//                         href="/seller/setup"
//                         className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
//                         onClick={() => setIsDropdownOpen(false)}
//                       >
//                         <Settings className="w-4 h-4" />
//                         <span className="text-sm font-medium">Settings</span>
//                       </Link>
//                     </div>

//                     <div className="border-t border-slate-700 py-2">
//                       <button
//                         onClick={handleLogout}
//                         className="flex items-center gap-3 px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full"
//                       >
//                         <LogOut className="w-4 h-4" />
//                         <span className="text-sm font-medium">Logout</span>
//                       </button>
//                     </div>
//                   </>
//                 ) : (
//                   <div className="py-2">
//                     <Link
//                       href="/login"
//                       className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
//                       onClick={() => setIsDropdownOpen(false)}
//                     >
//                       <LogIn className="w-4 h-4" />
//                       <span className="text-sm font-medium">Login</span>
//                     </Link>

//                     <Link
//                       href="/signup"
//                       className="flex items-center gap-3 px-4 py-2.5 text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
//                       onClick={() => setIsDropdownOpen(false)}
//                     >
//                       <UserPlus className="w-4 h-4" />
//                       <span className="text-sm font-medium">Sign Up</span>
//                     </Link>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </nav>
//   );
// }





"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  User,
  LogIn,
  UserPlus,
  LogOut,
  Settings,
  LayoutDashboard,
  ListOrdered,
  ChevronDown
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

  // HIDE LOGIC: Don't show Navbar on Home or general Dashboard landing
  if (pathname === "/" || pathname === "/dashboard") {
    return null;
  }

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
    <nav className="h-[70px] w-full bg-white flex items-center justify-end px-8">
      {/* 1. Removed the <div> containing the Logo/RetailIQ text.
          2. Used 'justify-end' on the parent <nav> to push everything to the right.
      */}

      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className={`flex items-center gap-3 px-3 py-1.5 rounded-xl transition-all border ${
            isDropdownOpen 
              ? "bg-orange-50 border-orange-200" 
              : "bg-gray-50 border-gray-100 hover:bg-gray-100"
          }`}
        >
          {userEmail ? (
            <>
              <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">
                {getUserInitials(userEmail)}
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-[10px] text-gray-400 font-bold uppercase leading-none mb-1">Seller</p>
                <p className="text-sm font-bold text-gray-900 leading-none truncate max-w-[100px]">
                  {userEmail.split("@")[0]}
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                <User size={18} />
              </div>
              <span className="text-sm font-bold text-gray-700">Account</span>
            </>
          )}
          <ChevronDown size={14} className={`text-gray-400 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden z-[100]">
            {userEmail ? (
              <>
                <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Signed in as</p>
                  <p className="text-sm font-bold text-gray-900 truncate">{userEmail}</p>
                </div>

                <div className="p-2">
                  <Link
                    href="/seller/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <LayoutDashboard size={18} />
                    <span className="text-sm font-bold">Dashboard</span>
                  </Link>
                  <Link
                    href="/seller/orders"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <ListOrdered size={18} />
                    <span className="text-sm font-bold">Orders</span>
                  </Link>
                  <Link
                    href="/seller/setup"
                    className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-orange-50 hover:text-orange-600 rounded-xl transition-colors"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    <Settings size={18} />
                    <span className="text-sm font-bold">Settings</span>
                  </Link>
                </div>

                <div className="p-2 border-t border-gray-50">
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors text-sm font-bold"
                  >
                    <LogOut size={18} />
                    Logout Session
                  </button>
                </div>
              </>
            ) : (
              <div className="p-2 space-y-1">
                <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-gray-600 hover:bg-gray-50 rounded-xl transition-colors">
                  <LogIn size={18} />
                  <span className="text-sm font-bold">Login</span>
                </Link>
                <div className="p-1">
                  <Link href="/signup">
                    <button className="w-full bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm hover:bg-orange-700 transition-colors">
                      Sign Up Free
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}