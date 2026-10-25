import { api } from '../api';
import { getFarmId } from '../farm';

export interface CreateMilkRecordDto {
    cowId?: string;
    date: string; // YYYY-MM-DD
    milkingTime: 'AM' | 'PM';
    amount: number;
    isBulk?: boolean;
    notes?: string;
    pricePerLiter?: number;
}


export interface BulkMilkRecordDto {
    records: CreateMilkRecordDto[];
}


export interface UpdateMilkRecordDto {
    amount?: number;
    pricePerLiter?: number;
    dairyAmount?: number;
    dairyPricePerLiter?: number;
    dairyFat?: number;
    dairySnf?: number;
    isReconciled?: boolean;
    notes?: string;
}

export const milkRecordsApi = {
    /**
     * Create a single milk record
     */
    async createMilkRecord(data: CreateMilkRecordDto) {
        const response = await api.post(`/milk-records`, data);
        return response.data;
    },

    /**
     * Create multiple milk records at once (bulk entry)
     */
    async createBulkMilkRecords(data: BulkMilkRecordDto) {
        const response = await api.post(`/milk-records/bulk`, data);
        return response.data;
    },

    /**
     * Update a milk record (for reconciliation)
     */
    async updateMilkRecord(id: string, data: UpdateMilkRecordDto) {
        const response = await api.patch(`/milk-records/${id}`, data);
        return response.data;
    },

    /**
     * Get today's milk production stats
     */
    async getTodayStats() {
        const response = await api.get(`/milk-records/today`);
        return response.data;
    },

    /**
     * Get milk records with optional filters
     */
    async getMilkRecords(params?: { cowId?: string; startDate?: string; endDate?: string; isBulk?: boolean }) {
        const response = await api.get(`/milk-records`, { params });
        return response.data;
    },
};

