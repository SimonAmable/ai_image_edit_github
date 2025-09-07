/**
 * API Client with automatic 401 handling
 * Redirects to login page when receiving 401 Unauthorized responses
 */

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function apiRequest(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    console.log('API request returned 401, redirecting to login...')
    window.location.href = '/login'
    throw new ApiError('Unauthorized', 401)
  }

  return response
}

export async function apiRequestJson<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const response = await apiRequest(url, options)

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    )
  }

  return response.json()
}

// Convenience methods for common HTTP verbs
export const api = {
  get: <T = any>(url: string, options?: RequestInit) =>
    apiRequestJson<T>(url, { ...options, method: 'GET' }),
  
  post: <T = any>(url: string, data?: any, options?: RequestInit) =>
    apiRequestJson<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = any>(url: string, data?: any, options?: RequestInit) =>
    apiRequestJson<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = any>(url: string, options?: RequestInit) =>
    apiRequestJson<T>(url, { ...options, method: 'DELETE' }),
}

// For file uploads (FormData)
export async function apiUpload(
  url: string,
  formData: FormData,
  options: RequestInit = {}
): Promise<any> {
  const response = await fetch(url, {
    ...options,
    method: 'POST',
    body: formData,
  })

  // Handle 401 Unauthorized - redirect to login
  if (response.status === 401) {
    console.log('Upload request returned 401, redirecting to login...')
    window.location.href = '/login'
    throw new ApiError('Unauthorized', 401)
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    throw new ApiError(
      errorData.error || `HTTP ${response.status}`,
      response.status,
      errorData
    )
  }

  return response.json()
}