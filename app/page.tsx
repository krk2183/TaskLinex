"use client";   

import { Zap, Clock, AlertTriangle, CheckCircle, XCircle, ArrowRight, CornerDownRight, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

const mockSystemState = 'On Track'; // OPTIONS: 'On Track', 'At Risk', 'Stalled'

const mockCommand = {
    title: 'Forge.AI - V1',
    rationale: 'System requires immediate human approval to proceed with deployment stage.',
    urgency: 'Deadline',
    nexturgency:'Critical',
    nextStep: 'Deployment Stage',
    steptitle: 'Exigent matter detected',  
    current:'Enhance Clarity',
    reasoning: 'System has detected an anomaly with model outputs.',  
    progress: 53
};

const mockaccount_credent = {
    name:'Matthew',
    occupation:'Board Director',
    availability:'Available',
}

const mockQueue = [
    { title: 'Finalize quarterly financial report', urgency: 'Deadline' },
    { title: 'Prepare Q&A for client demo', urgency: 'Normal', dependency: 'Waiting on approval of item 1.' },
    { title: 'Deploy staging environment fixes', urgency: 'Normal' },
    { title: 'Update documentation for API v2', urgency: 'Normal' },
];

const mockEmptyState = {
    state: 'Active', // OPTIONS: 'NoTasks', 'AllBlocked', 'OverdueOverload', 'Active'
};

// Interface for the floating boxes
export interface NoteBox {
    id: string;
    text:string;
    urgency:'Urgent' | 'Update' | 'Neutral';
    size:number;
    left:number;
    top:number;
    duration:number;
}

export const createBubble = (content: string,currentCount:number,urgency:'Urgent' | 'Update' | 'Neutral'): NoteBox => ({
    id: Math.random().toString(36).substring(2, 9),
    text: content,
    urgency:urgency,
    size: Math.min(200,Math.max(120, content.length * 5)),
    left: Math.random() *100+100,
    top:30+(currentCount*63),
    duration: 6 + Math.random() * 4 
});

// 3. System Status Indicator
const getStatusClasses = (status) => {
    switch (status) {
        case 'On Track':
            return { icon: TrendingUp, color: 'text-emerald-500', bg: 'bg-emerald-500/10', text: 'On Track' };
        case 'At Risk':
            return { icon: TrendingDown, color: 'text-amber-500', bg: 'bg-amber-500/10', text: 'At Risk' };
        case 'Stalled':
            return { icon: BarChart3, color: 'text-rose-500', bg: 'bg-rose-500/10', text: 'Stalled' };
        default:
            return { icon: BarChart3, color: 'text-gray-400', bg: 'bg-gray-700', text: 'Unknown' };
    }
};

const SystemStatusPill = ({ status }) => {
    const { icon: Icon, color, bg, text } = getStatusClasses(status);
    return (
        <div className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-full ${bg} ${color}`}>
            <Icon className="w-4 h-4" />
            <span>{text}</span>
        </div>
    );
};


//🔣🔣🔣 ICONS 🔣🔣🔣
const getUrgencyConfig = (urgency) => {
    switch (urgency) {
        case 'Critical':
            return { icon: Zap, color: 'text-red-800', bg: 'bg-red-800' };
        case 'Overdue':
            return { icon: AlertTriangle, color: 'text-amber-800', bg: 'bg-amber-800/10' };
        case 'Deadline': //Blinks at Deadline
            return { icon: Clock, color: 'text-red-800', bg: 'bg-red-600 animate-pulse' };
        default:
            return { icon: CheckCircle, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' };
    }
};

const getAvailability = (availability) => {
    switch(availability) {
        case 'Available':
            return "bg-emerald-400 animate-pulse shadow-[0_0_20px_rgba(52,211,153,0.8)]";
        case 'Busy':
            return "bg-orange-500 animate-pulse";
        default:
            return 'bg-gray-600';
    }
}
 
// Urgency Icons
const UrgencyIcon = ({ type }) => {
    switch (type) {
        case 'Critical':
            return <Zap className="w-4 h-4 text-rose-500" />;
        case 'Overdue':
            return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        case 'Deadline':
            return <Clock className="w-4 h-4 text-indigo-500" />;
        default:
            return <CheckCircle className="w-4 h-4 text-gray-400" />;
    }
};

// Message Bubble borders
const BubbleUrgency = (urgency) => {
    switch (urgency) {
        case 'Urgent':
            return '4px solid rgba(255, 0, 0, 0.6)';
        
        case 'Update':
            return '4px solid rgba(255, 213, 0, 0.6)'

        default: //Neutral
            return '4px solid rgba(99, 102, 241, 0.6)';
        
    }
}

const PrimaryActionButton = ({ command }) => {
    const actionText = command ? 'Mark Complete' : 'Start Command';
    const isInvalid = false; 

    return (
        <button
            className={`w-full py-4 text-lg font-bold rounded-xl transition-all duration-300 transform hover:scale-[1.01] 
            ${isInvalid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30'
            }`}
            disabled={isInvalid}
        >
            {actionText}
        </button>
    );
};



interface CommandProps {
    title: string;
    rationale: string;
    urgency: string;
    nexturgency: string;
    nextStep: string;
    steptitle: string;     
    reasoning: string;    
    progress: number;     
    isUrgent?: boolean;
}

const handlePress = (): void=>{
    alert('Hello');
}

const CommandSurface = ({ command }: { command: CommandProps | null }) => {
    const [isNoteOpen, setIsNoteOpen] = useState(false);
    const [note, setNote] = useState("");
    const [noteBoxes, SetNoteBoxes] = useState<NoteBox[]>([]); // Of interface NoteBox
    
    // Sort by urgency priority
    const priorityMap = { 'Urgent': 3, 'Update': 2, 'Neutral': 1 };
    const visibleBoxes = [...noteBoxes]
        .sort((a, b) => priorityMap[b.urgency] - priorityMap[a.urgency])
        .slice(0, 3);

    const saveNote = () => {
        if (note.trim() === "") {
            setIsNoteOpen(false);
            return;
        }
        
        const testUrgency = noteBoxes.length % 3 === 0 ? 'Urgent' : 'Neutral';
        
        // We still create the bubble object, but we will ignore 'left'/'top' 
        // in the render loop to force them into a neat column.
        const newbox = createBubble(note, noteBoxes.length, testUrgency);

        SetNoteBoxes((prev) => [...prev, newbox]); // Add Note to storage
        setNote("");
        setIsNoteOpen(false);

        // Auto-remove after delay
        setTimeout(() => {
            SetNoteBoxes((prev) => prev.filter(b => b.id !== newbox.id));
        }, 25000);
    };

    if (!command) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 p-10 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                <XCircle className="w-10 h-10 text-rose-500 mx-auto mb-4" />
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                    Execution stalled. All remaining work is blocked.
                </p>
                <p className="text-lg text-gray-500 dark:text-gray-400 mt-2">
                    System diagnosis indicates no path forward. Resolve upstream blocks.
                </p>
            </div>
        );
    }

    const urgencyStyle = getUrgencyConfig(command.urgency);
    const nexturgencystyle = getUrgencyConfig(command.nexturgency);

    const keydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            saveNote();
        }
    };

    return (
        <>
            {/* ACCOUNTS WRAPPER */}
            <div className="bg-[#0A0E17] border border-[#1e2638] p-6 rounded-xl shadow-2xl relative mb-5 flex items-center justify-between w-full">
                <div className="flex items-center gap-4">
                    {/* PFP */}
                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-purple-600 to-blue-500 flex-shrink-0 overflow-hidden border-2 border-gray-800">
                        <img
                            src="https://via.placeholder.com/150"
                            alt="PFP"
                            className="w-full h-full object-cover"
                        />
                    </div>

                    {/* Account Name */}
                    <div>
                        <h2 className="text-white font-bold text-lg tracking-tight">{mockaccount_credent.name}</h2>
                        <p className="text-gray-500 text-xs uppercase tracking-widest">{mockaccount_credent.occupation}</p>
                    </div>
                </div>

                {/* Right Section: Status Dot */}
                <div className="flex items-center gap-2 bg-[#121620] px-3 py-1 rounded-full border border-gray-800">
                    <span className="relative flex h-3 w-3">
                        <span className={`absolute inline-flex h-full w-full rounded-full ${getAvailability(mockaccount_credent.availability)} opacity-75`}></span>
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${getAvailability(mockaccount_credent.availability)}`}></span>
                    </span>
                    <span className="text-gray-300 text-sm font-medium">{mockaccount_credent.availability}</span>
                </div>
            </div>

            {/* MAIN CARD SURFACE */}
            <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-2xl border-l-5 border-r-5 border-indigo-500 relative">

                {/* Top Right Urgency Badge */}
                <div className="absolute top-8 right-10">
                    <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-wider shadow-sm ${urgencyStyle.bg} ${urgencyStyle.text}`}>
                        <span>{command.urgency ?? 'Standard'}</span>
                    </div>
                </div>

                {/* Title & Rationale */}
                <div className="max-w-2xl">
                    <h2 className="text-4xl font-black text-gray-900 dark:text-white pr-20 leading-[1.1] tracking-tight">
                        {command.title ?? 'Untitled Command'}
                    </h2>
                    <p className="text-xl text-gray-500 dark:text-gray-400 mt-6 mb-10 leading-relaxed font-medium">
                        {command.rationale ?? 'No rationale provided for this action.'}
                    </p>
                </div>

                <div className="mb-10 w-full lg:w-[40%]">
                    {/* PROGRESS SECTION */}
                    <div className="flex items-center gap-2 mb-4">
                        <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
                            {command.current ?? 'Enhance clarity'}
                        </span>
                        <div className='ml-auto text-[13px]'>{command.progress}%</div>
                    </div>

                    <progress
                        value={command.progress ?? 60}
                        max={100}
                        className="w-full h-3 rounded-full overflow-hidden accent-indigo-500 appearance-none bg-gray-100 dark:bg-gray-800 [&::-webkit-progress-bar]:bg-gray-100 dark:[&::-webkit-progress-bar]:bg-gray-800 [&::-webkit-progress-value]:bg-indigo-500"
                    />

                    {/*📦📦📦 INNER CONTENT AREA 📦📦📦 */}
                    <div className="relative mt-12">

                        {/*1️⃣ PRIMARY INFO BOX (Left Side) */}
                        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                    <span className="text-xs font-black uppercase tracking-widest text-indigo-500">
                                        {command.nextStep ?? 'Enhance clarity'}
                                    </span>
                                    {/* INNER ALERT */}
                                    <div className={`ml-2 text-[12px] rounded-full py-0.4 px-1.5 ${nexturgencystyle.bg}`}>
                                        <span>{command.nexturgency}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setIsNoteOpen(!isNoteOpen)}
                                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 shadow-md
                                    ${isNoteOpen ? 'bg-indigo-500 text-white rotate-45' : 'bg-white dark:bg-grey-500 text-indigo-600 hover:scale-110'}`}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="3" stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                    </svg>
                                </button>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {command.steptitle ?? 'Page 2 is overly vague'}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">
                                {command.reasoning ?? 'The Overlay function has been skimmed over instead of having its features broken down'}
                            </p>
                        </div>

                        {/* 2️⃣ SIDEBAR CONTAINER (Right Side) 
                            Holds both the Input Field AND the Bubbles in a vertical flex column 
                        */}
                        <div className="absolute top-0 left-[105%] w-72 h-full flex flex-col gap-4 z-20 pointer-events-none">
                            
                            {/* A. INPUT FIELD */}
                            {isNoteOpen && (
                                <div className="relative w-full animate-in fade-in zoom-in-95 slide-in-from-left-4 duration-300 pointer-events-auto">
                                    {/* Arrow pointing to button */}
                                    <div className="absolute top-8 -left-2 w-4 h-4 bg-white dark:bg-gray-800 border-l border-t border-gray-200 dark:border-gray-700 rotate-[-45deg] z-0" />

                                    <div className="relative bg-white/80 dark:bg-gray-800/90 backdrop-blur-xl p-5 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span className="text-[10px] font-bold uppercase text-indigo-500">New Annotation</span>
                                        </div>

                                        <textarea
                                            autoFocus
                                            value={note}
                                            onKeyDown={keydown}
                                            onChange={(e) => setNote(e.target.value)}
                                            placeholder="Write a note..."
                                            className="w-full min-h-[100px] bg-transparent border-none p-0 text-sm text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:ring-0 outline-none resize-none"
                                        />

                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                                            <span className="text-[9px] text-gray-400 uppercase tracking-tighter font-medium">Draft Saved</span>
                                            <button
                                                onClick={saveNote}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-400"
                                            >
                                                Done
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* B. BUBBLES LIST */}
                            {visibleBoxes.map((box) => (
                                <div
                                    key={box.id}
                                    className="floating-note note-visible pointer-events-auto bg-gray-900/80 backdrop-blur-md"
                                    style={{
                                        position: 'relative', 
                                        left: 'auto',
                                        top: 'auto',
                                        
                                        border: BubbleUrgency(box.urgency),
                                        width: '100%',
                                        maxWidth: '280px',
                                        
                                        animationDuration: `${box.duration}s, ${box.duration + 1}s`,
                                        animationDelay: `${parseInt(box.id, 36) % 3}s` 
                                    }}
                                >
                                    <span className="text-white text-[0.9rem] leading-tight font-bold break-words block">
                                        {box.text}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <PrimaryActionButton command={command} />
            </div>
        </>
    );
};

const ExecutionQueue = ({ queue }) => {
    if (queue.length === 0) {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-xl text-center text-gray-500 dark:text-gray-400 mt-8 border border-gray-200 dark:border-gray-700">
                <p className="font-medium">No queued work. Execution ends after current command.</p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6 flex items-center">
                <CornerDownRight className='w-5 h-5 mr-3 text-indigo-500' />
                Execution Queue
            </h3>
            <div className="space-y-3">
                {queue.slice(0, 5).map((item, index) => (
                    <div
                        key={index}
                        className="bg-white dark:bg-gray-900 p-5 rounded-xl shadow-md flex items-center justify-between border-l-4 border-transparent hover:border-indigo-500 transition-all duration-200"
                    >
                        <div className="flex items-center space-x-4 min-w-0">
                            {/* Urgency Marker */}
                            <UrgencyIcon type={item.urgency} />

                            <div className="flex-1 min-w-0">
                                {/* Title */}
                                <p className="text-base font-semibold text-gray-800 dark:text-gray-100 truncate">
                                    {item.title}
                                </p>
                                {/* Dependency Note */}
                                {item.dependency && (
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5 flex items-center">
                                        {item.dependency}
                                    </p>
                                )}
                            </div>
                        </div>
                        <span className="text-xs font-mono text-gray-400 dark:text-gray-600">
                            #{index + 1}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};



export default function HomePage() {
    // Current logic to show "Active" or "Stalled" state
    const currentCommand = mockEmptyState.state === 'AllBlocked' ? null : mockCommand;
    const currentQueue = mockEmptyState.state === 'NoTasks' ? [] : mockQueue;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
            <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                TaskLinex <span className="text-indigo-400 dark:text-indigo-500">Pulse</span>
            </h1>
            <div className="w-4/5 mx-auto py-8">
                <div className="flex justify-between items-center mb-10">
                    {/* System Status could go here */}
                </div>
                
                <CommandSurface command={currentCommand} />
                {currentCommand && (
                    <ExecutionQueue queue={currentQueue} />
                )}
            </div>
        </div>
    );
}