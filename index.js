import { CronJob } from 'cron';
import { CRON_TIME } from './utils/constants.js';
import schedule from './scheduler.js';

import './server.js';
import './worker.js';

process.env.CAPTCHA_CHALLENGER_PATH ??= '/usr/src/app/hcaptcha-challenger';
process.env.CAPTCHA_CHALLENGER_ENTRYPOINT ??= 'python3';

// Start the scheduler every 30 minutes & initialize the first run manually
const run = () => schedule().catch((err) => {
  console.error('[SCHEDULER] An unexpected error occurred:');
  console.error(err);
});
new CronJob(CRON_TIME, run).start();
run();
