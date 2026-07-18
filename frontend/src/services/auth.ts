import { api, setAccessToken } from '../lib/api'

export interface User {
  id: string
  email: string
  full_name: string | null
  is_active: boolean
  created_at: string
}

interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

function storeTokens(res: TokenResponse) {
  setAccessToken(res.access_token)
  localStorage.setItem('refresh_token', res.refresh_token)
}

export async function register(
  email: string,
  password: string,
  fullName?: string,
): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>('/auth/register', {
    email,
    password,
    full_name: fullName || null,
  })
  storeTokens(res)
  return res
}

export async function login(
  email: string,
  password: string,
): Promise<TokenResponse> {
  const res = await api.post<TokenResponse>('/auth/login', {
    email,
    password,
  })
  storeTokens(res)
  return res
}

export async function getMe(): Promise<User> {
  return api.get<User>('/auth/me')
}
