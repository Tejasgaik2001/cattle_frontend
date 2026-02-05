import { api } from '../api';

export interface CreateMilkRecordDto {
    cowId: string;
    date: string; // YYYY-MM-DD
    milkingTime: 'AM' | 'PM';
    amount: number;
}

export interface BulkMilkRecordDto {
    date: string; // YYYY-MM-DD
    records: {
        cowId: string;
        amAmount?: number;
        pmAmount?: number;
    }[];
}

export const milkRecordsApi = {
    /**
     * Create a single milk record
     */
    async createMilkRecord(data: CreateMilkRecordDto) {
        const response = await api.post('/milk-records', data);
        return response.data;
    },

    /**
     * Create multiple milk records at once (bulk entry)
     */
    async createBulkMilkRecords(data: BulkMilkRecordDto) {
        const response = await api.post('/milk-records/bulk', data);
        return response.data;
    },

    /**
     * Get today's milk production stats
     */
    async getTodayStats(farmId: string) {
        const response = await api.get(`/farms/${farmId}/milk-records/today-stats`);
        return response.data;
    },

    /**
     * Get milk records for a specific cow
     */
    async getCowMilkRecords(cowId: string, startDate?: string, endDate?: string) {
        const response = await api.get('/milk-records', {
            params: { cowId, startDate, endDate }
        });
        return response.data;
    }
};
