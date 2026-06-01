const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

type BackgroundRequestOptions = {
  method?: string;
  token?: string;
  body?: unknown;
  headers?: Record<string, string>;
  baseUrl?: string;
  stripApiVersion?: boolean;
};

export async function runBackgroundRequest(
  path: string,
  options: BackgroundRequestOptions = {}
): Promise<void> {
  const baseUrl = options.baseUrl ?? API_BASE_URL;

  if (!baseUrl) {
    console.warn('EXPO_PUBLIC_API_BASE_URL is not configured');
    return;
  }

  try {
    const resolvedBaseUrl = options.stripApiVersion
      ? baseUrl.replace(/\/v1\/?$/, '')
      : baseUrl;

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