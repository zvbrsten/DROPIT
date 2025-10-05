import axios from 'axios';
import API_CONFIG from '../config/api';

export const testBackendConnection = async () => {
  try {
    // Try to make a simple request to test connectivity
    const response = await axios.get(`${API_CONFIG.BASE_URL}/api/health`, {
      timeout: 5000,
    });
    return { success: true, status: response.status };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      return { success: false, error: 'Connection timeout' };
    } else if (error.code === 'ERR_NETWORK') {
      return { success: false, error: 'Network error' };
    } else if (error.response?.status === 404) {
      return { success: false, error: 'Backend not found' };
    } else {
      return { success: false, error: error.message };
    }
  }
};

export const getBackendStatus = () => {
  return {
    baseUrl: API_CONFIG.BASE_URL,
    timeout: API_CONFIG.TIMEOUT,
    endpoints: API_CONFIG.ENDPOINTS
  };
};
