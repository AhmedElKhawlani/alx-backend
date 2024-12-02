#!/usr/bin/yarn dev
import { createQueue } from 'kue';

// List of jobs to be added to the queue
const jobs = [
  { phoneNumber: '4153518780', message: 'This is the code 1234 to verify your account' },
  { phoneNumber: '4153518781', message: 'This is the code 4562 to verify your account' },
  { phoneNumber: '4153518743', message: 'This is the code 4321 to verify your account' },
  { phoneNumber: '4153538781', message: 'This is the code 4562 to verify your account' },
  { phoneNumber: '4153118782', message: 'This is the code 4321 to verify your account' },
  { phoneNumber: '4153718781', message: 'This is the code 4562 to verify your account' },
  { phoneNumber: '4159518782', message: 'This is the code 4321 to verify your account' },
  { phoneNumber: '4158718781', message: 'This is the code 4562 to verify your account' },
  { phoneNumber: '4153818782', message: 'This is the code 4321 to verify your account' },
  { phoneNumber: '4154318781', message: 'This is the code 4562 to verify your account' },
  { phoneNumber: '4151218782', message: 'This is the code 4321 to verify your account' },
];

// Create a queue instance
const queue = createQueue({ name: 'push_notification_code_2' });

// Add jobs to the queue
jobs.forEach((jobData) => {
  const job = queue.create('push_notification_code_2', jobData);

  // Event listeners for the job
  job
    .on('enqueue', () => {
      console.log(`Notification job created: ${job.id}`);
    })
    .on('complete', () => {
      console.log(`Notification job ${job.id} completed`);
    })
    .on('failed', (error) => {
      console.error(`Notification job ${job.id} failed: ${error?.message || error}`);
    })
    .on('progress', (progress) => {
      console.log(`Notification job ${job.id} is ${progress}% complete`);
    });

  // Save the job to the queue
  job.save((err) => {
    if (err) {
      console.error(`Failed to save job ${job.id}: ${err.message}`);
    }
  });
});
