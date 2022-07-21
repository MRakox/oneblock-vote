import { eachLimit } from 'async';
import { Worker } from 'bullmq';
import { join } from 'node:path';
import puppeteer from './browser.js';
import {
  __dirname,
  EXTENSION_PATH,
  REDIS_CONNECTION,
  SCREENSHOT_PATH,
  TIMEOUT,
  VOTE_TIMEOUT,
  VOTE_URL,
} from './constants.js';
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
    await job.log(`MAIN: Puppeteer launched in ${measure()}ms`);

    // Open Oneblock website in a new page
    const home = await browser.newPage();
    await home.goto(VOTE_URL).then(() => job.log(`ONEBLOCK: Page loaded in ${measure()}ms`));

    // Fill in & submit the vote form
    await home.waitForSelector('#stepNameInput').then((input) => input.type(process.env.MINECRAFT_USERNAME));
    await home.click('div[data-vote-step] button[type="submit"]', { delay: TIMEOUT });
    await job.log(`ONEBLOCK: Navigated to vote page in ${measure()}ms`);

    // Click on the vote button
    const button = await home.waitForSelector(`a[data-vote-id="${job.name}"]`, { visible: true });
    const name = await button.evaluate((el) => el.innerText);
    await button.click({ delay: TIMEOUT })
      .then(() => job.log(`ONEBLOCK: The voting form has been successfully initiated in ${measure()}ms`));

    // Find the vote page and wait for it to load
    await home.waitForTimeout(TIMEOUT);
    const page = (await browser.pages()).find((p) => p.url().includes(name));
    if (!page) {
      await exit(browser, job.id);
      return 'You have already voted on this site, please wait a few moments and try again later...';
    }
    await job.log(`VOTE: Navigated to ${name} in ${measure()}ms`);

    // Select the handler used to process the job depending on the vote site
    await import(join(__dirname, 'handlers', `${name}.js`))
      .then((handler) => handler.default(page, { print: job.log, measure }));
    await job.log(`VOTE: The vote has been successfully submitted in ${measure()}ms`);

    // Wait for the vote reward to be received
    await home.bringToFront().then(() => home.focus('#content_vote'));
    await home.waitForSelector('#status-message > div', { visible: true, timeout: VOTE_TIMEOUT }).catch(() => {
      throw new Error(`${name} did not receive the vote reward, please try again later...`);
    });
    await job.log(`ONEBLOCK: The vote reward has been received in ${measure()}ms`);

    // Mark the job as completed & exit the browser
    await job.log(`MAIN: The job has been successfully completed in ${measure(true)}ms`);
    await exit(browser, job.id);
  } catch (error) {
    // Exit the browser & throw the error
    await exit(browser, job.id).catch(console.error);
    throw error;
  }
}

export default new Worker(QUEUE_NAME, processor, REDIS_CONNECTION);
