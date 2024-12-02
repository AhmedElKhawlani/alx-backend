import { createClient, print } from 'redis';
import { promisify } from 'util';

// Create a Redis client
const client = createClient();

// Event listeners for connection status
client.on('ready', () => {
  console.log('Redis client successfully connected to the server');
});

client.on('error', (error) => {
  console.error(`Failed to connect to the Redis server: ${error.message}`);
});

// Function to set a key-value pair in Redis
function setNewSchool(schoolName, value) {
  client.set(schoolName, value, print);
}

// Function to get and display a value from Redis
async function displaySchoolValue(schoolName) {
  try {
    const getAsync = promisify(client.get).bind(client);
    const value = await getAsync(schoolName);
    console.log(`${schoolName}: ${value}`);
  } catch (error) {
    console.error(`Error retrieving value for ${schoolName}: ${error.message}`);
  }
}

// Demonstration of functionality
(async () => {
  await displaySchoolValue('Holberton');
  setNewSchool('HolbertonSanFrancisco', '100');
  await displaySchoolValue('HolbertonSanFrancisco');
})();
