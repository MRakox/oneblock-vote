import { request as fetch } from 'http';

export const PROXY_ERROR_CODE = 'PROXY_ERROR';

/**
 * Check whether the provided proxy is working
 * NOTE: The promise will reject if the proxy is not working or if the request failed
 * @param {string} proxy The proxy to check
 */
export default function checkProxy(proxy) {
  return new Promise((resolve, reject) => {
    // Connect to google.com to check if the proxy is working
    const request = fetch({
      path: 'www.google.com:443',
      method: 'CONNECT',
      timeout: 1000,
      agent: false,
      // Proxy connection settings
      host: new URL(proxy).hostname,
      port: new URL(proxy).port,
    });
    // Listen on the socket for the response and handle it
    request
      .on('connect', (res) => (request.destroy() && res.statusCode === 200 ? resolve() : reject(PROXY_ERROR_CODE)))
      .on('timeout', () => request.destroy())
      .on('error', (err) => reject((err && err.code) || PROXY_ERROR_CODE))
      .end();
  });
}
