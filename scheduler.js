import fetch from 'node-fetch';
import { queues } from './server.js';

/**
 * Fetch the next votes timestamps from the Oneblock website API for the given user
 * @param {string} username The username of the user
 * @returns {Promise<{ sites: Object.<string, number> }>}
 */
export async function fetchUser(username) {
  const response = await fetch(`https://oneblock.fr/vote/user/${username}`);
  const { sites, ...body } = await response.json();
  if (!response.ok || !sites) throw body;
  return sites;
}

/**
 * Get queue from a site id
 * @param {string} id The site id
 * @returns {import('bull').Queue}
 */
const getQueue = (id) => queues.at(parseInt(id, 10) - 1);

/**
 * Get job delay from a timestamp
 * @param {number} timestamp The timestamp
 * @returns {{ delay: number? }} The delay or an empty object
 */
const getDelay = (timestamp) => (timestamp > Date.now() ? { delay: timestamp - Date.now() } : {});

/**
 * Schedule the next votes jobs for the given user
 * @param {{
 *  id: string,
 *  ip: string,
 *  proxy: string,
 *  username: string
 * }} options The job options
 */
async function schedule(options) {
  // Retrieve the next votes timestamps from the Oneblock website API
  const sites = await fetchUser(options.username);

  // Schedule the vote jobs if they're not already scheduled
  Object
    .entries(sites)
    // TODO:
    // .filter(([id]) => !process.env.IGNORED_SITES?.includes(id))
    .forEach(async ([id, time]) => {
      const queue = getQueue(id);
      // TODO:
      // if (!queue) {}
      const jobs = await queue.getJobs(['active', 'delayed', 'paused', 'waiting']);
      // If the job isn't already in the queue, schedule it
      if (!jobs.some((job) => job.name === options.ip)) {
        await queue.add(options.ip, options, getDelay(time));
      }
    });
}

export default schedule;
