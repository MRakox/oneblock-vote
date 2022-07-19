/**
 * MIT License
 *
 * Copyright (c) 2020 Daniel Gatis
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * Adapted from: https://github.com/danielgatis/puppeteer-recaptcha-solver
 * Original author: Daniel Gatis <danielgatis@gmail.com>
 */

/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import axios from 'axios';
import { Agent } from 'https';
import { random } from './utils.js';

// eslint-disable-next-line consistent-return
async function solve(page) {
  try {
    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/anchor"]');
      if (!iframe) return false;
      return !!iframe.contentWindow.document.querySelector('#recaptcha-anchor');
    });

    let frames = await page.frames();
    const recaptchaFrame = frames.find((frame) => frame.url().includes('api2/anchor'));

    const checkbox = await recaptchaFrame.$('#recaptcha-anchor');
    await checkbox.click({ delay: random(30, 150) });

    await page.waitForFunction(() => {
      const iframe = document.querySelector('iframe[src*="api2/bframe"]');
      if (!iframe) return false;

      const img = iframe.contentWindow.document.querySelector(
        '.rc-image-tile-wrapper img',
      );
      return img && img.complete;
    });

    frames = await page.frames();
    const imageFrame = frames.find((frame) => frame.url().includes('api2/bframe'));
    const audioButton = await imageFrame.$('#recaptcha-audio-button');
    await audioButton.click({ delay: random(30, 150) });

    // eslint-disable-next-line no-constant-condition
    while (true) {
      try {
        await page.waitForFunction(
          () => {
            const iframe = document.querySelector('iframe[src*="api2/bframe"]');
            if (!iframe) return false;

            return !!iframe.contentWindow.document.querySelector(
              '.rc-audiochallenge-tdownload-link',
            );
          },
          { timeout: 5000 },
        );
      } catch (e) {
        console.error(e);
        continue;
      }

      const audioLink = await page.evaluate(() => {
        const iframe = document.querySelector('iframe[src*="api2/bframe"]');
        return iframe.contentWindow.document.querySelector('#audio-source').src;
      });

      // eslint-disable-next-line no-shadow
      const audioBytes = await page.evaluate((audioLink) => (async () => {
        const response = await window.fetch(audioLink);
        const buffer = await response.arrayBuffer();
        return Array.from(new Uint8Array(buffer));
      })(), audioLink);

      const httsAgent = new Agent({ rejectUnauthorized: false });
      const response = await axios({
        httsAgent,
        method: 'post',
        url: 'https://api.wit.ai/speech?v=2021092',
        data: new Uint8Array(audioBytes).buffer,
        headers: {
          Authorization: `Bearer ${process.env.WIT_TOKEN}`,
          'Content-Type': 'audio/mpeg3',
        },
      });

      let audioTranscript = null;

      try {
        audioTranscript = response.data.match('"text": "(.*)",')[1].trim();
      } catch (e) {
        const reloadButton = await imageFrame.$('#recaptcha-reload-button');
        await reloadButton.click({ delay: random(30, 150) });
        continue;
      }

      const input = await imageFrame.$('#audio-response');
      await input.click({ delay: random(30, 150) });
      await input.type(audioTranscript, { delay: random(30, 75) });

      const verifyButton = await imageFrame.$('#recaptcha-verify-button');
      await verifyButton.click({ delay: random(30, 150) });

      try {
        await page.waitForFunction(
          () => {
            const iframe = document.querySelector('iframe[src*="api2/anchor"]');
            if (!iframe) return false;

            return !!iframe.contentWindow.document.querySelector(
              '#recaptcha-anchor[aria-checked="true"]',
            );
          },
          { timeout: 5000 },
        );

        return page.evaluate(
          () => document.getElementById('g-recaptcha-response').value,
        );
      } catch (e) {
        console.error(e);
        continue;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

export default solve;
