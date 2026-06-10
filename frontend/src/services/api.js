import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username, password) => {
    // FastAPI expects form data or x-www-form-urlencoded for OAuth2PasswordRequestForm
    const params = new URLSearchParams();
    params.append('username', username);
    params.append('password', password);

    const response = await api.post('/auth/login', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    return response.data; // { access_token, token_type, username, role }
  },

  register: async (username, password, role = 'contributor') => {
    const response = await api.post('/auth/register', { username, password, role });
    return response.data;
  },
};

export const streamService = {
  getStreams: async () => {
    const response = await api.get('/streams');
    return response.data;
  },
};

export const branchService = {
  getBranches: async (streamId) => {
    const url = streamId ? `/branches?stream_id=${streamId}` : '/branches';
    const response = await api.get(url);
    return response.data;
  },
};

export const subjectService = {
  getSubjects: async (branchId, semester) => {
    let url = '/subjects';
    const params = [];
    if (branchId) params.push(`branch_id=${branchId}`);
    if (semester) params.push(`semester=${semester}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    const response = await api.get(url);
    return response.data;
  },
};

export const paperService = {
  getPapers: async (subjectId) => {
    const response = await api.get(`/papers?subject_id=${subjectId}`);
    return response.data;
  },

  filterPapers: async (filters) => {
    const { streamId, branchId, subjectId, semester } = filters;
    const params = new URLSearchParams();
    if (streamId) params.append('stream_id', streamId);
    if (branchId) params.append('branch_id', branchId);
    if (subjectId) params.append('subject_id', subjectId);
    if (semester) params.append('semester', semester);

    const response = await api.get(`/papers/filter?${params.toString()}`);
    return response.data;
  },

  uploadPaper: async (formData) => {
    // formData contains: subject_id, year, exam_type, file
    const response = await api.post('/papers/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
