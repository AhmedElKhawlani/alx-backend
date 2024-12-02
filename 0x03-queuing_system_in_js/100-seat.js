#!/usr/bin/yarn dev
import express from 'express';
import { promisify } from 'util';
import { createQueue } from 'kue';
import { createClient } from 'redis';

const app = express();
const client = createClient({ name: 'reserve_seat' });
const queue = createQueue();
const INITIAL_SEATS_COUNT = 50;
let reservationEnabled = false;
const PORT = 1245;

/**
 * Sets the number of available seats in Redis.
 * @param {number} number - The new number of seats.
 * @returns {Promise<void>}
 */
const reserveSeat = async (number) => {
  const setAsync = promisify(client.SET).bind(client);
  await setAsync('available_seats', number);
};

/**
 * Retrieves the current number of available seats from Redis.
 * @returns {Promise<number>} The number of available seats.
 */
const getCurrentAvailableSeats = async () => {
  const getAsync = promisify(client.GET).bind(client);
  const result = await getAsync('available_seats');
  return parseInt(result || 0, 10);
};

/**
 * Resets the available seats to an initial count.
 * @param {number} initialSeatsCount - The number of seats to reset to.
 * @returns {Promise<void>}
 */
const resetAvailableSeats = async (initialSeatsCount) => {
  await reserveSeat(initialSeatsCount);
};

// Endpoint to get the number of available seats
app.get('/available_seats', async (_req, res) => {
  try {
    const numberOfAvailableSeats = await getCurrentAvailableSeats();
    res.json({ numberOfAvailableSeats });
  } catch (error) {
    console.error('Error retrieving available seats:', error.message);
    res.status(500).json({ error: 'Could not retrieve available seats' });
  }
});

// Endpoint to reserve a seat
app.get('/reserve_seat', (_req, res) => {
  if (!reservationEnabled) {
    res.status(403).json({ status: 'Reservations are blocked' });
    return;
  }

  try {
    const job = queue.create('reserve_seat');

    job.on('failed', (err) => {
      console.error(`Seat reservation job ${job.id} failed: ${err.message || err}`);
    });

    job.on('complete', () => {
      console.log(`Seat reservation job ${job.id} completed`);
    });

    job.save();
    res.json({ status: 'Reservation in process' });
  } catch (error) {
    console.error('Error creating reservation job:', error.message);
    res.status(500).json({ status: 'Reservation failed' });
  }
});

// Endpoint to process the reservation queue
app.get('/process', (_req, res) => {
  res.json({ status: 'Queue processing started' });

  queue.process('reserve_seat', async (_job, done) => {
    try {
      const availableSeats = await getCurrentAvailableSeats();

      if (availableSeats > 0) {
        await reserveSeat(availableSeats - 1);
        if (availableSeats - 1 === 0) {
          reservationEnabled = false;
        }
        done();
      } else {
        done(new Error('Not enough seats available'));
      }
    } catch (error) {
      done(error);
    }
  });
});

// Start the server and reset available seats
app.listen(PORT, async () => {
  try {
    await resetAvailableSeats(process.env.INITIAL_SEATS_COUNT || INITIAL_SEATS_COUNT);
    reservationEnabled = true;
    console.log(`API available on localhost port ${PORT}`);
  } catch (error) {
    console.error('Error initializing available seats:', error.message);
  }
});

export default app;
