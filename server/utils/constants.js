// The options used to connect to the Redis server
export const REDIS_CONNECTION = {
  connection: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD || '',
    tls: false,
  },
};

// A list of names of the queues used by the application
// NOTE: It corresponds to the names of the votes sites
export const QUEUES = [
  'serveurs-minecraft.org',
  'serveur-prive.net',
  'top-serveurs.net',
];
