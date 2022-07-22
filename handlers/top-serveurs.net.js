import { spawn } from 'node:child_process';
import { join } from 'node:path';
import stripAnsi from 'strip-ansi';
import { VOTE_TIMEOUT } from '../utils/constants.js';

/** @param {import('puppeteer').Page} page */
export default async function handle(page) {
// Wait for the captcha to be solved
  await page.close();

  // Spawn a new instance of hCaptcha challenger
  const handler = spawn(process.env.CAPTCHA_CHALLENGER_ENTRYPOINT, [
    join(process.env.CAPTCHA_CHALLENGER_PATH, 'src', 'driver.py'),
    process.env.MINECRAFT_USERNAME,
  ], {
    cwd: join(process.env.HCAPTCHA_CHALLENGER_PATH, 'src'),
  });

  // Wait for the captcha to be solved
  // eslint-disable-next-line no-shadow
  const solve = () => new Promise((resolve, reject) => {
    handler.stdout.on('data', async (data) => {
      const message = stripAnsi(data.toString());
      const result = message?.includes('RESULT:') && message?.split('RESULT:')[1];
      if (result) resolve(result);
    });

    handler.on('error', console.error);
    setTimeout(reject, VOTE_TIMEOUT);
  });

  // Timeout the captcha if it's not solved
  return solve();
}
