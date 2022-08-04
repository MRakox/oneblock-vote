import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter.js';
import { FastifyAdapter } from '@bull-board/fastify';
import { QueueScheduler, Queue } from 'bullmq';
import fastify from 'fastify';

import { client, connect, disconnect } from './routes/clients.js';
import { QUEUES, REDIS_CONNECTION } from './utils/constants.js';

// Initialize BullMQ queue and scheduler
export const schedulers = QUEUES.map((name) => new QueueScheduler(name, REDIS_CONNECTION));
export const queues = QUEUES.map((name) => new Queue(name, REDIS_CONNECTION));

// Initialize Fastify server
const app = fastify();
const serverAdapter = new FastifyAdapter();

// Initialize BullBoard API
createBullBoard({
  queues: queues.map((queue) => new BullMQAdapter(queue)),
  serverAdapter,
});

// Register routes
app.post('/', { schema: { body: client } }, connect);
app.delete('/', disconnect);

// Register BullBoard API routes & start the server
app.register(serverAdapter.registerPlugin())
  .listen({ host: '0.0.0.0', port: process.env.SERVER_PORT })
  .then((adress) => console.log(`🚀 Server ready at ${adress}`));
