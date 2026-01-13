"use client";

import {User, Shield} from 'lucide-react';
import { useState } from 'react';

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


function AccountSection ({ data, onUpdate }: { data: AccountSettings, onUpdate: (d: AccountSettings) => void }) {
    return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
        <div className="flex items-center gap-4">
            <img src={data.avatarUrl} className="w-16 h-16 rounded-full border-2 border-gray-200 dark:border-gray-700" />
            <div className="space-y-2">
                <button className="text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-md font-medium hover:bg-gray-200 transition">Change Avatar</button>
                <p className="text-[10px] text-gray-400">Max size 2MB (JPG/PNG)</p>
            </div>
        </div>

        <div className="grid gap-4 max-w-lg">
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Display Name</label>
                <input 
                    type="text" 
                    value={data.displayName} 
                    onChange={(e) => onUpdate({ ...data, displayName: e.target.value })}
                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 outline-none" 
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Account Mode</label>
                <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-900 rounded-md">
                    <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span className="text-sm font-medium text-indigo-900 dark:text-indigo-200">{data.accountType} Plan</span>
                    <span className="text-[10px] ml-auto bg-white dark:bg-black/20 px-2 py-0.5 rounded text-indigo-600 dark:text-indigo-300">Locked</span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Contact support to upgrade to Team.</p>
            </div>
        </div>

        <div className="pt-6 border-t border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-4 h-4" /> Security
            </h3>
            <Toggle 
                label="Two-Factor Authentication" 
                description="Secure your account with an authenticator app."
                checked={data.twoFactorEnabled}
                onChange={(v: boolean) => onUpdate({ ...data, twoFactorEnabled: v })}
            />
        </div>
    </div>
    );
};

export default function AccountPage() {
    const [data, setData] = useState<AccountSettings>({
        displayName: 'John Doe',
        email: 'john@example.com',
        avatarUrl: 'https://i.pravatar.cc/150?u=1',
        accountType: 'Individual',
        language: 'en-US',
        twoFactorEnabled: false
    });

    return (
        <div className="p-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-8 text-slate-900 dark:text-white">Account</h1>
            <AccountSection data={data} onUpdate={setData} />
        </div>
    );
}