import React from 'react';
import { AppShell } from '@/components/shell/AppShell';

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Mock user for now
    const mockUser = {
        name: "Rajesh Patil",
        avatarUrl: "/placeholder-avatar.jpg" // We don't have this yet, it will fallback
    };

    return (
        <AppShell user={mockUser}>
            {children}
        </AppShell>
    );
}
