// components/Sidebar.tsx - UPDATED

"use client";


// Import Sun/Moon icons for better visual representation of the switch
import { Home, Settings, ChevronLeft, LayoutDashboard, BarChart3, Sun, Moon, BadgePlus, MapPinCheck } from 'lucide-react';
import Link from 'next/link';
import { useLayout } from './LayoutContext'; // Use shared context

const navItems = [
    { name: 'Pulse', href: '/', icon: BadgePlus },
    { name: 'Roadmap', href: '/roadmap', icon: MapPinCheck },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const { isExpanded, toggleSidebar } = useLayout();
    
    // Dynamic Tailwind Classes based on state
    const sidebarWidth = isExpanded ? 'w-64' : 'w-20';
    const transitionClass = 'transition-width duration-300 ease-in-out';
    
    // Use Tailwind's dark: prefix directly for styles
    const sidebarBg = 'bg-white dark:bg-gray-900'; 

    return (
        // Apply classes using Tailwind's dark: prefix
        <aside className={`${sidebarBg} shadow-xl ${sidebarWidth} ${transitionClass} flex flex-col p-4 flex-shrink-0 border-r border-gray-100 dark:border-gray-800`}>
            
            {/* 1. Header and Toggle Button */}
            <div className="flex justify-between items-center mb-8">
                <h1 className={`text-2xl font-bold text-gray-400 dark:text-white text-center ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0'} transition-opacity duration-300 overflow-hidden`}>
                    Task<span className='text-indigo-400 dark:text-indigo-500'>Linex</span>
                </h1>
                <button
                    onClick={toggleSidebar}
                    // Styles updated to use dark: prefix
                    className={`p-2 rounded-full focus:outline-none bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 text-indigo-600 dark:text-indigo-400`}
                >
                    <ChevronLeft
                        size={24}
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}
                    />
                </button>
            </div>
            
            {/* 2. Navigation Links */}
            <nav className="flex flex-col flex-1 mt-10">
                <div className='space-y-2'>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center relative overflow-hidden  text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white rounded-lg py-3 px-3 transition-all duration-300 group ${isExpanded ? 'justify-start' : 'justify-center'}`}
                        >
                            <item.icon size={24} className="flex-shrink-0" />
                            <span
                                className={`ml-3 whitespace-nowrap ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute'} transition-all duration-300 overflow-hidden`}
                            >
                                {item.name}
                            </span>
                            {/* Tooltip for collapsed state (Visible on hover) */}
                            {!isExpanded && (
                                <span className="absolute left-full ml-4 py-1 px-3 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                <div className="mt-auto mb-5 border-t border-gray-200 dark:border-slate-800 pt-4">
                    <div className={`flex items-center gap-3 ${isExpanded ? 'px-2' : 'justify-center'}`}>
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">JD</div>
                        <div className={`overflow-hidden transition-all duration-200 ${isExpanded ? "w-full" : "w-0"}`}>
                            <a href="/account" className="text-xs">
                                <div className="text-gray-800 dark:text-white font-medium whitespace-nowrap">John Doe</div>
                                <div className="text-slate-500 whitespace-nowrap">Workspace Admin</div>
                            </a>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
}