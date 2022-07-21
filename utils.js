import { performance as time } from 'node:perf_hooks';
import {
  MIN_TYPE_SPEED, MAX_TYPE_SPEED, MIN_CLICK_DELAY, MAX_CLICK_DELAY,
} from './constants.js';

export const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;
export const randomTypeSpeed = () => random(MIN_TYPE_SPEED, MAX_TYPE_SPEED);
export const randomClickDelay = () => random(MIN_CLICK_DELAY, MAX_CLICK_DELAY);

export function performance(startAt = time.now()) {
  let offset = time.now();
  return (untilStart = false) => {
    const result = time.now() - (untilStart ? startAt : offset);
    offset = time.now();
    return parseInt(result, 10);
  };
}

// export const siteNameFromID = (id) => SITES[parseInt(id, 10) - 1];
// export const siteIDFromName = (name) => (SITES.indexOf(name) + 1).toString();
