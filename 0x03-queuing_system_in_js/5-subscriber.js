import { createClient } from 'redis';

// Create a Redis client
const client = createClient();

// Event listeners for Redis connection
client.on('ready', () => {
  console.log('Redis client connected to the server');
});

client.on('error', (error) => {
  console.error(`Redis client not connected to the server: ${error.message}`);
});

// Subscribe to the "holberton school channel"
const channelName = 'holberton school channel';
client.subscribe(channelName, (err) => {
  if (err) {
    console.error(`Failed to subscribe to ${channelName}: ${err.message}`);
  } else {
    console.log(`Subscribed to channel: ${channelName}`);
  }
});

// Listen for messages on the channel
client.on('message', (channel, message) => {
  console.log(`Message received: ${message}`);
  if (message === 'KILL_SERVER') {
    console.log('Terminating server as requested.');
    client.unsubscribe();
    client.quit();
  }
});

// Function to publish messages to the channel
function publishMessage(message, delay) {
  setTimeout(() => {
    console.log(`About to send: ${message}`);
    client.publish(channelName, message, (err) => {
      if (err) {
        console.error(`Failed to publish message "${message}": ${err.message}`);
      }
    });
  }, delay);
}

// Publish messages with delays
publishMessage("Holberton Student #1 starts course", 100);
publishMessage("Holberton Student #2 starts course", 200);
publishMessage("KILL_SERVER", 300);
publishMessage("Holberton Student #3 starts course", 400);
