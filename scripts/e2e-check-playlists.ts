import { chromium } from 'playwright';
import jwt from 'jsonwebtoken';

async function run() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    // Ensure the request will be same-origin as Vite origin
    viewport: { width: 1280, height: 800 }
  });
  page.on('console', (msg) => {
    console.log('PAGE LOG>', msg.type(), msg.text());
  });
  // capture responses to /api/playlists
  const playlistResponses: any[] = [];
  page.on('response', async (resp) => {
    try {
      const url = resp.url();
      if (url.includes('/api/playlists')) {
        const text = await resp.text();
        playlistResponses.push({ url, status: resp.status(), body: text.slice(0, 10000) });
        console.log('Captured playlist response', resp.status(), url);
      }
    } catch (e) {
      // ignore
    }
  });

  // Set auth token for user 1 (simulate logged-in Super Admin) so /api/subscriptions/mine returns subscriptions
  try {
    const token = jwt.sign({ id: '1' }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });
    await page.addInitScript((t) => {
      localStorage.setItem('authToken', t);
      localStorage.setItem('authUser', JSON.stringify({ id: 1, name: 'Super Admin' }));
    }, token);
  } catch (e) {
    console.warn('Could not create auth token for E2E');
  }

  // Try common Vite ports (5173, 5174) and pick the first that responds
  const candidates = [5173, 5174];
  let url = '';
  for (const p of candidates) {
    try {
      const tryUrl = `http://localhost:${p}/channel/CH-UWMkr1KK88`;
      const res = await page.goto(tryUrl, { waitUntil: 'domcontentloaded', timeout: 3000 }).catch(() => null);
      if (res && res.ok()) { url = tryUrl; break; }
    } catch (e) {
      // ignore and try next
    }
  }
  if (!url) url = 'http://localhost:5173/channel/CH-UWMkr1KK88';
  console.log('Opening', url);
  await page.goto(url, { waitUntil: 'networkidle' });

  // Wait for the channel page to render the playlists section (tab may default to videos)
  // If playlists tab is not active, click the tab button
  const playlistsTab = await page.$('button.tab-button:has-text("Playlists")');
  if (playlistsTab) {
    await playlistsTab.click();
  }

  // Wait for playlists grid or no-results
  await page.waitForTimeout(1000);

  const playlistCards = await page.$$eval('.playlists-grid .video-card-link', els => els.length);
  console.log('Playlist cards found:', playlistCards);
  console.log('Captured playlistResponses count:', playlistResponses.length);
  if (playlistResponses.length > 0) {
    console.log('Playlist response sample:', playlistResponses[0].body.slice(0, 1000));
  }

  // Take screenshot for verification
  await page.screenshot({ path: 'e2e-channel-playlists.png', fullPage: true });

  await browser.close();
  process.exit(playlistCards > 0 ? 0 : 2);
}

run().catch((err) => { console.error(err); process.exit(1); });