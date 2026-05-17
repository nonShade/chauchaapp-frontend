export type FormData = {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: Date;
  incomeType: string;
  incomeAmount: string;
  spentAmount: string;
  economicCategories: string[];
};
 
export type FormErrors = Partial<Record<keyof FormData, string>>;