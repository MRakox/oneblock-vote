import { TIMEOUT } from '../utils/constants.js';
import { randomClickDelay } from '../utils/random.js';

/** @param {import('puppeteer').Page} page */
export default async function handle(page) {
  // Wait for the page to load
  await page.waitForTimeout(TIMEOUT * 10);

  await page.screenshot({ path: 'screenshots/top-serveurs.net.png', fullPage: true });

  // Submit the vote form
  await page.click('.btn-submit-vote', { delay: randomClickDelay() });
}
