import { api } from '../api';
import type { MemberDue } from '@/app/(app)/financials/types';

export const reimbursementsApi = {
    /** 
     * Get all pending member dues (reimbursements or collections)
     */
    async getAllPending(): Promise<MemberDue[]> {
        const response = await api.get('/reimbursements');
        return response.data;
    },

    /**
     * Get pending dues grouped by person
     */
    async getPendingByPerson(): Promise<any[]> {
        const response = await api.get('/reimbursements/pending-by-person');
        return response.data;
    },

    /**
     * Mark a due entry as settled (PAID)
     */
    async markAsPaid(id: string, data: { paidDate: string; note?: string }): Promise<MemberDue> {
        const response = await api.patch(`/reimbursements/${id}/mark-paid`, data);
        return response.data;
    }
};
