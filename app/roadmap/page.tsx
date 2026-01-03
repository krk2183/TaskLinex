"use client";

import React, { useState } from 'react';
import { 
    Calendar, Filter, ZoomIn, ZoomOut, ChevronRight, 
    MoreHorizontal, AlertTriangle, CheckCircle, Clock, 
    ArrowRight, GitCommit, GripVertical, Layers, Users, Zap
} from 'lucide-react';

// --- TYPES & INTERFACES ---

type TaskStatus = 'On Track' | 'At Risk' | 'Blocked' | 'Completed';
type Priority = 'High' | 'Medium' | 'Low';

interface User {
    id: string;
    name: string;
    avatar: string;
    load: number; // 0-100 capacity
}

interface Task {
    id: string;
    title: string;
    startDate: number; // Grid column start (simplified for UI demo)
    duration: number; // Grid span
    progress: number; // 0-100
    status: TaskStatus;
    owner: User;
    handOffTo?: User; // Optional: Next owner
    dependencyId?: string; // ID of task this depends on
    isMilestone?: boolean;
    priority: Priority;
    plannedDuration?: number; // For Planned vs Actual viz
}

interface ProjectGroup {
    id: string;
    name: string;
    tasks: Task[];
}

// --- MOCK DATA ---

const mockUsers: User[] = [
    { id: 'u1', name: 'Matthew', avatar: 'https://i.pravatar.cc/150?u=1', load: 85 },
    { id: 'u2', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=2', load: 95 }, // Overloaded
    { id: 'u3', name: 'David', avatar: 'https://i.pravatar.cc/150?u=3', load: 40 },
    { id: 'u4', name: 'Elena', avatar: 'https://i.pravatar.cc/150?u=4', load: 60 },
];

const mockProjects: ProjectGroup[] = [
    {
        id: 'p1',
        name: 'Forge.AI Core',
        tasks: [
            { 
                id: 't1', title: 'Model Training Phase 1', startDate: 1, duration: 4, 
                progress: 100, status: 'Completed', owner: mockUsers[0], priority: 'High' 
            },
            { 
                id: 't2', title: 'Data Validation', startDate: 4, duration: 3, 
                progress: 60, status: 'On Track', owner: mockUsers[1], dependencyId: 't1', priority: 'High',
                plannedDuration: 2 // Slippage: Taking longer than planned
            },
            { 
                id: 't3', title: 'API Gateway Integration', startDate: 6, duration: 4, 
                progress: 20, status: 'At Risk', owner: mockUsers[2], dependencyId: 't2', priority: 'Medium',
                handOffTo: mockUsers[3] // Handoff
            },
        ]
    },
    {
        id: 'p2',
        name: 'Web Dashboard V2',
        tasks: [
            { 
                id: 't4', title: 'UX Research', startDate: 2, duration: 3, 
                progress: 90, status: 'On Track', owner: mockUsers[3], priority: 'Low' 
            },
            { 
                id: 't5', title: 'Alpha Release', startDate: 8, duration: 1, 
                progress: 0, status: 'Blocked', owner: mockUsers[1], isMilestone: true, priority: 'High' 
            }
        ]
    }
];

const timeColumns = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6', 'Week 7', 'Week 8', 'Week 9', 'Week 10', 'Week 11', 'Week 12'];

// --- SUB-COMPONENTS ---

// 1. Top Bar: Team Workload HUD
const WorkloadHUD = () => {
    return (
        <div className="flex items-center gap-6 px-4 py-2 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 overflow-x-auto">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Team Load</span>
            {mockUsers.map(user => {
                let loadColor = 'bg-emerald-500';
                if (user.load > 70) loadColor = 'bg-amber-500';
                if (user.load > 90) loadColor = 'bg-rose-500';

                return (
                    <div key={user.id} className="flex items-center gap-3 min-w-[140px] group cursor-pointer">
                        <div className="relative">
                            <img src={user.avatar} className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700" alt={user.name} />
                            {user.load > 90 && (
                                <div className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] w-4 h-4 flex items-center justify-center rounded-full animate-pulse">!</div>
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">{user.name}</span>
                                <span>{user.load}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                                <div className={`h-full ${loadColor} rounded-full transition-all duration-500`} style={{ width: `${user.load}%` }} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// 2. The Task Bar Component
const TaskBar = ({ task }: { task: Task }) => {
    // Styles based on status
    const statusStyles = {
        'On Track': 'bg-indigo-500 border-indigo-600',
        'At Risk': 'bg-amber-500 border-amber-600',
        'Blocked': 'bg-rose-500 border-rose-600',
        'Completed': 'bg-emerald-500 border-emerald-600',
    };

    const isSlipping = task.plannedDuration && task.duration > task.plannedDuration;

    if (task.isMilestone) {
        return (
            <div 
                className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group z-20 hover:scale-110 transition-transform cursor-pointer"
                style={{ left: `${(task.startDate - 1) * 8.33}%`, width: '40px' }}
            >
                <div className="w-4 h-4 rotate-45 bg-purple-500 border-2 border-white dark:border-gray-900 shadow-lg" />
                <div className="w-0.5 h-8 bg-purple-500/50 absolute top-4" />
                <span className="mt-6 text-[10px] font-bold text-purple-600 dark:text-purple-400 whitespace-nowrap bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.title}
                </span>
            </div>
        );
    }

    return (
        <div 
            className="absolute h-10 top-2 group z-10"
            style={{ 
                left: `${(task.startDate - 1) * 8.33}%`, 
                width: `${task.duration * 8.33}%` 
            }}
        >
            {/* TOOLTIP ON HOVER */}
            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-64 bg-gray-900 text-white text-xs p-3 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-sm">{task.title}</span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${task.status === 'Blocked' ? 'bg-rose-500' : 'bg-gray-700'}`}>
                        {task.status}
                    </span>
                </div>
                <div className="space-y-1 text-gray-300">
                    <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3" /> 
                        <span>{task.duration} Weeks (Est: {task.plannedDuration || task.duration})</span>
                    </div>
                    {task.handOffTo && (
                        <div className="flex items-center gap-2 text-indigo-300">
                            <ArrowRight className="w-3 h-3" /> 
                            <span>Hand-off to {task.handOffTo.name}</span>
                        </div>
                    )}
                </div>
                <div className="mt-2 pt-2 border-t border-gray-700 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">Changed 2h ago by Sarah</span>
                    <button className="text-indigo-400 hover:text-white font-bold">View Details</button>
                </div>
            </div>

            {/* PLANNED (Ghost Bar - Visible if slipping) */}
            {isSlipping && (
                <div 
                    className="absolute top-0 left-0 h-full border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-md opacity-50"
                    style={{ width: `${(task.plannedDuration! / task.duration) * 100}%` }}
                />
            )}

            {/* ACTUAL BAR */}
            <div className={`relative h-full rounded-md shadow-md flex items-center px-3 overflow-hidden transition-all hover:shadow-lg ${statusStyles[task.status]}`}>
                {/* Progress Fill (Darker shade overlay) */}
                <div className="absolute left-0 top-0 bottom-0 bg-black/10" style={{ width: `${task.progress}%` }} />
                
                {/* Content */}
                <span className="relative z-10 text-xs font-bold text-white truncate drop-shadow-md pr-8">
                    {task.title}
                </span>

                {/* Owner Avatars */}
                <div className="absolute right-2 flex items-center">
                    <img src={task.owner.avatar} className="w-6 h-6 rounded-full border border-white/20" alt="Owner" />
                    {task.handOffTo && (
                        <div className="flex items-center -ml-2 z-10">
                            <div className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center border border-white/20 text-white">
                                <ArrowRight className="w-2 h-2" />
                            </div>
                            <img src={task.handOffTo.avatar} className="w-6 h-6 rounded-full border border-white/20 -ml-1" alt="Next" />
                        </div>
                    )}
                </div>
            </div>

            {/* DEPENDENCY LINE (Simulated for this demo) */}
            {task.dependencyId && (
                <svg className="absolute top-1/2 right-full w-12 h-8 -mr-1 pointer-events-none overflow-visible z-0 hidden md:block">
                    <path 
                        d="M -20,0 C -10,0 -10,10 0,10" 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth="2" 
                        strokeDasharray="4"
                    />
                    <circle cx="0" cy="10" r="2" fill="#6366f1" />
                </svg>
            )}
        </div>
    );
};


// --- MAIN PAGE COMPONENT ---

export default function RoadmapPage() {
    const [zoomLevel, setZoomLevel] = useState<'Month' | 'Week'>('Week');

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex flex-col">
            
            {/* HEADER AREA */}
            <div className="bg-white dark:bg-[#0A0E17] border-b border-gray-200 dark:border-gray-800 p-6 shadow-sm z-30">
                <div className="max-w-[1600px] mx-auto">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-3">
                                <Layers className="text-indigo-500" />
                                Execution Roadmap
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">
                                Q4 Deliverables & Team Capacity
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                                <button 
                                    onClick={() => setZoomLevel('Month')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${zoomLevel === 'Month' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Month
                                </button>
                                <button 
                                    onClick={() => setZoomLevel('Week')}
                                    className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${zoomLevel === 'Week' ? 'bg-white dark:bg-gray-700 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                                >
                                    Week
                                </button>
                            </div>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                                <Zap className="w-4 h-4" /> Auto-Balance
                            </button>
                        </div>
                    </div>

                    {/* FILTERS TOOLBAR */}
                    <div className="flex items-center gap-4 overflow-x-auto pb-2">
                        <div className="relative group">
                            <SearchInput />
                        </div>
                        <FilterDropdown label="Owner" />
                        <FilterDropdown label="Status" />
                        <FilterDropdown label="Priority" />
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700 mx-2" />
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-indigo-500 rounded-sm"></span> On Track</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-500 rounded-sm"></span> At Risk</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 bg-rose-500 rounded-sm"></span> Blocked</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TEAM HUD */}
            <WorkloadHUD />

            {/* GANTT AREA */}
            <div className="flex-1 overflow-auto relative custom-scrollbar">
                <div className="min-w-[1200px] p-6">
                    
                    {/* TIMELINE HEADER (Dates) */}
                    <div className="sticky top-0 z-20 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur border-b border-gray-200 dark:border-gray-800 mb-6">
                        <div className="grid grid-cols-12 gap-0 text-center">
                            {timeColumns.map((col, i) => (
                                <div key={i} className="py-2 border-r border-gray-200 dark:border-gray-800 last:border-0">
                                    <span className="text-xs font-bold text-gray-500 uppercase">{col}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* PROJECT GROUPS */}
                    <div className="space-y-8">
                        {mockProjects.map(project => (
                            <div key={project.id} className="relative">
                                {/* Project Header */}
                                <div className="sticky left-0 flex items-center gap-3 mb-4 bg-gray-50 dark:bg-gray-950 pr-4 w-fit z-10">
                                    <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-800 rounded">
                                        <ChevronRight className="w-4 h-4 text-gray-500" />
                                    </button>
                                    <h3 className="font-bold text-lg text-gray-800 dark:text-gray-200">{project.name}</h3>
                                    <span className="text-xs bg-gray-200 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-mono">
                                        {project.tasks.length} items
                                    </span>
                                </div>

                                {/* Timeline Rows */}
                                <div className="relative border-l border-gray-200 dark:border-gray-800 ml-4 space-y-4">
                                    {/* Vertical Grid Lines Background */}
                                    <div className="absolute inset-0 grid grid-cols-12 pointer-events-none z-0">
                                        {Array.from({ length: 12 }).map((_, i) => (
                                            <div key={i} className="border-r border-dashed border-gray-200 dark:border-gray-800 h-full" />
                                        ))}
                                    </div>

                                    {/* Task Rows */}
                                    {project.tasks.map(task => (
                                        <div key={task.id} className="relative h-14 w-full">
                                            <TaskBar task={task} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    );
}

// --- UTILITY COMPONENTS ---

const SearchInput = () => (
    <div className="relative">
        <input 
            type="text" 
            placeholder="Search tasks..." 
            className="pl-8 pr-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-48"
        />
        <ZoomIn className="w-4 h-4 text-gray-400 absolute left-2.5 top-2" />
    </div>
);

const FilterDropdown = ({ label }: { label: string }) => (
    <button className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-md text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition">
        <Filter className="w-3 h-3 text-gray-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </button>
);