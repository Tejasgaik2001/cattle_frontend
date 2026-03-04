import { api } from '../api';
import { getFarmId } from '../farm';

export interface CreateMilkRecordDto {
    cowId: string;
    date: string; // YYYY-MM-DD
    milkingTime: 'AM' | 'PM';
    amount: number;
}

export interface BulkMilkRecordDto {
    records: CreateMilkRecordDto[];
}

export const milkRecordsApi = {
    /**
     * Create a single milk record
     */
    async createMilkRecord(data: CreateMilkRecordDto) {
        const farmId = await getFarmId();
        const response = await api.post(`/farms/${farmId}/milk-records`, data);
        return response.data;
    },

    /**
     * Create multiple milk records at once (bulk entry)
     */
    async createBulkMilkRecords(data: BulkMilkRecordDto) {
        const farmId = await getFarmId();
        const response = await api.post(`/farms/${farmId}/milk-records/bulk`, data);
        return response.data;
    },

    /**
     * Get today's milk production stats
     */
    async getTodayStats() {
        const farmId = await getFarmId();
        const response = await api.get(`/farms/${farmId}/milk-records/today`);
        return response.data;
    },

    /**
     * Get milk records with optional filters
     */
    async getMilkRecords(params?: { cowId?: string; startDate?: string; endDate?: string }) {
        const farmId = await getFarmId();
        const response = await api.get(`/farms/${farmId}/milk-records`, { params });
        return response.data;
    },
};
