import { TIMEOUT } from '../utils/constants.js';
import { randomClickDelay } from '../utils/random.js';

/** @param {import('puppeteer').Page} page */
export default async function handle(page) {
  // Wait for the page to load
  await page.waitForTimeout(TIMEOUT * 10);

  await page.screenshot({ path: 'screenshots/top-serveurs.net-before.png', fullPage: true });

  // Submit the vote form
  await page.click('.btn-submit-vote', { delay: randomClickDelay() });

  // * DEBUG:
  await page.waitForTimeout(TIMEOUT * 5);
  await page.screenshot({ path: 'screenshots/top-serveurs.net-after.png', fullPage: true });
}
