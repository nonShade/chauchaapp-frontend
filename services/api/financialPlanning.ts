import apiClient from './apiClient';
import { FinancialPlanningResponse, FinancialPlanningTip } from '@/types/planningTypes';

export const getFinancialPlanningTips = async (): Promise<FinancialPlanningTip[]> => {
  const response = await apiClient.get<FinancialPlanningResponse>('/financial-planning');
  return response.data.financialPlanningTips || [];
};

export const generateFinancialPlanning = async (): Promise<void> => {
  await apiClient.post('/financial-planning/generate');
};
