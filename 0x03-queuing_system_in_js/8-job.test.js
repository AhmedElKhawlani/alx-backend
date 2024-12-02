#!/usr/bin/yarn test
import sinon from 'sinon';
import { expect } from 'chai';
import { createQueue } from 'kue';
import createPushNotificationsJobs from './8-job.js';

describe('createPushNotificationsJobs', () => {
  const loggerSpy = sinon.spy(console);
  const queue = createQueue({ name: 'push_notification_code_test' });

  before(() => {
    queue.testMode.enter(true); // Enable Kue's test mode
  });

  after(() => {
    queue.testMode.clear(); // Clear test mode queue
    queue.testMode.exit();  // Exit test mode
  });

  afterEach(() => {
    loggerSpy.log.resetHistory(); // Reset the history of logger spy after each test
  });

  it('throws an error if jobs is not an array', () => {
    expect(() => createPushNotificationsJobs({}, queue)).to.throw('Jobs is not an array');
  });

  it('adds jobs to the queue with correct type and data', () => {
    const jobInfos = [
      {
        phoneNumber: '44556677889',
        message: 'Use the code 1982 to verify your account',
      },
      {
        phoneNumber: '98877665544',
        message: 'Use the code 1738 to verify your account',
      },
    ];

    expect(queue.testMode.jobs.length).to.equal(0); // Initially, the queue should be empty
    createPushNotificationsJobs(jobInfos, queue);

    // Verify job creation
    expect(queue.testMode.jobs.length).to.equal(2);
    expect(queue.testMode.jobs[0].data).to.deep.equal(jobInfos[0]);
    expect(queue.testMode.jobs[0].type).to.equal('push_notification_code_3');
  });

  it('logs job creation', (done) => {
    queue.process('push_notification_code_3', () => {
      expect(loggerSpy.log.calledWith('Notification job created:', queue.testMode.jobs[0].id)).to.be.true;
      done();
    });
  });

  it('handles progress events', (done) => {
    queue.testMode.jobs[0].addListener('progress', () => {
      expect(loggerSpy.log.calledWith('Notification job', queue.testMode.jobs[0].id, '25% complete')).to.be.true;
      done();
    });

    queue.testMode.jobs[0].emit('progress', 25);
  });

  it('handles failed events', (done) => {
    queue.testMode.jobs[0].addListener('failed', () => {
      expect(loggerSpy.log.calledWith('Notification job', queue.testMode.jobs[0].id, 'failed:', 'Failed to send')).to.be.true;
      done();
    });

    queue.testMode.jobs[0].emit('failed', new Error('Failed to send'));
  });

  it('handles complete events', (done) => {
    queue.testMode.jobs[0].addListener('complete', () => {
      expect(loggerSpy.log.calledWith('Notification job', queue.testMode.jobs[0].id, 'completed')).to.be.true;
      done();
    });

    queue.testMode.jobs[0].emit('complete');
  });
});
