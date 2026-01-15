"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutGrid, Activity, Zap, Users, AlertOctagon, 
  ArrowRight, Search, Bell, Menu, TrendingUp, 
  MessageSquareWarning, Clock, ChevronRight, CheckCircle2 
} from 'lucide-react';

// --- 1. MOCK DATA & TYPES (Based on your provided Schema) ---

const MOCK_USERS = [
  { 
    id: "u1", name: "Alex Chen", avatar: "AC", baseCapacity: 100,
    personas: [{ id: "p1", role: "Backend Lead", color: "#3b82f6" }] 
  },
  { 
    id: "u2", name: "Sarah Jenkins", avatar: "SJ", baseCapacity: 80,
    personas: [{ id: "p2", role: "Product Design", color: "#ec4899" }] 
  },
  { 
    id: "u3", name: "Mike Ross", avatar: "MR", baseCapacity: 100,
    personas: [{ id: "p3", role: "DevOps", color: "#8b5cf6" }] 
  }
];

const MOCK_TASKS = [
  // Chain 1: The Bottleneck
  { 
    id: "t1", title: "Auth Service Migration", status: "Blocked", 
    ownerId: "u1", duration: 5, plannedDuration: 3, 
    leakageHours: 12, // Communication leakage
    dependencies: [], downstream: ["t2", "t3"] 
  },
  { 
    id: "t2", title: "Frontend Auth Integration", status: "Stalled", 
    ownerId: "u2", duration: 3, plannedDuration: 3, 
    leakageHours: 2, 
    dependencies: ["t1"], downstream: ["t4"] 
  },
  { 
    id: "t3", title: "API Gateway Config", status: "Pending", 
    ownerId: "u3", duration: 2, plannedDuration: 2, 
    leakageHours: 0, 
    dependencies: ["t1"], downstream: ["t4"] 
  },
  { 
    id: "t4", title: "Production Deployment", status: "Pending", 
    ownerId: "u3", duration: 1, plannedDuration: 1, 
    leakageHours: 0, 
    dependencies: ["t2", "t3"], downstream: [] 
  },
  // Chain 2: Healthy
  { 
    id: "t5", title: "User Dashboard UI", status: "In Progress", 
    ownerId: "u2", duration: 4, plannedDuration: 4, 
    leakageHours: 1, 
    dependencies: [], downstream: [] 
  }
];

const AI_SUGGESTIONS = [
  {
    id: "ai1", type: "blocker", confidence: 0.92,
    message: "Auth Service is blocking 2 downstream flows. Reassign 'API Gateway' to Mike to parallelize.",
    impact: "Save 12h"
  },
  {
    id: "ai2", type: "leakage", confidence: 0.85,
    message: "High communication leakage on 'Auth Service'. 12h spent in Slack/clarifications.",
    impact: "Process Fix"
  }
];

// --- 2. COMPONENTS ---

// A. Layout Shell
const SidebarItem = ({ icon: Icon, label, active }) => (
  <div className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200 group ${active ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-slate-800 text-slate-400'}`}>
    <Icon size={20} className={active ? "text-blue-400" : "group-hover:text-slate-200"} />
    <span className={`font-medium ${active ? "text-blue-400" : "group-hover:text-slate-200"}`}>{label}</span>
    {active && <motion.div layoutId="nav-indicator" className="ml-auto w-1 h-1 bg-blue-400 rounded-full" />}
  </div>
);

// B. Visualization: Dependency Ripple Graph
const RippleGraph = ({ tasks, onHoverNode }) => {
  // Simple layout calculation for demo purposes (Layers based on dependencies)
  // In production, use D3 or Dagre
  const layers = [
    tasks.filter(t => t.dependencies.length === 0),
    tasks.filter(t => t.dependencies.length > 0 && t.downstream.length > 0),
    tasks.filter(t => t.downstream.length === 0 && t.dependencies.length > 0)
  ];

  return (
    <div className="relative h-64 w-full flex items-center justify-between px-10">
      {/* Connecting Lines (SVG) */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
        <defs>
          <marker id="head" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
          </marker>
        </defs>
        {/* Mocked connector lines for visual demo */}
        <path d="M 150 128 C 300 128, 300 80, 450 80" stroke="#64748b" strokeWidth="1" fill="none" markerEnd="url(#head)" />
        <path d="M 150 128 C 300 128, 300 180, 450 180" stroke="#64748b" strokeWidth="1" fill="none" markerEnd="url(#head)" />
        <path d="M 550 80 C 650 80, 650 128, 750 128" stroke="#64748b" strokeWidth="1" fill="none" markerEnd="url(#head)" />
        <path d="M 550 180 C 650 180, 650 128, 750 128" stroke="#64748b" strokeWidth="1" fill="none" markerEnd="url(#head)" />
      </svg>

      {layers.map((layer, i) => (
        <div key={i} className="flex flex-col gap-12 z-10">
          {layer.map(task => (
            <motion.div
              key={task.id}
              whileHover={{ scale: 1.1 }}
              onMouseEnter={() => onHoverNode(task.id)}
              onMouseLeave={() => onHoverNode(null)}
              className={`
                relative w-12 h-12 rounded-full flex items-center justify-center border-2 shadow-xl cursor-pointer
                ${task.status === 'Blocked' ? 'bg-red-900/20 border-red-500 text-red-500' : 
                  task.status === 'Stalled' ? 'bg-amber-900/20 border-amber-500 text-amber-500' : 
                  'bg-slate-900 border-slate-700 text-slate-400'}
              `}
            >
              {task.status === 'Blocked' && (
                <motion.div 
                  className="absolute inset-0 rounded-full border border-red-500"
                  animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
              <div className="text-xs font-bold">{task.id.toUpperCase()}</div>
              
              {/* Tooltip */}
              <div className="absolute top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 bg-slate-800 text-xs p-2 rounded w-32 text-center pointer-events-none transition-opacity">
                {task.title}
              </div>
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};


interface CommunicationLeakageProps {
  tasks: Task[];
}

const CommunicationLeakage: React.FC<CommunicationLeakageProps> = ({ tasks }) => {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  return (
    <div className="space-y-2 relative overflow-visible" onMouseLeave={() => setHoveredId(null)}>
      {tasks.slice(0, 3).map((task) => {
        const isHovered = hoveredId === task.id;
        const isHighLeakage = task.leakageHours > 5;

        return (
          <motion.div
            key={task.id}
            onMouseEnter={() => setHoveredId(task.id)}
            className={`relative p-3 rounded-xl transition-all duration-300 border ${
              isHovered 
                ? 'bg-slate-800/80 border-slate-700 shadow-lg z-30 scale-[1.02]' 
                : 'bg-slate-900/20 border-transparent hover:bg-slate-800/40 z-0'
            }`}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-2">
              <span className={`text-sm font-medium transition-colors ${isHovered ? 'text-white' : 'text-slate-400'}`}>
                {task.title}
              </span>
              <span className={`text-xs font-mono ${isHighLeakage ? 'text-orange-400' : 'text-slate-500'}`}>
                -{task.leakageHours}h
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min((task.leakageHours / 15) * 100, 100)}%` }}
                transition={{ duration: 1, ease: "circOut" }}
                className={`h-full rounded-full shadow-sm ${
                  isHighLeakage 
                    ? 'bg-gradient-to-r from-orange-500 to-red-500' 
                    : 'bg-slate-600'
                }`}
              />
            </div>

            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: -4, scale: 0.95 }}
                  animate={{ opacity: 1, y: 4, scale: 1 }}
                  exit={{ opacity: 0, y: -4, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="absolute left-0 right-0 top-full z-50 px-1 pointer-events-none"
                >
                  <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-700 p-3 rounded-lg shadow-2xl ring-1 ring-black/50">
                    <div className="flex items-start gap-3">
                      <MessageSquareWarning 
                        size={16} 
                        className={`mt-0.5 shrink-0 ${isHighLeakage ? 'text-orange-400' : 'text-slate-500'}`} 
                      />
                      <div className="space-y-1">
                        <div className="text-xs text-slate-300 leading-relaxed">
                          {isHighLeakage ? (
                            <>
                              <span className="text-orange-200 font-semibold">High Friction:</span> 
                              {" "}Heavy Slack volume detected. 42 messages exchanged.
                            </>
                          ) : (
                            "Communication flow is within healthy parameters."
                          )}
                        </div>
                        {isHighLeakage && (
                          <div className="flex gap-2 pt-1">
                             <span className="text-[10px] bg-orange-500/10 text-orange-400 px-1.5 py-0.5 rounded border border-orange-500/20">
                                Suggest Sync
                             </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
};


// D. Heatmap Cell
const HeatmapCell = ({ load }) => {
  let bgClass = "bg-slate-800/50";
  if (load > 0) bgClass = "bg-blue-900/30";
  if (load > 50) bgClass = "bg-blue-600/40";
  if (load > 80) bgClass = "bg-blue-500";
  if (load > 100) bgClass = "bg-red-500"; // Overload color

  return (
    <motion.div 
      whileHover={{ scale: 1.1, zIndex: 10 }}
      className={`h-10 w-full rounded-md border border-slate-800/50 ${bgClass} relative group cursor-grab active:cursor-grabbing`}
    >
        {load > 100 && (
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-slate-950 animate-pulse" />
        )}
        {/* Tooltip */}
        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-48 bg-slate-900 border border-slate-700 p-3 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
            <p className="text-xs font-bold text-white">Load: {load}%</p>
            <p className="text-[10px] text-slate-400">Predicted Burnout Risk: {load > 90 ? 'High' : 'Low'}</p>
        </div>
    </motion.div>
  );
};

// --- 3. MAIN PAGE COMPONENT ---

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("Analytics");
  const [hoveredNode, setHoveredNode] = useState(null);
  const [showEnvoy, setShowEnvoy] = useState(false);

  const blockedTasks = MOCK_TASKS.filter(t => t.status === "Blocked");
  const stalledTasks = MOCK_TASKS.filter(t => t.status === "Stalled");

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30 overflow-hidden">
      

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur z-10">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">Analytics Intelligence</h1>
            <div className="h-6 w-px bg-slate-800" />
            <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
                <button className="px-3 py-1 text-xs font-medium bg-slate-800 text-white rounded shadow-sm">Team View</button>
                <button className="px-3 py-1 text-xs font-medium text-slate-500 hover:text-white transition-colors">Individual</button>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
             <button 
                onClick={() => setShowEnvoy(!showEnvoy)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${showEnvoy ? 'bg-amber-500/10 border-amber-500 text-amber-500' : 'bg-slate-900 border-slate-700 hover:border-amber-500/50'}`}
             >
                <Zap size={14} className={showEnvoy ? "fill-current" : ""} />
                <span className="text-sm font-medium">Envoy Suggest</span>
                {AI_SUGGESTIONS.length > 0 && <span className="bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 rounded-full">{AI_SUGGESTIONS.length}</span>}
             </button>
          </div>
        </header>

        {/* Scrollable Dashboard Grid */}
        <div className="flex-1 overflow-y-auto p-8 scroll-smooth">
          <div className="grid grid-cols-12 gap-6 max-w-7xl mx-auto">

            {/* A. Real-Time Task Flow Ticker */}
            <div className="col-span-12 grid grid-cols-3 gap-6 mb-4">
               {[
                 { label: "Blocked Flow", count: blockedTasks.length, color: "red", desc: "Downstream impact detected" },
                 { label: "Stalled / Idle", count: stalledTasks.length, color: "amber", desc: "No activity > 48h" },
                 { label: "Velocity Trend", count: "+12%", color: "emerald", desc: "Vs last sprint" }
               ].map((stat, i) => (
                 <motion.div 
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-slate-900 border border-slate-800 p-5 rounded-2xl relative overflow-hidden group hover:border-slate-700 transition-colors"
                 >
                    <div className={`absolute top-0 right-0 p-24 bg-${stat.color}-500/5 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none`} />
                    <h3 className="text-slate-400 font-medium text-sm">{stat.label}</h3>
                    <div className="flex items-end gap-2 mt-2">
                        <span className="text-3xl font-bold text-white">{stat.count}</span>
                        {stat.count !== 0 && (
                            <span className={`text-xs mb-1 font-medium px-2 py-0.5 rounded bg-${stat.color}-500/10 text-${stat.color}-500`}>
                                Critical
                            </span>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                        <Activity size={12} /> {stat.desc}
                    </p>
                 </motion.div>
               ))}
            </div>

            {/* B. Dependency Ripple Visualization */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden flex flex-col"
            >
                <div className="flex justify-between items-start mb-6 z-10">
                    <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                            Dependency Ripple
                            <span className="text-[10px] uppercase tracking-wider bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Beta</span>
                        </h2>
                        <p className="text-sm text-slate-400 mt-1">
                            {hoveredNode 
                                ? <span className="text-amber-400 animate-pulse">Simulating impact for Task {hoveredNode.toUpperCase()}...</span> 
                                : "Hover nodes to simulate delay impact downstream."}
                        </p>
                    </div>
                    <button className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded transition-colors border border-slate-700">
                        View Full Graph
                    </button>
                </div>
                
                {/* Graph Container */}
                <div className="flex-1 min-h-[300px] bg-slate-950/50 rounded-xl border border-dashed border-slate-800 relative">
                     <RippleGraph tasks={MOCK_TASKS} onHoverNode={setHoveredNode} />
                </div>
            </motion.div>

            {/* C. Communication Leakage */}
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="col-span-4 bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
                <h2 className="text-lg font-bold text-white mb-1">Comm. Leakage</h2>
                <p className="text-xs text-slate-500 mb-6">Time lost in clarification loops vs. execution.</p>
                <CommunicationLeakage tasks={MOCK_TASKS} />
                
                <div className="mt-8 pt-6 border-t border-slate-800">
                    <div className="flex items-center gap-4">
                        <div className="relative w-16 h-16">
                             {/* Mock Radial Progress */}
                             <svg className="w-full h-full transform -rotate-90">
                                <circle cx="32" cy="32" r="28" stroke="#1e293b" strokeWidth="6" fill="none" />
                                <circle cx="32" cy="32" r="28" stroke="#3b82f6" strokeWidth="6" fill="none" strokeDasharray="175" strokeDashoffset="40" strokeLinecap="round" />
                             </svg>
                             <div className="absolute inset-0 flex items-center justify-center font-bold text-white text-sm">78%</div>
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">Focus Efficiency</div>
                            <div className="text-xs text-slate-400">Team average is up by 4%</div>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* D. Workload Heatmap */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="col-span-12 bg-slate-900 border border-slate-800 rounded-2xl p-6"
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-lg font-bold text-white">Capacity Heatmap</h2>
                        <p className="text-sm text-slate-400">Drag to reassign and balance load.</p>
                    </div>
                    <div className="flex gap-2">
                         <div className="flex items-center gap-2 text-xs text-slate-500">
                             <div className="w-3 h-3 bg-blue-900/30 rounded"></div> Low
                             <div className="w-3 h-3 bg-blue-500 rounded"></div> Optimal
                             <div className="w-3 h-3 bg-red-500 rounded"></div> Critical
                         </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {MOCK_USERS.map((user) => (
                        <div key={user.id} className="grid grid-cols-12 gap-4 items-center">
                            {/* User Info */}
                            <div className="col-span-2 flex items-center gap-3">
                                <div className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center text-xs font-bold text-slate-300 border border-slate-700">
                                    {user.avatar}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{user.name}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-wider">{user.personas[0].role}</div>
                                </div>
                            </div>
                            
                            {/* Heatmap Grid (Mocked for Sprints 1-10) */}
                            <div className="col-span-10 grid grid-cols-10 gap-2">
                                {[20, 45, 80, 60, 110, 90, 30, 0, 20, 50].map((load, idx) => (
                                    <HeatmapCell key={idx} load={load} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>

          </div>
        </div>

        {/* 3. Envoy AI Slide-Over Panel */}
        <AnimatePresence>
            {showEnvoy && (
                <motion.div
                    initial={{ x: "100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute top-16 right-0 bottom-0 w-96 bg-slate-900/95 backdrop-blur-xl border-l border-slate-800 shadow-2xl z-30 flex flex-col"
                >
                    <div className="p-6 border-b border-slate-800">
                        <div className="flex items-center gap-2 text-amber-500 mb-2">
                            <Zap size={20} className="fill-current" />
                            <h3 className="font-bold text-lg text-white">Envoy Suggestions</h3>
                        </div>
                        <p className="text-sm text-slate-400">
                            I've analyzed the ripple effects and found 2 optimization opportunities.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {AI_SUGGESTIONS.map((suggestion) => (
                            <motion.div 
                                key={suggestion.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-950 border border-amber-500/20 rounded-xl p-4 relative group hover:border-amber-500/50 transition-colors"
                            >
                                <div className="absolute top-4 right-4 text-xs font-mono text-amber-500 opacity-50">
                                    {Math.round(suggestion.confidence * 100)}% CONFIDENCE
                                </div>
                                <div className="flex items-center gap-2 mb-3">
                                    {suggestion.type === 'blocker' 
                                        ? <AlertOctagon size={16} className="text-red-400" />
                                        : <MessageSquareWarning size={16} className="text-orange-400" />
                                    }
                                    <span className="text-xs font-bold uppercase text-slate-400">{suggestion.type}</span>
                                </div>
                                <p className="text-sm text-slate-200 mb-4 leading-relaxed">
                                    {suggestion.message}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">
                                        ROI: {suggestion.impact}
                                    </span>
                                    <button className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-amber-600 hover:text-white text-slate-300 px-3 py-1.5 rounded transition-all">
                                        Apply Fix <ArrowRight size={12} />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

      </main>
    </div>
  );
}