import { api } from '../api';
import type { Loan, LoanPayment } from '@/app/(app)/financials/types';

export interface CreateLoanDto {
    lenderName: string;
    principalAmount: number;
    interestRate: number;
    startDate: string;
    type?: 'simple' | 'compound';
    notes?: string;
}

export interface CreateLoanPaymentDto {
    paymentDate: string;
    amountPaid: number;
    interestComponent?: number;
    principalComponent?: number;
    notes?: string;
}

export const loansApi = {
    async getAll(): Promise<Loan[]> {
        const response = await api.get('/loans');
        return response.data;
    },

    async getOne(loanId: string): Promise<Loan> {
        const response = await api.get(`/loans/${loanId}`);
        return response.data;
    },

    async getTotalOutstanding(): Promise<{ totalOutstanding: number }> {
        const response = await api.get('/loans/outstanding-total');
        return response.data;
    },

    async create(data: CreateLoanDto): Promise<Loan> {
        const response = await api.post('/loans', data);
        return response.data;
    },

    async addPayment(loanId: string, data: CreateLoanPaymentDto): Promise<LoanPayment> {
        const response = await api.post(`/loans/${loanId}/payments`, data);
        return response.data;
    },

    async updateStatus(loanId: string, status: 'active' | 'closed'): Promise<Loan> {
        const response = await api.patch(`/loans/${loanId}/status`, { status });
        return response.data;
    },
};
