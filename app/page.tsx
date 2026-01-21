"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  Zap, Layers, ArrowRight, CheckCircle,
  AlertTriangle, Clock, GitCommit, Sparkles,
  User, Search, GitPullRequest,
  Workflow, MessageSquare, BrainCircuit,
  ChevronRight, Activity
} from "lucide-react";

// --- UTILS & CONSTANTS ---

const GLASS_PANEL = "bg-gradient-to-br from-white/[0.08] via-white/[0.02] to-transparent backdrop-blur-2xl border border-white/[0.08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]";
const HIGHLIGHT_TEXT = "text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-violet-300";

// --- REUSABLE COMPONENTS FROM YOUR APP (ADAPTED FOR LANDING) ---

// 1. From analytics.tsx: Heatmap Cell
const HeatmapCell = ({ load, delay }: { load: number, delay: number }) => {
  let bgClass = "bg-white/[0.05]";
  if (load > 40) bgClass = "bg-indigo-500/40";
  if (load > 80) bgClass = "bg-indigo-500";
  if (load > 100) bgClass = "bg-rose-500";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      whileInView={{ opacity: 1, scale: 1 }}
      transition={{ delay: delay * 0.02 }}
      className={`h-8 w-full rounded-sm border border-white/[0.05] ${bgClass} relative group`}
    >
        {load > 100 && (
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-rose-400 rounded-full animate-pulse" />
        )}
    </motion.div>
  );
};

// 2. From roadmap.tsx: Task Item Visualization
const TaskItem = ({ title, width, start, status, avatar, delay }: any) => {
    const statusColor = {
        'On Track': 'bg-indigo-500',
        'At Risk': 'bg-amber-500',
        'Blocked': 'bg-rose-500',
        'Completed': 'bg-emerald-500'
    }[status as string] || 'bg-slate-700';

    return (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.5 }}
            className={`absolute top-2 h-10 rounded-lg shadow-lg flex items-center px-3 gap-2 overflow-hidden border border-white/10 ${statusColor}`}
            style={{ left: `${start}%`, width: `${width}%` }}
        >
            <div className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-black/20 to-transparent w-full" />
            <span className="relative z-10 text-xs font-bold text-white truncate">{title}</span>
            {avatar && (
                <div className="absolute right-2 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[8px] font-bold text-white">
                    {avatar}
                </div>
            )}
        </motion.div>
    );
};

// 3. From analytics.tsx: Dependency Ripple (Simplified SVG)
const RippleGraph = () => (
    <div className="relative h-64 w-full flex items-center justify-center group">
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-60">
        <defs>
          <marker id="head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
          </marker>
        </defs>
        <motion.path 
            d="M 100 128 C 200 128, 200 64, 300 64" 
            stroke="#6366f1" strokeWidth="1" fill="none" markerEnd="url(#head)" 
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.5, ease: "easeInOut" }}
        />
        <motion.path 
            d="M 100 128 C 200 128, 200 192, 300 192" 
            stroke="#6366f1" strokeWidth="1" fill="none" markerEnd="url(#head)" 
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.7, ease: "easeInOut" }}
        />
        <motion.path 
            d="M 340 64 C 400 64, 400 128, 460 128" 
            stroke="#6366f1" strokeWidth="1" fill="none" markerEnd="url(#head)" 
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 0.9, ease: "easeInOut" }}
        />
      </svg>

      {/* Nodes */}
      <div className="absolute left-[80px] top-[108px]">
         <div className="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-500 animate-pulse shadow-[0_0_30px_rgba(244,63,94,0.4)]">
             <AlertTriangle size={16} />
         </div>
      </div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }} className="absolute left-[300px] top-[44px]">
         <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-indigo-400">
             <span className="text-xs font-bold">FE</span>
         </div>
      </motion.div>

      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }} className="absolute left-[300px] top-[172px]">
         <div className="w-10 h-10 rounded-full bg-indigo-500/20 border border-indigo-500 flex items-center justify-center text-indigo-400">
             <span className="text-xs font-bold">API</span>
         </div>
      </motion.div>
      
       <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.4 }} className="absolute left-[460px] top-[108px]">
         <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-600 flex items-center justify-center text-slate-400 opacity-50">
             <span className="text-xs font-bold">QA</span>
         </div>
      </motion.div>
    </div>
);

// 4. New Component: Chat Bubble for Communication Feature
const ChatBubble = ({ user, text, delay, align = "left" }: any) => (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`flex gap-3 max-w-[90%] ${align === "right" ? "ml-auto flex-row-reverse" : ""}`}
    >
        <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 flex items-center justify-center text-[10px] text-white/60 shrink-0">
            {user}
        </div>
        <div className={`p-3 rounded-2xl border border-white/5 text-xs text-white/70 ${align === "right" ? "bg-violet-500/10 border-violet-500/20 text-violet-100" : "bg-white/5"}`}>
            {text}
        </div>
    </motion.div>
);

// --- SECTIONS ---

function Header() {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-12 py-4 border-b border-white/[0.06] bg-[#050505]/80 backdrop-blur-xl"
    >
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-violet-600 rounded-[6px] shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
        <span className="text-sm font-semibold tracking-tight text-white">TaskLinex</span>
      </div>
      <nav className="hidden md:flex gap-8 text-[13px] font-medium text-white/50">
        <a href="#envoy" className="hover:text-white transition-colors">Envoy</a>
        <a href="#roadmap" className="hover:text-white transition-colors">Roadmap</a>
        <a href="#pulse" className="hover:text-white transition-colors">Pulse</a>
      </nav>
      <div className="flex items-center gap-4">
        <a href="#" className="text-[13px] font-medium text-white/70 hover:text-white transition-colors">Log in</a>
        <button className="bg-white text-black text-[13px] font-semibold px-4 py-2 rounded-lg hover:bg-white/90 transition-all">
          Get Access
        </button>
      </div>
    </motion.header>
  );
}

function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 800], [0, 100]);

  return (
    <section className="relative flex flex-col items-center pt-32 pb-20 overflow-hidden bg-[#050505]">
      {/* Background Glow */}
      <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }} className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-violet-600/20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />
      <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 12, repeat: Infinity, repeatType: "mirror", delay: 1 }} className="absolute top-[10%] left-[20%] w-[600px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="relative z-10 text-center max-w-5xl px-4 mb-24">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 backdrop-blur-md mb-8 shadow-[0_0_20px_rgba(139,92,246,0.1)]"
        >
          <Sparkles className="w-3 h-3 text-violet-400" />
          <span className="text-xs font-medium text-violet-200">Envoy 2.0 is now live</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="text-7xl md:text-9xl font-semibold tracking-tighter text-white mb-8"
        >
          Clarity in <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white/60 to-white/20">Complex Systems.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-xl md:text-2xl text-white/60 max-w-2xl mx-auto leading-relaxed mb-12 font-light"
        >
          The task engine for high-velocity engineering.
          Plan with <span className="text-violet-400 font-medium">Roadmaps</span>.
          Predict with <span className="text-violet-400 font-medium">Envoy</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <button className="h-12 px-8 rounded-full bg-white text-black font-semibold hover:bg-violet-50 transition-colors flex items-center gap-2 shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            Start Workspace <ArrowRight className="w-4 h-4" />
          </button>
          <button className="h-12 px-8 rounded-full border border-white/20 text-white/80 font-medium hover:bg-white/10 transition-colors">
            View the Roadmap
          </button>
        </motion.div>
      </div>

      {/* HERO VISUAL: Relative positioning */}
      <motion.div 
        style={{ y }} 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="relative w-full max-w-6xl px-4 z-20"
      >
         {/* Glow Effect */}
         <div className="absolute -inset-1 bg-gradient-to-b from-violet-500/30 to-transparent blur-2xl -z-10 rounded-[2rem] opacity-50" />
         
         <div className="w-full h-[600px] rounded-xl border border-white/10 bg-[#0B1120] shadow-2xl relative overflow-hidden flex flex-col">
            
            {/* Browser/App Header */}
            <div className="h-10 border-b border-white/5 bg-[#0F172A] flex items-center px-4 justify-between">
                <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500/20 border border-rose-500/50" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/20 border border-amber-500/50" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/50" />
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded bg-black/40 border border-white/5 text-[10px] text-white/40 font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                    app.tasklinex.com/roadmap
                </div>
                <div className="w-16" /> {/* Spacer for centering */}
            </div>
            
            {/* App Header (Roadmap Style) */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-[#0B1120]">
                <div className="flex items-center gap-4">
                    <div className="p-1.5 bg-violet-500/10 rounded">
                        <Layers className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-sm font-semibold text-white">Q3 Engineering Roadmap</span>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                         <div className="w-6 h-6 rounded-full bg-emerald-500 border border-[#0F172A]" />
                         <div className="w-6 h-6 rounded-full bg-violet-500 border border-[#0F172A]" />
                    </div>
                    <div className="w-px h-4 bg-white/10" />
                    <button className="bg-violet-600 text-white px-3 py-1 text-xs font-bold rounded shadow-lg shadow-violet-500/20">Auto-Balance</button>
                </div>
            </div>

            {/* Main Gantt Area (Simulating roadmap.tsx) */}
            <div className="flex-1 relative bg-[#0B1120] p-8 overflow-hidden">
                {/* Grid Lines */}
                <div className="absolute inset-0 grid grid-cols-6 pointer-events-none">
                     {[...Array(6)].map((_, i) => (
                         <div key={i} className="border-r border-dashed border-white/5 h-full" />
                     ))}
                </div>

                {/* Project Group 1 */}
                <div className="relative mb-12">
                     <div className="flex items-center gap-3 mb-4">
                         <ChevronRight className="w-4 h-4 text-white/40 rotate-90" />
                         <h3 className="text-sm font-bold text-white">Core Infrastructure</h3>
                     </div>
                     <div className="relative h-32 w-full">
                         {/* Dependency Line SVG Layer */}
                         <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                             <path d="M 25% 40px C 28% 40px, 30% 80px, 33% 80px" fill="none" stroke="#6366f1" strokeWidth="2" strokeDasharray="4" className="opacity-40" />
                         </svg>

                         <TaskItem title="Auth Migration" start={5} width={20} status="Completed" avatar="AC" delay={0.3} />
                         <TaskItem title="API Gateway Config" start={33} width={15} status="At Risk" avatar="SJ" delay={0.5} />
                         <TaskItem title="DB Sharding" start={55} width={25} status="On Track" avatar="MR" delay={0.7} />
                         
                         {/* Floating Envoy Popup Simulation */}
                         <motion.div 
                            initial={{ opacity: 0, scale: 0.8, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ delay: 1.5, duration: 0.5 }}
                            className="absolute top-14 left-[38%] z-50 bg-slate-800 border border-violet-500/30 p-3 rounded-xl shadow-2xl w-48"
                         >
                             <div className="flex items-center gap-2 mb-2 text-violet-400">
                                 <BrainCircuit size={12} />
                                 <span className="text-[10px] font-bold uppercase">Envoy Detected Risk</span>
                             </div>
                             <p className="text-[10px] text-slate-300 leading-tight">Dependency delay detected. Shift 'DB Sharding' to next sprint?</p>
                         </motion.div>
                     </div>
                </div>

                {/* Project Group 2 */}
                <div className="relative">
                     <div className="flex items-center gap-3 mb-4">
                         <ChevronRight className="w-4 h-4 text-white/40 rotate-90" />
                         <h3 className="text-sm font-bold text-white">Frontend Refresh</h3>
                     </div>
                     <div className="relative h-24 w-full">
                         <TaskItem title="Component Library" start={10} width={30} status="On Track" avatar="SJ" delay={0.9} />
                         <TaskItem title="User Dashboard" start={45} width={20} status="Blocked" avatar="AC" delay={1.1} />
                     </div>
                </div>
            </div>
            
            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent z-10" />
         </div>
      </motion.div>
    </section>
  );
}

function EnvoySection() {
    const [step, setStep] = useState(0);

    // Auto-cycle through Envoy states
    useEffect(() => {
        const timer = setInterval(() => {
            setStep((prev) => (prev + 1) % 3);
        }, 4000);
        return () => clearInterval(timer);
    }, []);

    const content = [
        { icon: AlertTriangle, color: "text-rose-400", title: "Blocker Detected", text: "API Gateway latency is delaying 3 dependents." },
        { icon: GitPullRequest, color: "text-violet-400", title: "Context Ready", text: "Pull Request #892 matches 'Auth' context." },
        { icon: Activity, color: "text-emerald-400", title: "Velocity Check", text: "Team velocity is 15% above average. Burnout risk low." },
    ];

    return (
        <section id="envoy" className="py-32 px-6 bg-gradient-to-b from-[#050505] to-[#0c0512] relative overflow-hidden">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-6">
                        <Sparkles className="w-5 h-5 text-violet-500" />
                        <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Envoy Intelligence</span>
                    </div>
                    <h2 className={`text-5xl font-semibold tracking-tight mb-6 ${HIGHLIGHT_TEXT}`}>
                        Not a chatbot. <br/>
                        A co-pilot for state.
                    </h2>
                    <p className="text-lg text-white/50 leading-relaxed mb-8">
                        Envoy doesn't want to chat. It silently observes your dependency graph (based on our Ripple engine),
                        flagging circular blockers and slippage before they become fires.
                    </p>
                    <ul className="space-y-4">
                        {[
                            "Proactive blocker detection",
                            "One-click Gantt rescheduling",
                            "Context-aware PR filtering"
                        ].map((item, i) => (
                            <li key={i} className="flex items-center gap-3 text-white/70">
                                <CheckCircle className="w-5 h-5 text-white/20" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* VISUAL: Envoy Analysis from Analytics.tsx */}
                <div className={`relative ${GLASS_PANEL} rounded-3xl p-8 min-h-[400px] flex flex-col justify-between overflow-hidden`}>
                     {/* Background Ripple Effect */}
                     <div className="absolute inset-0 opacity-30 pointer-events-none">
                         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500/20 blur-[80px] rounded-full animate-pulse" />
                     </div>

                     <div className="relative z-10">
                        <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
                             <h3 className="font-bold text-white flex items-center gap-2">
                                 <BrainCircuit className="w-4 h-4 text-violet-400" />
                                 Envoy Live Analysis
                             </h3>
                             <div className="flex gap-1">
                                 <div className="w-2 h-2 bg-violet-500 rounded-full animate-ping" />
                             </div>
                        </div>

                        {/* Graph Visualization */}
                        <RippleGraph />

                        {/* Dynamic Message Card */}
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                                className="mt-6 bg-black/40 border border-white/10 rounded-xl p-4 backdrop-blur-md"
                            >
                                <div className="flex gap-4">
                                    <div className={`w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shrink-0`}>
                                        {(() => {
                                            const Icon = content[step].icon;
                                            return <Icon className={`w-5 h-5 ${content[step].color}`} />;
                                        })()}
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium mb-1 text-sm">{content[step].title}</h4>
                                        <p className="text-white/50 text-xs leading-relaxed">{content[step].text}</p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                     </div>
                </div>
            </div>
        </section>
    );
}

function WorkflowEngine() {
    return (
        <section className="py-32 px-6 bg-[#050505] border-t border-white/5">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
                    
                    {/* Feature 1: Visual Task Flow */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <Workflow className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Visual Task Flow</span>
                        </div>
                        <h3 className="text-4xl font-semibold text-white">
                            See the work. <br/>
                            <span className="text-white/40">Not just the list.</span>
                        </h3>
                        <p className="text-white/50 leading-relaxed">
                            Kanban boards that actually understand dependencies. 
                            Switch views instantly between List, Board, and Timeline.
                            Spot bottlenecks before they block the sprint.
                        </p>
                        
                        {/* Visual: Mini Kanban/Task List */}
                        <div className={`${GLASS_PANEL} rounded-2xl p-6 h-[320px] relative overflow-hidden flex flex-col`}>
                             <div className="h-10 bg-white/5 border-b border-white/5 flex items-center px-4 gap-4 rounded-t-lg mb-4">
                                 <div className="flex gap-1">
                                     <div className="w-2 h-2 rounded-full bg-rose-500" />
                                     <div className="w-2 h-2 rounded-full bg-amber-500" />
                                 </div>
                                 <div className="h-1 w-16 bg-white/10 rounded-full" />
                             </div>
                             <div className="flex-1 relative space-y-4">
                                 <div className="relative h-10 w-full">
                                     <TaskItem title="Backend API Refactor" start={0} width={70} status="On Track" avatar="MR" delay={0.2} />
                                 </div>
                                 <div className="relative h-10 w-full">
                                     <TaskItem title="Client Auth Hook" start={20} width={50} status="Blocked" avatar="SJ" delay={0.4} />
                                 </div>
                                 <div className="relative h-10 w-full">
                                     <TaskItem title="Design System Update" start={5} width={40} status="Completed" avatar="AC" delay={0.6} />
                                 </div>
                             </div>
                             
                             {/* Floating Status Pill */}
                             <motion.div 
                                initial={{ scale: 0 }}
                                whileInView={{ scale: 1 }}
                                transition={{ delay: 0.8 }}
                                className="absolute bottom-6 right-6 px-3 py-1.5 rounded-full bg-rose-500/20 border border-rose-500/50 text-rose-400 text-xs font-bold flex items-center gap-2 shadow-lg"
                             >
                                 <AlertTriangle size={12} />
                                 Critical Path Blocked
                             </motion.div>
                        </div>
                    </div>

                    {/* Feature 2: Element-Linked Communication */}
                    <div className="space-y-8">
                        <div className="flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-violet-500">Contextual Comms</span>
                        </div>
                        <h3 className="text-4xl font-semibold text-white">
                            Chat where <br/>
                            <span className="text-white/40">the work happens.</span>
                        </h3>
                        <p className="text-white/50 leading-relaxed">
                            Stop pasting links in Slack. Comments in TaskLinex are tied directly to the task, 
                            code snippet, or roadmap item. Context is preserved forever.
                        </p>

                        {/* Visual: Chat Interface */}
                        <div className={`${GLASS_PANEL} rounded-2xl p-6 h-[320px] relative flex flex-col`}>
                            <div className="border-b border-white/5 pb-4 mb-4 flex justify-between items-center">
                                <span className="text-xs font-bold text-white">Task #892: Auth Flow</span>
                                <span className="text-[10px] text-white/30 bg-white/5 px-2 py-0.5 rounded">Active Thread</span>
                            </div>
                            <div className="flex-1 space-y-4 overflow-hidden relative">
                                <ChatBubble user="AC" text="Blocked on the JWT secret env variable. Can you check?" delay={0.2} />
                                <ChatBubble user="MR" text="Checking now. It should be in the Vault." delay={0.4} align="right" />
                                <ChatBubble user="AC" text="Found it. Deploying fix." delay={0.6} />
                                
                                {/* Input Area Simulation */}
                                <div className="absolute bottom-0 left-0 right-0 h-10 bg-white/5 rounded-lg border border-white/10 flex items-center px-3 text-white/30 text-xs">
                                    Type a reply...
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    )
}

function SecondaryFeatures() {
    return (
        <section className="py-20 px-6 bg-[#0c0512] border-t border-white/5">
            <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                    { icon: Search, label: "Smart Search", desc: "Query with natural language" },
                    { icon: GitCommit, label: "Git Integration", desc: "Two-way sync with GitHub" },
                    { icon: Clock, label: "Time Travel", desc: "Replay project history" },
                    { icon: CheckCircle, label: "Milestones", desc: "Track major release goals" }
                ].map((f, i) => (
                    <div key={i} className="flex flex-col items-center text-center gap-3 p-4 rounded-xl hover:bg-white/5 transition-colors group cursor-default">
                        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-violet-500/20 group-hover:text-violet-400 transition-all text-white/40 mb-2">
                            <f.icon size={20} />
                        </div>
                        <div>
                            <h4 className="text-white font-medium text-sm">{f.label}</h4>
                            <p className="text-white/40 text-xs mt-1">{f.desc}</p>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

function PersonasSection() {
    const [activePersona, setActivePersona] = useState<"builder" | "reviewer" | "architect">("builder");

    const personas = {
        builder: {
            color: "bg-emerald-500",
            items: [
                { id: 1, label: "Implement Auth Hook", status: "In Progress", time: "2h" },
                { id: 2, label: "Fix CSS Overflow", status: "Todo", time: "30m" },
            ]
        },
        reviewer: {
            color: "bg-amber-500",
            items: [
                { id: 3, label: "PR #892: Database Schema", status: "Reviewing", time: "15m" },
                { id: 4, label: "PR #888: Login Flow", status: "Approved", time: "-" },
            ]
        },
        architect: {
            color: "bg-violet-500",
            items: [
                { id: 5, label: "Q4 System Design", status: "Drafting", time: "2d" },
                { id: 6, label: "Review RFC: Scaling", status: "Pending", time: "1d" },
            ]
        }
    };

    return (
        <section id="personas" className="py-32 px-6 bg-[#0c0512] border-t border-white/5">
            <div className="max-w-4xl mx-auto text-center mb-16">
                 <h2 className={`text-4xl md:text-5xl font-semibold tracking-tight mb-6 ${HIGHLIGHT_TEXT}`}>
                    Fracture your focus. <br/> Intentionally.
                </h2>
                <p className="text-white/50 max-w-xl mx-auto">
                    You wear multiple hats. TaskLinex <span className="text-white">Personas</span> lets you split your account into distinct profiles.
                    Switch contexts instantly without losing state.
                </p> 
            </div>

            <div className="max-w-5xl mx-auto">
                {/* Persona Switcher UI */}
                <div className={`${GLASS_PANEL} rounded-3xl p-2 md:p-8 relative overflow-hidden`}>

                    {/* Switcher Controls */}
                    <div className="flex justify-center mb-8">
                        <div className="flex p-1 bg-black/40 rounded-full border border-white/10">
                            {(["builder", "reviewer", "architect"] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setActivePersona(p)}
                                    className={`relative px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 ${activePersona === p ? 'text-white' : 'text-white/40 hover:text-white/60'}`}
                                >
                                    {activePersona === p && (
                                        <motion.div
                                            layoutId="activePill"
                                            className="absolute inset-0 bg-violet-600 rounded-full shadow-[0_0_15px_rgba(124,58,237,0.4)]"
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                    )}
                                    <span className="relative capitalize z-10">{p}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Dynamic Context View */}
                    <div className="relative min-h-[300px] bg-black/40 rounded-2xl border border-white/5 p-6 md:p-10 flex flex-col md:flex-row gap-8 items-start transition-colors duration-500">

                        {/* Profile Card */}
                        <div className="w-full md:w-64 shrink-0">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 mb-4 flex items-center justify-center">
                                <User className="w-8 h-8 text-white/70" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-1 capitalize">{activePersona} Mode</h3>
                            <p className="text-xs text-white/40 mb-4">Filtering noise. Focusing on specific context.</p>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-white/60">Strict Mode</span>
                            </div>
                        </div>

                        {/* Task List Transitioning */}
                        <div className="flex-1 w-full space-y-3">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activePersona}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                    className="space-y-3"
                                >
                                    {personas[activePersona].items.map((item) => (
                                        <div key={item.id} className="group flex items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors cursor-pointer">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-2 h-2 rounded-full ${personas[activePersona].color}`} />
                                                <span className="text-sm font-medium text-white/90">{item.label}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <span className="text-xs font-mono text-white/30">{item.status}</span>
                                                <div className="w-px h-4 bg-white/10" />
                                                <span className="text-xs font-mono text-white/30 w-8 text-right">{item.time}</span>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="flex items-center gap-3 px-4 py-2 opacity-30">
                                        <div className="w-full h-px bg-white/10" />
                                        <span className="text-[10px] uppercase whitespace-nowrap">Context Filter Active</span>
                                        <div className="w-full h-px bg-white/10" />
                                    </div>
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function PulseDashboard() {
    return (
        <section id="pulse" className="py-32 px-6 bg-[#050505] border-t border-white/5 relative">
             <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-violet-900/10 blur-[120px] rounded-full pointer-events-none" />
             <div className="max-w-7xl mx-auto">
                <div className="mb-16 md:flex justify-between items-end">
                    <div className="max-w-2xl">
                        <div className="flex items-center gap-2 mb-6">
                            <Layers className="w-5 h-5 text-violet-500" />
                            <span className="text-xs font-bold uppercase tracking-widest text-violet-500">The Pulse</span>
                        </div>
                        <h2 className={`text-4xl md:text-5xl font-semibold tracking-tight ${HIGHLIGHT_TEXT}`}>
                            Your Morning Brief.
                        </h2>
                        <p className="text-lg text-white/50 mt-4">
                            Stop hunting for status. Pulse aggregates velocity, blockers, and capacity heatmaps into a single, high-fidelity view.
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <span className="text-xs font-mono text-white/30">Live System Overview</span>
                    </div>
                </div>

                {/* BENTO GRID LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[500px]">

                    {/* Card 1: Capacity Heatmap (From analytics.tsx) */}
                    <div className={`md:col-span-2 md:row-span-2 ${GLASS_PANEL} rounded-3xl p-8 relative group overflow-hidden flex flex-col transition-all duration-300 hover:border-violet-500/20 hover:bg-white/[0.05]`}>
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-lg font-medium text-white">Team Capacity Heatmap</h3>
                                <p className="text-sm text-white/40">Load balance across sprints</p>
                            </div>
                            <Activity className="w-5 h-5 text-white/20 group-hover:text-violet-400 transition-colors" />
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-center gap-4">
                            {[1, 2, 3].map((row) => (
                                <div key={row} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/10 border border-white/5 text-[10px] flex items-center justify-center text-white/50">
                                        {['AC', 'SJ', 'MR'][row-1]}
                                    </div>
                                    <div className="flex-1 grid grid-cols-10 gap-2">
                                        {[...Array(10)].map((_, i) => (
                                            <HeatmapCell key={i} load={((row * 31 + i * 17) % 120)} delay={row * 2 + i} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-6 flex justify-between items-center text-xs text-white/30">
                            <span>Sprint 24</span>
                            <span>Sprint 34</span>
                        </div>
                    </div>

                    {/* Card 2: Comm Leakage (From analytics.tsx) */}
                    <div className={`md:col-span-2 md:row-span-1 ${GLASS_PANEL} rounded-3xl p-6 flex items-center justify-between group transition-all duration-300 hover:border-rose-500/20 hover:bg-white/[0.05]`}>
                         <div className="flex-1 pr-6">
                             <h3 className="text-lg font-medium text-white mb-2">Communication Leakage</h3>
                             <p className="text-sm text-white/40 mb-4">
                                 High slack volume detected on <span className="text-white">Auth Service</span>.
                             </p>
                             <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                    initial={{ width: 0 }}
                                    whileInView={{ width: "70%" }}
                                    transition={{ duration: 1 }}
                                    className="h-full bg-gradient-to-r from-violet-500 to-rose-500" 
                                 />
                             </div>
                         </div>
                         <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
                             <MessageSquare className="w-5 h-5 text-white/40" />
                         </div>
                    </div>

                    {/* Card 3: Velocity Trend */}
                    <div className={`md:col-span-1 md:row-span-1 ${GLASS_PANEL} rounded-3xl p-6 flex flex-col justify-between group hover:border-emerald-500/20 transition-all duration-300 hover:bg-white/[0.05]`}>
                        <div className="flex items-center gap-3 mb-2">
                             <Zap className="w-4 h-4 text-emerald-400" />
                             <span className="text-xs font-bold uppercase tracking-wider text-white/30">Velocity</span>
                        </div>
                        <div>
                            <div className="text-3xl font-bold text-white mb-1">124 pts</div>
                            <div className="text-xs text-emerald-400 font-mono">
                                +12% vs last sprint
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Roadmap Status */}
                    <div className={`md:col-span-1 md:row-span-1 ${GLASS_PANEL} rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:border-violet-500/20 hover:bg-white/[0.05]`}>
                        <div className="flex items-center gap-3">
                             <Workflow className="w-4 h-4 text-violet-400" />
                             <span className="text-xs font-bold uppercase tracking-wider text-white/30">Release</span>
                        </div>
                        <div className="space-y-2">
                             <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                                 <div className="h-full w-[85%] bg-violet-500 rounded-full" />
                             </div>
                             <div className="flex justify-between text-xs text-white/50">
                                 <span>Q3 Launch</span>
                                 <span>85%</span>
                             </div>
                        </div>
                    </div>

                </div>
             </div>
        </section>
    )
}

function CTA() {
    return (
        <section 
            className="py-40 px-6 bg-[#050505] text-center border-t border-white/5 relative overflow-hidden"
            style={{
                backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)",
                backgroundSize: "20px 20px"
            }}>
            <div className="absolute inset-0 bg-gradient-to-b from-violet-900/20 via-[#050505] to-[#050505] pointer-events-none" />

            <div className="relative z-10 max-w-3xl mx-auto">
                <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tighter mb-8">
                    Build with <br/> structure.
                </h2>
                <p className="text-xl text-white/50 mb-12 max-w-xl mx-auto">
                    Join high-performance engineering teams moving from chaos to clarity.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button className="h-14 px-8 rounded-full bg-white text-black font-bold text-lg hover:bg-gray-100 transition-colors">
                        Start Free Trial
                    </button>
                    <button className="h-14 px-8 rounded-full bg-black border border-white/20 text-white font-medium hover:bg-white/10 transition-colors">
                        Book a Demo
                    </button>
                </div>

                <div className="mt-16 flex justify-center gap-8 opacity-30 grayscale">
                    {/* Mock Logos */}
                    <div className="h-6 w-20 bg-white/10 rounded" />
                    <div className="h-6 w-20 bg-white/10 rounded" />
                    <div className="h-6 w-20 bg-white/10 rounded" />
                    <div className="h-6 w-20 bg-white/10 rounded" />
                </div>
            </div>
        </section>
    )
}

function Footer() {
    return (
        <footer className="border-t border-white/5 bg-black py-20 px-6 md:px-12">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12">
                <div className="md:col-span-2">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-6 h-6 bg-violet-600 rounded-lg shadow-[0_0_15px_rgba(124,58,237,0.5)]" />
                        <span className="text-lg font-semibold tracking-tight text-white">TaskLinex</span>
                    </div>
                    <p className="text-white/40 text-sm max-w-xs">The operating system for high-velocity engineering teams.</p>
                </div>

                <div>
                    <h3 className="font-semibold text-white/80 mb-4">Product</h3>
                    <ul className="space-y-3 text-sm text-white/40">
                        <li><a href="#" className="hover:text-white transition-colors">Roadmap</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Envoy AI</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Pulse</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Personas</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-white/80 mb-4">Resources</h3>
                    <ul className="space-y-3 text-sm text-white/40">
                        <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">API Status</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
                    </ul>
                </div>

                <div>
                    <h3 className="font-semibold text-white/80 mb-4">Company</h3>
                    <ul className="space-y-3 text-sm text-white/40">
                        <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                    </ul>
                </div>
            </div>

            <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-white/30 text-xs">
                    © 2026 TaskLinex Inc.
                </p>
                <div className="flex gap-6 text-xs text-white/30 font-medium">
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
                </div>
            </div>
        </footer>
    )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-slate-200 font-sans selection:bg-violet-500/30">
      <Header />
      <Hero />
      <EnvoySection />
      <WorkflowEngine />
      <PersonasSection />
      <SecondaryFeatures />
      <PulseDashboard />
      <CTA />
      <Footer />
    </div>
  );
}