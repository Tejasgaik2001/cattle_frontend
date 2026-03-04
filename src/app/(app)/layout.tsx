"use client"

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/shell/AppShell';
import { clearFarmCache } from '@/lib/farm';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [user, setUser] = useState<{ name: string; avatarUrl?: string } | null>(null);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const token = localStorage.getItem('accessToken');

        if (!token || !storedUser) {
            router.replace('/login');
            return;
        }

        try {
            const parsed = JSON.parse(storedUser);
            setUser({
                name: parsed.name || parsed.email || 'User',
                avatarUrl: parsed.avatarUrl,
            });
        } catch {
            router.replace('/login');
            return;
        }

        setIsChecking(false);
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        clearFarmCache();
        router.replace('/login');
    };

    if (isChecking && !user) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <AppShell user={user || { name: 'User' }} onLogout={handleLogout}>
            {children}
        </AppShell>
    );
}
