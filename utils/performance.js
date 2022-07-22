import { performance as time } from 'node:perf_hooks';

export default function performance(startAt = time.now()) {
  let offset = time.now();
  return (untilStart = false) => {
    const result = time.now() - (untilStart ? startAt : offset);
    offset = time.now();
    return parseInt(result, 10);
  };
}
