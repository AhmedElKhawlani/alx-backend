import { createClient } from 'redis';

// Create a Redis client
const client = createClient();

// Event listener for successful connection
client.on('ready', () => {
  console.log('Redis client connected to the server');
});

// Event listener for errors
client.on('error', (error) => {
  console.error(`Redis client not connected to the server: ${error.message}`);
});

// Subscribe to a channel
const channelName = 'holberton school channel';
client.subscribe(channelName, (err) => {
  if (err) {
    console.error(`Failed to subscribe to ${channelName}: ${err.message}`);
  } else {
    console.log(`Subscribed to channel: ${channelName}`);
  }
});

// Event listener for messages
client.on('message', (channel, message) => {
  console.log(`Message received on channel ${channel}: ${message}`);
  if (message === 'KILL_SERVER') {
    console.log('Terminating the server as requested.');
    client.unsubscribe();
    client.quit();
  }
});
