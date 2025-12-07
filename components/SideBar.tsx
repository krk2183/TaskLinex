// components/Sidebar.tsx

"use client";

import { useLayout } from './LayoutContext';
import { Settings, ChevronLeft, LayoutDashboard, BarChart3 } from 'lucide-react';
import Link from 'next/link';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const { isExpanded, toggleSidebar } = useLayout();

  // Dynamic Tailwind Classes based on state
  const sidebarWidth = isExpanded ? 'w-64' : 'w-20';
  const transitionClass = 'transition-width duration-300 ease-in-out';

  return (
    <aside className={`bg-white shadow-xl ${sidebarWidth} ${transitionClass} flex flex-col p-4 flex-shrink-0`}>
      {/* 1. Header and Toggle Button */}
      <div className="flex justify-between items-center mb-8">
        <h1 className={`text-xl font-bold text-indigo-600 ${isExpanded ? 'opacity-100' : 'opacity-0 w-0 h-0'} transition-opacity duration-300 overflow-hidden`}>
          TaskLinex
        </h1>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 focus:outline-none"
        >
          <ChevronLeft
            size={24}
            className={`transition-transform duration-300 ${isExpanded ? 'rotate-0' : 'rotate-180'}`}
          />
        </button>
      </div>

      {/* 2. Navigation Links */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.name}
            href={item.href}
            // Dynamic classes to align text/icon and apply hover styles
            className={`flex items-center text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg py-3 px-3 transition-all duration-300 group ${isExpanded ? 'justify-start' : 'justify-center'}`}
          >
            <item.icon size={24} className="flex-shrink-0" />
            <span
              // Dynamic classes to smoothly hide the text
              className={`ml-3 whitespace-nowrap ${isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full absolute'} transition-all duration-300 overflow-hidden`}
            >
              {item.name}
            </span>
            {/* Tooltip for collapsed state (Visible on hover) */}
            {!isExpanded && (
                <span className="absolute left-full ml-4 py-1 px-3 bg-gray-800 text-white text-sm rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    {item.name}
                </span>
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
}