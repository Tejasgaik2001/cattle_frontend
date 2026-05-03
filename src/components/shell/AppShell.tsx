// src/components/shell/AppShell.tsx
"use client"

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainNav } from './MainNav';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '../theme/theme-toggle';
import { LayoutDashboard, UsersRound, HeartPulse, Landmark, BarChart, Wallet } from 'lucide-react';

interface AppShellProps {
    children: React.ReactNode;
    user?: { name: string; avatarUrl?: string };
    onLogout?: () => void;
}

export function AppShell({ children, user, onLogout }: AppShellProps) {
    const pathname = usePathname();
    const router = useRouter();

    const handleNavigate = (path: string) => {
        router.push(path);
    };

    const navigationItems = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Herd', href: '/herd-management', icon: UsersRound },
        { label: 'Financials', href: '/financials', icon: Wallet },
        { label: 'Health', href: '/health-breeding', icon: HeartPulse },
        { label: 'Production', href: '/production-finance', icon: Landmark },
        { label: 'Reports', href: '/reports-analytics', icon: BarChart },
    ];


    // Augment navigation items with isActive based on current path
    const fullNavigationItems = navigationItems.map(item => ({
        ...item,
        isActive: pathname === item.href || pathname.startsWith(`${item.href}/`),
    }));

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 transition-colors duration-300">
            {/* Desktop Sidebar */}
            <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 p-4 shadow-sm fixed inset-y-0">
                <div className="flex items-center justify-center h-16 border-b border-slate-200 dark:border-slate-800 mb-6 font-sans">
                    <h1 className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">MyCowFarm</h1>
                </div>
                <div className="flex-1 overflow-y-auto">
                    <MainNav navigationItems={fullNavigationItems} onNavigate={handleNavigate} />
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                    <div className="flex-1 overflow-hidden">
                        <UserMenu user={user} onLogout={onLogout} onNavigate={handleNavigate} />
                    </div>
                    <ThemeToggle />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                {/* Mobile Header (top-right user menu) */}
                <header className="md:hidden flex items-center justify-between h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 shadow-sm sticky top-0 z-40">
                    <h1 className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">MyCowFarm</h1>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserMenu user={user} isMobile={true} onLogout={onLogout} onNavigate={handleNavigate} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-20 md:pb-8">
                    {children}
                </main>

                {/* Mobile Bottom Navigation */}
                <div className="md:hidden">
                    <MainNav navigationItems={fullNavigationItems} isMobile={true} onNavigate={handleNavigate} />
                </div>
            </div>
        </div>
    );
}
