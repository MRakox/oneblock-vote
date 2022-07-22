import {
  MIN_TYPE_SPEED, MAX_TYPE_SPEED, MIN_CLICK_DELAY, MAX_CLICK_DELAY,
} from './constants.js';

export const random = (min, max) => Math.floor(Math.random() * (max - min)) + min;
export const randomTypeSpeed = () => random(MIN_TYPE_SPEED, MAX_TYPE_SPEED);
export const randomClickDelay = () => random(MIN_CLICK_DELAY, MAX_CLICK_DELAY);
