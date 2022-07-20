import { eachLimit } from 'async';
import { Worker } from 'bullmq';
import { join } from 'node:path';
import puppeteer from './browser.js';
import {
  __dirname, EXTENSION_PATH, QUEUE_NAME, REDIS_CONNECTION, SCREENSHOT_PATH, TIMEOUT, VOTE_TIMEOUT,
} from './constants.js';
import { handle } from './scheduler.js';

/** @param {import('puppeteer').Browser} browser */
const exit = (browser, id) => new Promise((resolve) => {
  browser.pages().then((pages) => eachLimit(
    pages,
    1,
    async (page) => {
      // Wait for the page to be loaded
      await page.waitForTimeout(TIMEOUT);
      await page.bringToFront();
      await page.waitForTimeout(TIMEOUT);
      // Take a screenshot of the page
      const { hostname } = new URL(page.url());
      if (hostname) await page.screenshot({ path: join(SCREENSHOT_PATH, `${hostname}-${id}.png`) });
    },
    () => browser.close().then(resolve),
  ));
});

/** @param {import('bullmq').Job} job */
async function processor(job) {
  /** @type {import('puppeteer').Browser} */
  let browser;

  try {
    const startAt = Date.now();

    // Initialize puppeteer and open Oneblock website in a new page
    browser = await puppeteer
      .launch({
        headless: false,
        ignoreDefaultArgs: ['--disable-extensions', '--enable-automation'],
        args: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-web-security',
          `--load-extension=${EXTENSION_PATH}`,
          '--disable-features=IsolateOrigins,site-per-process',
          '--disable-site-isolation-trials',
        ],
      });
    const home = await handle(browser);
    await job.log(`Navigated to Oneblock vote page in ${Date.now() - startAt}ms`);

    // Check for the vote cooldown
    const button = await home.waitForSelector(
      `a[data-vote-id="${job.data.vote_id}"]`,
    );
    await button.waitForSelector('.vote-timer', { hidden: true, timeout: VOTE_TIMEOUT }).catch(() => {
      throw new Error(`${job.name} is still in the cooldown, please try again later [${job.data.vote_id}]`);
    });

    // Click on the vote button
    await home.waitForTimeout(TIMEOUT);
    await button.click();
    await job.log(`Clicked on the vote button in ${Date.now() - startAt}ms`);
    await home.waitForTimeout(TIMEOUT);

    // Find the vote page and wait for it to load
    const page = (await browser.pages())
      .find((p) => p.url().includes(job.name));
    if (!page) {
      throw new Error(`Could not find ${job.name} page [${job.data.vote_id}]`);
    }
    await job.log(`Navigated to ${job.name} in ${Date.now() - startAt}ms`);

    // Select the handler used to process the job depending on the vote site
    const handler = await import(join(__dirname, 'handlers', `${job.name}.js`));
    await handler.default(page);

    // Wait for the vote reward to be received
    await home.waitForSelector('#status-message', { timeout: VOTE_TIMEOUT }).catch(() => {
      throw new Error(`${job.name} did not receive the vote reward [${job.data.vote_id}]`);
    });

    // Mark the job as completed & exit the browser
    await job.log(`Successfully voted in ${Date.now() - startAt}ms on ${job.name} [${job.data.vote_id}]`);
    await exit(browser, job.id);
  } catch (error) {
    // Exit the browser & throw the error
    await exit(browser, job.id).catch(() => {});
    throw error;
  }
}

export default new Worker(QUEUE_NAME, processor, REDIS_CONNECTION);
