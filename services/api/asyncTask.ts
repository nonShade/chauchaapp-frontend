import apiClient from './apiClient';

export interface AsyncTaskResponse {
  task_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface TaskStatusResponse<T = unknown> {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: T;
  error?: string;
}

export const POLL_INTERVAL = 3000;

export async function waitForTask<T>(
  taskId: string,
  statusUrlFn: (taskId: string) => string,
  interval: number = POLL_INTERVAL,
  customBaseUrl?: string,
): Promise<T> {
  while (true) {
    let data: TaskStatusResponse<T>;
    if (customBaseUrl) {
      const response = await fetch(`${customBaseUrl}${statusUrlFn(taskId)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      data = await response.json();
    } else {
      const response = await apiClient.get<TaskStatusResponse<T>>(
        statusUrlFn(taskId),
      );
      data = response.data;
    }

    if (data.status === 'completed') {
      return data.result as T;
    }
    if (data.status === 'failed') {
      throw new Error(data.error || 'La tarea falló');
    }

    await new Promise((resolve) => setTimeout(resolve, interval));
  }
}
