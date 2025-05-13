import axios from 'axios';

// Get the API URL from the environment variable
const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8800';

// Function to test API connectivity
export async function testApiConnection() {
  console.log('Testing API connection to:', apiUrl);
  
  try {
    // Try to connect to the API server
    const response = await axios.get(`${apiUrl}/api/tiktok/status`);
    console.log('API connection successful:', response.data);
    return {
      success: true,
      data: response.data,
      message: 'API connection successful'
    };
  } catch (error) {
    console.error('API connection failed:', error);
    return {
      success: false,
      error: error,
      message: `API connection failed: ${error.message}`
    };
  }
}

// Function to test devices endpoint
export async function testDevicesEndpoint() {
  console.log('Testing devices endpoint at:', `${apiUrl}/api/devices`);
  
  try {
    // Try to get devices from the API
    const response = await axios.get(`${apiUrl}/api/devices`);
    console.log('Devices endpoint response:', response.data);
    return {
      success: true,
      data: response.data,
      message: 'Devices endpoint accessible'
    };
  } catch (error) {
    console.error('Devices endpoint failed:', error);
    return {
      success: false,
      error: error,
      message: `Devices endpoint failed: ${error.message}`
    };
  }
}

// Export the API URL for reference
export const API_URL = apiUrl; 