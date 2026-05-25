import apiClient from './apiClient';
import { FamilyGroupResponseDTO } from '../../types/group';

export const getFamilyGroup = async (): Promise<FamilyGroupResponseDTO | null> => {
  try {
    const response = await apiClient.get('/family-group');
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.status === 404) {
      return null;
    }
    throw error;
  }
};
