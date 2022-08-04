import S from 'fluent-json-schema';
import schedule, { fetchUser } from '../scheduler.js';
import checkProxy from '../utils/proxy.js';

// Define the schema of a client
export const client = S.object()
  .additionalProperties(false)
  .prop('id', S.string().format('uuid').required())
  .prop('username', S.string().required())
  .prop('proxy', S.string().format('url').required());

/**
 * POST / - Connect a new vote client to the server
 * @param {import('fastify').FastifyRequest} request
 * @param {import('fastify').FastifyReply} reply
 */
export async function connect(request, reply) {
  // Retrieve the client from the request body
  const { username, proxy } = request.body;

  // TODO: Check if the client is already connected

  // Check if the provided username is valid
  try {
    await fetchUser(username);
  } catch {
    return reply.status(400).send({ error: 'INVALID_USERNAME' });
  }

  // Check if the provided proxy is valid
  try {
    request.body.ip = await checkProxy(proxy);
  } catch {
    return reply.status(400).send({ error: 'INVALID_PROXY' });
  }

  // Schedule the next vote jobs
  try {
    await schedule(request.body);
  } catch (err) {
    // TODO: LOG ERROR
    return reply.status(500).send({ error: 'SCHEDULER_ERROR' });
  }

  return reply.status(200).send(request.body);
}

export function disconnect() {}
