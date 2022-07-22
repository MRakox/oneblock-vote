import { TIMEOUT } from '../utils/constants.js';
import { randomClickDelay } from '../utils/random.js';

/** @param {import('puppeteer').Page} page */
export default async function handle(page) {
  // Wait for the page to load
  await page.waitForTimeout(TIMEOUT * 5);

  // Submit the vote form
  await page.click('.btn-submit-vote', { delay: randomClickDelay() });
}
