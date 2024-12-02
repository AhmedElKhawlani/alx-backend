import { createClient, print } from 'redis';

// Create a Redis client
const client = createClient();

// Event listeners for connection status
client.on('ready', () => {
  console.log('Redis client successfully connected to the server');
});

client.on('error', (error) => {
  console.error(`Failed to connect to the Redis server: ${error.message}`);
});

// Add data to the "HolbertonSchools" hash
const schools = {
  Portland: 50,
  Seattle: 80,
  "New York": 20,
  Bogota: 20,
  Cali: 40,
  Paris: 2,
};

for (const [city, value] of Object.entries(schools)) {
  client.hset("HolbertonSchools", city, value, print);
}

// Retrieve and display all data from the "HolbertonSchools" hash
client.hgetall("HolbertonSchools", (error, reply) => {
  if (error) {
    console.error(`Error fetching data: ${error.message}`);
  } else {
    console.log("HolbertonSchools data:", reply);
  }
});
