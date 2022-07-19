import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import { QueueScheduler, Queue } from 'bullmq';
import fastify from 'fastify';
import { QUEUE_NAME, REDIS_CONNECTION } from './constants.js';

export const scheduler = new QueueScheduler(QUEUE_NAME, REDIS_CONNECTION);
export const queue = new Queue(QUEUE_NAME, REDIS_CONNECTION);

const app = fastify();
const serverAdapter = new FastifyAdapter();

createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter,
});

app
  .register(serverAdapter.registerPlugin())
  .listen({ port: process.env.SERVER_PORT })
  .then((adress) => console.log(`🚀 Server ready at ${adress}`));
