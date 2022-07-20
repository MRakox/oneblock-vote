import { each } from 'async';
import puppeteer from './browser.js';
import { TIMEOUT, VOTE_URL } from './constants.js';
import { queue } from './server.js';
import { randomClickDelay, randomTypeSpeed } from './utils.js';

/**
 * @param {import('puppeteer').Browser} page
 * @returns {Promise<import('puppeteer').Page>}
 */
export async function handle(browser) {
  const page = await browser.newPage();
  await page.goto(VOTE_URL);

  // Wait for the page to load
  await page.waitForSelector('#stepNameInput');
  await page.type('#stepNameInput', process.env.MINECRAFT_USERNAME, { delay: randomTypeSpeed() });
  await page.click('div[data-vote-step] button[type="submit"]', { delay: randomClickDelay() });
  await page.waitForTimeout(TIMEOUT);

  return page;
}

async function schedule() {
  // Initialize puppeteer and open Oneblock website in a new page
  const browser = await puppeteer.launch({ headless: false });
  const page = await handle(browser);

  // Retrieve the next votes timestamps
  const links = await page.$$('a[data-vote-id]');
  each(
    links,
    async (link) => {
    // Retrieve job data from the link
      const name = await link.evaluate((el) => el.innerText);
      const url = await link.evaluate((el) => el.getAttribute('href'));
      const id = await link.evaluate((el) => el.getAttribute('data-vote-id'));
      const time = await link.evaluate((el) => parseInt(el.getAttribute('data-vote-time'), 10));

      // Schedule the vote job if it's not already scheduled
      const jobs = await queue.getDelayed();
      if (!jobs.find((job) => job.data.vote_id === id)) {
        const date = new Date(time > Date.now() ? time : Date.now());
        await queue.add(
          name,
          {
            vote_id: id,
            vote_url: url,
            vote_date: date.toLocaleDateString(),
            vote_time: date.toLocaleTimeString(),
          },
          time > Date.now() ? { delay: time - Date.now() } : {},
        );
      }
    },
    () => browser.close(),
  );
}

export default schedule;
