import { createApp } from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function main() {
  await connectDB();
  console.log('[db] connected to MongoDB');

  const app = createApp();
  app.listen(env.port, () => {
    console.log(`[server] listening on port ${env.port} (${env.nodeEnv})`);
  });
}

main().catch((err) => {
  console.error('[server] error starting app:', err);
  process.exit(1);
});

