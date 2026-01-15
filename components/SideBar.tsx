"use client";

import { Home, Settings, ChevronLeft, LayoutDashboard, BarChart3, Sun, Moon, BadgePlus, MapPinCheck } from 'lucide-react';
import Link from 'next/link';
import { useLayout } from './LayoutContext'; 
const navItems = [
    { name: 'Pulse', href: '/', icon: BadgePlus },
    { name: 'Roadmap', href: '/roadmap', icon: MapPinCheck },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const { isExpanded, toggleSidebar } = useLayout();
    
    const sidebarWidth = isExpanded ? 'md:w-64' : 'md:w-20';
    const transitionClass = 'transition-all duration-300 ease-in-out';    
    const sidebarBg = 'bg-white dark:bg-gray-900'; 

    return (
        <aside className={`${sidebarBg} shadow-xl w-full ${sidebarWidth} ${transitionClass} flex flex-row md:flex-col p-4 flex-shrink-0 border-b md:border-b-0 md:border-r border-gray-100 dark:border-gray-800 items-center md:items-stretch justify-between md:justify-start z-10`}>
            
            <div className="flex justify-between items-center mb-0 md:mb-8">
                <h1 className={`text-xl md:text-2xl font-bold text-gray-400 dark:text-white text-center ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0'} transition-opacity duration-300 overflow-hidden`}>
                    Task<span className='text-indigo-400 dark:text-indigo-500'>Linex</span>
                </h1>
                <button
                    onClick={toggleSidebar}
                    className={`hidden md:block p-2 rounded-full focus:outline-none bg-indigo-50 dark:bg-gray-700 hover:bg-indigo-100 dark:hover:bg-gray-600 text-indigo-600 dark:text-indigo-400`}
                >
                    <ChevronLeft
                        size={24}
                        className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}
                    />
                </button>
            </div>
            
            <nav className="flex flex-row md:flex-col flex-1 mt-0 md:mt-10 items-center md:items-stretch gap-4 md:gap-0 justify-end md:justify-start">
                <div className='flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2'>
                    {navItems.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center relative overflow-hidden  text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white rounded-lg py-2 px-2 md:py-3 md:px-3 transition-all duration-300 group ${isExpanded ? 'justify-start' : 'justify-center'}`}
                        >
                            <item.icon size={24} className="flex-shrink-0" />
                            <span
                                className={`hidden md:block ml-3 whitespace-nowrap ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute'} transition-all duration-300 overflow-hidden`}
                            >
                                {item.name}
                            </span>
                            {!isExpanded && (
                                <span className="hidden md:block absolute left-full ml-4 py-1 px-3 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                                    {item.name}
                                </span>
                            )}
                        </Link>
                    ))}
                </div>

                <div className="mt-0 md:mt-auto mb-0 md:mb-5 border-t-0 md:border-t border-gray-200 dark:border-slate-800 pt-0 md:pt-4 ml-4 md:ml-0">
                    <div className={`flex items-center gap-3 ${isExpanded ? 'px-2' : 'justify-center'}`}>
                        <Link href="/account" className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">JD</Link>
                        <div className={`hidden md:block overflow-hidden transition-all duration-200 ${isExpanded ? "w-full" : "w-0"}`}>
                            <Link href="/account" className="text-xs">
                                <div className="text-gray-800 dark:text-white font-medium whitespace-nowrap">John Doe</div>
                                <div className="text-slate-500 whitespace-nowrap">Workspace Admin</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>
        </aside>
    );
}