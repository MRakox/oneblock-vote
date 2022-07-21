import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import { QueueScheduler, Queue } from 'bullmq';
import fastify from 'fastify';
import { QUEUE_NAME, REDIS_CONNECTION, SITES } from './constants.js';

export const queue = new Queue(QUEUE_NAME, REDIS_CONNECTION);
export const schedulers = SITES.map((site) => new QueueScheduler(site, REDIS_CONNECTION));
export const queues = Object.fromEntries(
  SITES.map((site) => [site, new Queue(site, REDIS_CONNECTION)]),
);

const app = fastify();
const serverAdapter = new FastifyAdapter();

createBullBoard({
  queues: [...Object.values(queues).map(BullMQAdapter), new BullMQAdapter(queue)],
  serverAdapter,
});

app
  .register(serverAdapter.registerPlugin())
  .listen({ port: process.env.SERVER_PORT })
  .then((adress) => console.log(`🚀 Server ready at ${adress}`));
