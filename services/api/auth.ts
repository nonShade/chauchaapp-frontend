const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  first_name:        string;
  last_name:         string;
  email:             string;
  password:          string;
  birth_date:        string;
  income_type:       string;
  monthly_income:    number;
  monthly_expenses:  number;
  topics:            string[];
}

export interface LoginPayload {
  email:    string;
  password: string;
}

export interface AuthTokens {
  access_token:  string;
  refresh_token: string;
  user:          Record<string, unknown>;
}

export interface VerifyEmailResponse {
  exists:  boolean;
  message: string;
}

// ─── Helpers internos ─────────────────────────────────────────────────────────

function parseErrorDetail(data: any): string {
  if (Array.isArray(data?.detail)) {
    return data.detail
      .map((err: any) => `${err.loc?.join(".")}: ${err.msg}`)
      .join("\n");
  }
  if (typeof data?.detail === "string") return data.detail;
  return JSON.stringify(data, null, 2);
}

// ─── Registro ─────────────────────────────────────────────────────────────────

export async function registerUser(payload: RegisterPayload): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/auth/register`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(parseErrorDetail(data) || "Error en registro");
  }
}

// ─── Login ────────────────────────────────────────────────────────────────────

export async function loginUser(payload: LoginPayload): Promise<AuthTokens> {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify(payload),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(parseErrorDetail(data) || "Error al iniciar sesión");
  }

  return data as AuthTokens;
}

// ─── Verificación de email ────────────────────────────────────────────────────

export async function verifyEmail(email: string): Promise<VerifyEmailResponse> {
  const res = await fetch(`${API_BASE_URL}/auth/verify-email`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ email }),
  });

  if (!res.ok) {
    throw new Error(`verify-email HTTP ${res.status}`);
  }

  return res.json() as Promise<VerifyEmailResponse>;
}