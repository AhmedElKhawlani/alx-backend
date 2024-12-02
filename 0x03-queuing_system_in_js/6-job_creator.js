#!/usr/bin/yarn dev
import { createQueue } from 'kue';

// Create a queue for push notifications
const queue = createQueue({ name: 'push_notification_code' });

// Define the job details
const jobData = {
  phoneNumber: '07045679939',
  message: 'Account registered',
};

// Create the job in the queue
const job = queue.create('push_notification_code', jobData);

// Event listeners for the job
job
  .on('enqueue', () => {
    console.log(`Notification job created: ${job.id}`);
  })
  .on('complete', () => {
    console.log('Notification job completed');
  })
  .on('failed attempt', (errorMessage) => {
    console.error(`Notification job failed: ${errorMessage}`);
  })
  .on('failed', (errorMessage) => {
    console.error(`Notification job permanently failed: ${errorMessage}`);
  });

// Save the job to the queue
job.save((err) => {
  if (err) {
    console.error(`Failed to save job: ${err.message}`);
  }
});
