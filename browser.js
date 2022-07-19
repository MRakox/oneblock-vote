import puppeteer from 'puppeteer-extra';

// Add stealth plugin and use defaults (all tricks to hide puppeteer usage)
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Add adblocker plugin to block all ads and trackers (saves bandwidth)
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker';

// Add anonymize user agent plugin to set a random user agent on all pages
import AnonymizePlugin from 'puppeteer-extra-plugin-anonymize-ua';

puppeteer
  .use(StealthPlugin())
  .use(AdblockerPlugin({ blockTrackers: true }))
  .use(AnonymizePlugin());

export default puppeteer;
