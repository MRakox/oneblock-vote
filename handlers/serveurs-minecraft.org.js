// import solve from '../solve.js';
import { randomClickDelay } from '../utils.js';

/** @param {import('puppeteer').Page} page */
export default async function handle(page) {
  page.setDefaultNavigationTimeout(0);

  // Wait for the captcha to be solved
  // await solve(page).catch((err) => {
  //   throw new Error(`Unable to solve the captcha in time: ${err.message}`);
  // });

  // Submit the vote form
  await page.click('#form_vote .yes', { delay: randomClickDelay() });
}
