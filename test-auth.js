// Simple test to check authentication
const testAuth = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/user', {
      method: 'GET',
      credentials: 'include', // Important for cookies
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('User authenticated:', data);
    } else {
      console.log('User not authenticated:', response.status);
    }
  } catch (error) {
    console.error('Auth test error:', error);
  }
};

// For Node.js testing
if (typeof window === 'undefined') {
  // Server-side test
  console.log('Run this in browser console after logging in');
} else {
  // Browser test
  testAuth();
}
