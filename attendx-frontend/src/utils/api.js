// ============================================================
//  api.js — Centralized API client for AttendX backend
//  Base URL: REACT_APP_API_URL (default: http://localhost:4000)
// ============================================================

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('attendx_token');
}

async function request(method, path, body, isFormData = false) {
  const token = getToken();
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData) headers['Content-Type'] = 'application/json';

  const opts = { method, headers };
  if (body) {
    opts.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${BASE}${path}`, opts);
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(data.error || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

// ── Auth ─────────────────────────────────────────────────────
export const auth = {
  login:         (email, password)    => request('POST', '/api/auth/login',          { email, password }),
  logout:        ()                   => request('POST', '/api/auth/logout'),
  me:            ()                   => request('GET',  '/api/auth/me'),
  resetPassword: (new_password)       => request('PATCH','/api/auth/reset-password', { new_password }),
};

// ── Users ─────────────────────────────────────────────────────
export const users = {
  list:       ()           => request('GET',    '/api/users'),
  create:     (payload)    => request('POST',   '/api/users',      payload),
  get:        (id)         => request('GET',    `/api/users/${id}`),
  update:     (id, data)   => request('PUT',    `/api/users/${id}`, data),
  deactivate: (id)         => request('DELETE', `/api/users/${id}`),
};

// ── Attendance ────────────────────────────────────────────────
export const attendance = {
  checkIn:   (formData)       => request('POST',  '/api/attendance/checkin',      formData, true),
  checkOut:  (formData)       => request('POST',  '/api/attendance/checkout',     formData, true),
  startBreak: ()              => request('POST',  '/api/attendance/break/start'),
  endBreak:   ()              => request('POST',  '/api/attendance/break/end'),
  getToday:   ()              => request('GET',   '/api/attendance/today'),
  getSummary: (month, userId) => {
    const qs = new URLSearchParams();
    if (month)  qs.set('month', month);
    if (userId) qs.set('user_id', userId);
    return request('GET', `/api/attendance/summary?${qs}`);
  },
  getHistory: (month, page = 1, limit = 31) => {
    const qs = new URLSearchParams({ page, limit });
    if (month) qs.set('month', month);
    return request('GET', `/api/attendance/history?${qs}`);
  },
  getAllToday: ()              => request('GET',   '/api/attendance/all'),
  getReport:  (month, userId) => {
    const qs = new URLSearchParams();
    if (month)  qs.set('month', month);
    if (userId) qs.set('user_id', userId);
    return request('GET', `/api/attendance/report?${qs}`);
  },
  override: (id, data) => request('PATCH', `/api/attendance/${id}`, data),
};

// ── Leaves ────────────────────────────────────────────────────
export const leaves = {
  apply:   (payload)   => request('POST',   '/api/leaves',              payload),
  list:    (status)    => request('GET',    `/api/leaves${status ? `?status=${status}` : ''}`),
  get:     (id)        => request('GET',    `/api/leaves/${id}`),
  approve: (id)        => request('PATCH',  `/api/leaves/${id}/approve`),
  reject:  (id)        => request('PATCH',  `/api/leaves/${id}/reject`),
  cancel:  (id)        => request('DELETE', `/api/leaves/${id}`),
};

// ── Chat ─────────────────────────────────────────────────────
export const chat = {
  getMessages:   (page = 1, limit = 50) =>
    request('GET',    `/api/chat/messages?page=${page}&limit=${limit}`),
  sendMessage:   (text)      => request('POST',   '/api/chat/messages', { text }),
  deleteMessage: (id)        => request('DELETE', `/api/chat/messages/${id}`),
};

// ── Notifications ────────────────────────────────────────────
export const notifications = {
  list:       ()   => request('GET',   '/api/notifications'),
  markAllRead: () => request('PATCH',  '/api/notifications/read-all'),
  markOneRead: (id) => request('PATCH', `/api/notifications/${id}/read`),
};

// ── Dashboard ─────────────────────────────────────────────────
export const dashboard = {
  me:       (month) => request('GET', `/api/dashboard/me${month ? `?month=${month}` : ''}`),
  overview: (month) => request('GET', `/api/dashboard/overview${month ? `?month=${month}` : ''}`),
};
