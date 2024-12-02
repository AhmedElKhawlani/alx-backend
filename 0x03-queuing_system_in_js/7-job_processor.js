#!/usr/bin/yarn dev
import { createQueue } from 'kue';

const BLACKLISTED_NUMBERS = ['4153518780', '4153518781'];
const queue = createQueue();

/**
 * Sends a push notification to a user.
 * @param {String} phoneNumber - The recipient's phone number.
 * @param {String} message - The notification message.
 * @param {Object} job - The Kue job object.
 * @param {Function} done - The callback function to signal completion.
 */
const sendNotification = (phoneNumber, message, job, done) => {
  const totalAttempts = 2;
  let attemptsLeft = totalAttempts;

  const sendInterval = setInterval(() => {
    // Update job progress
    const progress = ((totalAttempts - attemptsLeft) / totalAttempts) * 100;
    job.progress(totalAttempts - attemptsLeft, totalAttempts);

    // Check if the phone number is blacklisted
    if (BLACKLISTED_NUMBERS.includes(phoneNumber)) {
      clearInterval(sendInterval);
      return done(new Error(`Phone number ${phoneNumber} is blacklisted`));
    }

    // Log the message and complete the job
    if (attemptsLeft === totalAttempts) {
      console.log(`Sending notification to ${phoneNumber}, with message: ${message}`);
    }

    attemptsLeft -= 1;

    // Clear the interval and complete the job if all attempts are done
    if (attemptsLeft <= 0) {
      clearInterval(sendInterval);
      done();
    }
  }, 1000);
};

// Process jobs in the queue
queue.process('push_notification_code_2', 2, (job, done) => {
  sendNotification(job.data.phoneNumber, job.data.message, job, done);
});
