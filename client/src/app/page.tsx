// "use client";

// import Image from "next/image";
// import { motion } from "framer-motion";
// import bgImage from "../assets/bg-cart.png";

// export default function HomePage() {
//   return (
//     <div className="w-screen overflow-hidden text-white m-0 p-0">
//       {/* Hero Section */}
//       <section className="relative w-full h-screen">
//         <div className="absolute inset-0">
//           <Image
//             src={bgImage}
//             alt="RetailIQ Background"
//             fill
//             priority
//             className="object-cover brightness-110 contrast-105 saturate-125"
//           />
//           <div className="absolute inset-0 bg-white/10 mix-blend-overlay" />
//         </div>

//         <div className="relative z-10 flex flex-col items-start justify-center h-full px-10 md:px-24">
//           <motion.h1
//             className="text-5xl md:text-7xl font-bold text-orange-400 mb-4 drop-shadow-[0_5px_15px_rgba(255,140,0,0.5)]"
//             initial={{ opacity: 0, y: 30 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ duration: 1 }}
//           >
//             Welcome to RetailIQ
//           </motion.h1>

//           <motion.p
//             className="text-lg md:text-2xl text-gray-100 max-w-2xl"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             transition={{ delay: 0.5, duration: 1 }}
//           >
//             The smart solution for shopkeepers to digitize their store and grow faster.
//           </motion.p>
//         </div>
//       </section>

//       {/* Getting Started Section */}
//       <section className="relative bg-[#070203] py-20 px-8 md:px-24 text-center">
//         <motion.h2
//           className="text-4xl md:text-5xl font-bold text-orange-400 mb-10"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           Let’s Register Your Shop
//         </motion.h2>

//         <motion.p
//           className="text-lg md:text-xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed"
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ delay: 0.3, duration: 0.8 }}
//         >
//           Getting started with RetailIQ is simple — create your account, register your shop, and 
//           manage your inventory digitally. Track your growth in real-time with our easy-to-use 
//           dashboard.
//         </motion.p>

        
//       </section>

//       {/* Our Services Section */}
//       <section className="relative bg-[#070203] py-20 px-8 md:px-24 text-center ">
//         <motion.h2
//           className="text-4xl md:text-5xl font-bold text-orange-400 mb-10"
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//         >
//           Our Services
//         </motion.h2>

//         <motion.p
//           className="text-lg md:text-xl text-gray-200 max-w-4xl mx-auto leading-relaxed"
//           initial={{ opacity: 0 }}
//           whileInView={{ opacity: 1 }}
//           transition={{ delay: 0.3, duration: 0.8 }}
//         >
//           We provide a complete digital solution for retail management — 
//           from inventory tracking and analytics to secure cloud storage of your sales data. 
//           RetailIQ empowers shopkeepers to compete in the digital era.
//         </motion.p>
//       </section>
//     </div>
//   );
// }







"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowRight, 
  BarChart3, 
  ShieldCheck, 
  Zap, 
  Store, 
  Globe,
  User,
  ChevronDown,
  LayoutDashboard,
  ListOrdered,
  LogOut,
  LogIn
} from "lucide-react";

// IMPORTANT: Ensure this path is correct or use the direct file if it's in public/
import bgImage from "../assets/bg-cart.png"; 

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.12 } }
};

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);

    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-[#050505] text-white selection:bg-orange-500/30 selection:text-orange-500 overflow-x-hidden font-sans">
      
      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-500 ${
        isScrolled ? "py-4 bg-black/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl" : "py-8 bg-transparent"
      }`}>
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)]"
            >
              <span className="text-white font-black text-xl">R</span>
            </motion.div>
            <span className="text-2xl font-black tracking-tighter uppercase">
              Retail<span className="text-orange-500">IQ</span>
            </span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 hover:border-orange-500/40 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white">
                {userEmail ? userEmail[0].toUpperCase() : <User size={14} />}
              </div>
              <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-orange-500' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 15, scale: 0.95 }}
                  className="absolute right-0 mt-4 w-60 bg-[#0C0C0C] border border-white/10 rounded-2xl p-2 shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-[110] overflow-hidden"
                >
                  {userEmail ? (
                    <>
                      <div className="px-4 py-3 border-b border-white/5 mb-1">
                        <p className="text-[10px] text-orange-500 font-bold uppercase tracking-widest">Active Store</p>
                        <p className="text-sm font-bold truncate">{userEmail}</p>
                      </div>
                      <DropdownItem href="/seller/dashboard" icon={<LayoutDashboard size={16} />} label="Dashboard" />
                      <DropdownItem href="/seller/orders" icon={<ListOrdered size={16} />} label="Orders" />
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl text-sm font-bold transition-all mt-1">
                        <LogOut size={16} /> Logout Session
                      </button>
                    </>
                  ) : (
                    <>
                      <DropdownItem href="/login" icon={<LogIn size={16} />} label="Sign In" />
                      <Link href="/signup" className="block p-1">
                        <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-orange-500/20">Launch App</button>
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <Image
            src={bgImage}
            alt="Retail Background"
            fill
            priority
            className="object-cover object-right md:object-center opacity-50 brightness-[0.7] contrast-125" 
          />
          {/* FADES: This makes the image blend into the black background */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#050505]/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeInUp} className="inline-block py-1.5 px-4 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 text-xs font-black uppercase tracking-widest mb-8 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              The Next Gen Retail OS
            </motion.span>
            <motion.h1 variants={fadeInUp} className="text-6xl md:text-[9rem] font-black mb-8 tracking-tighter leading-[0.8] uppercase">
              Smart <br />
              <span className="text-orange-500 drop-shadow-[0_0_30px_rgba(249,115,22,0.3)]">Retailing.</span>
            </motion.h1>
            <motion.p variants={fadeInUp} className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-12 font-medium leading-relaxed">
              Transform your physical store into a digital powerhouse. Track inventory, analyze growth, and scale effortlessly with one unified dashboard.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Link href="/signup">
                <motion.button 
                  whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(249,115,22,0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="group bg-orange-500 text-white px-10 py-5 rounded-2xl font-black text-lg transition-all flex items-center gap-2"
                >
                  Launch Store <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <motion.button 
                whileHover={{ backgroundColor: "rgba(255,255,255,0.1)" }}
                className="bg-white/5 backdrop-blur-md border border-white/10 px-10 py-5 rounded-2xl font-black text-lg transition-all"
              >
                Live Demo
              </motion.button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-10">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center"
          >
            {[
              { label: "Active Shops", val: "10K+" }, 
              { label: "Daily Sales", val: "₹50M+" }, 
              { label: "Uptime", val: "99.9%" }, 
              { label: "Support", val: "24/7" }
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeInUp}>
                <h3 className="text-4xl md:text-5xl font-black text-orange-500 mb-2 tracking-tighter">{stat.val}</h3>
                <p className="text-gray-500 text-xs uppercase font-bold tracking-[0.2em]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- FEATURES GRID --- */}
      <section className="py-40 px-10">
        <div className="max-w-7xl mx-auto">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            className="mb-24 text-center md:text-left"
          >
            <h2 className="text-orange-500 font-black mb-4 uppercase tracking-[0.3em] text-sm">Capabilities</h2>
            <h3 className="text-5xl md:text-7xl font-black max-w-3xl tracking-tighter leading-tight uppercase">
              Everything you need to <span className="text-zinc-600">own the market.</span>
            </h3>
          </motion.div>

          <motion.div 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true }} 
            variants={staggerContainer} 
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            <FeatureCard icon={<Zap className="text-orange-500" />} title="Instant Billing" desc="Generate professional invoices in seconds. Support for all thermal printers and digital receipts." />
            <FeatureCard icon={<BarChart3 className="text-orange-500" />} title="AI Analytics" desc="Predictive algorithms tell you exactly what to restock and when based on buyer trends." />
            <FeatureCard icon={<ShieldCheck className="text-orange-500" />} title="Secure Cloud" desc="Bank-level encryption and daily automated backups ensure your business data is never lost." />
            <FeatureCard icon={<Store className="text-orange-500" />} title="Multi-Store" desc="Manage one location or a thousand. Our global dashboard scales as fast as your ambition." />
            <FeatureCard icon={<Globe className="text-orange-500" />} title="Online Catalog" desc="Turn your physical inventory into a beautiful public website with just one click." />
            
            {/* CTA CARD */}
            <motion.div 
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className="p-10 rounded-[2.5rem] bg-orange-500 flex flex-col justify-center items-center text-center shadow-2xl shadow-orange-500/20"
            >
              <h4 className="text-3xl font-black mb-6 text-white tracking-tighter italic uppercase">"Scale or <br />get left behind."</h4>
              <Link href="/signup" className="w-full">
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-black text-white px-8 py-4 rounded-2xl font-black hover:bg-zinc-900 transition-colors shadow-xl"
                >
                  Join RetailIQ
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="bg-black py-24 px-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          <div>
            <h2 className="text-3xl font-black tracking-tighter mb-2 uppercase">Retail<span className="text-orange-500">IQ</span></h2>
            <p className="text-gray-500 text-sm font-medium">Empowering the next generation of global retailers.</p>
          </div>
          <div className="flex gap-10 text-xs font-bold uppercase tracking-widest text-gray-400">
            <Link href="#" className="hover:text-orange-500 transition-colors font-bold uppercase tracking-widest">Privacy</Link>
            <Link href="#" className="hover:text-orange-500 transition-colors font-bold uppercase tracking-widest">Terms</Link>
            <Link href="#" className="hover:text-orange-500 transition-colors font-bold uppercase tracking-widest">Support</Link>
          </div>
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">© 2026 RetailIQ Intelligence Systems.</p>
        </div>
      </footer>
    </div>
  );
}

function DropdownItem({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-orange-500 hover:bg-orange-500/5 rounded-xl transition-all text-sm font-bold">
      {icon} {label}
    </Link>
  );
}

function FeatureCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div 
      variants={fadeInUp} 
      whileHover={{ y: -10, borderColor: "rgba(249, 115, 22, 0.4)" }} 
      className="p-10 rounded-[2.5rem] bg-white/[0.02] border border-white/5 transition-all duration-300 group shadow-lg"
    >
      <div className="w-16 h-16 rounded-[1.25rem] bg-orange-500/10 flex items-center justify-center mb-8 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 shadow-sm">
        <div className="group-hover:text-white transition-colors duration-300">{icon}</div>
      </div>
      <h4 className="text-2xl font-black mb-4 tracking-tighter uppercase">{title}</h4>
      <p className="text-gray-400 leading-relaxed font-medium text-sm">{desc}</p>
    </motion.div>
  );
}