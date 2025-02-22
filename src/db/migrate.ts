import { runMigrations } from './config';

// Run migrations
console.log('Running migrations...');
runMigrations()
  .then(() => {
    console.log('Migrations completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  }); 