'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Users, UserPlus, Shield, ShieldAlert, Trash2, Edit, Loader2, Search, XIcon } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ConfirmationDialog } from '@/components/ui/confirmation-dialog';
import { Card, CardContent } from '@/components/ui/card';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
    
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

    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = filterStatus === 'all' ||
                (filterStatus === 'active' && user.isActive) ||
                (filterStatus === 'inactive' && !user.isActive);
            return matchesSearch && matchesStatus;
        });
    }, [users, searchTerm, filterStatus]);

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
        <div className="p-4 md:p-6 space-y-6">
            {/* Header and Add User Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h2>
                    {filterStatus !== 'all' && (
                        <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 flex items-center gap-1 py-1">
                            {filterStatus === 'active' ? 'Active Users' : 'Inactive Users'}
                            <button onClick={() => setFilterStatus('all')}>
                                <XIcon className="h-3 w-3 ml-1 hover:text-red-500" />
                            </button>
                        </Badge>
                    )}
                </div>
                {canManageUsers && (
                    <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                        <DialogTrigger asChild>
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
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
                                    <label htmlFor="name" className="text-sm font-medium text-slate-900 dark:text-slate-100">Name</label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="text-sm font-medium text-slate-900 dark:text-slate-100">Email</label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="password" className="text-sm font-medium text-slate-900 dark:text-slate-100">Password</label>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="text-sm font-medium text-slate-900 dark:text-slate-100">Phone (Optional)</label>
                                    <Input
                                        id="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="role" className="text-sm font-medium text-slate-900 dark:text-slate-100">Role</label>
                                    <select
                                        id="role"
                                        value={formData.globalRole}
                                        onChange={(e) => setFormData({ ...formData, globalRole: e.target.value as any })}
                                        className="mt-1 w-full h-9 rounded-md border border-input bg-white dark:bg-slate-800 px-3 py-1 text-sm shadow-sm"
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

            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 w-full bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                </div>
                <div className="flex gap-2">
                    <Button
                        variant={filterStatus === 'all' ? 'default' : 'outline'}
                        onClick={() => setFilterStatus('all')}
                        className={filterStatus === 'all' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    >
                        All
                    </Button>
                    <Button
                        variant={filterStatus === 'active' ? 'default' : 'outline'}
                        onClick={() => setFilterStatus('active')}
                        className={filterStatus === 'active' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    >
                        Active
                    </Button>
                    <Button
                        variant={filterStatus === 'inactive' ? 'default' : 'outline'}
                        onClick={() => setFilterStatus('inactive')}
                        className={filterStatus === 'inactive' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
                    >
                        Inactive
                    </Button>
                </div>
            </div>

            <div className="hidden md:block bg-white dark:bg-slate-800/50 rounded-lg shadow-sm overflow-hidden">
                <table className="w-full font-sans">
                    <thead>
                        <tr className="bg-slate-50 dark:bg-slate-900/60 border-b-slate-200 dark:border-b-slate-700">
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Created</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors">
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                                    <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Badge className={getRoleBadge(user.globalRole)}>
                                        <span className="flex items-center gap-1">
                                            {getRoleIcon(user.globalRole)}
                                            {user.globalRole.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </Badge>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap">
                                    <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                        {user.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                                    {new Date(user.createdAt).toLocaleDateString()}
                                </td>
                                <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
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

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
                {filteredUsers.map((user) => (
                    <Card
                        key={user.id}
                        className="bg-white dark:bg-slate-800/50 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{user.name}</h3>
                                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                    {user.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{user.email}</p>
                            <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400 mt-2">
                                <Badge className={getRoleBadge(user.globalRole)}>
                                    <span className="flex items-center gap-1">
                                        {getRoleIcon(user.globalRole)}
                                        {user.globalRole.replace('_', ' ').toUpperCase()}
                                    </span>
                                </Badge>
                                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-3">
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
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* No results message */}
            {filteredUsers.length === 0 && users.length > 0 && (
                <div className="text-center py-8">
                    <p className="text-slate-500 dark:text-slate-400">No users match your search criteria.</p>
                </div>
            )}

            <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
                <DialogContent className="bg-card border-border">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">Update User Role</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="edit-role" className="text-sm font-medium text-slate-900 dark:text-slate-100">Role</label>
                            <select
                                id="edit-role"
                                value={formData.globalRole}
                                onChange={(e) => setFormData({ ...formData, globalRole: e.target.value as any })}
                                className="mt-1 w-full h-9 rounded-md border border-input bg-white dark:bg-slate-800 px-3 py-1 text-sm shadow-sm"
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
