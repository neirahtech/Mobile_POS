import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor to include the token and branch_id
api.interceptors.request.use(
  (config) => {
    // Log all outgoing requests for debugging
    console.log('Axios request:', config.method, config.url, config.data || config.params);

    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Robustly skip branch_id for /branches, /store, /workers endpoints (with or without /api prefix)
    const url = config.url || '';
    const skipBranch = /\/(branches|store|workers)(\/|$)/.test(url);

    const branch_id = localStorage.getItem('branch_id');
    if (branch_id && !skipBranch) {
      if (['get', 'delete'].includes(config.method)) {
        // Ensure config.params is always an object
        if (!config.params || typeof config.params !== 'object') {
          config.params = {};
        }
        config.params.branch_id = branch_id;
        // Log for debugging
        console.log('Axios GET/DELETE params:', config.params);
      } else if (['post', 'put', 'patch'].includes(config.method)) {
        // Always ensure config.data is an object (even if undefined)
        if (config.data instanceof FormData) {
          config.data.set('branch_id', branch_id);
        } else {
          let data = config.data;
          if (!data || typeof data !== 'object') {
            data = {};
          }
          data.branch_id = branch_id;
          config.data = data;
        }
        // Log the final data for debugging
        console.log('Axios request final data:', config.data);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const errorMessage = error.response?.data?.message;
      if (errorMessage && errorMessage.includes('token')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;