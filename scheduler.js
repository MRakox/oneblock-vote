import fetch from 'node-fetch';
import { queue } from './server.js';

async function schedule() {
  // Retrieve the next votes timestamps from the Oneblock website API
  /** @type {Object.<string, number>} */
  const sites = await fetch(`https://oneblock.fr/vote/user/${process.env.MINECRAFT_USERNAME}`)
    .then((res) => res.json())
    .catch((err) => {
      console.error('[SCHEDULER] An error occured while fetching the Oneblock website API:');
      console.error(err);
    });

  // Schedule the vote job if it's not already scheduled
  Object
    .entries(sites)
    .filter(([id]) => !process.env.IGNORED_SITES?.includes(id))
    .forEach(async ([id, time]) => {
      const jobs = await queue.getJobs(['active', 'delayed', 'paused', 'wait', 'waiting', 'waiting-children']);
      if (!jobs.find((job) => job.data === time && job.name === id)) {
        await queue.add(id, time, time > Date.now() ? { delay: time - Date.now() } : {});
      }
    });
}

export default schedule;
