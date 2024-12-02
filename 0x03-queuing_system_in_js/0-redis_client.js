import { createClient } from 'redis';

const client = createClient();

client.on('ready', () => {
  console.log('Successfully connected to the Redis server');
});

client.on('error', (error) => {
  console.error(`Failed to connect to the Redis server: ${error.message}`);
});
