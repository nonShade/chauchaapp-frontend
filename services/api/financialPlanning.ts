import apiClient from './apiClient';
import { FinancialPlanningResponse, FinancialPlanningTip } from '@/types/planningTypes';
import { AsyncTaskResponse, TaskStatusResponse, waitForTask } from './asyncTask';

export const getFinancialPlanningTips = async (): Promise<FinancialPlanningTip[]> => {
  const response = await apiClient.get<FinancialPlanningResponse>('/financial-planning');
  return response.data.financialPlanningTips || [];
};

async function triggerFinancialPlanningGeneration(): Promise<AsyncTaskResponse> {
  const response = await apiClient.post<AsyncTaskResponse>('/financial-planning/generate');
  return response.data;
}

async function getPlanningTaskStatus(taskId: string): Promise<TaskStatusResponse<FinancialPlanningResponse>> {
  const response = await apiClient.get<TaskStatusResponse<FinancialPlanningResponse>>(
    `/financial-planning/tasks/${taskId}`,
  );
  return response.data;
}

export const generateAndWaitForFinancialPlanning = async (): Promise<FinancialPlanningTip[]> => {
  const { task_id } = await triggerFinancialPlanningGeneration();
  const result = await waitForTask<FinancialPlanningResponse>(
    task_id,
    (id) => `/financial-planning/tasks/${id}`,
  );
  return result.financialPlanningTips ?? [];
};
