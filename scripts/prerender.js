const { spawn } = require('child_process');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

const DIST = path.resolve(__dirname, '..', 'dist');
const PORT = process.env.PRERENDER_PORT || 4173;
const HOST = `http://localhost:${PORT}`;
const ROUTES = ['/', '/admin'];

function waitForServer(retries = 20, delay = 300) {
  return new Promise((resolve, reject) => {
    let attempt = 0;
    const tryFetch = async () => {
      attempt++;
      try {
        const res = await fetch(HOST + '/');
        if (res.ok) return resolve();
      } catch (e) {}
      if (attempt >= retries) return reject(new Error('Server did not start in time'));
      setTimeout(tryFetch, delay);
    };
    tryFetch();
  });
}

async function prerenderRoutes() {
  for (const route of ROUTES) {
    const url = HOST + (route === '/' ? '/' : route);
    console.log('Prerendering', url);
    try {
      const res = await fetch(url);
      const text = await res.text();

      // compute output path
      const outPath = route === '/' ? path.join(DIST, 'index.html') : path.join(DIST, route.replace(/^\//, ''), 'index.html');
      const outDir = path.dirname(outPath);
      fs.mkdirSync(outDir, { recursive: true });
      fs.writeFileSync(outPath, text, 'utf8');
      console.log('Wrote', outPath);
    } catch (err) {
      console.error('Failed to prerender', route, err);
    }
  }
}

async function run() {
  console.log('Starting static server to prerender dist on port', PORT);
  const server = spawn('npx', ['serve', 'dist', '-s', '-l', String(PORT)], { stdio: 'inherit' });

  try {
    await waitForServer();
    await prerenderRoutes();
  } catch (err) {
    console.error(err);
  } finally {
    console.log('Stopping server');
    server.kill('SIGTERM');
  }
}

run();
