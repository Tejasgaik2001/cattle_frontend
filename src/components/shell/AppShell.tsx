// src/components/shell/AppShell.tsx
"use client"

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { MainNav } from './MainNav';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '../theme/theme-toggle';
import { LayoutDashboard, UsersRound, HeartPulse, Landmark, BarChart, Wallet, Shield, GitFork, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AppShellProps {
    children: React.ReactNode;
    user?: { name: string; avatarUrl?: string };
    onLogout?: () => void;
}

export function AppShell({ children, user, onLogout }: AppShellProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Close mobile drawer on route change
    useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    // Close mobile drawer on Escape key and lock body scroll when open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isMobileMenuOpen]);

    const handleNavigate = (path: string) => {
        router.push(path);
        setIsMobileMenuOpen(false);
    };

    const navigationItems = [
        { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Herd', href: '/herd-management', icon: UsersRound },
        { label: 'Family Tree', href: '/herd-management/family-tree', icon: GitFork },
        { label: 'Financials', href: '/financials', icon: Wallet },
        { label: 'Health', href: '/health-breeding', icon: HeartPulse },
        { label: 'Production', href: '/production-finance', icon: Landmark },
        { label: 'Reports', href: '/reports-analytics', icon: BarChart },
        { label: 'Users', href: '/user-management', icon: Shield },
    ];

    // Augment navigation items with isActive based on current path
    const fullNavigationItems = navigationItems.map(item => {
        if (item.href === '/herd-management/family-tree') {
            return {
                ...item,
                isActive: pathname === '/herd-management/family-tree' || pathname.startsWith('/herd-management/family-tree/'),
            };
        }
        if (item.href === '/herd-management') {
            return {
                ...item,
                isActive: pathname === '/herd-management' || (pathname.startsWith('/herd-management/') && !pathname.startsWith('/herd-management/family-tree')),
            };
        }
        return {
            ...item,
            isActive: pathname === item.href || pathname.startsWith(`${item.href}/`),
        };
    });

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

            {/* Mobile Slide-over Drawer Backdrop */}
            <div
                className={cn(
                    "fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-50 md:hidden transition-opacity duration-300",
                    isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
                aria-hidden="true"
            />

            {/* Mobile Slide-over Drawer Navigation */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col p-4 shadow-2xl md:hidden transition-transform duration-300 ease-in-out",
                    isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
                )}
                aria-label="Mobile Navigation Drawer"
            >
                <div className="flex items-center justify-between h-14 border-b border-slate-200 dark:border-slate-800 mb-4 px-2">
                    <h1 className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">MyCowFarm</h1>
                    <button
                        type="button"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="p-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none transition-colors"
                        aria-label="Close menu"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto px-1">
                    <MainNav navigationItems={fullNavigationItems} onNavigate={handleNavigate} />
                </div>

                <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 px-1">
                    <div className="flex-1 overflow-hidden">
                        <UserMenu user={user} onLogout={onLogout} onNavigate={handleNavigate} />
                    </div>
                    <ThemeToggle />
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">
                {/* Mobile Header with Hamburger Toggle */}
                <header className="md:hidden flex items-center justify-between h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 shadow-sm sticky top-0 z-40">
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsMobileMenuOpen(prev => !prev)}
                            className="p-2 -ml-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
                            aria-label="Toggle navigation menu"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                        <h1 className="text-lg font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">MyCowFarm</h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <ThemeToggle />
                        <UserMenu user={user} isMobile={true} onLogout={onLogout} onNavigate={handleNavigate} />
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 md:p-8 pb-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
