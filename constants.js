import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

export const REDIS_CONNECTION = {
  connection: {
    port: 6379,
    host: 'localhost',
    password: '',
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
export const CAPTCHA_TIMEOUT = 300000;
export const VOTE_TIMEOUT = 300000;

// every 30 minutes
export const CRON_TIME = '*/5 * * * *';

export const VOTE_URL = 'https://oneblock.fr/vote';

export const SITES = ['serveurs-minecraft.org', 'serveur-prive.net', 'top-serveurs.net'];

// eslint-disable-next-line no-underscore-dangle
export const __dirname = dirname(fileURLToPath(import.meta.url));
export const EXTENSION_PATH = join(__dirname, 'extensions');
export const SCREENSHOT_PATH = join(__dirname, 'screenshots');
