import { api } from './api';

let cachedFarmId: string | null = null;

/**
 * Get the current user's farm ID.
 * For single-farm support, fetches the first farm and caches it.
 */
export async function getFarmId(): Promise<string> {
    if (cachedFarmId) {
        return cachedFarmId;
    }

    const response = await api.get('/farms');
    const farms = response.data;

    if (!farms || farms.length === 0) {
        throw new Error('No farms found for this user');
    }

    cachedFarmId = farms[0].id;
    return cachedFarmId!;
}

/**
 * Clear the cached farm ID (e.g., on logout)
 */
export function clearFarmCache() {
    cachedFarmId = null;
}
