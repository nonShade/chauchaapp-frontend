const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

const stripApiVersion = (baseUrl: string) => baseUrl.replace(/\/v1\/?$/, '');

type BackgroundRequestOptions = {
  method?: string;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
  baseUrl?: string;
};

export async function runBackgroundRequest(
  path: string,
  options: BackgroundRequestOptions = {}
): Promise<void> {
  if (!API_BASE_URL) {
    console.warn('EXPO_PUBLIC_API_BASE_URL is not configured');
    return;
  }

  const baseUrl = options.baseUrl ?? API_BASE_URL;
  const resolvedBaseUrl = options.baseUrl ? stripApiVersion(baseUrl) : baseUrl;

  try {
    void fetch(`${resolvedBaseUrl}${path}`, {
      method: options.method ?? 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
        ...(options.headers ?? {}),
      },
      body:
        options.body === undefined ? undefined : JSON.stringify(options.body),
    }).catch((error) => {
      console.error(`Background request failed for ${path}:`, error);
    });
  } catch (error) {
    console.error(`Unable to start background request for ${path}:`, error);
  }
}