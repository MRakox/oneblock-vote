import { CronJob } from 'cron';
import { CRON_TIME } from './constants.js';
import schedule from './scheduler.js';

import './server.js';
import './worker.js';

const run = () => schedule()
  .catch((err) => {
    console.error('[SCHEDULER] An unexpected error occurred:');
    console.error(err);
  });

// Start the scheduler every 30 minutes & initialize the first run manually
new CronJob(
  CRON_TIME,
  run,
).start();
run();
