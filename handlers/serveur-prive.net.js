import { CAPTCHA_TIMEOUT, TIMEOUT } from '../constants.js';
import { randomClickDelay, randomTypeSpeed } from '../utils.js';

/** @param {import('puppeteer').Page} page */
export default async function handle(page) {
  // Wait for the captcha to be solved
  await page.waitForSelector("iframe[data-hcaptcha-response*='_']", {
    timeout: CAPTCHA_TIMEOUT,
  }).catch(async () => {
    await page.screenshot({ path: 'captcha.png' });
    throw new Error('The captcha was not solved in time');
  });

  // Fill in & submit the vote form
  await page.waitForTimeout(TIMEOUT);
  await page.type('#pseudo', process.env.MINECRAFT_USERNAME, { delay: randomTypeSpeed() });
  await page.waitForTimeout(TIMEOUT);
  await page.click('#btnvote', { delay: randomClickDelay() });
}
