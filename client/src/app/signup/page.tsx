// "use client";

// import { useState } from "react";
// import { Mail, Lock, Eye, EyeOff, ShoppingBag, TrendingUp, Users, Zap } from "lucide-react";
// import { auth, googleProvider } from "../../lib/firebase";
// import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
// import { useRouter } from "next/navigation";

// export default function SignupPage() {
//   const [showPassword, setShowPassword] = useState(false);
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const router = useRouter();

//   const sendTokenToBackend = async (idToken: string) => {
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verifyToken`,
//       {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${idToken}`,
//         },
//       }
//     );

//     const data = await res.json().catch(() => ({}));
//     if (!res.ok) {
//       console.error(" Backend verification failed:", data);
//       throw new Error(data.message || "Failed to verify user on server");
//     }
//     console.log(" User verified on backend:", data);
//     return data;
//   };

//   const handleSignup = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
    
//     try {
//       const userCredential = await createUserWithEmailAndPassword(auth, email, password);
//       const idToken = await userCredential.user.getIdToken();
//       await sendTokenToBackend(idToken);

//       //  Save user email to localStorage
//       localStorage.setItem("userEmail", userCredential.user.email || "");
      
//       //  Dispatch custom event to update navbar immediately
//       window.dispatchEvent(new CustomEvent('authStateChanged', { 
//         detail: { email: userCredential.user.email } 
//       }));

//       router.push("/seller/setup");
//     } catch (error: any) {
//       console.error("❌ Signup error:", error);
//       alert(error.message || "Signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleGoogleSignup = async () => {
//     setLoading(true);
//     try {
//       const result = await signInWithPopup(auth, googleProvider);
//       const idToken = await result.user.getIdToken();
//       await sendTokenToBackend(idToken);

//       //  Save Google user email
//       localStorage.setItem("userEmail", result.user.email || "");
      
//       //  Dispatch event
//       window.dispatchEvent(new CustomEvent('authStateChanged', { 
//         detail: { email: result.user.email } 
//       }));

//       router.push("/seller/setup");
//     } catch (error: any) {
//       console.error("❌ Google signup error:", error);
//       alert(error.message || "Google signup failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const features = [
//     { icon: ShoppingBag, text: "Manage Inventory" },
//     { icon: TrendingUp, text: "Track Sales" },
//     { icon: Users, text: "Customer Insights" },
//     { icon: Zap, text: "Quick Payments" }
//   ];

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex">
//       {/* Left Side - Branding */}
//       <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-orange-500/10 to-transparent" />
//         <div className="absolute inset-0 backdrop-blur-3xl" />
        
//         <div className="relative z-10 flex flex-col justify-center px-16 text-white">
//           <div className="mb-8">
//             <div className="inline-flex items-center gap-3 mb-6">
//               <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center">
//                 <ShoppingBag className="w-7 h-7" />
//               </div>
//               <span className="text-3xl font-bold">RetailIQ</span>
//             </div>
//             <h1 className="text-5xl font-bold leading-tight mb-4">
//               Grow Your Business
//               <br />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
//                 Smarter & Faster
//               </span>
//             </h1>
//             <p className="text-slate-400 text-lg mb-8">
//               Join thousands of sellers who trust RetailIQ to manage their business operations seamlessly.
//             </p>
//           </div>

//           <div className="grid grid-cols-2 gap-4">
//             {features.map((feature, idx) => (
//               <div
//                 key={idx}
//                 className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all"
//               >
//                 <feature.icon className="w-8 h-8 text-orange-400 mb-2" />
//                 <p className="text-sm font-medium">{feature.text}</p>
//               </div>
//             ))}
//           </div>

//           <div className="mt-12 space-y-3">
//             <div className="flex items-center gap-3">
//               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500" />
//               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500 to-teal-500 -ml-4" />
//               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-500 -ml-4" />
//               <span className="text-sm text-slate-400 ml-2">
//                 Join Now
//               </span>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Right Side - Signup Form */}
//       <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
//         <div className="w-full max-w-md">
//           {/* Mobile Logo */}
//           <div className="lg:hidden flex items-center gap-3 mb-8">
//             <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
//               <ShoppingBag className="w-6 h-6 text-white" />
//             </div>
//             <span className="text-2xl font-bold text-white">RetailIQ</span>
//           </div>

//           <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl">
//             <div className="mb-6">
//               <h2 className="text-2xl font-bold text-white mb-2">Create your account</h2>
//               <p className="text-slate-400 text-sm">
//                 Join us and start growing your business today
//               </p>
//             </div>

//             <div className="space-y-4">
//               {/* Email Input */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Email Address
//                 </label>
//                 <div className="relative">
//                   <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
//                   <input
//                     type="email"
//                     value={email}
//                     onChange={(e) => setEmail(e.target.value)}
//                     className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
//                     placeholder="you@example.com"
//                     required
//                   />
//                 </div>
//               </div>

//               {/* Password Input */}
//               <div>
//                 <label className="block text-sm font-medium text-slate-300 mb-2">
//                   Password
//                 </label>
//                 <div className="relative">
//                   <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
//                   <input
//                     type={showPassword ? "text" : "password"}
//                     value={password}
//                     onChange={(e) => setPassword(e.target.value)}
//                     className="w-full pl-11 pr-12 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
//                     placeholder="••••••••"
//                     required
//                   />
//                   <button
//                     type="button"
//                     onClick={() => setShowPassword(!showPassword)}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
//                   >
//                     {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
//                   </button>
//                 </div>
//               </div>

//               {/* Submit Button */}
//               <button
//                 onClick={handleSignup}
//                 disabled={loading}
//                 className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
//               >
//                 {loading ? (
//                   <span className="flex items-center justify-center gap-2">
//                     <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
//                       <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                       <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                     </svg>
//                     Creating account...
//                   </span>
//                 ) : (
//                   "Create Account"
//                 )}
//               </button>

//               {/* Divider */}
//               <div className="relative my-6">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-slate-700" />
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-4 bg-slate-900/50 text-slate-400">Or continue with</span>
//                 </div>
//               </div>

//               {/* Google Button */}
//               <button
//                 onClick={handleGoogleSignup}
//                 disabled={loading}
//                 className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-slate-900 font-semibold py-3 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 <img
//                   src="https://www.svgrepo.com/show/475656/google-color.svg"
//                   alt="Google"
//                   className="w-5 h-5"
//                 />
//                 Google
//               </button>
//             </div>

//             {/* Footer Link */}
//             <p className="text-center text-sm text-slate-400 mt-6">
//               Already have an account?{" "}
//               <a href="/login" className="text-orange-400 hover:text-orange-300 font-medium transition-colors">
//                 Log in
//               </a>
//             </p>
//           </div>

//           {/* Terms */}
//           <p className="text-center text-xs text-slate-500 mt-6">
//             By continuing, you agree to our{" "}
//             <a href="#" className="text-slate-400 hover:text-white underline">
//               Terms of Service
//             </a>{" "}
//             and{" "}
//             <a href="#" className="text-slate-400 hover:text-white underline">
//               Privacy Policy
//             </a>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }




"use client";

import { useState } from "react";
import { Mail, Lock, Eye, EyeOff, ShoppingBag, TrendingUp, Users, Zap, ArrowLeft } from "lucide-react";
import { auth, googleProvider } from "../../lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const sendTokenToBackend = async (idToken: string) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verifyToken`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
      }
    );

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      console.error("Backend verification failed:", data);
      throw new Error(data.message || "Failed to verify user on server");
    }
    return data;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const idToken = await userCredential.user.getIdToken();
      await sendTokenToBackend(idToken);

      localStorage.setItem("userEmail", userCredential.user.email || "");
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { email: userCredential.user.email } 
      }));

      router.push("/seller/setup");
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      alert(error.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      await sendTokenToBackend(idToken);

      localStorage.setItem("userEmail", result.user.email || "");
      window.dispatchEvent(new CustomEvent('authStateChanged', { 
        detail: { email: result.user.email } 
      }));

      router.push("/seller/setup");
    } catch (error: any) {
      console.error("❌ Google signup error:", error);
      alert(error.message || "Google signup failed");
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: ShoppingBag, text: "Manage Inventory" },
    { icon: TrendingUp, text: "Track Sales" },
    { icon: Users, text: "Customer Insights" },
    { icon: Zap, text: "Quick Payments" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-black flex relative">
      
      {/* 🆕 Back to Home Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-50 flex items-center gap-2 text-slate-400 hover:text-orange-500 transition-colors group"
      >
        <div className="p-2 rounded-full bg-slate-800/50 group-hover:bg-orange-500/10 border border-slate-700 group-hover:border-orange-500/50">
          <ArrowLeft className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium uppercase tracking-wider">Back to Home</span>
      </Link>

      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-orange-500/10 to-transparent" />
        <div className="absolute inset-0 backdrop-blur-3xl" />
        
        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="mb-8">
            <div className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <span className="text-3xl font-bold tracking-tight">RetailIQ</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-4 tracking-tight">
              Grow Your Business
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600">
                Smarter & Faster
              </span>
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              Join thousands of sellers who trust RetailIQ to manage their business operations seamlessly.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 hover:bg-white/10 hover:border-orange-500/30 transition-all duration-300"
              >
                <feature.icon className="w-8 h-8 text-orange-400 mb-2" />
                <p className="text-sm font-semibold tracking-wide">{feature.text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">RetailIQ</span>
          </div>

          <div className="bg-slate-900/40 backdrop-blur-2xl rounded-3xl border border-slate-800 p-8 shadow-2xl">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Create account</h2>
              <p className="text-slate-400 text-sm">
                Join us and start growing your business today
              </p>
            </div>

            <form onSubmit={handleSignup} className="space-y-5">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                    placeholder="name@company.com"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-orange-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-12 py-3.5 bg-slate-800/50 border border-slate-700 rounded-xl text-white placeholder-slate-600 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-800" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold">
                <span className="px-4 bg-black text-slate-500">Or sign up with</span>
              </div>
            </div>

            {/* Google Button */}
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white hover:bg-slate-100 text-black font-bold py-3.5 rounded-xl transition-all active:scale-[0.98] shadow-lg"
            >
              <img
                src="https://www.svgrepo.com/show/475656/google-color.svg"
                alt="Google"
                className="w-5 h-5"
              />
              Continue with Google
            </button>

            {/* Footer Link */}
            <p className="text-center text-sm text-slate-500 mt-8">
              Already have an account?{" "}
              <Link href="/login" className="text-orange-500 hover:text-orange-400 font-bold transition-colors">
                Log in
              </Link>
            </p>
          </div>

          {/* Terms */}
          <p className="text-center text-[10px] text-slate-600 mt-8 uppercase tracking-widest leading-relaxed">
            By creating an account, you agree to our{" "}
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>{" "}
            &{" "}
            <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
          </p>
        </div>
      </div>
    </div>
  );
}