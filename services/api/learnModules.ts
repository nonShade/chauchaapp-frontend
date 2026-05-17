import { LearnModule, LearnModuleDetailResponse } from '@/types/modulesTypes';
import apiClient from './apiClient';

export const getLearnModules = async (): Promise<LearnModule[]> => {
    const response = await apiClient.get('/education/modules');
    return response.data.modules || [];
};

export const getLearnModuleDetail = async (moduleId: string): Promise<LearnModuleDetailResponse> => {
    const response = await apiClient.get(`/education/modules/${moduleId}`);
    return response.data;
}