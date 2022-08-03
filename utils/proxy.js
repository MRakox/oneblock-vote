import HttpsProxyAgent from 'https-proxy-agent';
import fetch from 'node-fetch';

export const PROXY_ERROR_CODE = 'PROXY_ERROR';

/**
 * Check whether the provided proxy is working
 * NOTE: The promise will reject if the proxy is not working or if the request failed.
 *       Otherwise, the proxy ip adress will be returned.
 * @param {string} proxy The proxy to check
 * @returns {Promise<string>} The proxy ip adress
 */
export default async function checkProxy(proxy) {
  const request = await fetch(
    'https://api.ipify.org/?format=json',
    { agent: new HttpsProxyAgent(proxy) },
  );
  const { ip } = await request.json();
  if (!ip) throw PROXY_ERROR_CODE;
  return ip;
}
