import { TIMEOUT } from '../constants.js';
import { randomClickDelay } from '../utils.js';

/** @param {import('puppeteer').Page} page */
export default async function handle(page) {
  // Wait for the page to load
  await page.waitForTimeout(TIMEOUT * 5);

  // Submit the vote form
  await page.click('#form_vote .yes', { delay: randomClickDelay() });
}
