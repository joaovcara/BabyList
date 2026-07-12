import app from './app.js';
import { env } from './config/env.js';
import { databaseRepository } from './repositories/database.repository.js';

async function main() {
  await databaseRepository.initialize();
  app.listen(env.port, () => {
    console.log(`BabyList API running on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
