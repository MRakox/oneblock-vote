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
 * @param {string} username The username of the user
 * @param {object} data The data to pass to the job
 */
async function schedule(username, data = {}) {
  // Retrieve the next votes timestamps from the Oneblock website API
  const sites = await fetchUser(username);

  // Schedule the vote jobs if they're not already scheduled
  Object
    .entries(sites)
    // TODO:
    // .filter(([id]) => !process.env.IGNORED_SITES?.includes(id))
    .forEach(async ([id, time]) => {
      const queue = getQueue(id);
      // TODO:
      // if (!queue) {}
      await queue.add(username, data, getDelay(time));
    });
}

export default schedule;
