import { spawn } from 'node:child_process';
import { TIMEOUT } from 'node:dns';
import { join } from 'node:path';
import stripAnsi from 'strip-ansi';

/** @param {import('puppeteer').Page} page */
export default async function handle(page, { job }) {
  // Wait for the captcha to be solved
  await page.close();

  // Spawn a new instance of hCaptcha challenger
  const handler = spawn(process.env.CAPTCHA_CHALLENGER_ENTRYPOINT, [
    join(process.env.CAPTCHA_CHALLENGER_PATH, 'src', 'main.py'),
    'vote',
    '--username', process.env.MINECRAFT_USERNAME,
    '--site', 'serveur-prive.net',
  ], {
    cwd: join(process.env.CAPTCHA_CHALLENGER_PATH, 'src'),
  });

  // Wait for the captcha to be solved
  // eslint-disable-next-line no-shadow
  const solve = () => new Promise((resolve, reject) => {
    handler.stdout.on('data', async (data) => {
      // Retrieve the message from the subprocess
      console.log(data.toString());
      const message = stripAnsi(data.toString());
      await job.log(message);
      // If the message is a success, resolve the promise
      const result = message.includes('RESULT:') && message.split('RESULT:')[1];
      if (result) resolve(result);
    });

    // If the subprocess times out, reject the promise
    handler.on('error', console.error);
    handler.stderr.on('data', (data) => console.error(data.toString()));
    handler.on('exit', (code) => setTimeout(() => reject(new Error(`The vote handler exited with code ${code}`)), TIMEOUT));
  });

  // Timeout the captcha if it's not solved
  return solve();
}
