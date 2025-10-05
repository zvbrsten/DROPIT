// API Configuration
const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'https://dropit-backend-three.vercel.app',
  TIMEOUT: parseInt(process.env.REACT_APP_API_TIMEOUT) || 10000,
  ENDPOINTS: {
    UPLOAD: '/api/upload',
    FILE: '/api/file',
    DOWNLOAD: '/api/download'
  }
};

export default API_CONFIG;
