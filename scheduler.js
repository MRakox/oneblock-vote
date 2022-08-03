import fetch from 'node-fetch';
import { queue } from './server.js';

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
 * Schedule the next votes jobs for the given user
 * @param {string} username The username of the user
 */
async function schedule(username) {
  // Retrieve the next votes timestamps from the Oneblock website API
  const sites = await fetchUser(username);

  // Schedule the vote jobs if they're not already scheduled
  Object
    .entries(sites)
    // TODO:
    // .filter(([id]) => !process.env.IGNORED_SITES?.includes(id))
    .forEach(async ([id, time]) => {
      const jobs = await queue.getJobs(['active', 'completed', 'delayed', 'paused', 'wait', 'waiting', 'waiting-children']);
      if (!jobs.find((job) => job.data === time && job.name === id)) {
        await queue.add(id, time, time > Date.now() ? { delay: time - Date.now() } : {});
      }
    });
}

export default schedule;
