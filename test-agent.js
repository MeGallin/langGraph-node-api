// Simple test script to interact with the agent API
// Using dynamic import for node-fetch since it's an ESM module
import('node-fetch').then(async ({ default: fetch }) => {
  async function testAgent(message) {
    try {
      const response = await fetch('http://localhost:8000/api/agent/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
        }),
      });
      
      const data = await response.json();
      console.log('Response:', data);
      return data;
    } catch (error) {
      console.error('Error:', error);
    }
  }

  // Test message
  const message = "Hello there, I'm Gary!";

  // Call the API
  await testAgent(message);
}).catch(err => console.error('Failed to import fetch:', err));