export interface Tip {
  daily_tip_id: string;
  title: string;
  text: string;
  category: string;
  day_of_week: number;
  generated_at: string;
  is_active: boolean;
}

export interface AllTipsResponse {
    total_count: number;
    tips: Tip[];
    generated_at: string;
}

export const getTipOfTheDay = async (): Promise<Tip | null> => {
    const BASE = 'http://localhost:8001';
    try {
        const res = await fetch(`${BASE}/tips/today`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
            console.warn('getTipOfTheDay: non-ok response', res.status);
            return null;
        }
        const data = await res.json();
        // simple shape validation
        if (data && typeof data.daily_tip_id === 'string') {
            return data as Tip;
        }
        return null;
    } catch (error) {
        console.error('Error fetching tip of the day:', error);
        return null;
    }
};

export const getAllTips = async (): Promise<AllTipsResponse> => {
    const BASE = 'http://localhost:8001';
    try {
        const res = await fetch(`${BASE}/tips/all`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (!res.ok) {
            console.warn('getAllTips: non-ok response', res.status);
            // return an empty shape to keep callers safe
            return { total_count: 0, tips: [], generated_at: new Date().toISOString() };
        }
        const data = await res.json();
        // basic validation
        if (data && Array.isArray(data.tips)) {
            return data as AllTipsResponse;
        }
        return { total_count: 0, tips: [], generated_at: new Date().toISOString() };
    } catch (error) {
        console.error('Error fetching all tips:', error);
        return { total_count: 0, tips: [], generated_at: new Date().toISOString() };
    }
};