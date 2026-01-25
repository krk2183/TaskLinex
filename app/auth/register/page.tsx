"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, ArrowLeft, Mail, User, Briefcase, ChevronRight, Lock, AlertCircle } from "lucide-react";

// --- COMPONENTS ---

const Logo = () => (
  <div className="flex items-center gap-2 mb-10">
    <span className="text-3xl font-bold tracking-tight select-none">
      <span className="text-white">Task</span>
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
  <div className="space-y-1.5">
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
    className="absolute left-8 md:left-24 xl:left-40 top-8 z-50"
  >
    <Link 
      href="/"
      className="flex items-center gap-2 px-5 py-3 rounded-full bg-violet-500/10 hover:bg-violet-500/20 text-violet-300 hover:text-white transition-all border-2 border-violet-400/50 text-sm font-medium group backdrop-blur-xl"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      Back
    </Link>
  </motion.div>
);

// --- PAGE ---

export default function SignupPage() {
  const [Data, setData] = React.useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    rememberMe: false
  });
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setData({ ...Data, [e.target.name]: value });
    setError(""); // Clear error when user starts typing again
  };

  const handleSignup = async (e: React.FormEvent) => {
     
    if (Data.password !== Data.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    const { confirmPassword, ...formData } = Data;
    try {
      const response = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || "Signup failed. Please try again.");
      }
      
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
      setLoading(false); // Only set loading to false on error
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30">
      

      {/* LEFT SIDE: VISUALIZATION (Swapped for Signup to create variety from Login) */}
      <div className="hidden lg:flex w-5/12 relative bg-[#0B0F17] overflow-hidden border-r border-slate-800 flex-col justify-between p-12">
         {/* Abstract Background */}
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-violet-900/20 via-slate-950 to-slate-950" />
         
         <div className="relative z-10 mt-20">
             <h2 className="text-4xl font-bold text-white tracking-tight mb-6">
                 Built for <br/> 
                 <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-indigo-400">Deterministic</span> <br/>
                 Workflows.
             </h2>
             <div className="space-y-6">
                 {['Isolate dependencies.', 'Visualize critical paths.', 'Eliminate status meetings.'].map((item, i) => (
                     <motion.div 
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + (i * 0.1) }}
                        className="flex items-center gap-3"
                     >
                         <div className="w-6 h-6 rounded-full bg-violet-500/10 flex items-center justify-center border border-violet-500/20">
                             <ChevronRight className="w-3 h-3 text-violet-400" />
                         </div>
                         <span className="text-slate-300 font-medium">{item}</span>
                     </motion.div>
                 ))}
             </div>
         </div>

         <div className="relative z-10">
             <div className="flex items-center gap-3 opacity-60">
                 <div className="flex -space-x-2">
                     {[1,2,3].map(i => (
                         <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-950" />
                     ))}
                 </div>
                 <p className="text-xs text-slate-500 font-medium">Join 4,000+ engineering leaders</p>
             </div>
         </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="w-full lg:w-7/12 flex flex-col justify-center px-8 md:px-24 xl:px-40 relative z-10 bg-slate-950">
      <BackButton />
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="absolute top-8 right-8 lg:hidden">
             <Logo />
          </div>
          
          <div className="mb-10 lg:mt-24 mt-20">
             <div className="hidden lg:block"><Logo /></div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-2">Initialize Workspace</h1>
            <p className="text-slate-400">Begin your 14-day trial. No credit card required.</p>
          </div>

          <form className="space-y-5" onSubmit={handleSignup}>
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
                <InputField 
                label="First Name" 
                type="text" 
                name="firstName"
                value={Data.firstName}
                onChange={handleChange}
                placeholder="Jane" 
                icon={User} 
                />
                <InputField 
                label="Last Name" 
                type="text" 
                name="lastName"
                value={Data.lastName}
                onChange={handleChange}
                placeholder="Doe" 
                icon={User} 
                />
            </div>

            <InputField 
              label="Work Email" 
              type="email" 
              name="email"
              value={Data.email}
              onChange={handleChange}
              placeholder="jane@company.com" 
              icon={Mail} 
            />

            <InputField 
              label="Password" 
              type="password" 
              name="password"
              value={Data.password}
              onChange={handleChange}
              placeholder="Password" 
              icon={Lock}
            />

            <InputField 
              label="Confirm Password" 
              type="password" 
              name="confirmPassword"
              value={Data.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password" 
              icon={Lock}
            />

            <InputField 
              label="Company Name" 
              type="text" 
              name="companyName"
              value={Data.companyName}
              onChange={handleChange}
              placeholder="Acme Inc." 
              icon={Briefcase} 
            />

            <div className="flex items-center justify-center gap-2">
              <input
                type="checkbox"
                name="rememberMe"
                id="rememberMe"
                checked={Data.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-slate-800 bg-slate-900 text-violet-600 focus:ring-violet-500/50 focus:ring-offset-0 accent-violet-600"
              />
              <label htmlFor="rememberMe" className="text-sm text-slate-400 select-none  cursor-pointer hover:text-slate-300 transition-colors">
                Remember me
              </label>
            </div>

            <div className="pt-2">
                <button type="submit" disabled={loading} className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_25px_rgba(124,58,237,0.5)] transition-all flex items-center justify-center gap-2 group">
                {loading ? "Creating Account..." : "Create Account"} {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>
            
            <p className="text-[11px] text-slate-500 text-center leading-relaxed max-w-sm mx-auto">
                By clicking "Create Account", you agree to our <a href="#" className="text-slate-400 underline hover:text-white">Terms of Service</a> and <a href="#" className="text-slate-400 underline hover:text-white">Privacy Policy</a>.
            </p>
          </form>

          <div className="mt-12 text-center text-sm border-t border-slate-900 pt-8">
            <span className="text-slate-500">Already have a workspace? </span> 
            <Link href="/login" className="text-violet-400 hover:text-violet-300 font-bold ml-1">
                Sign In
            </Link>
          </div>
        </motion.div>
      </div>

    </div>
  );
}