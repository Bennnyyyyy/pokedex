import axios from 'axios';

/**
 * Creates an API instance with default configuration
 * @param {string} baseURL - The base URL for the API
 * @returns {Object} - Configured axios instance
 */
export const createApiInstance = (baseURL) => {
  return axios.create({
    baseURL,
    timeout: 10000, // 10 seconds
    headers: {
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Handles API errors consistently
 * @param {Error} error - The error from axios
 * @returns {Object} - Formatted error object
 */
export const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code outside of 2xx
    return {
      status: error.response.status,
      data: error.response.data,
      message: error.response.data.message || 'Server error'
    };
  } else if (error.request) {
    // The request was made but no response was received
    return {
      status: 0,
      message: 'No response from server. Please check your connection.'
    };
  } else {
    // Something happened in setting up the request
    return {
      status: 0,
      message: error.message || 'Error setting up request'
    };
  }
};

/**
 * Retries a failed API request
 * @param {Function} apiCall - The API function to retry
 * @param {number} maxRetries - Maximum number of retry attempts
 * @returns {Promise} - Result of the API call
 */
export const retryApiCall = async (apiCall, maxRetries = 3) => {
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      // Wait before retrying (exponential backoff)
      const delay = Math.pow(2, attempt) * 1000 + Math.random() * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError;
};