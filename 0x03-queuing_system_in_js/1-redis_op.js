import { createClient, print } from 'redis';

const client = createClient();

client.on('ready', () => {
  console.log('Redis client successfully connected to the server');
});

client.on('error', (error) => {
  console.error(`Failed to connect to the Redis server: ${error.message}`);
});

/**
 * Sets a key-value pair in Redis.
 * @param {string} schoolName - The key to set.
 * @param {string} value - The value to associate with the key.
 */
function setNewSchool(schoolName, value) {
  client.set(schoolName, value, print);
}

/**
 * Retrieves and displays the value associated with a key in Redis.
 * @param {string} schoolName - The key to retrieve.
 */
function displaySchoolValue(schoolName) {
  client.get(schoolName, (error, reply) => {
    if (error) {
      console.error(`Error fetching value for key "${schoolName}": ${error.message}`);
    } else {
      console.log(`${schoolName}: ${reply}`);
    }
  });
}

// Demonstrate the functionality
displaySchoolValue('Holberton');
setNewSchool('HolbertonSanFrancisco', '100');
displaySchoolValue('HolbertonSanFrancisco');
