"use client";

import React, { 
    createContext, useContext, useReducer, 
    useEffect, useState, useMemo, useRef 
} from 'react';
import { createPortal } from 'react-dom';
import { 
    Calendar, Filter, ZoomIn, ChevronRight, 
    AlertTriangle, CheckCircle, Clock, ArrowRight, 
    GitCommit, Layers, Zap, BrainCircuit, UserCog,
    MessageSquare, RefreshCw, Plus, Search, X
} from 'lucide-react';

// 1. BACKEND-READY TYPES & INTERFACES

type TaskStatus = 'On Track' | 'At Risk' | 'Blocked' | 'Completed';
type Priority = 'High' | 'Medium' | 'Low';
type ViewMode = 'Week' | 'Month';

// The "Persona" allows one user to wear multiple hats (e.g., Lead vs Contributor)
interface Persona {
    id: string;
    name: string;
    role: string;
    capacity: number; // 0-100
    color: string;
}

interface User {
    id: string;
    name: string;
    avatar: string;
    baseCapacity: number;
    personas: Persona[];
}

interface EnvoySuggestion {
    id: string;
    type: 'handoff' | 'slippage' | 'blocker';
    message: string;
    confidence: number;
    actionLabel: string;
}

interface Task {
    id: string;
    projectId: string;
    title: string;
    // Backend would store ISO dates; frontend converts to grid units
    startDate: number; 
    duration: number; // Actual duration
    plannedDuration: number; // For slippage visualization
    progress: number;
    status: TaskStatus;
    priority: Priority;
    // Relationships
    ownerId: string;
    personaId?: string; // Which "hat" is the owner wearing?
    dependencyIds: string[]; // Array of IDs this task depends on
    handOffToId?: string;
    // Meta
    isMilestone?: boolean;
    tags: string[];
    // AI Context
    envoySuggestion?: EnvoySuggestion;
}

interface Project {
    id: string;
    name: string;
    visible: boolean;
}

// Global Filter State
interface FilterState {
    query: string;
    owners: string[];
    statuses: TaskStatus[];
    onlyMyPersonas: boolean;
}

// ==========================================
// 2. MOCK DATA & API SIMULATION
// ==========================================

const MOCK_USERS: User[] = [
    { 
        id: 'u1', name: 'Matthew', avatar: 'https://i.pravatar.cc/150?u=1', baseCapacity: 80,
        personas: [
            { id: 'p_u1_1', name: 'Matt (Lead)', role: 'Lead', capacity: 40, color: 'bg-purple-500' },
            { id: 'p_u1_2', name: 'Matt (Dev)', role: 'Dev', capacity: 60, color: 'bg-blue-500' }
        ]
    },
    { 
        id: 'u2', name: 'Sarah', avatar: 'https://i.pravatar.cc/150?u=2', baseCapacity: 95,
        personas: [{ id: 'p_u2_1', name: 'Sarah', role: 'Data Scientist', capacity: 95, color: 'bg-emerald-500' }]
    },
    { 
        id: 'u3', name: 'David', avatar: 'https://i.pravatar.cc/150?u=3', baseCapacity: 40,
        personas: [{ id: 'p_u3_1', name: 'David', role: 'Backend', capacity: 40, color: 'bg-indigo-500' }]
    }
];

const MOCK_PROJECTS: Project[] = [
    { id: 'proj1', name: 'Forge.AI Core', visible: true },
    { id: 'proj2', name: 'Web Dashboard V2', visible: true }
];

const MOCK_TASKS: Task[] = [
    { 
        id: 't1', projectId: 'proj1', title: 'Model Training P1', startDate: 1, duration: 4, plannedDuration: 4,
        progress: 100, status: 'Completed', priority: 'High', ownerId: 'u1', personaId: 'p_u1_1', dependencyIds: [], tags: ['AI']
    },
    { 
        id: 't2', projectId: 'proj1', title: 'Data Validation', startDate: 4, duration: 3, plannedDuration: 2, // Slippage
        progress: 60, status: 'On Track', priority: 'High', ownerId: 'u2', dependencyIds: ['t1'], tags: ['Data'],
        envoySuggestion: { id: 's1', type: 'slippage', message: 'Task is 1 week behind schedule.', confidence: 0.9, actionLabel: 'Adjust Timeline' }
    },
    { 
        id: 't3', projectId: 'proj1', title: 'Gateway Integration', startDate: 6, duration: 4, plannedDuration: 4,
        progress: 20, status: 'At Risk', priority: 'Medium', ownerId: 'u3', dependencyIds: ['t2'], handOffToId: 'u1', tags: ['Backend']
    },
    { 
        id: 't4', projectId: 'proj2', title: 'UX Research', startDate: 2, duration: 3, plannedDuration: 3,
        progress: 90, status: 'On Track', priority: 'Low', ownerId: 'u3', dependencyIds: [], tags: ['Design']
    },
    { 
        id: 't5', projectId: 'proj2', title: 'Alpha Release', startDate: 8, duration: 1, plannedDuration: 1,
        progress: 0, status: 'Blocked', priority: 'High', ownerId: 'u1', dependencyIds: ['t3', 't4'], isMilestone: true, tags: ['Release']
    }
];

// Async Placeholder
const MockAPI = {
    sleep: (ms: number) => new Promise(r => setTimeout(r, ms)),
    fetchData: async () => { await MockAPI.sleep(800); return { tasks: MOCK_TASKS, users: MOCK_USERS, projects: MOCK_PROJECTS }; },
    autoBalance: async (tasks: Task[]) => {
        await MockAPI.sleep(1200);
        // Simulate logic: Find overloaded user, move task to underloaded user
        const newTasks = [...tasks];
        const riskyTask = newTasks.find(t => t.id === 't3');
        if (riskyTask) {
            riskyTask.ownerId = 'u1'; // Reassign
            riskyTask.status = 'On Track';
        }
        return newTasks;
    },
    triggerEnvoyAction: async (taskId: string, action: string) => {
        await MockAPI.sleep(1000);
        return { success: true, message: `Envoy executed: ${action}` };
    }
};

// ==========================================
// 3. STORE & STATE MANAGEMENT (Context)
// ==========================================

interface AppState {
    tasks: Task[];
    users: User[];
    projects: Project[];
    currentUser: User | null; // The logged in user
    activePersonaId: string | null; // Which "Hat" they are wearing
    isLoading: boolean;
    filters: FilterState;
    viewMode: ViewMode;
    envoyActive: string | null; // Task ID interacting with Envoy
}

type Action = 
    | { type: 'INIT_DATA', payload: any }
    | { type: 'SET_FILTER', payload: Partial<FilterState> }
    | { type: 'SET_VIEW_MODE', payload: ViewMode }
    | { type: 'TOGGLE_PERSONA', payload: string }
    | { type: 'UPDATE_TASKS', payload: Task[] }
    | { type: 'SET_LOADING', payload: boolean }
    | { type: 'TRIGGER_ENVOY', payload: string | null };

const initialState: AppState = {
    tasks: [], users: [], projects: [],
    currentUser: MOCK_USERS[0], // Simulating logged in as Matthew
    activePersonaId: 'p_u1_1',
    isLoading: true,
    viewMode: 'Week',
    envoyActive: null,
    filters: { query: '', owners: [], statuses: [], onlyMyPersonas: false }
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> } | null>(null);

function appReducer(state: AppState, action: Action): AppState {
    switch (action.type) {
        case 'INIT_DATA':
            return { ...state, ...action.payload, isLoading: false };
        case 'SET_FILTER':
            return { ...state, filters: { ...state.filters, ...action.payload } };
        case 'SET_VIEW_MODE':
            return { ...state, viewMode: action.payload };
        case 'TOGGLE_PERSONA':
            return { ...state, activePersonaId: action.payload === state.activePersonaId ? null : action.payload };
        case 'UPDATE_TASKS':
            return { ...state, tasks: action.payload };
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload };
        case 'TRIGGER_ENVOY':
            return { ...state, envoyActive: action.payload };
        default: return state;
    }
}

// ==========================================
// 4. SUB-COMPONENTS
// ==========================================

// 4.1 Dependency SVG Layer
// Calculates connections based on grid positions (Row Index & Column Index)
const DependencyLayer = ({ tasks, projects, viewMode, collapsedProjects }: { tasks: Task[], projects: Project[], viewMode: ViewMode, collapsedProjects: string[] }) => {
    // Flatten tasks to find their visual row index
    const visibleProjects = projects.filter(p => p.visible);
    let rowMap = new Map<string, number>();
    let currentRow = 0;

    visibleProjects.forEach(p => {
        const isCollapsed = collapsedProjects.includes(p.id);
        currentRow++; // Project Header

        if (isCollapsed) {
            return;
        }

        const projectTasks = tasks.filter(t => t.projectId === p.id);
        projectTasks.forEach(t => {
            rowMap.set(t.id, currentRow);
            currentRow++;
        });
    });

    const colWidth = 8.33; // %
    const rowHeight = 56; // px (approx height of task row)
    const headerOffset = 140; // px offset from top

    return (
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible">
            {tasks.map(task => {
                if (!task.dependencyIds || task.dependencyIds.length === 0) return null;
                const endRow = rowMap.get(task.id);
                if (endRow === undefined) return null;

                return task.dependencyIds.map(depId => {
                    const depTask = tasks.find(t => t.id === depId);
                    const startRow = rowMap.get(depId);
                    if (!depTask || startRow === undefined) return null;

                    // Coordinates
                    const x1 = (depTask.startDate + depTask.duration - 1) * colWidth + "%";
                    const y1 = (startRow * rowHeight) + (rowHeight / 2) + 20; // +20 fudge factor for padding
                    const x2 = (task.startDate - 1) * colWidth + "%";
                    const y2 = (endRow * rowHeight) + (rowHeight / 2) + 20;

                    // Path Logic (Curved connector)
                    return (
                        <g key={`${depId}-${task.id}`}>
                            <path 
                                d={`M ${x1} ${y1} C ${parseInt(x1) + 5}% ${y1}, ${parseInt(x2) - 5}% ${y2}, ${x2} ${y2}`}
                                fill="none"
                                stroke={task.status === 'Blocked' ? '#f43f5e' : '#6366f1'}
                                strokeWidth="2"
                                strokeDasharray={task.status === 'On Track' ? '0' : '4'}
                                className="opacity-40"
                            />
                            <circle cx={x2} cy={y2} r="3" fill={task.status === 'Blocked' ? '#f43f5e' : '#6366f1'} />
                        </g>
                    );
                });
            })}
        </svg>
    );
};

// 4.2 The "Envoy" AI Assistant Popup
const EnvoyPopup = ({ task, onClose, triggerRef }: { task: Task, onClose: () => void, triggerRef: React.RefObject<HTMLElement> }) => {
    const [status, setStatus] = useState<'idle' | 'thinking' | 'done'>('idle');
    const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);
    const popupRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                top: rect.bottom + 10,
                left: rect.left
            });
        }
    }, [triggerRef]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                popupRef.current && 
                !popupRef.current.contains(event.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(event.target as Node)
            ) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose, triggerRef]);

    // Close on scroll/resize to prevent detached popup
    useEffect(() => {
        const handleDismiss = () => onClose();
        window.addEventListener('scroll', handleDismiss, true);
        window.addEventListener('resize', handleDismiss);
        return () => {
            window.removeEventListener('scroll', handleDismiss, true);
            window.removeEventListener('resize', handleDismiss);
        };
    }, [onClose]);
    
    const handleAction = async () => {
        setStatus('thinking');
        await MockAPI.triggerEnvoyAction(task.id, 'Optimized Schedule');
        setStatus('done');
        setTimeout(onClose, 1500);
    };

    if (typeof document === 'undefined' || !coords) return null;

    return createPortal(
        <div 
            ref={popupRef}
            className="fixed z-[9999] w-64 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-indigo-100 dark:border-indigo-900 p-4 animate-in fade-in zoom-in-95 slide-in-from-top-2 duration-200 ease-out"
            style={{ top: coords.top, left: coords.left }}
        >
            <div className="flex items-center gap-2 mb-3 border-b border-gray-100 dark:border-gray-700 pb-2">
                <BrainCircuit className="w-4 h-4 text-indigo-500" />
                <span className="font-bold text-xs uppercase tracking-wider text-indigo-900 dark:text-indigo-100">Envoy AI</span>
            </div>
            
            {status === 'idle' && (
                <>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mb-3">
                        {task.envoySuggestion?.message || "I can help optimize this task's allocation."}
                    </p>
                    <button 
                        onClick={handleAction}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                    >
                        <Zap className="w-3 h-3" />
                        {task.envoySuggestion?.actionLabel || "Analyze Impact"}
                    </button>
                </>
            )}

            {status === 'thinking' && (
                <div className="flex flex-col items-center py-2 text-indigo-500">
                    <RefreshCw className="w-5 h-5 animate-spin mb-2" />
                    <span className="text-xs">Optimizing critical path...</span>
                </div>
            )}

            {status === 'done' && (
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-xs font-bold">Optimization Applied</span>
                </div>
            )}
        </div>,
        document.body
    );
};

// Task Item
const TaskItem = ({ task, user, dispatch, isEnvoyActive }: { task: Task, user: User | undefined, dispatch: any, isEnvoyActive: boolean }) => {
    const triggerRef = useRef<HTMLButtonElement>(null);
    const statusColor = {
        'On Track': 'bg-indigo-500', 'At Risk': 'bg-amber-500', 'Blocked': 'bg-rose-500', 'Completed': 'bg-emerald-500'
    };

    // Calculate slippage
    const isSlipping = task.duration > task.plannedDuration;
    const ghostWidth = (task.plannedDuration / task.duration) * 100;

    return (
        <div 
            className="absolute top-2 h-10 group"
            style={{ left: `${(task.startDate - 1) * 8.33}%`, width: `${task.duration * 8.33}%` }}
        >
            {/* Envoy Trigger (Hover) */}
            <button 
                ref={triggerRef}
                onClick={() => dispatch({ type: 'TRIGGER_ENVOY', payload: isEnvoyActive ? null : task.id })}
                className={`absolute -top-3 -right-3 z-[60] bg-white dark:bg-slate-900 rounded-full p-1 shadow border transition-all ${task.envoySuggestion ? 'text-indigo-600 scale-100' : 'text-gray-400 scale-0 group-hover:scale-100'}`}
            >
                <BrainCircuit className="w-3.5 h-3.5" />
            </button>

            {/* Envoy Popup */}
            {isEnvoyActive && (
                <EnvoyPopup task={task} onClose={() => dispatch({ type: 'TRIGGER_ENVOY', payload: null })} triggerRef={triggerRef} />
            )}
            {/* Ghost Bar (Future) */}
            {isSlipping && (
                <div className="absolute inset-0 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-md opacity-50 w-full" style={{ width: `${ghostWidth}%` }} />
            )}

                {/* Main Bar */}
                <div className={`
                    relative h-full rounded-md shadow-sm 
                    flex items-center px-3 gap-2 overflow-hidden
                    ${statusColor[task.status]}
                    
                    /* THE ANIMATION MAGIC */
                    transition-all transition-gpu duration-300 ease-in-out 
                    hover:w-max hover:min-w-full hover:z-50 hover:shadow-xl
                    group
                `}>
                {/* Progress Background */}
                <div className="absolute left-0 top-0 bottom-0 bg-black/20" style={{ width: `${task.progress}%` }} />
                
                {/* Text */}
                <span className="
                    relative z-10 text-xs font-bold text-white 
                    truncate group-hover:whitespace-normal group-hover:overflow-visible
                    transition-all duration-300
                ">
                    {task.title}
                </span>

                {/* Avatar */}
                {user && (
                    <img 
                        src={user.avatar} 
                        className="relative z-10 w-6 h-6 rounded-full border border-white/30 flex-shrink-0" 
                        alt="Owner"
                    />
                )}
            </div>

            {/* Handoff Indicator */}
            {task.handOffToId && (
                <div className="absolute top-1/2 -right-3 -translate-y-1/2 w-5 h-5 bg-slate-900 rounded-full flex items-center justify-center text-white border border-white z-20">
                    <ArrowRight className="w-3 h-3" />
                </div>
            )}
        </div>
    );
};

// HUD 
const WorkloadHUD = () => {
    const { state, dispatch } = useContext(AppContext)!;

    if (state.isLoading) {
        return (
            <div className="flex items-center gap-6 px-6 py-3 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
                <div className="flex flex-col gap-1">
                    <div className="h-2 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                </div>
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex flex-col gap-2 min-w-[140px] animate-pulse">
                        <div className="flex justify-between items-center"><div className="w-20 h-3 bg-slate-200 dark:bg-slate-800 rounded" /></div>
                        <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-6 px-6 py-3 bg-white dark:bg-[#0B1120] border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
            <div className="flex flex-col">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Team Capacity</span>
                <span className="text-xs text-slate-500">Persona View</span>
            </div>
            
            <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 mx-2" />

            {state.users.map(user => {
                // If the user is the current logged-in user, show persona toggles
                const isCurrentUser = state.currentUser?.id === user.id;
                
                return (
                    <div key={user.id} className="flex flex-col gap-1 min-w-[140px]">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                                <img src={user.avatar} className="w-6 h-6 rounded-full" alt={user.name} />
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{user.name}</span>
                            </div>
                            <span className="text-[10px] text-slate-400">{user.baseCapacity}%</span>
                        </div>
                        
                        {/* Capacity Bar */}
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${user.baseCapacity > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{ width: `${user.baseCapacity}%` }} />
                        </div>

                        {/* Persona Pills */}
                        {isCurrentUser && (
                            <div className="flex gap-1 mt-1">
                                {user.personas.map(p => (
                                    <button 
                                        key={p.id}
                                        onClick={() => dispatch({ type: 'TOGGLE_PERSONA', payload: p.id })}
                                        className={`text-[9px] px-1.5 py-0.5 rounded border transition-colors ${state.activePersonaId === p.id ? 'bg-indigo-100 border-indigo-300 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-700 dark:text-indigo-300' : 'bg-transparent border-slate-200 text-slate-500'}`}
                                    >
                                        {p.role}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Add Task Modal
const AddTaskModal = ({ onClose }: { onClose: () => void }) => {
    // Save the variables in memory
    const { state, dispatch } = useContext(AppContext)!;
    const [title, setTitle] = useState('');
    const [projectId, setProjectId] = useState(state.projects[0]?.id || '');
    const [ownerId, setOwnerId] = useState(state.users[0]?.id || '');
    const [startDate, setStartDate] = useState(1);
    const [duration, setDuration] = useState(1);
    const [status, setStatus] = useState<TaskStatus>('On Track');
    const [priority, setPriority] = useState<Priority>('Medium');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newTask: Task = {
            id: `t${Date.now()}`,   
            projectId,
            title,
            startDate: Number(startDate),
            duration: Number(duration),
            plannedDuration: Number(duration),
            progress: 0,
            status,
            priority,
            ownerId,
            dependencyIds: [],
            tags: []
        };
        
        dispatch({ type: 'UPDATE_TASKS', payload: [...state.tasks, newTask] });
        onClose();
    };

    return (
        // Creates the background blur
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white dark:bg-[#0F172A] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 scale-100 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">Add New Task</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Task Title</label>
                        <input 
                            type="text" 
                            required
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                            placeholder="e.g. Database Migration"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Project</label>
                            <select 
                                value={projectId}
                                onChange={e => setProjectId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                {state.projects.map(p => (
                                    <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Owner</label>
                            <select 
                                value={ownerId}
                                onChange={e => setOwnerId(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                {state.users.map(u => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Start Week</label>
                            <input 
                                type="number" 
                                min="1" max="12"
                                value={startDate}
                                onChange={e => setStartDate(Number(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Duration (W)</label>
                            <input 
                                type="number" 
                                min="1" max="12"
                                value={duration}
                                onChange={e => setDuration(Number(e.target.value))}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Status</label>
                            <select 
                                value={status}
                                onChange={e => setStatus(e.target.value as TaskStatus)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value="On Track">On Track</option>
                                <option value="At Risk">At Risk</option>
                                <option value="Blocked">Blocked</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Priority</label>
                            <select 
                                value={priority}
                                onChange={e => setPriority(e.target.value as Priority)}
                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                            >
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-6">
                        <button 
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit"
                            className="px-4 py-2 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-lg shadow-indigo-500/20 transition-all transform hover:scale-105 active:scale-95"
                        >
                            Create Task
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// MAIN PAGE COMPONENT

export default function RoadmapPage() {
    const [state, dispatch] = useReducer(appReducer, initialState);
    
    // Initial Data Fetch
    useEffect(() => {
        MockAPI.fetchData().then(data => dispatch({ type: 'INIT_DATA', payload: data }));
    }, []);

    // Filter Logic
    const filteredTasks = useMemo(() => {
        return state.tasks.filter(t => {
            // THIS PART
            const matchesSearch = t.title.toLowerCase().includes(state.filters.query.toLowerCase());
            const matchesStatus = state.filters.statuses.length === 0 || state.filters.statuses.includes(t.status);
            // Persona Filter Logic
            const matchesPersona = !state.filters.onlyMyPersonas || (state.activePersonaId ? t.personaId === state.activePersonaId : true);
            return matchesSearch && matchesStatus && matchesPersona;
        });
    }, [state.tasks, state.filters, state.activePersonaId]);

    const handleAutoBalance = async () => {
        dispatch({ type: 'SET_LOADING', payload: true });
        const optimizedTasks = await MockAPI.autoBalance(state.tasks);
        dispatch({ type: 'UPDATE_TASKS', payload: optimizedTasks });
        dispatch({ type: 'SET_LOADING', payload: false });
    };

    const [collapsedProjects, setCollapsedProjects] = useState<string[]>([]);
    const toggleProjectCollapse = (projectId: string) => {
        setCollapsedProjects(prev => 
            prev.includes(projectId) 
                ? prev.filter(id => id !== projectId) 
                : [...prev, projectId]
        );
    };

    const [addVisible,setAVisible] = useState(false);

    return (
        <AppContext.Provider value={{ state, dispatch }}>
            <div className="min-h-screen bg-slate-50 dark:bg-[#0B1120] text-slate-900 dark:text-slate-100 flex flex-col font-sans animate-in fade-in slide-in-from-bottom-8 duration-700 ease-out">
                
                {/* TOP HEADER */}
                <header className="bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 p-4 z-40">
                    <div className="max-w-[1800px] mx-auto flex flex-col xl:flex-row justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-indigo-500/10 rounded-lg">
                                <Layers className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Execution Roadmap</h1>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="flex items-center gap-1"><GitCommit className="w-3 h-3"/> v2.4.0</span>
                                    <span>•</span>
                                    <span>Q1 2026 Deliverables</span>
                                </div>
                            </div>
                        </div>

                        {/* QUERY BUILDER / TOOLBAR */}
                        <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-900/50 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 overflow-x-auto">
                            <div className="relative group">
                                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                                <input 
                                    type="text" 
                                    placeholder="Search (JQL support pending)..." 
                                    className="pl-9 pr-4 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none"
                                    onChange={(e) => dispatch({ type: 'SET_FILTER', payload: { query: e.target.value } })}
                                />
                            </div>
                            
                            <div className="h-6 w-px bg-slate-300 dark:bg-slate-700 mx-1" />
                            
                            <button 
                                onClick={() => dispatch({ type: 'SET_FILTER', payload: { onlyMyPersonas: !state.filters.onlyMyPersonas } })}
                                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${state.filters.onlyMyPersonas ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300' : 'hover:bg-white dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'}`}
                            >
                                <UserCog className="w-4 h-4" />
                                My Persona Only
                            </button>

                            <button 
                                onClick={handleAutoBalance}
                                className="ml-auto bg-slate-900 dark:bg-indigo-600 hover:bg-slate-800 dark:hover:bg-indigo-700 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all"
                            >
                                <Zap className="w-3 h-3" /> Auto-Balance
                            </button>
                        </div>
                    </div>
                </header>

                <WorkloadHUD />

                {/* GANTT CANVAS */}
                <div className="flex-1 overflow-auto relative custom-scrollbar bg-slate-50 dark:bg-[#0B1120]">
                    <div className="min-w-[1400px] p-8">
                        
                        {/* TIMELINE DATES */}
                        <div className="sticky top-0 z-30 bg-slate-50/95 dark:bg-[#0B1120]/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 mb-6">
                            <div className="grid grid-cols-12 gap-0">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="py-3 border-r border-slate-200 dark:border-slate-800/50 text-center">
                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">W{i + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="relative">
                            {/* BACKGROUND GRID */}
                            <div className="absolute inset-0 grid grid-cols-12 pointer-events-none z-0">
                                {Array.from({ length: 12 }).map((_, i) => (
                                    <div key={i} className="border-r border-dashed border-slate-200 dark:border-slate-800 h-full" />
                                ))}
                            </div>

                            {/* SVG LINES OVERLAY */}
                            <DependencyLayer tasks={state.tasks} projects={state.projects} viewMode={state.viewMode} collapsedProjects={collapsedProjects} />

                            {/* PROJECT ROWS */}
                            <div className="space-y-12 relative z-10">
                                {state.isLoading ? (
                                    // Loading Skeletons
                                    <div className="space-y-12 p-2">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="animate-pulse space-y-4">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-4 h-4 bg-slate-200 dark:bg-slate-800 rounded" />
                                                    <div className="h-6 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                                                </div>
                                                <div className="h-14 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-lg" />
                                                <div className="h-14 w-full bg-slate-200/50 dark:bg-slate-800/50 rounded-lg" />
                                            </div>
                                        ))}
                                    </div>
                                ) : filteredTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-96 text-center">
                                        <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                                            <Search className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h3 className="text-lg font-medium text-slate-900 dark:text-white">No matching tasks found</h3>
                                        <p className="text-slate-500 dark:text-slate-400 mt-1">
                                            Try adjusting your search or filters to find what you're looking for.
                                        </p>
                                    </div>
                                ) : (
                                    state.projects.map(project => {
                                        const projectTasks = filteredTasks.filter(t => t.projectId === project.id);
                                        const isCollapsed = collapsedProjects.includes(project.id);
                                        
                                        // Get unique users for this project to display avatars
                                        const projectUserIds = [...new Set(projectTasks.map(task => task.ownerId))];
                                        const projectUsers = state.users.filter(user => projectUserIds.includes(user.id));

                                        if (projectTasks.length === 0) return null;

                                        return (
                                            <div key={project.id} className="transition-all duration-300">
                                                {/* Project Title Stickiness */}
                                                <div className="sticky left-0 flex items-center gap-3 pr-4 w-fit z-20 bg-slate-50 dark:bg-[#0B1120] py-1 rounded-r-lg mb-2">
                                                    <button onClick={() => toggleProjectCollapse(project.id)} className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded transition-colors">
                                                        <ChevronRight className={`w-4 h-4 text-slate-500 transition-transform duration-300 ${!isCollapsed ? 'rotate-90' : ''}`} />
                                                    </button>
                                                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-200">{project.name}</h3>
                                                    <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-full font-mono">
                                                        {projectTasks.length}
                                                    </span>

                                                    {/* Collapsed View: Show Avatars */}
                                                    <div className={`flex items-center transition-all duration-300 ease-in-out ${isCollapsed ? 'pl-2 opacity-100' : '-translate-x-4 opacity-0 h-0 w-0'}`}>
                                                        {projectUsers.map((user, index) => (
                                                            <img
                                                                key={user.id}
                                                                src={user.avatar}
                                                                alt={user.name}
                                                                className="w-6 h-6 rounded-full border-2 border-slate-50 dark:border-[#0B1120]"
                                                                style={{ marginLeft: index > 0 ? '-10px' : 0, zIndex: projectUsers.length - index }}
                                                            />
                                                        ))}
                                                    </div>
                                                </div>
                                                
                                                {/* Animated Task Container */}
                                                <div className={`grid transition-all duration-300 ease-in-out ${isCollapsed ? 'grid-rows-[0fr]' : 'grid-rows-[1fr]'}`}>
                                                    <div className="overflow-hidden">
                                                        <div className="relative space-y-4 min-h-[100px]">
                                                            {projectTasks.map(task => (
                                                                <div key={task.id} className="relative h-14 w-full hover:bg-white/50 dark:hover:bg-white/5 rounded-lg transition-colors">
                                                                    {task.isMilestone ? (
                                                                        // Milestone Render
                                                                        <div 
                                                                            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center z-20 cursor-pointer"
                                                                            style={{ left: `${(task.startDate - 1) * 8.33}%` }}
                                                                        >
                                                                            <div className="w-5 h-5 rotate-45 bg-purple-500 border-2 border-white dark:border-slate-900 shadow-lg hover:scale-125 transition-transform" />
                                                                            <span className="mt-8 text-[10px] font-bold text-purple-600 bg-white dark:bg-slate-800 px-2 py-0.5 rounded shadow-sm">
                                                                                {task.title}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        // Standard Task Render
                                                                        <TaskItem 
                                                                            task={task} 
                                                                            user={state.users.find(u => u.id === task.ownerId)} 
                                                                            dispatch={dispatch}
                                                                            isEnvoyActive={state.envoyActive === task.id}
                                                                        />
                                                                    )}
                                                                    
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>                        
                        </div>
                    </div>
                    <div className='fixed bottom-6 right-6 z-50' id='addButton'>
                        <button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-[12px] p-4 shadow-lg transition-transform hover:scale-110"
                        onClick={()=>setAVisible(!addVisible)}>
                            <Plus className="w-15 h-6" />
                        </button>
                    </div>

                    {/* Open the AddTaskModal window */}
                    {addVisible && <AddTaskModal onClose={() => setAVisible(false)} />}
                </div>

            </div>
        </AppContext.Provider>
    );
}