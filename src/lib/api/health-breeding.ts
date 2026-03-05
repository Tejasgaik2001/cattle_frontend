import { api } from '../api';

// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface HealthBreedingOverview {
    cowsUnderTreatment: number;
    pregnantCows: number;
    healthIssuesLast7Days: number;
    vaccinationsDueOverdueCount: number;
}

export interface HealthBreedingTask {
    id: string;
    cowId: string;
    cowTagId: string;
    cowName: string | null;
    taskType: 'VACCINATION_DUE' | 'HEALTH_FOLLOWUP' | 'PREGNANCY_CHECK' | 'CALVING_EXPECTED' | 'BREEDING_RECOMMENDATION';
    dueDate: string;
    urgency: 'high' | 'medium' | 'low';
    message: string;
}

export interface CowHealthBreedingRow {
    id: string;
    tagId: string;
    name: string | null;
    healthStatus: 'Healthy' | 'Under Treatment' | 'Pregnant' | 'Dry';
    lastHealthEventDate: string | null;
    lastHealthEventDescription: string | null;
    lastBreedingEventDate: string | null;
    lastBreedingEventType: string | null;
    expectedCalvingDate: string | null;
}

export interface CowEventHistoryItem {
    id: string;
    type: string;
    date: string;
    description: string;
    metadata: Record<string, any> | null;
}

export interface CowHistory {
    health: CowEventHistoryItem[];
    breeding: CowEventHistoryItem[];
    vaccination: CowEventHistoryItem[];
}

export interface CreateHealthRecordPayload {
    cowId: string;
    issue: string;
    treatmentType?: string;
    medication?: string;
    withdrawalDays?: number;
    vetName?: string;
    notes?: string;
    treatmentDate: string;
}

export interface CreateBreedingEventPayload {
    cowId: string;
    eventType: 'heat' | 'insemination' | 'pregnancy_confirmed';
    inseminationDate?: string;
    bullId?: string;
    technicianName?: string;
    notes?: string;
}

export interface CreateVaccinationRecordPayload {
    cowId: string;
    vaccineName: string;
    vaccinationDate: string;
    nextDueDate?: string;
    notes?: string;
}

// ─── API Client ─────────────────────────────────────────────────────────────

export const healthBreedingApi = {
    async getOverview(): Promise<HealthBreedingOverview> {
        const response = await api.get(`/health-breeding/overview`);
        return response.data;
    },

    async getTasks(): Promise<HealthBreedingTask[]> {
        const response = await api.get(`/health-breeding/tasks`);
        return response.data;
    },

    async getCowList(): Promise<CowHealthBreedingRow[]> {
        const response = await api.get(`/health-breeding/cow-list`);
        return response.data;
    },

    async getCowHistory(cowId: string): Promise<CowHistory> {
        const response = await api.get(`/health-breeding/cows/${cowId}/history`);
        return response.data;
    },

    async createHealthRecord(payload: CreateHealthRecordPayload): Promise<void> {
        await api.post(`/health-breeding/health-records`, payload);
    },

    async createBreedingEvent(payload: CreateBreedingEventPayload): Promise<void> {
        await api.post(`/health-breeding/breeding-events`, payload);
    },

    async createVaccinationRecord(payload: CreateVaccinationRecordPayload): Promise<void> {
        await api.post(`/health-breeding/vaccination-records`, payload);
    },
};
