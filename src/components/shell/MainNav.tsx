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
        if (onNavigate) {
            onNavigate(href);
        }
    };

    return (
        <nav className="flex flex-col space-y-1 font-sans text-sm">
            {navigationItems.map((item) => (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={(e) => handleNavigationClick(e, item.href)}
                    className={cn(
                        "flex items-center px-4 py-2.5 rounded-lg transition-colors text-sm font-medium",
                        item.isActive
                            ? "bg-emerald-600 text-white shadow-sm font-semibold"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                    )}>
                    {item.icon && <item.icon className="mr-3 h-5 w-5 shrink-0" />}
                    <span className="truncate">{item.label}</span>
                </Link>
            ))}
        </nav>
    );
}
