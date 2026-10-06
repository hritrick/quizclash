const [baseUrl, expectedRevision, socketUrl] = process.argv.slice(2);
if (!baseUrl || !expectedRevision) throw new Error('Usage: node scripts/verify-deployment.mjs URL COMMIT [SOCKET_URL]');
const deadline = Date.now() + 12 * 60 * 1000;
let lastError;
while (Date.now() < deadline) {
  try {
    if (socketUrl && new URL(baseUrl).hostname.endsWith('.vercel.app')) {
      const deployed = await fetch(new URL('/deployment.json', baseUrl), { signal: AbortSignal.timeout(15000), cache: 'no-store' });
      if (!deployed.ok || (await deployed.json()).revision !== expectedRevision) throw new Error('Waiting for matching frontend revision');
    }
    const response = await fetch(new URL('/api/health', baseUrl), { signal: AbortSignal.timeout(15000) });
    const health = await response.json();
    if (!response.ok || health.database !== 'connected' || health.revision !== expectedRevision) throw new Error(`Waiting for healthy revision ${expectedRevision}: HTTP ${response.status}, revision ${health.revision}`);
    const catalog = await fetch(new URL('/api/v1/quizzes', baseUrl), { signal: AbortSignal.timeout(15000) });
    if (!catalog.ok || !(await catalog.json()).success) throw new Error('Quiz catalog failed');
    if (socketUrl) {
      const handshake = await fetch(new URL('/socket.io/?EIO=4&transport=polling', socketUrl), { signal: AbortSignal.timeout(60000) });
      if (!handshake.ok || !(await handshake.text()).startsWith('0{')) throw new Error('Socket.IO handshake failed');
    }
    console.log(`Verified deployment ${expectedRevision} at ${baseUrl}`);
    process.exit(0);
  } catch (error) {
    lastError = error;
    console.log(error.message);
    await new Promise((resolve) => setTimeout(resolve, 15000));
  }
}
throw lastError || new Error('Deployment did not become healthy');
