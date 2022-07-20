import { CronJob } from 'cron';
import Xvfb from 'xvfb';
import { CRON_TIME } from './constants.js';
import schedule from './scheduler.js';

import './server.js';
import './worker.js';

new Xvfb({
  silent: true,
  xvfb_args: ['-screen', '0', '1280x720x24', '-ac'],
}).start(console.error);

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
