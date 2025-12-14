// components/Sidebar.tsx - UPDATED

"use client";


// Import Sun/Moon icons for better visual representation of the switch
import { Home, Settings, ChevronLeft, LayoutDashboard, BarChart3, Sun, Moon } from 'lucide-react';
import Link from 'next/link';
import { useLayout } from './LayoutContext'; // Use shared context

const navItems = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    // 1. Destructure the dark mode state and toggle from context
    const { isExpanded, toggleSidebar, isDarkMode, toggleDarkMode } = useLayout();
    
    // (Removed: const [isdarkmode, setdarkmode] = useState(false);)
    // (Removed: const togglemode = () => { ... })

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
                <h1 className={`text-xl font-bold text-indigo-600 dark:text-indigo-400 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0'} transition-opacity duration-300 overflow-hidden`}>
                    TaskLinex
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
            
            {/* Dark Mode Switch Button */}
            <div className='mb-6'>
                <button 
                    // 2. Use toggleDarkMode from context
                    onClick={toggleDarkMode}
                    className={`flex items-center w-full py-2 px-3 rounded-xl font-medium transition-colors duration-200 
                    ${isDarkMode 
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                        : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`} 
                    id='modeswitch' 
                >
                    {isDarkMode 
                        ? <Moon size={20} className='mr-3 flex-shrink-0' /> 
                        : <Sun size={20} className='mr-3 flex-shrink-0' />
                    }
                    {isExpanded && <span>Switch to {isDarkMode ? 'Light' : 'Dark'}</span>}
                </button>
            </div>

            {/* 2. Navigation Links */}
            <nav className="flex-1 space-y-2">
                {navItems.map((item) => (
                    <Link
                        key={item.name}
                        href={item.href}
                        // 3. Styles updated to use dark: prefix
                        className={`flex items-center text-gray-700 dark:text-gray-300 hover:bg-indigo-50 dark:hover:bg-gray-700 hover:text-indigo-600 dark:hover:text-white rounded-lg py-3 px-3 transition-all duration-300 group ${isExpanded ? 'justify-start' : 'justify-center'}`}
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
            </nav>
        </aside>
    );
}