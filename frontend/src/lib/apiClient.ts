import { supabase } from './supabaseClient';

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

async function authHeader(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function parseErrorBody(res: Response): Promise<{ message: string; code?: string }> {
  try {
    const body = await res.json();
    return { message: body.message ?? res.statusText, code: body.code };
  } catch {
    return { message: res.statusText };
  }
}

export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown; signal?: AbortSignal } = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(await authHeader()),
  };

  let body: BodyInit | undefined;
  if (options.body instanceof FormData) {
    body = options.body;
  } else if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
    body = JSON.stringify(options.body);
  }

  const res = await fetch(`/api${path}`, {
    method: options.method ?? 'GET',
    headers,
    body,
    signal: options.signal,
  });

  if (!res.ok) {
    const { message, code } = await parseErrorBody(res);
    throw new ApiError(res.status, message, code);
  }

  if (res.status === 204) return undefined as T;

  return (await res.json()) as T;
}

function extractFilename(res: Response, fallback: string): string {
  const disposition = res.headers.get('Content-Disposition');
  const match = disposition?.match(/filename="?([^"]+)"?/);
  return match?.[1] ?? fallback;
}

export async function apiDownload(
  path: string,
  suggestedFilename: string,
  options: { method?: string } = {},
): Promise<void> {
  const headers = await authHeader();
  const res = await fetch(`/api${path}`, { method: options.method ?? 'GET', headers });

  if (!res.ok) {
    const { message, code } = await parseErrorBody(res);
    throw new ApiError(res.status, message, code);
  }

  const blob = await res.blob();
  const filename = extractFilename(res, suggestedFilename);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
