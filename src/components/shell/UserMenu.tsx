// src/components/shell/UserMenu.tsx
"use client"

import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { LogOut, Settings, HelpCircle } from 'lucide-react';

interface UserMenuProps {
    user?: { name: string; avatarUrl?: string };
    isMobile?: boolean;
    onLogout?: () => void;
    onNavigate?: (path: string) => void;
}

export function UserMenu({ user, isMobile = false, onLogout, onNavigate }: UserMenuProps) {
    const handleNavigation = (path: string) => {
        if (onNavigate) {
            onNavigate(path);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <div className={`flex items-center cursor-pointer ${isMobile ? 'h-8 w-8' : 'w-full px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors'}`}>
                    <Avatar className={isMobile ? 'h-8 w-8' : 'h-8 w-8 mr-2'}>
                        {user?.avatarUrl ? <AvatarImage src={user.avatarUrl} alt={user.name} /> : <AvatarFallback>{user?.name ? user.name.charAt(0).toUpperCase() : 'U'}</AvatarFallback>}
                    </Avatar>
                    {!isMobile && user?.name && (
                        <span className="font-sans text-sm font-medium text-slate-700 dark:text-slate-300 truncate">
                            {user.name}
                        </span>
                    )}
                </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isMobile ? 'end' : 'start'} className="w-56 font-sans">
                {user?.name && (
                    <>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                <p className="text-xs leading-none text-slate-500 dark:text-slate-400">
                                    {/* Optional: User email or role */}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                    </>
                )}
                <DropdownMenuItem onClick={() => handleNavigation('/settings')} className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleNavigation('/help')} className="cursor-pointer">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Help</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
