'use client';

import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Shield, ShieldAlert, Trash2, Edit, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { api } from '@/lib/api';

interface User {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    globalRole: 'super_admin' | 'admin' | 'sub_admin' | 'worker';
    isActive: boolean;
    createdAt: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const [showEditDialog, setShowEditDialog] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [currentUserRole, setCurrentUserRole] = useState<string>('worker');
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        phone: '',
        globalRole: 'worker' as const,
    });

    useEffect(() => {
        fetchUsers();
        fetchCurrentUser();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCurrentUser = async () => {
        try {
            const response = await api.get('/users/me');
            setCurrentUserRole(response.data.globalRole);
        } catch (error) {
            console.error('Error fetching current user:', error);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreating(true);
        
        try {
            await api.post('/users', formData);
            toast.success('User created successfully');
            setShowCreateDialog(false);
            setFormData({ email: '', password: '', name: '', phone: '', globalRole: 'worker' });
            fetchUsers();
        } catch (error: any) {
            console.error('Error creating user:', error);
            toast.error(error.response?.data?.message || 'Failed to create user');
        } finally {
            setIsCreating(false);
        }
    };

    const handleUpdateRole = async () => {
        if (!selectedUser) return;
        setIsUpdating(true);
        
        try {
            await api.patch(`/users/${selectedUser.id}/role`, {
                globalRole: formData.globalRole,
                isActive: selectedUser.isActive,
            });
            toast.success('User role updated successfully');
            setShowEditDialog(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (error: any) {
            console.error('Error updating user role:', error);
            toast.error(error.response?.data?.message || 'Failed to update user role');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await api.delete(`/users/${userId}`);
            toast.success('User deleted successfully');
            fetchUsers();
        } catch (error: any) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        }
    };

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            super_admin: 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary',
            admin: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
            sub_admin: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
            worker: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
        };
        return colors[role] || colors.worker;
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'super_admin':
                return <ShieldAlert className="h-4 w-4" />;
            case 'admin':
                return <Shield className="h-4 w-4" />;
            default:
                return <Users className="h-4 w-4" />;
        }
    };

    const canManageUsers = currentUserRole === 'super_admin' || currentUserRole === 'admin';
    const canUpdateRoles = currentUserRole === 'super_admin';

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black tracking-tight text-foreground">
                        User Management
                    </h1>
                    <p className="text-muted-foreground font-medium mt-1">
                        Manage system users and their roles
                    </p>
                </div>
                {canManageUsers && (
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Add User
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card border-border">
                            <DialogHeader>
                                <DialogTitle className="text-foreground">Create New User</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleCreateUser} className="space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground">Name</label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">Email</label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">Password</label>
                                    <Input
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">Phone (Optional)</label>
                                    <Input
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground">Role</label>
                                    <select
                                        value={formData.globalRole}
                                        onChange={(e) => setFormData({ ...formData, globalRole: e.target.value as any })}
                                        className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                                    >
                                        <option value="worker">Worker</option>
                                        {currentUserRole === 'super_admin' && (
                                            <>
                                                <option value="sub_admin">Sub Admin</option>
                                                <option value="admin">Admin</option>
                                                <option value="super_admin">Super Admin</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowCreateDialog(false)}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isCreating}
                                        className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                    >
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                        Create User
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/50">
                            <tr>
                                <th className="text-left p-4 font-semibold text-foreground">User</th>
                                <th className="text-left p-4 font-semibold text-foreground">Role</th>
                                <th className="text-left p-4 font-semibold text-foreground">Status</th>
                                <th className="text-left p-4 font-semibold text-foreground">Created</th>
                                <th className="text-right p-4 font-semibold text-foreground">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((user) => (
                                <tr key={user.id} className="border-t border-border hover:bg-muted/30">
                                    <td className="p-4">
                                        <div>
                                            <div className="font-medium text-foreground">{user.name}</div>
                                            <div className="text-sm text-muted-foreground">{user.email}</div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <Badge className={getRoleBadge(user.globalRole)}>
                                            <span className="flex items-center gap-1">
                                                {getRoleIcon(user.globalRole)}
                                                {user.globalRole.replace('_', ' ').toUpperCase()}
                                            </span>
                                        </Badge>
                                    </td>
                                    <td className="p-4">
                                        <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                            {user.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </td>
                                    <td className="p-4 text-sm text-muted-foreground">
                                        {new Date(user.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-2">
                                            {canUpdateRoles && user.globalRole !== 'super_admin' && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setSelectedUser(user);
                                                        setFormData({ ...formData, globalRole: user.globalRole as any });
                                                        setShowEditDialog(true);
                                                    }}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canUpdateRoles && user.globalRole !== 'super_admin' && (
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon"
                                                    onClick={() => {
                                                        setUserToDelete(user.id);
                                                        setShowDeleteDialog(true);
                                                    }}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Update User Role</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Role</label>
                            <select
                                value={formData.globalRole}
                                onChange={(e) => setFormData({ ...formData, globalRole: e.target.value as any })}
                                className="mt-1 w-full h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                            >
                                <option value="worker">Worker</option>
                                <option value="sub_admin">Sub Admin</option>
                                <option value="admin">Admin</option>
                                <option value="super_admin">Super Admin</option>
                            </select>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <Button
                                variant="outline"
                                onClick={() => setShowEditDialog(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateRole}
                                disabled={isUpdating}
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                            >
                                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                                Update Role
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            <ConfirmationDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                title="Delete User"
                description="Are you sure you want to delete this user? This action cannot be undone."
                onConfirm={() => {
                    if (userToDelete) {
                        handleDeleteUser(userToDelete);
                    }
                }}
                variant="destructive"
            />
        </div>
    );
}
