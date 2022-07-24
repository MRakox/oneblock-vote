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
    join(process.env.CAPTCHA_CHALLENGER_PATH, 'src', 'worker.py'),
    process.env.MINECRAFT_USERNAME,
  ], {
    cwd: join(process.env.CAPTCHA_CHALLENGER_PATH, 'src'),
    stdio: 'pipe', // Pipe the output to the parent process
  });

  // Wait for the captcha to be solved
  // eslint-disable-next-line no-shadow
  const solve = () => new Promise((resolve, reject) => {
    handler.stdout.on('data', async (data) => {
      console.log(data.toString());
      const message = stripAnsi(data.toString());
      await job.log(message);
      const result = message.includes('RESULT:') && message.split('RESULT:')[1];
      if (result) resolve(result);
    });

    handler.on('error', console.error);
    handler.stderr.on('data', (data) => console.error(data.toString()));
    handler.on('exit', (code) => setTimeout(() => reject(new Error(`The vote handler exited with code ${code}`)), TIMEOUT));
  });

  // Timeout the captcha if it's not solved
  return solve();
}
