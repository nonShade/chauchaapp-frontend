import { FormData } from "@/types/registerForm";

// ─── Constantes de edad ───────────────────────────────────────────────────────

export const MIN_AGE = 18;
export const MAX_AGE = 50;

export const buildAgeDate = (yearsAgo: number): Date => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - yearsAgo);
  return d;
};

// ─── Regex ────────────────────────────────────────────────────────────────────

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const NAME_REGEX  = /^[\p{L}\s]+$/u;

// ─── Orden de prioridad de errores mostrados en el banner ─────────────────────

export const ERROR_PRIORITY: (keyof FormData)[] = [
  "nombre",
  "apellido",
  "email",
  "password",
  "confirmPassword",
  "birthDate",
  "incomeType",
  "incomeAmount",
  "spentAmount",
  "economicCategories",
];

// ─── Validación de un campo individual ───────────────────────────────────────
// Devuelve el mensaje de error, o "" si es válido.

export function validateFormField(
  field:    keyof FormData,
  value:    any,
  formData: FormData
): string {
  switch (field) {
    case "nombre":
      if (!value.trim())          return "El nombre es obligatorio";
      if (!NAME_REGEX.test(value)) return "El nombre no puede contener caracteres especiales o numéricos";
      return "";

    case "apellido":
      if (!value.trim())          return "El apellido es obligatorio";
      if (!NAME_REGEX.test(value)) return "El apellido no puede contener caracteres especiales o numéricos";
      return "";

    case "email":
      if (!value.trim())             return "El correo es obligatorio";
      if (!EMAIL_REGEX.test(value))  return "El correo es inválido";
      return "";

    case "password":
      if (!value.trim())    return "La contraseña es obligatoria";
      if (value.length < 6) return "La contraseña debe tener mínimo 6 caracteres";
      return "";

    case "confirmPassword":
      if (!value.trim())                  return "Se debe confirmar la contraseña";
      if (value !== formData.password)    return "Las contraseñas deben coincidir";
      return "";

    case "incomeType":
      if (!value) return "Selecciona un tipo de ingreso";
      return "";

    case "incomeAmount": {
      const num = Number(value);
      if (!value.trim())  return "El ingreso es obligatorio";
      if (isNaN(num))     return "Debe ser un número válido";
      if (num <= 0)       return "El ingreso debe ser mayor a 0";
      if (num <= 5000)    return "El ingreso no puede ser tan bajo";
      return "";
    }

    case "spentAmount": {
      const num = Number(value);
      if (!value.trim()) return "Los gastos son obligatorios";
      if (isNaN(num))    return "Debe ser un número válido";
      if (num < 0)       return "Los gastos no pueden ser negativos";
      return "";
    }

    case "economicCategories":
      if (value.length === 0) return "Selecciona al menos una categoría";
      return "";

    default:
      return "";
  }
}

// ─── Títulos y subtítulos por paso ────────────────────────────────────────────

export const STEP_TITLES: Record<number, string> = {
  1: "Crea tu cuenta",
  2: "Tu situación financiera",
  3: "¿Qué noticias te interesan?",
};

export const STEP_SUBTITLES: Record<number, string> = {
  1: "Datos básicos para acceder a la app.",
  2: "La IA usa esto para personalizar tus reportes.",
  3: "Recibirás noticias relevantes según tus intereses.",
};