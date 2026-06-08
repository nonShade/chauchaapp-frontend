import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { LearnModule, LearnModuleDetailResponse, ModuleProgress } from '@/types/modulesTypes';
import apiClient from './apiClient';

const parseJSON = (value: string | null): any | null => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const getUserIdFromStorage = async (): Promise<string | null> => {
  let userDataStr: string | null = null;

  if (typeof localStorage !== 'undefined') {
    userDataStr = localStorage.getItem('user');
  }

  if (!userDataStr) {
    try {
      userDataStr = await AsyncStorage.getItem('user');
    } catch (e) {
      console.warn('No se pudo leer user desde AsyncStorage:', e);
    }
  }

  if (!userDataStr) {
    try {
      userDataStr = await SecureStore.getItemAsync('user');
    } catch (e) {
      console.warn('No se pudo leer user desde SecureStore:', e);
    }
  }

  const user = parseJSON(userDataStr);
  if (!user) return null;
  return user.id || user.user_id || null;
};

export const getLearnModules = async (): Promise<LearnModule[]> => {
  const response = await apiClient.get('/education/modules');
  return response.data.modules || [];
};

export const generateLearnModules = async (): Promise<void> => {
  await apiClient.post('/education/modules/generate', {
    items: [
      { topic: 'tasas', level: 'Principiante' },
      { topic: 'creditos', level: 'Intermedio' },
      { topic: 'fondos mutuos', level: 'Avanzado' },
    ],
  });
};

export const getLearnModuleDetail = async (moduleId: string): Promise<LearnModuleDetailResponse> => {
  const userId = await getUserIdFromStorage();
  const response = await apiClient.get(`/education/modules/${moduleId}`, {
    params: userId ? { user_id: userId } : {},
  });
  return response.data;
};

export const startModuleProgress = async (moduleId: string): Promise<ModuleProgress> => {
  const userId = await getUserIdFromStorage();
  const response = await apiClient.post(
    `/education/modules/${moduleId}/progress/start`,
    {},
    {
      params: userId ? { user_id: userId } : {},
    },
  );
  return response.data;
};

export const completeModuleSection = async (moduleId: string, sectionId: string): Promise<void> => {
  const userId = await getUserIdFromStorage();
  await apiClient.patch(
    `/education/modules/${moduleId}/progress/sections`,
    { sectionId },
    {
      params: userId ? { user_id: userId } : {},
    },
  );
};

export const submitQuizAttempt = async (
  moduleId: string,
  score: number,
  correctAnswers: number,
  totalQuestions: number,
): Promise<void> => {
  const userId = await getUserIdFromStorage();
  await apiClient.post(
    `/education/modules/${moduleId}/quiz/attempts`,
    {
      score,
      correctAnswers,
      totalQuestions,
    },
    {
      params: userId ? { user_id: userId } : {},
    },
  );
};