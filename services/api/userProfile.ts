const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

export interface IncomeTypeOption {
  id: string;
  name: string;
}

export interface TopicOption {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  income_type_id: string;
  monthly_income: string;
  monthly_expenses: string;
  topics: string[];
}

export interface UpdateUserProfilePayload {
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  income_type_id: string;
  monthly_income: number;
  monthly_expenses: number;
  topics: string[];
}

export const getUserProfile = async (token: string): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: UserProfile = await response.json();
    return data;
  } catch (error) {
    console.error('Error al obtener el perfil del usuario:', error);
    return null;
  }
};

export const getIncomeTypes = async (): Promise<IncomeTypeOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/transactions/income-types`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener tipos de ingreso:', error);
    return [];
  }
};

export const getNewsTopics = async (): Promise<TopicOption[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/news/topics`);

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error al obtener topics de noticias:', error);
    return [];
  }
};

// Logout: POST /auth/logout — invalida el token (blacklist)
export const logoutUser = async (token: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error(`Logout failed: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error en logout:', error);
    return false;
  }
};

export const updateUserProfile = async (
  token: string,
  payload: UpdateUserProfilePayload,
): Promise<UserProfile | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/users/profile`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    const data: UserProfile = await response.json();
    return data;
  } catch (error) {
    console.error('Error al actualizar el perfil del usuario:', error);
    return null;
  }
};

// Función para calcular la edad a partir de la fecha de nacimiento
export const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Función para formatear el ingreso mensual
export const formatCLP = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('de-DE', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
};
