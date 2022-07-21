import { eachLimit } from 'async';
import { Worker } from 'bullmq';
import { join } from 'node:path';
import puppeteer from './browser.js';
import {
  REDIS_CONNECTION,
  SCREENSHOT_PATH,
  TIMEOUT,
  VOTE_TIMEOUT,
  VOTE_URL,
  QUEUE_NAME,
} from './constants.js';
import { events, queues } from './server.js';
import { performance } from './utils.js';

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
// eslint-disable-next-line consistent-return
async function processor(job) {
  /** @type {import('puppeteer').Browser} */
  let browser;

  try {
    // Initialize the performance measurement
    const measure = performance();

    // Initialize puppeteer
    browser = await puppeteer.launch();
    await job.log(`Puppeteer launched in ${measure()}ms`);

    // Open Oneblock website in a new page
    const [page] = await browser.pages();
    await page.goto(VOTE_URL).then(() => job.log(`ONEBLOCK: Page loaded in ${measure()}ms`));

    // Fill in & submit the vote form
    await page.waitForSelector('#stepNameInput').then((input) => input.type(process.env.MINECRAFT_USERNAME));
    await page.click('div[data-vote-step] button[type="submit"]', { delay: TIMEOUT });
    await job.log(`Navigated to vote page in ${measure()}ms`);

    // Click on the vote button
    const button = await page.waitForSelector(`a[data-vote-id="${job.name}"]`, { visible: true });
    const name = await button.evaluate((el) => el.innerText);
    await button.click({ delay: TIMEOUT })
      .then(() => job.log(`The voting form has been successfully initiated in ${measure()}ms`));

    // Handle the job depending on the vote site
    await job.log('Waiting for the vote to be submitted...');
    const queue = queues[name];
    if (!queue) throw new Error(`Unknown vote site: ${name}`);
    await queue.add(name, process.env.MINECRAFT_USERNAME)
      .then((handler) => handler.waitUntilFinished(events[name]));
    await job.log(`The vote has been successfully submitted in ${measure()}ms`);

    // Wait for the vote reward to be received
    await page.bringToFront().then(() => page.focus('#content_vote'));
    await page.waitForSelector('#status-message > div', { visible: true, timeout: VOTE_TIMEOUT }).catch(() => {
      throw new Error(`${name} did not receive the vote reward, please try again later...`);
    });
    await job.log(`The vote reward has been received in ${measure()}ms`);

    // Mark the job as completed & exit the browser
    await job.log(`The job has been successfully completed in ${measure(true)}ms`);
    await exit(browser, job.id);
  } catch (error) {
    // Exit the browser & throw the error
    await exit(browser, job.id).catch(console.error);
    throw error;
  }
}

export default new Worker(QUEUE_NAME, processor, REDIS_CONNECTION);
