const BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000'

let _token = null
let _anonToken = null
let _refreshPromise = null

export const tokenStore = {
  get: () => _token,
  set: (t) => { _token = t },
  clear: () => { _token = null },
}

export const anonTokenStore = {
  get: () => _anonToken,
  set: (t) => { _anonToken = t },
  clear: () => { _anonToken = null },
}

async function tryRefresh() {
  if (_refreshPromise) return _refreshPromise
  _refreshPromise = fetch(`${BASE}/auth/refresh`, {
    method: 'POST',
    credentials: 'include',
  })
    .then(r => {
      if (!r.ok) return null
      return r.json()
    })
    .then(body => {
      if (body?.data?.token) {
        tokenStore.set(body.data.token)
        return true
      }
      return false
    })
    .catch(() => false)
    .finally(() => { _refreshPromise = null })
  return _refreshPromise
}

async function req(path, opts = {}) {
  const token = tokenStore.get()
  const anonToken = anonTokenStore.get()
  const headers = { 'Content-Type': 'application/json', ...opts.headers }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  } else if (anonToken) {
    headers['Authorization'] = `Bearer ${anonToken}`
  }

  const res = await fetch(`${BASE}${path}`, {
    ...opts,
    headers,
    credentials: 'include',
  })

  if (res.status === 401 && !opts._retry) {
    const refreshed = await tryRefresh()
    if (refreshed) {
      return req(path, { ...opts, _retry: true })
    }
    tokenStore.clear()
    window.dispatchEvent(new Event('auth:expired'))
    throw new ApiError(401, 'Session expired')
  }

  const body = res.status === 204 ? {} : await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new ApiError(res.status, body.message || 'Request failed', body.errors)
  }

  return body
}

export class ApiError extends Error {
  constructor(status, message, errors = []) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export const authApi = {
  register: async (body) => {
    const res = await req('/auth/register', { method: 'POST', body: JSON.stringify(body) })
    return { token: res.data.token, user: res.data.user }
  },
  login: async (body) => {
    const res = await req('/auth/login', { method: 'POST', body: JSON.stringify(body) })
    return { token: res.data.token, user: res.data.user }
  },
  google: async (idToken) => {
    const res = await req('/auth/google', { method: 'POST', body: JSON.stringify({ idToken }) })
    return { token: res.data.token, user: res.data.user }
  },
  refresh: () => tryRefresh(),
  me: async () => {
    const res = await req('/auth/me')
    return { user: res.data.user }
  },
  logout: () => req('/auth/logout', { method: 'POST' }),
  deleteAccount: () => req('/auth/account', { method: 'DELETE' }),
  issueAnonToken: async () => {
    const res = await req('/auth/anon-token', { method: 'POST' })
    if (res.data && res.data.token) {
      anonTokenStore.set(res.data.token)
    }
    return res
  },
}

export const pollsApi = {
  list: async () => {
    const res = await req('/polls')
    return { polls: res.data.polls }
  },
  getBySlug: async (slug) => {
    const res = await req(`/polls/${slug}`)
    return { poll: res.data.poll }
  },
  myPolls: async () => {
    const res = await req('/polls/me/polls')
    return { polls: res.data.polls }
  },
  getById: async (id) => {
    const res = await req(`/polls/me/poll/${id}`)
    return { poll: res.data.poll }
  },
  create: async (body) => {
    const res = await req('/polls', { method: 'POST', body: JSON.stringify(body) })
    return { poll: res.data.poll }
  },
  update: async (id, body) => {
    const res = await req(`/polls/${id}`, { method: 'PUT', body: JSON.stringify(body) })
    return { poll: res.data.poll }
  },
  delete: (id) => req(`/polls/${id}`, { method: 'DELETE' }),
  activate: async (id) => {
    const res = await req(`/polls/${id}/activate`, { method: 'PATCH' })
    return { poll: res.data.poll }
  },
  publish: async (id, resultsVisibility) => {
    const res = await req(`/polls/${id}/publish`, {
      method: 'PATCH',
      body: JSON.stringify({ resultsVisibility }),
    })
    return { poll: res.data.poll }
  },
  respond: async (slug, answers) => {
    const res = await req(`/polls/${slug}/respond`, { method: 'POST', body: JSON.stringify({ answers }) })
    return { responseId: res.data.responseId }
  },
  analytics: async (id) => {
    const res = await req(`/polls/${id}/analytics`)
    return { analytics: res.data.analytics }
  },
  results: async (id) => {
    const res = await req(`/polls/${id}/results`)
    return { analytics: res.data.analytics }
  },
  checkSubmission: async (slug) => {
    const res = await req(`/polls/${slug}/submission`)
    return { submitted: res.data.submitted, answers: res.data.answers }
  },
}

export const healthApi = {
  check: () => req('/health'),
}