// src/components/shell/MainNav.tsx
import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

// We need to define LucideIcon type or use React.ElementType
interface NavItem {
    label: string;
    href: string;
    isActive?: boolean;
    icon?: React.ElementType;
}

interface MainNavProps {
    navigationItems: NavItem[];
    isMobile?: boolean;
    onNavigate?: (href: string) => void;
}

export function MainNav({ navigationItems, isMobile = false, onNavigate }: MainNavProps) {
    const handleNavigationClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
        // If onNavigate is provided, we might want to prevent default next/link behavior
        // but usually next/link handles it. 
        // If onNavigate is purely for side effects (like closing mobile menu), we can call it.
        if (onNavigate) {
            onNavigate(href);
        }
    };

    return (
        <>
            {/* Desktop Sidebar Navigation */}
            {!isMobile && (
                <nav className="flex flex-col space-y-1 font-sans text-sm">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleNavigationClick(e, item.href)}
                            className={cn(
                                "flex items-center px-4 py-2 rounded-md transition-colors",
                                item.isActive
                                    ? "bg-emerald-600 text-white shadow-md"
                                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                            )}>
                            {item.icon && <item.icon className="mr-3 h-5 w-5" />}
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            )}

            {/* Mobile Bottom Tab Navigation */}
            {isMobile && (
                <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shadow-lg flex justify-around items-center h-16 font-sans text-xs">
                    {navigationItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={(e) => handleNavigationClick(e, item.href)}
                            className={cn(
                                "flex flex-col items-center justify-center flex-grow py-1 space-y-1",
                                item.isActive
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-600 dark:text-slate-400"
                            )}>
                            {item.icon && <item.icon className="h-5 w-5" />}
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    ))}
                </nav>
            )}
        </>
    );
}
