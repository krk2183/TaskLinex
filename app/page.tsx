"use client";

import React, { useState, useEffect } from 'react';
import { 
    Zap, Clock, AlertTriangle, CheckCircle, XCircle, ArrowRight, 
    CornerDownRight, BarChart3, TrendingUp, TrendingDown, 
    MessageSquare, Users, User, Calendar, Flag, Activity, Layers, 
    MoreHorizontal, Filter, Search 
} from 'lucide-react';

// --- TYPES & INTERFACES ---

type EventType = 'status_change' | 'comment' | 'blocker' | 'milestone' | 'handoff';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar: string;
    status: 'online' | 'busy' | 'offline';
    workload: number; // 0-100%
    currentTask?: string;
}

interface PulseEvent {
    id: string;
    type: EventType;
    actor: TeamMember;
    targetTask: string;
    targetLink: string;
    details: string; // e.g., "Moved to In Progress"
    timestamp: string; // Relative time e.g., "2m ago"
    metadata?: {
        from?: string;
        to?: string;
        blockerReason?: string;
    };
    actionRequired?: boolean;
}

// --- MOCK DATA ---

const Team: TeamMember[] = [
    { id: '1', name: 'Matthew', role: 'Director', avatar: 'https://i.pravatar.cc/150?u=1', status: 'online', workload: 85, currentTask: 'Financial Review' },
    { id: '2', name: 'Sarah', role: 'Lead Eng', avatar: 'https://i.pravatar.cc/150?u=2', status: 'busy', workload: 95, currentTask: 'API Migration' },
    { id: '3', name: 'David', role: 'Designer', avatar: 'https://i.pravatar.cc/150?u=3', status: 'offline', workload: 40 },
    { id: '4', name: 'Elena', role: 'Product', avatar: 'https://i.pravatar.cc/150?u=4', status: 'online', workload: 60, currentTask: 'User Flows' },
];


class addMember implements TeamMember{
    constructor(
        public id: string,
        public name: string,
        public role: string,
        public avatar: string,
        public status: TeamMember['status'],
        public workload: number,
        public currentTask?: string
    ) {}
}

// Make this read from a dataset and then create these roles
const getMembers = ()=> {

    // ILLUSTRATIVE PURPOSES ONLY
    const id:number = Team.length + 1;
    const name:string = 'Jake';
    const role:string = 'Developer';
    const avatar:string = 'https://i.pravatar.cc/150?u=5';
    const status: TeamMember['status'] = 'busy';
    const workload:number = 35;
    const currentTask:string = 'Scalability Adaptation';
    const newMember:TeamMember = new addMember(id.toString(),name,role,avatar,status,workload,currentTask);
    Team.push(newMember)
    };
getMembers();

// EVENTS FOR THE ACTIVITY STREAM
const mockEvents: PulseEvent[] = [
    {
        id: 'e1',
        type: 'blocker',
        actor: Team[1], // Sarah
        targetTask: 'Payment Gateway Integration',
        targetLink: '#',
        details: 'flagged a critical blocker',
        timestamp: 'Just now',
        metadata: { blockerReason: 'Waiting on Stripe API keys from Ops.' },
        actionRequired: true,
    },
    {
        id: 'e2',
        type: 'handoff',
        actor: Team[3], // Elena
        targetTask: 'Onboarding UI ups',
        targetLink: '#',
        details: 'handed off to David',
        timestamp: '12m ago',
        metadata: { from: 'Product Review', to: 'Design Implementation' }
    },
    {
        id: 'e3',
        type: 'status_change',
        actor: Team[0], // Matthew
        targetTask: 'Q4 Strategy Deck',
        targetLink: '#',
        details: 'marked as Complete',
        timestamp: '45m ago',
        metadata: { from: 'In Review', to: 'Done' }
    },
    {
        id: 'e4',
        type: 'comment',
        actor: Team[2], // David
        targetTask: 'Mobile Nav Component',
        targetLink: '#',
        details: 'commented',
        timestamp: '1h ago',
        metadata: { blockerReason: 'I uploaded the new assets to Figma.' }
    },
];

class addEvent implements PulseEvent {
    constructor(
        public id:string,
        public type: EventType,
        public actor: TeamMember,
        public targetTask:string,
        public targetLink:string,
        public details:string,
        public timestamp:string,
        public metadata?: {
            from?:string,
            to?:string,
            blockerReason?:string}
    ) {}
}

const getEvents = ()=>{
    const id = 'e7';
    const type = 'milestone';
    // use the last team member to avoid out-of-bounds undefined access
    const actor = Team[Team.length-1];
    const targetTask = 'Memory Optimization';
    const targetLink = 'Link';
    const details = 'has been picked up';
    const timestamp= '15m ago';
    const metadata= {blockerReason:'Customer Disagreement.'}
    const newAction = new addEvent(id,type,actor,targetTask,targetLink,details,timestamp,metadata);
    mockEvents.push(newAction)

}
getEvents();

// Upcoming Elements
interface Upcoming{
    id:string,
    step:string,
    isHighPriority?:boolean
}

const upcomingTasks: Upcoming[] = [
    { id: 'u1', step: 'Enhance Clarity of model outputs', isHighPriority: true },
    { id: 'u2', step: 'Final Validation', isHighPriority: false },
    { id: 'u3', step: 'Documentation Sweep', isHighPriority: false },
];

// Upper Element - Blockers & Dependencies, Sprint Health and Team Velocity
interface ProjectHealth {
    velocity: 'High' | 'Medium' | 'Low';
    blockers: {
        count: number;
        type: 'blocker' | 'dependency';
    };
    sprint: {
        daysLeft: number;
        completed: number;
        remaining: number;
    };
}

const currentStats: ProjectHealth = {
    velocity: 'Medium', //'High' | 'Medium' | 'Low'
    blockers: { count: 2, type: 'blocker' }, // 'blocker' | 'dependency'
    sprint: { daysLeft: 3, completed: 12, remaining: 5 }
};

// Sprint Health Graph
const SprintHealthCard  = ({ data }: { data: ProjectHealth }) => {
    const totalSlots = 25;
    const totalTasks = data.sprint.completed + data.sprint.remaining;
    const currentDayIndex = 15; // Example: we are at bar 15 of 25

    return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm md:col-span-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 group">
            <div className="flex-1 w-full sm:w-auto">
                <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">Sprint Health</p>
                <div className="flex items-center gap-4 text-sm font-medium">
                    <span className="flex items-center gap-1.5 text-slate-300">
                        <CheckCircle className="w-4 h-4 text-emerald-500" /> {data.sprint.completed} Done
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                        <Clock className="w-4 h-4 text-indigo-500" /> {data.sprint.daysLeft}d left
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-300">
                        <Layers className="w-4 h-4 text-amber-500" /> {data.sprint.remaining} Remaining
                    </span>
                </div>
            </div>

            <div className="w-full sm:w-52 h-14 flex items-end gap-[2px]">
                {Array.from({ length: totalSlots }).map((_, i) => {
                    // 2. Logic: Is this bar in the past, present, or future?
                    const isPast = i < currentDayIndex;
                    const isCurrent = i === currentDayIndex;
                    
                    let barHeight = 0;
                    if (isPast) {
                        barHeight = (i / currentDayIndex) * (data.sprint.completed / totalTasks) * 100;
                    } else if (isCurrent) {
                        barHeight = (data.sprint.completed / totalTasks) * 100;
                    } else {
                        barHeight = 5; // Placeholder for future days
                    }

                    return (
                        <div key={i} className="flex-1 h-full bg-slate-100 dark:bg-slate-800/30 rounded-t-full relative">
                            <div 
                                className={`absolute bottom-0 left-0 right-0 rounded-t-full transition-all duration-1000
                                    ${isCurrent ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]' : 
                                      isPast ? 'bg-slate-400 dark:bg-slate-600' : 'bg-slate-200 dark:bg-slate-800'}
                                `}
                                style={{ 
                                    height: `${Math.max(barHeight, 4)}%`,
                                    transitionDelay: `${i * 10}ms`
                                }}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};




// --- HELPER COMPONENTS ---

const StatusPill = ({ status }: { status: string }) => {
    const colors = {
        online: 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]',
        busy: 'bg-amber-500',
        offline: 'bg-gray-400'
    };
    return (
        <span className={`h-2.5 w-2.5 rounded-full ${colors[status as keyof typeof colors] || colors.offline} ring-2 ring-slate-950`} />
    );
};

const WorkloadIndicator = ({ level }: { level: number }) => {
    let color = 'bg-emerald-500';
    if (level > 70) color = 'bg-amber-500';
    if (level > 90) color = 'bg-rose-500';

    return (
        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div 
                className={`h-full ${color} transition-all duration-500`} 
                style={{ width: `${level}%` }} 
            />
        </div>
    );
};

// --- CORE COMPONENTS ---

const PulseInsights = ({ data }: { data: ProjectHealth }) => {
    const isBlocker = data.blockers?.type === 'blocker';
    const velocityStyles = {
        High: { color: 'text-emerald-500', bg: 'bg-emerald-100 dark:bg-emerald-900/20', iconColor: 'text-emerald-600', textSize: 'text-xl' },
        Medium: { color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20', iconColor: 'text-amber-600', textSize: 'text-lg' },
        Low: { color: 'text-rose-500', bg: 'bg-rose-100 dark:bg-rose-900/20', iconColor: 'text-rose-600', textSize: 'text-xl' }
    };

    const status = velocityStyles[data.velocity];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">Team Velocity</p>
                    <div className="flex items-center gap-2 mt-1">
                        <span className={`${status.textSize} font-black text-slate-200`}>{data.velocity}</span>
                        <TrendingUp className={`w-5 h-5 ${status.color}`} />
                    </div>
                </div>
                <div className={`h-10 w-10 ${status.bg} rounded-lg flex items-center justify-center`}>
                    <Zap className={`w-5 h-5 ${status.iconColor}`} />
                </div>
            </div>
            {data.blockers.count > 0 && (
                <div className={`bg-slate-900 border ${isBlocker ? 'border-rose-200 dark:border-rose-900/50' : 'border-amber-200 dark:border-amber-900/50'} p-4 rounded-xl shadow-sm flex items-center justify-between relative overflow-hidden`}>
                    <div className={`absolute left-0 top-0 bottom-0 w-1 ${isBlocker ? 'bg-rose-500' : 'bg-amber-500'}`} />
                    <div>
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold">
                            {isBlocker ? 'Active Blockers' : 'External Dependencies'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`text-2xl font-black ${isBlocker ? 'text-rose-600' : 'text-amber-600'}`}>
                                {data.blockers.count} {data.blockers.count === 1 ? 'Issue' : 'Issues'}
                            </span>
                        </div>
                    </div>
                        <a href="/analytics" 
                       className={`
                            text-xs px-4 py-2 rounded-lg font-bold
                            transition-all duration-200 ease-out
                            cursor-pointer outline-none active:scale-95                            
                            border border-slate-700/50 
                            
                            ${isBlocker 
                                ? `bg-rose-900/80 text-rose-100 hover:bg-rose-800 
                                hover:border-rose-500/50
                                shadow-[0_4px_12px_-4px_rgba(225,29,72,0.6)]` 
                                : `bg-slate-800 text-slate-300 hover:bg-slate-700
                                hover:text-slate-100
                                hover:border-slate-500/50
                                shadow-[0_4px_12px_-4px_rgba(0,0,0,0.5)]`
                            }
                        `}>
                            View
                        </a>
                </div>
            )}

            {/* SPRINT HEALTH FIELD */}
            {data.sprint.daysLeft > 0 && (
                <SprintHealthCard data={data} />
            )}
        </div>
    );
};


const TeamSidebar = ({ members }: { members: TeamMember[] }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-fit sticky top-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-slate-200 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-500" /> Team Pulse
                </h3>
                <span className="text-xs bg-slate-800 px-2 py-1 rounded text-slate-400">{Team.filter(member => member.status === 'online').length} Online</span>
            </div>

            <div className="space-y-5">
                {members.map((member) => (
                    <div key={member.id} className="group relative">
                        <div className="flex items-start gap-3">
                            <div className="relative">
                                <img src={member.avatar} alt={member.name} className="w-10 h-10 rounded-full object-cover border-2 border-slate-800" />
                                <div className="absolute -bottom-1 -right-1">
                                    <StatusPill status={member.status} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <h4 className="text-sm font-bold text-slate-200">{member.name}</h4>
                                    <span className="text-[10px] text-slate-500">{member.role}</span>
                                </div>
                                <WorkloadIndicator level={member.workload} />
                                {member.currentTask && (
                                    <p className="text-xs text-slate-400 mt-1 truncate group-hover:text-indigo-500 transition-colors">
                                        <Activity className="w-3 h-3 inline mr-1 text-slate-500" />
                                        {member.currentTask}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                <button className="text-sm text-indigo-400 font-semibold hover:underline">View Schedule</button>
            </div>
        </div>
    );
};

// Feed Sections Main Content
const FeedItem = ({ event }: { event: PulseEvent }) => {
    // COLOR SCHEME AND ICONOGRAPHY
    const getStyles = (type: EventType) => {
        switch(type) {
            case 'blocker':
                return { icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20', border: 'border-rose-200 dark:border-rose-900' };
            case 'status_change':
                return { icon: ArrowRight, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-900' };
            case 'handoff':
                return { icon: User, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-900' };
            default:
                return { icon: MessageSquare, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800', border: 'border-gray-200 dark:border-gray-800' };
          }
    };

    const style = getStyles(event.type);
    const Icon = style.icon;

    return (
        <div className="flex gap-3 sm:gap-4 relative pb-8 last:pb-0">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-10 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 last:hidden" />

            {/* Avatar */}
            <div className="relative z-10">
                <img 
                    src={event.actor.avatar} 
                    alt={event.actor.name} 
                    className="w-10 h-10 rounded-full border-4 border-gray-50 dark:border-gray-950 object-cover shadow-sm" 
                />
                <div className={`absolute -bottom-1 -right-1 p-0.5 rounded-full bg-white dark:bg-gray-900 ${style.color}`}>
                    <Icon className="w-3 h-3" />
                </div>
            </div>

            {/* Content Card */}
            <div className={`flex-1 p-3 sm:p-4 rounded-xl border ${style.border} ${style.bg} relative group transition-all hover:shadow-md`}>
                <div className="flex flex-col sm:flex-row sm:justify-between items-start mb-1 gap-1 sm:gap-0">
                    <p className="text-sm text-slate-200">
                        <span className="font-bold">{event.actor.name}</span> <span className="text-slate-400 font-normal">{event.details}</span> <span className="font-semibold text-indigo-400 hover:underline cursor-pointer">"{event.targetTask}"</span>
                    </p>
                    <span className="text-xs text-slate-500 whitespace-nowrap ml-0 sm:ml-2">{event.timestamp}</span>
                </div>

                {/* Metadata / Details */}
                {/* WHEN OBSTACLE */}
                {event.metadata?.blockerReason && (
                    <div className="mt-2 p-2 bg-rose-100 dark:bg-rose-950/50 rounded-lg text-xs text-rose-800 dark:text-rose-200 font-medium flex items-start gap-2">
                        <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                        "{event.metadata.blockerReason}"
                    </div>
                )}
                {/* WHEN CONTINUING */}
                {event.metadata?.from && (
                    <div className="mt-2 flex items-center gap-2 text-xs font-mono text-slate-400">
                        {/* TASK FROM */}
                        <span className="px-2 py-0.5 bg-slate-800/50 rounded">{event.metadata.from}</span>
                        <ArrowRight className="w-3 h-3" />
                        {/* TASK TO */}
                        <span className="px-2 py-0.5 bg-slate-800/50 rounded font-bold text-slate-200">{event.metadata.to}</span>
                    </div>
                )}

                {/* Action Options */}
                <div className="mt-3 flex gap-3 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity">
                    {event.actionRequired ? (
                        <button className="text-xs flex items-center gap-1 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-700 shadow-sm text-slate-200 hover:text-emerald-500 font-semibold">
                            <CheckCircle className="w-3 h-3" /> Resolve
                        </button>
                    ) : (
                         <button className="text-xs flex items-center gap-1 bg-transparent hover:bg-slate-800/50 px-2 py-1 rounded text-slate-400">
                            <MessageSquare className="w-3 h-3" /> Reply
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ActivityStream = ({ events }: { events: PulseEvent[] }) => {
    return (
        <div className="bg-slate-950 rounded-2xl p-4 sm:p-6 shadow-sm border border-slate-800 min-h-[600px]">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4 sm:gap-0">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-200 flex items-center gap-2">
                    Activity Stream
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </h2>
                
                {/* 🔎🔎SEARCH FIELD 🔎🔎 */}
                <div className="flex gap-2 w-full sm:w-auto">
                     <div className="relative flex-1 sm:flex-none">
                        <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Filter feed..." 
                            className="pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 outline-none w-full sm:w-48 transition-all focus:w-full sm:focus:w-64"
                        />
                    </div>
                    <button className="p-2 border border-slate-700 rounded-lg hover:bg-slate-800 text-slate-400">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* EVENT FIELD */}
            <div className="pl-2">
                {events.map(event => (
                    <FeedItem key={event.id} event={event} />
                ))}
            </div>

             <div className="mt-8 text-center">
                <button className="text-sm text-slate-400 hover:text-indigo-400 transition-colors flex items-center justify-center w-full gap-2">
                    <Clock className="w-3 h-3" /> Load previous updates
                </button>
            </div>
        </div>
    );
};

// --- Pulse Focus ---

const PulseFocus = () => {
    return (
        <div className="bg-slate-950 text-white p-6 rounded-2xl shadow-2xl border border-indigo-500/30 relative lg:sticky lg:top-6">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-sm text-slate-400 uppercase tracking-widest font-bold mb-1">My Focus</h3>
                    <h2 className="text-xl font-bold">Forge.AI - V1</h2>
                </div>
                <div className="bg-red-600 animate-pulse px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Deadline
                </div>
            </div>

            <div className="space-y-4">
                <div className="bg-slate-800/50 p-4 rounded-xl border-l-4 border-indigo-500">
                    <div className="flex justify-between text-xs text-slate-400 mb-2">
                        <span>Current Step</span>
                        <span>53%</span>
                    </div>
                    <p className="font-medium text-sm">Enhance Clarity of model outputs</p>
                    <div className="w-full bg-slate-700 h-1.5 rounded-full mt-3 overflow-hidden">
                        <div className="bg-indigo-500 h-full w-[53%]" />
                    </div>
                </div>

                <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Up Next</p>
                    {upcomingTasks.map((task)=>(
                    <div key={task.id || task.step} className={`flex items-center justify-between p-3 ${task.isHighPriority? 'bg-rose-900/30' :'bg-slate-800/30'} rounded-lg hover:bg-slate-800 transition cursor-pointer group`}>
                            <div className="flex items-center gap-3">
                                <CheckCircle className="w-4 h-4 text-slate-500 group-hover:text-indigo-400" />
                                <span className="text-sm text-slate-300">{task.step}</span>
                            </div>
                            {task.isHighPriority&&<Zap className="w-3 h-3 text-red-400" />}
                        </div>
                    ))}
                </div>

            </div>

            <button className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 py-3 rounded-xl font-bold text-sm shadow-lg shadow-indigo-900/50 transition-all transform hover:scale-[1.02]">
                Resume Context
            </button>
        </div>
    );
};

// --- MAIN PAGE LAYOUT ---

export default function PulsePage() {
    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 p-4 md:p-8 font-sans selection:bg-indigo-500/30">
            {/* Header Area */}
            <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight mb-2">
                        TaskLinex <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-500">Pulse</span>
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Synchronize with your team without the meetings.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex -space-x-3">
                         {Team.map(m => (
                             <img key={m.id} src={m.avatar} className="w-8 h-8 rounded-full border-2 border-slate-950" />
                         ))}
                         <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold border-2 border-slate-950">+2</div>
                    </div>
                    <button className="bg-slate-900 text-sm font-semibold px-4 py-2 rounded-lg border border-slate-700 hover:bg-slate-800 transition">
                        Invite
                    </button>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                {/* 1. Top Level Insights */}
                <PulseInsights data={currentStats}/>

                {/* 2. Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Left: Team Sidebar (20%) */}
                    <div className="hidden lg:block lg:col-span-3">
                        <TeamSidebar members={Team} />
                    </div>



                    {/* Right: My Focus (30%) */}
                    <div className="lg:col-span-3">
                        <PulseFocus />
                        
                        {/* Mini Widget: Upcoming Deadlines */}
                        <div className="mt-6 bg-slate-900 p-5 rounded-2xl border border-slate-800">
                             <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wide mb-4 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> This Week
                             </h4>
                             <div className="space-y-3">
                                <div className="flex gap-3 items-start">
                                    <div className="flex flex-col items-center min-w-[30px]">
                                        <span className="text-xs font-bold text-gray-400">OCT</span>
                                        <span className="text-lg font-black text-gray-800 dark:text-gray-200">24</span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold leading-tight">Client Demo: V1 Prototype</p>
                                        <p className="text-xs text-rose-500 mt-1 font-medium">Risk: High</p>
                                    </div>
                                </div>
                             </div>
                        </div>
                    </div>
                    
                    {/* Middle: Activity Feed (50%) */}
                    <div className="lg:col-span-6">
                        <ActivityStream events={mockEvents} />
                    </div>
                </div>
            </div>
        </div>
    );
}