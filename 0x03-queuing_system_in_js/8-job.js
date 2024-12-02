#!/usr/bin/yarn dev
import { Queue } from 'kue';

/**
 * Creates push notification jobs from an array of job information.
 * @param {Object[]} jobs - Array of job information objects.
 * @param {Queue} queue - Kue queue instance.
 * @throws {Error} If the jobs parameter is not an array.
 */
export const createPushNotificationsJobs = (jobs, queue) => {
  if (!Array.isArray(jobs)) {
    throw new Error('Jobs must be provided as an array');
  }

  jobs.forEach((jobInfo) => {
    const job = queue.create('push_notification_code_3', jobInfo);

    // Event listeners for job lifecycle events
    job
      .on('enqueue', () => {
        console.log(`Notification job created: ${job.id}`);
      })
      .on('complete', () => {
        console.log(`Notification job ${job.id} completed`);
      })
      .on('failed', (err) => {
        console.error(`Notification job ${job.id} failed: ${err?.message || err}`);
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
};

export default createPushNotificationsJobs;
