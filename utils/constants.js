import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const REDIS_CONNECTION = {
  connection: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || '',
    tls: false,
  },
};

export const QUEUE_NAME = 'Vote';

// Delays in milliseconds
export const MIN_TYPE_SPEED = 25;
export const MAX_TYPE_SPEED = 75;
export const MIN_CLICK_DELAY = 25;
export const MAX_CLICK_DELAY = 150;

export const TIMEOUT = 500;
// 5 minutes in milliseconds
export const VOTE_TIMEOUT = 300000;

// every 30 minutes
export const CRON_TIME = '*/5 * * * *';

export const VOTE_URL = 'https://oneblock.fr/vote';

// eslint-disable-next-line no-underscore-dangle
export const __dirname = join(dirname(fileURLToPath(import.meta.url)), '..');
export const SCREENSHOT_PATH = join(__dirname, 'screenshots');
