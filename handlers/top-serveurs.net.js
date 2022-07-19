// import solve from '../solve';
import { randomClickDelay } from '../utils';

/** @param {import('puppeteer').Page} page */
export default async function handle(page) {
  page.setDefaultNavigationTimeout(0);

  // Wait for the captcha to be solved
  // await solve(page).catch((err) => {
  //   throw new Error(`Unable to solve the captcha in time: ${err.message}`);
  // });

  // Submit the vote form
  await page.click('.btn-submit-vote', { delay: randomClickDelay() });
}
