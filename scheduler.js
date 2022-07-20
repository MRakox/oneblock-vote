import fetch from 'node-fetch';
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
  // Retrieve the next votes timestamps from the Oneblock website API
  /** @type {Object.<string, number>} */
  const { sites } = await fetch(`https://oneblock.fr/vote/user/${process.env.MINECRAFT_USERNAME}`)
    .then((res) => res.json())
    .catch((err) => {
      console.error('[SCHEDULER] An error occured while fetching the Oneblock website API:');
      console.error(err);
    });

  // Schedule the vote job if it's not already scheduled
  Object
    .entries(sites)
    .forEach(async ([id, time]) => {
      const jobs = await queue.getJobs();
      if (!jobs.find((job) => job.data === time)) {
        await queue.add(id, time, time > Date.now() ? { delay: time - Date.now() } : {});
      }
    });
}

export default schedule;
