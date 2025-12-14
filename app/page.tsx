import { Zap, Clock, AlertTriangle, CheckCircle, XCircle, ArrowRight, CornerDownRight, BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

// --- MOCK DATA FOR ILLUSTRATION ---
const mockSystemState = 'At Risk'; // 'On Track', 'At Risk', 'Stalled'

const mockCommand = {
    title: 'Review Project X architecture overhaul',
    rationale: 'System requires immediate human approval to proceed with deployment stage.',
    urgency: 'Critical',
};

const mockQueue = [
    { title: 'Finalize quarterly financial report', urgency: 'Deadline' },
    { title: 'Prepare Q&A for client demo', urgency: 'Normal', dependency: 'Waiting on approval of item 1.' },
    { title: 'Deploy staging environment fixes', urgency: 'Normal' },
    { title: 'Update documentation for API v2', urgency: 'Normal' },
];

const mockEmptyState = {
    state: 'Active', // 'NoTasks', 'AllBlocked', 'OverdueOverload', 'Active'
};

// --- HELPER COMPONENTS AND FUNCTIONS ---

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

// 4. Primary Action Control Logic
const PrimaryActionButton = ({ command }) => {
    const actionText = command ? 'Mark Complete' : 'Start Command';
    const isInvalid = false; // Mock disabled state logic

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


// 1. Command (Primary Execution Surface)
const CommandSurface = ({ command }) => {
    // 5. Failure & Empty State Messaging (replaces Command)
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

    return (
        <div className="bg-white dark:bg-gray-900 p-10 rounded-2xl shadow-2xl border-l-4 border-indigo-500 relative">
            {/* Urgency Indicator top-right */}
            <div className="absolute top-6 right-8">
                <div className="flex items-center space-x-1.5 px-3 py-1 bg-rose-500/10 rounded-full text-rose-500 font-semibold text-sm">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{command.urgency}</span>
                </div>
            </div>

            {/* Title top-left (largest typography on page) */}
            <h2 className="text-5xl font-extrabold text-gray-900 dark:text-white pr-32 leading-tight">
                {command.title}
            </h2>

            {/* Rationale directly under title, smaller text */}
            <p className="text-xl text-gray-600 dark:text-gray-400 mt-4 mb-10">
                {command.rationale}
            </p>

            {/* 4. Primary Action Control */}
            <PrimaryActionButton command={command} />
        </div>
    );
};

// 2. Execution Queue (Immediate Continuation)
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
                                {/* Optional Dependency Note */}
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


// --- MAIN PAGE COMPONENT ---

export default function HomePage() {
    // Current logic to show "Active" or "Stalled" state
    const currentCommand = mockEmptyState.state === 'AllBlocked' ? null : mockCommand;
    const currentQueue = mockEmptyState.state === 'NoTasks' ? [] : mockQueue;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
            <div className="max-w-4xl mx-auto py-8">
                <div className="flex justify-between items-center mb-10">
                    {/* Main title */}
                    <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                        Tasklinex <span className="text-indigo-600 dark:text-indigo-400">Pulse</span>
                    </h1>

                    {/* 3. System Status Indicator */}
                    <SystemStatusPill status={mockSystemState} />
                </div>

                {/* 1. Command (Primary Execution Surface) */}
                <CommandSurface command={currentCommand} />

                {/* 2. Execution Queue (Immediate Continuation) */}
                {currentCommand && (
                    <ExecutionQueue queue={currentQueue} />
                )}
            </div>
        </div>
    );
}