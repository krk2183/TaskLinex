"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { 
    User, Shield, Users, Bot, Bell, Layout, Beaker, 
    Save, CheckCircle, AlertCircle, Plus, Trash2, 
    Activity, Lock, RefreshCw, Smartphone, Monitor
} from 'lucide-react';

// ==========================================
// 1. DATA MODELS (Backend Schema)
// ==========================================

// --- Account & Identity ---
interface AccountSettings {
    displayName: string;
    email: string;
    avatarUrl: string;
    accountType: 'Individual' | 'Team' | 'Enterprise';
    language: string;
    twoFactorEnabled: boolean;
}

// --- Persona System ---
interface PersonaDefinition {
    id: string;
    name: string;
    role: string; // e.g., "Lead", "Contributor", "Reviewer"
    color: string; // Hex or Tailwind class
    capacityLimit: number; // 0-100
    allowOverload: boolean;
}

interface PersonaSettings {
    activePersonas: PersonaDefinition[];
    enableVirtualTeammates: boolean; // Treat personas as separate users in UI
}

// --- Envoy AI ---
interface EnvoySettings {
    suggestionsEnabled: boolean;
    autoDetectDependencies: boolean;
    communicationStyle: 'Concise' | 'Elaborate';
    sensitivityLevel: number; // 1-10 (Conservative -> Proactive)
    permissions: {
        canDraftNotes: boolean;
        canProposeHandoffs: boolean;
        canModifyDates: boolean;
    };
}

// --- Visualization ---
interface VisualSettings {
    defaultTimelineScale: 'Week' | 'Month' | 'Quarter';
    showGhostBars: boolean; // For slippage
    showDependencyLines: boolean;
    uiDensity: 'Compact' | 'Comfortable';
}

// --- Root Settings Object ---
interface UserSettings {
    account: AccountSettings;
    personas: PersonaSettings;
    envoy: EnvoySettings;
    visuals: VisualSettings;
    experimental: {
        enableJQL: boolean;
        usegpuAcceleration: boolean;
    };
}

// ==========================================
// 2. MOCK API & UTILS
// ==========================================

const INITIAL_SETTINGS: UserSettings = {
    account: {
        displayName: 'Matthew',
        email: 'matthew@forge.ai',
        avatarUrl: 'https://i.pravatar.cc/150?u=1',
        accountType: 'Individual',
        language: 'en-US',
        twoFactorEnabled: false,
    },
    personas: {
        enableVirtualTeammates: true,
        activePersonas: [
            { id: 'p1', name: 'Matt (Lead)', role: 'Strategy', color: '#8b5cf6', capacityLimit: 40, allowOverload: true },
            { id: 'p2', name: 'Matt (Dev)', role: 'Execution', color: '#10b981', capacityLimit: 60, allowOverload: false },
        ]
    },
    envoy: {
        suggestionsEnabled: true,
        autoDetectDependencies: true,
        communicationStyle: 'Concise',
        sensitivityLevel: 7,
        permissions: { canDraftNotes: true, canProposeHandoffs: true, canModifyDates: false }
    },
    visuals: {
        defaultTimelineScale: 'Week',
        showGhostBars: true,
        showDependencyLines: true,
        uiDensity: 'Comfortable'
    },
    experimental: {
        enableJQL: false,
        usegpuAcceleration: true
    }
};

const Toggle = ({ label, description, checked, onChange, disabled }: any) => (
    <div className={`flex items-start justify-between py-4 border-b border-gray-100 dark:border-gray-800 last:border-0 ${disabled ? 'opacity-50' : ''}`}>
        <div className="pr-8">
            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</h4>
            {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
        </div>
        <button 
            onClick={() => !disabled && onChange(!checked)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${checked ? 'bg-indigo-600' : 'bg-gray-200 dark:bg-gray-700'}`}
        >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
        </button>
    </div>
);


const SettingsAPI = {
    get: async (): Promise<UserSettings> => {
        await new Promise(r => setTimeout(r, 600)); // Simulate net lag
        return INITIAL_SETTINGS;
    },
    patch: async (section: keyof UserSettings, data: any): Promise<boolean> => {
        await new Promise(r => setTimeout(r, 400));
        // Simulate 10% failure rate
        if (Math.random() > 0.95) throw new Error("Failed to sync settings");
        console.log(`[API] PATCH /settings/${section}`, data);
        return true;
    }
};

// ==========================================
// 3. UI COMPONENTS (Modular Sections)
// ==========================================

// --- Generic Toggle Component ---

// --- Section 1: Account ---
// const AccountSection = ({ data, onUpdate }: { data: AccountSettings, onUpdate: (d: AccountSettings) => void }) => (
//     <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
//         <div className="flex items-center gap-4">
//             <img src={data.avatarUrl} className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700" />
//             <div className="space-y-2">
//                 <button className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md font-medium hover:bg-gray-200 transition">Change Avatar</button>
//                 <p className="text-[10px] text-gray-400">Max size 2MB (JPG/PNG)</p>
//             </div>
//         </div>

//         <div className="grid gap-4 max-w-lg">
//             <div>
//                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Name</label>
//                 <input 
//                     type="text" 
//                     value={data.displayName} 
//                     onChange={(e) => onUpdate({ ...data, displayName: e.target.value })}
//                     className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
//                 />
//             </div>
            
//             <div>
//                 <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Mode</label>
//                 <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-md">
//                     <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
//                     <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{data.accountType} Plan</span>
//                     <span className="text-[10px] ml-auto bg-white dark:bg-black/20 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-300">Locked</span>
//                 </div>
//                 <p className="text-[10px] text-gray-400 mt-1">Contact support to upgrade to Team.</p>
//             </div>
//         </div>

//         <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
//             <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
//                 <Shield className="w-4 h-4" /> Security
//             </h3>
//             <Toggle 
//                 label="Two-Factor Authentication" 
//                 description="Secure your account with an authenticator app."
//                 checked={data.twoFactorEnabled}
//                 onChange={(v: boolean) => onUpdate({ ...data, twoFactorEnabled: v })}
//             />
//         </div>
//     </div>
// );

// --- Section 2: Personas (Complex List Logic) ---
const PersonaSection = ({ data, onUpdate }: { data: PersonaSettings, onUpdate: (d: PersonaSettings) => void }) => {
    const updatePersona = (id: string, field: string, value: any) => {
        const newPersonas = data.activePersonas.map(p => p.id === id ? { ...p, [field]: value } : p);
        onUpdate({ ...data, activePersonas: newPersonas });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-lg border border-blue-100 dark:border-blue-900">
                <div className="flex justify-between items-start">
                    <div>
                        <h4 className="text-sm font-bold text-blue-900 dark:text-blue-200">Persona System</h4>
                        <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                            Split your account into virtual "roles" to track capacity across different responsibilities.
                        </p>
                    </div>
                    <Users className="w-5 h-5 text-blue-500" />
                </div>
            </div>

            <Toggle 
                label="Enable Virtual Teammates"
                description="Treat personas as distinct rows in the Gantt chart."
                checked={data.enableVirtualTeammates}
                onChange={(v: boolean) => onUpdate({ ...data, enableVirtualTeammates: v })}
            />

            <div className="space-y-3">
                <div className="flex justify-between items-end mb-2">
                    <label className="text-xs font-bold text-gray-500 uppercase">Active Personas</label>
                    <button className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium">
                        <Plus className="w-3 h-3" /> Add Persona
                    </button>
                </div>

                {data.activePersonas.map(persona => (
                    <div key={persona.id} className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm flex flex-col md:flex-row gap-4 md:items-center">
                        {/* Color Indicator */}
                        <div className="w-8 h-8 rounded-full shrink-0" style={{ backgroundColor: persona.color }} />
                        
                        {/* Inputs */}
                        <div className="flex-1 grid grid-cols-2 gap-3">
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Name</label>
                                <input 
                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 text-sm focus:border-indigo-500 outline-none pb-1"
                                    value={persona.name}
                                    onChange={(e) => updatePersona(persona.id, 'name', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] text-gray-400 block mb-1">Role</label>
                                <input 
                                    className="w-full bg-transparent border-b border-gray-200 dark:border-gray-700 text-sm focus:border-indigo-500 outline-none pb-1"
                                    value={persona.role}
                                    onChange={(e) => updatePersona(persona.id, 'role', e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Capacity Slider */}
                        <div className="w-full md:w-32">
                             <label className="text-[10px] text-gray-400 block mb-1">Max Load: {persona.capacityLimit}%</label>
                             <input 
                                type="range" 
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                                min="10" max="100" 
                                value={persona.capacityLimit} 
                                onChange={(e) => updatePersona(persona.id, 'capacityLimit', parseInt(e.target.value))}
                            />
                        </div>

                        <button className="p-2 text-gray-400 hover:text-red-500 transition">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- Section 3: Envoy AI ---
const EnvoySection = ({ data, onUpdate }: { data: EnvoySettings, onUpdate: (d: EnvoySettings) => void }) => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="border-l-4 border-indigo-500 pl-4 py-1">
            <h3 className="text-lg font-bold">Envoy Configuration</h3>
            <p className="text-sm text-gray-500">Manage how the AI interacts with your tasks.</p>
        </div>

        <div className="space-y-0 divide-y divide-gray-100 dark:divide-gray-800">
            <Toggle 
                label="Proactive Suggestions" 
                description="Allow Envoy to offer optimizations on hover."
                checked={data.suggestionsEnabled}
                onChange={(v: boolean) => onUpdate({ ...data, suggestionsEnabled: v })}
            />
            <Toggle 
                label="Dependency Detection" 
                description="Automatically link tasks based on context and timeline overlap."
                checked={data.autoDetectDependencies}
                onChange={(v: boolean) => onUpdate({ ...data, autoDetectDependencies: v })}
            />
        </div>

        <div className="pt-4">
            <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">Intervention Sensitivity</label>
                <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded">{data.sensitivityLevel}/10</span>
            </div>
            <input 
                type="range" min="1" max="10" 
                value={data.sensitivityLevel}
                onChange={(e) => onUpdate({ ...data, sensitivityLevel: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <div className="flex justify-between text-[10px] text-gray-400 mt-2">
                <span>Conservative (Only Errors)</span>
                <span>Proactive (Optimizations)</span>
            </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Write Permissions</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(data.permissions).map(([key, val]) => (
                    <label key={key} className="flex items-center gap-3 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={val}
                            onChange={(e) => onUpdate({ ...data, permissions: { ...data.permissions, [key]: e.target.checked } })}
                            className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </label>
                ))}
            </div>
        </div>
    </div>
);


// 4. MAIN PAGE CONTROLLER


export default function SettingsPage() {
    // Default Page State
    const [activeTab, setActiveTab] = useState<'personas' | 'envoy' | 'visuals'>('personas');
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [loading, setLoading] = useState(true);
    const [syncState, setSyncState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    // Initial Fetch
    useEffect(() => {
        SettingsAPI.get().then(data => {
            setSettings(data);
            setLoading(false);
        });
    }, []);

    const handleUpdate = useCallback(async (section: keyof UserSettings, newData: any) => {
        if (!settings) return;
        
        const previousData = settings[section];
        
        setSettings(prev => prev ? ({ ...prev, [section]: newData }) : null);
        setSyncState('saving');

        try {
            // API Call
            await SettingsAPI.patch(section, newData);
            setSyncState('saved');
            setTimeout(() => setSyncState('idle'), 2000);
        } catch (err) {
            // Rollback on failure
            console.error(err);
            setSettings(prev => prev ? ({ ...prev, [section]: previousData }) : null);
            setSyncState('error');
        }
    }, [settings]);

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
            <RefreshCw className="w-6 h-6 animate-spin text-indigo-500" />
        </div>
    );

    if (!settings) return null;

    const tabs = [
        { id: 'personas', label: 'Persona System', icon: Users },
        { id: 'envoy', label: 'Envoy AI', icon: Bot },
        { id: 'visuals', label: 'Visualization', icon: Monitor },
    ] as const;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0A0E17] text-gray-900 dark:text-gray-100 flex flex-col md:flex-row">
            
            {/* SIDEBAR */}
            <aside className="w-full md:w-64 bg-white dark:bg-[#0F172A] border-r border-gray-200 dark:border-gray-800 flex-shrink-0 z-20">
                <div className="p-6">
                    <h1 className="text-xl font-bold tracking-tight mb-1">Settings</h1>
                    <p className="text-xs text-gray-500">TaskLinex v2.4 Control</p>
                </div>
                
                <nav className="px-3 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                                    isActive 
                                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' 
                                    : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
                                {tab.label}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-8 px-6">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Experimental</h4>
                    <button className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-800 dark:hover:text-gray-300 transition-colors">
                        <Beaker className="w-3 h-3" />
                        Feature Flags
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT */}
            <main className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto py-8 px-6 md:px-12">                    
                    <div className="flex justify-between items-center mb-8 border-b border-gray-200 dark:border-gray-800 pb-4">
                        <h2 className="text-2xl font-bold">
                            {tabs.find(t => t.id === activeTab)?.label}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-medium">
                            {syncState === 'saving' && <span className="text-gray-400 flex items-center gap-1"><RefreshCw className="w-3 h-3 animate-spin" /> Saving...</span>}
                            {syncState === 'saved' && <span className="text-emerald-500 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Saved</span>}
                            {syncState === 'error' && <span className="text-rose-500 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Failed to save</span>}
                        </div>
                    </div>

                    {/* Dynamic Content */}
                    <div className="min-h-[400px]">
                        {activeTab === 'personas' && (
                            <PersonaSection 
                                data={settings.personas} 
                                onUpdate={(d) => handleUpdate('personas', d)} 
                            />
                        )}
                        {activeTab === 'envoy' && (
                            <EnvoySection 
                                data={settings.envoy} 
                                onUpdate={(d) => handleUpdate('envoy', d)} 
                            />
                        )}
                        {activeTab === 'visuals' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                                <Toggle 
                                    label="Show Ghost Bars" 
                                    description="Visualize planned duration vs actual to identify slippage."
                                    checked={settings.visuals.showGhostBars}
                                    onChange={(v: boolean) => handleUpdate('visuals', { ...settings.visuals, showGhostBars: v })}
                                />
                                <div className="py-4 border-b border-gray-100 dark:border-gray-800">
                                    <h4 className="text-sm font-medium mb-2">Default Timeline Scale</h4>
                                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
                                        {['Week', 'Month', 'Quarter'].map((scale) => (
                                            <button 
                                                key={scale}
                                                onClick={() => handleUpdate('visuals', { ...settings.visuals, defaultTimelineScale: scale })}
                                                className={`px-3 py-1 text-xs rounded-md transition-all ${settings.visuals.defaultTimelineScale === scale ? 'bg-white dark:bg-gray-700 shadow-sm font-bold' : 'text-gray-500'}`}
                                            >
                                                {scale}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}