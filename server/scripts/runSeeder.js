import { seedHugeDataToMongoDB } from '../services/mongoSeeder.js';

async function run() {
  console.log('--- Cinevo Huge Test Data Seeder Execution ---');
  try {
    const result = await seedHugeDataToMongoDB();
    console.log('\nSeeding Result:\n', JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Seeding execution failed:', err);
    process.exit(1);
  }
}

run();
