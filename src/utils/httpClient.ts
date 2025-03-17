/**
 * Simple HTTP client utility to replace axios
 * This provides a common interface for making HTTP requests
 */

/**
 * Makes a GET request to the specified URL
 * @param url The URL to request
 * @param options Optional request options
 * @returns A promise with the response data
 */
export async function get(url: string, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    // Try to parse as JSON first
    try {
      return await response.json();
    } catch (e) {
      // If not JSON, return text
      return await response.text();
    }
  } catch (error) {
    console.error(`Error fetching ${url}:`, error);
    throw error;
  }
}

/**
 * Makes a POST request to the specified URL
 * @param url The URL to request
 * @param data The data to send
 * @param options Optional request options
 * @returns A promise with the response data
 */
export async function post(url: string, data: any, options: RequestInit = {}): Promise<any> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }
    
    // Try to parse as JSON first
    try {
      return await response.json();
    } catch (e) {
      // If not JSON, return text
      return await response.text();
    }
  } catch (error) {
    console.error(`Error posting to ${url}:`, error);
    throw error;
  }
}

// Export an axios-like interface for backward compatibility
export default {
  get,
  post,
  put: async (url: string, data: any, options: RequestInit = {}) => {
    return post(url, data, { ...options, method: 'PUT' });
  },
  delete: async (url: string, options: RequestInit = {}) => {
    return get(url, { ...options, method: 'DELETE' });
  }
};
