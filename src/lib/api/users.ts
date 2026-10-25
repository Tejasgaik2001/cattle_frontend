import { api } from '../api';

export interface User {
    id: string;
    email: string;
    name: string;
    phone: string | null;
    globalRole: 'super_admin' | 'admin' | 'sub_admin' | 'worker';
    isActive: boolean;
    createdAt: string;
}

export const usersApi = {
    async getAll(): Promise<User[]> {
        const response = await api.get('/users');
        console.log("responsegetAll",response);
        return response.data;
    },

    async getMe(): Promise<User> {
        const response = await api.get('/users/me');
        return response.data;
    },

    async create(data: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        globalRole?: string;
    }): Promise<User> {
        const response = await api.post('/users', data);
        return response.data;
    },

    async updateRole(id: string, data: { globalRole: string; isActive?: boolean }): Promise<User> {
        const response = await api.patch(`/users/${id}/role`, data);
        return response.data;
    },

    async delete(id: string): Promise<void> {
        await api.delete(`/users/${id}`);
    }
};
