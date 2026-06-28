"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  LogIn,
  Sparkles,
  Layers,
  Send,
  X
} from "lucide-react";

// --- ULTRA-PREMIUM INTERACTIVE BACKGROUND ---
function LuxuryCanvasBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const particles: Array<{ x: number; y: number; ox: number; oy: number; vx: number; vy: number; radius: number }> = [];

    const spacing = 50;
    for (let x = 0; x < width; x += spacing) {
      for (let y = 0; y < height; y += spacing) {
        particles.push({ x, y, ox: x, oy: y, vx: 0, vy: 0, radius: Math.random() * 1.5 + 0.5 });
      }
    }

    let mouse = { x: -1000, y: -1000, radius: 200 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        const dx = mouse.x - p.x;
        const dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 1.5;
          p.vy -= Math.sin(angle) * force * 1.5;
        }

        p.vx += (p.ox - p.x) * 0.05;
        p.vy += (p.oy - p.y) * 0.05;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.x += p.vx;
        p.y += p.vy;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);

        if (mouse.x > 0 && dist < mouse.radius) {
          ctx.fillStyle = `rgba(249, 115, 22, ${0.2 + (1 - dist / mouse.radius) * 0.5})`;
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
        }
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />;
}

// Animation Orchestration Settings
const luxuryFadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
};

const staggerContainer = {
  visible: { transition: { staggerChildren: 0.15 } }
};

export default function HomePage() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Spotlight effect state
  const [mousePos, setMousePosition] = useState({ x: 0, y: 0 });

  // Modal state
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | "support" | null>(null);

  // Contact Form State
  const [formStatus, setFormStatus] = useState<"idle" | "submitting" | "success">("idle");

  const dropdownRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll();
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const email = localStorage.getItem("userEmail");
    if (email) setUserEmail(email);

    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener("scroll", handleScroll);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    setUserEmail(null);
    setIsDropdownOpen(false);
  };

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormStatus("submitting");
    setTimeout(() => setFormStatus("success"), 1500);
  };

  return (
    <div className="bg-[#030303] text-white selection:bg-orange-500/30 selection:text-orange-400 overflow-x-hidden font-sans relative antialiased min-h-screen">

      {/* 3D Noise Grain Overlay */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.02] pointer-events-none z-[200]" />

      {/* Global Dynamic Spotlight Effect */}
      <div
        className="fixed inset-0 pointer-events-none z-[50]"
        style={{
          background: `radial-gradient(800px circle at ${mousePos.x}px ${mousePos.y}px, rgba(255,255,255,0.03), transparent 40%)`
        }}
      />

      {/* --- NAVIGATION --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${isScrolled ? "py-4 bg-[#030303]/70 backdrop-blur-xl border-b border-white/5 shadow-2xl" : "py-8 bg-transparent"
        }`}>
        <div className="max-w-7xl mx-auto px-8 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              className="w-9 h-9 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-lg flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.3)]"
            >
              <span className="text-white font-black text-lg tracking-tighter">R</span>
            </motion.div>
            <span className="text-xl font-black tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-gray-400">
              Retail<span className="text-orange-500">IQ</span>
            </span>
          </Link>

          <div className="relative" ref={dropdownRef}>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.03] border border-white/10 hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 shadow-inner"
            >
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                {userEmail ? userEmail[0].toUpperCase() : <User size={12} />}
              </div>
              <ChevronDown size={12} className={`text-gray-400 transition-transform duration-500 ${isDropdownOpen ? 'rotate-180 text-orange-400' : ''}`} />
            </motion.button>

            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.97 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
                  className="absolute right-0 mt-4 w-64 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-2 shadow-[0_30px_60px_rgba(0,0,0,0.8)] z-[110]"
                >
                  {userEmail ? (
                    <>
                      <div className="px-4 py-3 border-b border-white/5 mb-1">
                        <p className="text-[9px] text-orange-400 font-extrabold uppercase tracking-widest">Enterprise Instance</p>
                        <p className="text-sm font-semibold text-gray-200 truncate">{userEmail}</p>
                      </div>
                      <DropdownItem href="/seller/dashboard" icon={<LayoutDashboard size={15} />} label="Dashboard Core" />
                      <DropdownItem href="/seller/orders" icon={<ListOrdered size={15} />} label="Order Fulfillment" />
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl text-xs font-bold transition-all duration-300 mt-1">
                        <LogOut size={15} /> Terminate Session
                      </button>
                    </>
                  ) : (
                    <>
                      <DropdownItem href="/login" icon={<LogIn size={15} />} label="Access Gateway" />
                      <Link href="/signup" className="block p-1 mt-1">
                        <button className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-lg shadow-orange-600/20">Launch Instance</button>
                      </Link>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </nav>

      {/* --- REFINED ASYMMETRICAL HERO SECTION --- */}
      <section className="relative min-h-[100vh] w-full flex items-center pt-32 pb-20 overflow-hidden border-b border-white/5">
        <LuxuryCanvasBackground />

        {/* Soft Background Gradient Meshes */}
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-orange-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-amber-600/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity }}
          className="relative z-10 w-full max-w-7xl mx-auto px-8 flex flex-col items-start"
        >
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="w-full">

            <motion.div variants={luxuryFadeUp} className="inline-flex items-center gap-2 py-2 px-4 rounded-full border border-white/10 bg-white/[0.02] text-gray-300 text-xs font-medium tracking-widest mb-12 shadow-2xl backdrop-blur-md">
              <Sparkles size={12} className="text-orange-500 animate-pulse" />
              <span>THE NEXT GENERATION RETAIL PROTOCOL</span>
            </motion.div>

            {/* Massive Asymmetrical Typography */}
            <div className="flex flex-col gap-2 mb-12 w-full">
              <motion.div className="overflow-hidden" variants={luxuryFadeUp}>
                <h1 className="text-[12vw] md:text-[8rem] font-black tracking-tighter leading-[0.85] text-white">
                  INTELLIGENT
                </h1>
              </motion.div>
              <motion.div className="overflow-hidden w-full flex md:justify-end" variants={luxuryFadeUp}>
                <h1 className="text-[12vw] md:text-[8rem] font-black tracking-tighter leading-[0.85] text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 md:-mt-6">
                  RETAILING.
                </h1>
              </motion.div>
            </div>

            <motion.div variants={luxuryFadeUp} className="flex flex-col md:flex-row items-start md:items-center justify-between w-full border-t border-white/10 pt-8 gap-8">
              <p className="text-neutral-400 text-sm md:text-base max-w-xl font-normal leading-relaxed tracking-wide">
                Convert physical real estate into automated, highly responsive commerce ecosystems. Unified multi-store logistics, custom predictive metrics, and programmatic catalog generation designed for the modern enterprise.
              </p>

              <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
                <Link href="/signup">
                  <motion.button
                    whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(249,115,22,0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-white text-black px-8 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300 flex items-center gap-2"
                  >
                    Initialize System <ArrowRight size={14} />
                  </motion.button>
                </Link>
                <motion.button
                  onClick={scrollToContact}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.05)" }}
                  className="bg-transparent border border-white/20 text-white px-8 py-4 rounded-xl font-bold text-xs tracking-widest uppercase transition-all duration-300"
                >
                  Contact Sales
                </motion.button>
              </div>
            </motion.div>

          </motion.div>
        </motion.div>
      </section>

      {/* --- REFINED METRICS MARQUEE --- */}
      <section className="py-24 border-b border-white/5 relative z-10 bg-[#030303]">
        <div className="max-w-7xl mx-auto px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center"
          >
            {[
              { label: "Active Nodes", val: "100+" },
              { label: "Gross Volume", val: "₹500K+" },
              { label: "Core Uptime", val: "99%" },
              { label: "Latency", val: "< 70ms" }
            ].map((stat, i) => (
              <motion.div key={i} variants={luxuryFadeUp} className="relative group">
                <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">{stat.val}</h3>
                <p className="text-neutral-500 text-[10px] uppercase font-bold tracking-[0.25em]">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- LUXURY BENTO FEATURE MATRIX --- */}
      <section className="py-40 px-8 max-w-7xl mx-auto relative z-10">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={luxuryFadeUp}
          className="mb-24 md:text-center"
        >
          <p className="text-orange-500 font-extrabold mb-4 uppercase tracking-[0.35em] text-xs">Architectural Layers</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            DESIGNED TO SCALE. <br /><span className="text-neutral-700">BUILT TO OUTPERFORM.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <BentoCard icon={<BarChart3 />} title="Predictive Neural Engine" desc="Deep statistical pattern mapping profiles. Automated ML calculations process raw customer variables asynchronously to construct intelligent stock profiles before depletion alerts fire." />
          </div>
          <div className="md:col-span-1">
            <BentoCard icon={<Zap />} title="Instant Point of Sale" desc="Microsecond billing arrays optimized for receipt engines and immediate online signature validation." />
          </div>
          <div className="md:col-span-1">
            <BentoCard icon={<ShieldCheck />} title="Immutable Ledger" desc="Enterprise compliance patterns protecting customer tracking records and transactional payloads." />
          </div>
          <div className="md:col-span-1">
            <BentoCard icon={<Layers />} title="Fleet Control" desc="Cluster multi-location channels into one command deck. Global changes cascade in real time." />
          </div>
          <div className="md:col-span-1">
            <BentoCard icon={<Globe />} title="Dynamic Storefronts" desc="Transform internal databases into structured, high-conversion merchant portals instantly." />
          </div>
        </div>
      </section>

      {/* --- GLASSMORPHISM CONTACT FORM --- */}
      <section id="contact" className="py-32 px-8 border-t border-white/5 bg-gradient-to-b from-[#030303] to-[#0a0a0a] relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="p-[1px] rounded-[2rem] bg-gradient-to-b from-white/10 to-transparent shadow-2xl"
          >
            <div className="bg-[#050505] rounded-[2rem] p-10 md:p-16 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 blur-[100px] pointer-events-none" />

              <div className="mb-10 text-center">
                <h3 className="text-3xl font-black tracking-tight mb-3">Request a Demonstration</h3>
                <p className="text-neutral-500 text-sm tracking-wide">Connect with our enterprise architecture team to deploy your infrastructure.</p>
              </div>

              {formStatus === "success" ? (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="py-16 text-center">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <ShieldCheck size={32} />
                  </div>
                  <h4 className="text-2xl font-bold mb-2">Request Received</h4>
                  <p className="text-neutral-400 text-sm">An integration specialist will contact you within 24 hours.</p>
                </motion.div>
              ) : (
                <form onSubmit={handleFormSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Full Name</label>
                      <input required type="text" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Work Email</label>
                      <input required type="email" className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all" placeholder="john@company.com" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Company Volume</label>
                    <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all appearance-none cursor-pointer">
                      <option value="1" className="bg-[#111]">1 - 5 Locations</option>
                      <option value="2" className="bg-[#111]">6 - 20 Locations</option>
                      <option value="3" className="bg-[#111]">Enterprise (20+)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Deployment Needs</label>
                    <textarea required rows={3} className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-orange-500/50 focus:bg-white/[0.05] transition-all resize-none" placeholder="Tell us about your infrastructure goals..."></textarea>
                  </div>
                  <button
                    disabled={formStatus === "submitting"}
                    type="submit"
                    className="w-full bg-white text-black font-bold text-xs uppercase tracking-widest py-4 rounded-xl hover:bg-neutral-200 transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                  >
                    {formStatus === "submitting" ? "Encrypting Payload..." : <>Submit Request <Send size={14} /></>}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- FOOTER & MODALS --- */}
      <footer className="bg-black py-16 px-8 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
          <div>
            <h2 className="text-xl font-black tracking-widest mb-1.5 uppercase text-white/80">Retail<span className="text-orange-500">IQ</span></h2>
            <p className="text-neutral-600 text-xs font-medium tracking-wide">The foundational operational protocol.</p>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
            <button onClick={() => setActiveModal("privacy")} className="hover:text-white transition-colors">Privacy Charter</button>
            <button onClick={() => setActiveModal("terms")} className="hover:text-white transition-colors">Terms of Protocol</button>
            <button onClick={() => setActiveModal("support")} className="hover:text-white transition-colors">Support Portal</button>
          </div>
          <p className="text-neutral-700 text-[9px] font-bold uppercase tracking-[0.25em]">© 2026 RetailIQ Systems.</p>
        </div>
      </footer>

      {/* Custom Modal System */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative bg-[#0a0a0a] border border-white/10 p-10 rounded-[2rem] w-full max-w-xl shadow-2xl"
            >
              <button onClick={() => setActiveModal(null)} className="absolute top-6 right-6 text-neutral-500 hover:text-white transition-colors">
                <X size={20} />
              </button>

              {activeModal === "privacy" && (
                <>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Privacy Charter</h3>
                  <div className="text-neutral-400 text-sm space-y-4 leading-relaxed">
                    <p>RetailIQ utilizes end-to-end encryption for all merchant and consumer data payloads. We operate on a strict zero-knowledge architecture regarding customer payment tokens.</p>
                    <p>Your business logic, ML analytics, and inventory datasets are isolated within dedicated operational clusters and are never monetized or shared with third-party aggregators.</p>
                  </div>
                </>
              )}

              {activeModal === "terms" && (
                <>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Terms of Protocol</h3>
                  <div className="text-neutral-400 text-sm space-y-4 leading-relaxed">
                    <p>By initializing a RetailIQ instance, merchants agree to maintain ethical supply chains and adhere to local commerce compliance laws.</p>
                    <p>The RetailIQ SLA guarantees 99.99% uptime for the core POS and Inventory APIs. Maintenance windows are broadcasted 72 hours prior to execution via the operational dashboard.</p>
                  </div>
                </>
              )}

              {activeModal === "support" && (
                <>
                  <h3 className="text-2xl font-black mb-4 uppercase tracking-tight">Support Portal</h3>
                  <div className="text-neutral-400 text-sm space-y-6 leading-relaxed">
                    <p>Enterprise users have access to 24/7 technical engineering support for API, webhook, and hardware integration.</p>
                    <div className="p-4 bg-white/[0.03] border border-white/10 rounded-xl">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-500 mb-1">Direct Engineering Line</p>
                      <p className="text-white font-mono text-sm">sysops@retailiq.network</p>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

function DropdownItem({ href, icon, label }: { href: string, icon: any, label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 text-neutral-400 hover:text-orange-400 hover:bg-white/[0.02] rounded-xl transition-all duration-300 text-xs font-bold uppercase tracking-wider">
      <span className="text-neutral-500 group-hover:text-orange-400">{icon}</span> {label}
    </Link>
  );
}

function BentoCard({ icon, title, desc }: { icon: any, title: string, desc: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      whileHover={{ y: -5, backgroundColor: "rgba(255,255,255,0.03)" }}
      className="p-8 md:p-10 rounded-[2rem] bg-white/[0.01] border border-white/5 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between h-full min-h-[260px]"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

      <div className="w-12 h-12 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-center mb-8 text-neutral-400 group-hover:text-orange-400 group-hover:border-orange-500/30 transition-all duration-500 shadow-sm">
        {icon}
      </div>
      <div className="relative z-10">
        <h4 className="text-xl font-bold mb-3 tracking-tight uppercase text-neutral-200 group-hover:text-white transition-colors duration-300">{title}</h4>
        <p className="text-neutral-500 leading-relaxed text-sm font-normal tracking-wide group-hover:text-neutral-400 transition-colors duration-300">{desc}</p>
      </div>
    </motion.div>
  );
}