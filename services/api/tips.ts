import apiClient from './apiClient';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const getRootApiBaseUrl = () => {
  if (!API_BASE_URL) return null;
  return API_BASE_URL.replace(/\/v1\/?$/, '');
};

export interface DailyTip {
  daily_tip_id: string;
  title: string;
  text: string;
  category: string;
  day_of_week: number;
  generated_at: string;
  is_active: boolean;
}

export const tipsService = {
  async getTodayTip(): Promise<DailyTip | null> {
    try {
      const rootBaseUrl = getRootApiBaseUrl();

      if (!rootBaseUrl) {
        console.warn('EXPO_PUBLIC_API_BASE_URL is not configured');
        return null;
      }

      const response = await fetch(`${rootBaseUrl}/tips/today`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return (await response.json()) as DailyTip;
    } catch (error) {
      console.error('Error fetching today tip:', error);
      return null;
    }
  },
};