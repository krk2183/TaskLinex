"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Mail, Github, Chrome, ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";

// --- COMPONENTS ---

const Logo = () => (
  <div className="flex items-center gap-2 mb-12">
    <span className="text-3xl font-bold tracking-tight select-none">
      <span className="text-white ">Task</span>
      <span className="text-violet-500">Linex</span>
    </span>
  </div>
);

const InputField = ({ 
  label, 
  type, 
  placeholder, 
  icon: Icon,
  name,
  value,
  onChange
}: { 
  label: string, 
  type: string, 
  placeholder: string, 
  icon: any,
  name: string,
  value: string,
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
}) => (
  <div className="space-y-2">
    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="h-4 w-4 text-slate-500 group-focus-within:text-violet-400 transition-colors" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        className="w-full bg-slate-900 border border-slate-800 text-slate-200 text-sm rounded-lg block pl-10 p-3 placeholder-slate-600 focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 outline-none transition-all shadow-sm"
        placeholder={placeholder}
      />
    </div>
  </div>
);

const BackButton = () => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay: 0.2, duration: 0.5 }}
    className="absolute left-8 md:left-24 xl:left-32 top-8 z-50"
  >
    <Link 
      href="/"
      className="flex items-center gap-2 px-5 py-3 rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-white transition-all border border-violet-400/50 text-sm font-medium group backdrop-blur-sm"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      Back
    </Link>
  </motion.div>
);
// --- PAGE ---

export default function LoginPage() {
  const [data, setData] = React.useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setData({ ...data, [name]: type === "checkbox" ? checked : value });
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Login failed. Please check your credentials.");
      }
      
      const result = await response.json();
      localStorage.setItem("token", result.access_token);
      window.location.href = "/app";
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30 relative">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 md:px-24 xl:px-32 relative z-10">
        <BackButton />

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Logo />
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Resume Context</h1>
            <p className="text-slate-400">Authenticate to access your workspace.</p>
          </div>

          <form className="space-y-5" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <InputField 
              label="Work Email" 
              type="email" 
              placeholder="name@company.com" 
              icon={Mail} 
              name="email"
              value={data.email}
              onChange={handleChange}
            />

            <InputField
              label="Password"
              type="password"
              placeholder="••••••••••••"
              icon={Lock}
              name="password"
              value={data.password}
              onChange={handleChange}
            />

            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="rememberMe"
                        id="rememberMe"
                        checked={data.rememberMe}
                        onChange={handleChange}
                        className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-violet-600 focus:ring-violet-500/50 focus:ring-offset-0 accent-violet-600"
                    />
                    <label htmlFor="rememberMe" className="text-sm text-slate-400 select-none cursor-pointer hover:text-slate-300 transition-colors">
                        Remember me
                    </label>
                </div>
                <Link href="#" className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Forgot password?
                </Link>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2 group">
              {loading ? "Signing In..." : (
                <>Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
              )}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-950 text-slate-500 text-xs uppercase tracking-widest font-semibold">Or continue with</span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4">
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 transition-all text-sm font-medium text-slate-300">
               <Chrome className="w-4 h-4" /> Google
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-lg hover:bg-slate-800 hover:border-slate-700 transition-all text-sm font-medium text-slate-300">
               <Github className="w-4 h-4" /> GitHub
            </button>
          </div>

          <p className="mt-10 text-center text-sm text-slate-500">
            No active session? <Link href="/signup" className="text-violet-400 hover:text-violet-300 font-medium">Initialize Workspace</Link>
          </p>
        </motion.div>
      </div>

      {/* RIGHT SIDE: VISUALIZATION */}
      <div className="hidden lg:block w-1/2 relative bg-[#0B0F17] overflow-hidden border-l border-slate-800">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />
        
        <div className="absolute inset-0 flex items-center justify-center">
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="w-[400px] h-[300px] bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 relative shadow-2xl"
             >
                 {/* Decorative Header */}
                 <div className="flex gap-2 mb-6 border-b border-slate-800 pb-4">
                     {[
                        { color: "bg-rose-500", shadow: "#f43f5e" },
                        { color: "bg-amber-500", shadow: "#f59e0b" },
                        { color: "bg-emerald-500", shadow: "#10b981" }
                     ].map((item, i) => (
                         <motion.div 
                            key={i}
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9, boxShadow: `0 0 20px ${item.shadow}` }}
                            className={`w-3 h-3 rounded-full ${item.color} cursor-pointer`} 
                         />
                     ))}
                 </div>
                 
                 {/* Decorative Code/Status */}
                 <div className="space-y-3 font-mono text-xs">
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="flex justify-between text-slate-500"
                     >
                         <span>status</span>
                         <span className="text-emerald-500">active</span>
                     </motion.div>
                     <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="flex justify-between text-slate-500"
                     >
                         <span>encryption</span>
                         <span className="text-violet-400">TLS 1.3 / AES-256</span>
                     </motion.div>
                     <motion.div initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 0.4 }} className="h-px bg-slate-800 my-2 origin-left" />
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="text-slate-400">
                        <span className="text-violet-500">➜</span> verifying_handshake...
                     </motion.div>
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }} className="text-slate-400">
                        <span className="text-violet-500">➜</span> establishing_secure_tunnel...
                     </motion.div>
                     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }} className="text-slate-200 animate-pulse">
                        <span className="text-emerald-500">✔</span> ready_for_auth
                     </motion.div>
                 </div>

                 {/* Secure Badge */}
                 <motion.div 
                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.1, type: "spring" }}
                    className="absolute -bottom-6 -right-6 bg-slate-950 border border-slate-800 px-4 py-2 rounded-lg flex items-center gap-2 shadow-lg"
                 >
                     <ShieldCheck className="w-4 h-4 text-emerald-500" />
                     <span className="text-xs font-bold text-slate-300">SOC2 Compliant</span>
                 </motion.div>
             </motion.div>
        </div>
      </div>

    </div>
  );
}