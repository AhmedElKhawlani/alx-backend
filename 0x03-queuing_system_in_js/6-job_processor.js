#!/usr/bin/yarn dev
import { createQueue } from 'kue';

// Create a queue instance
const queue = createQueue();

/**
 * Simulates sending a notification to a phone number.
 * @param {string} phoneNumber - The recipient's phone number.
 * @param {string} message - The notification message.
 */
const sendNotification = (phoneNumber, message) => {
  console.log(`Sending notification to ${phoneNumber} with message: ${message}`);
};

// Define the queue processing logic
queue.process('push_notification_code', (job, done) => {
  const { phoneNumber, message } = job.data;

  try {
    sendNotification(phoneNumber, message);
    done();
  } catch (error) {
    console.error(`Error processing job ${job.id}:`, error.message);
    done(error);
  }
});
