const API_BASE = '/api/v1'

let accessToken: string | null = null

export function setAccessToken(token: string | null) {
  accessToken = token
}

export function getAccessToken(): string | null {
  return accessToken
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  }

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json'
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(body.detail || `Request failed: ${res.status}`)
  }

  if (res.status === 204) return undefined as T

  return res.json()
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
  upload: <T>(path: string, file: File) => {
    const form = new FormData()
    form.append('file', file)
    return request<T>(path, { method: 'POST', body: form })
  },
  download: (path: string) => {
    const headers: Record<string, string> = {}
    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`
    }
    return fetch(`${API_BASE}${path}`, { headers })
  },
}
