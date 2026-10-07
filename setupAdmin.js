import { createAdminUser } from './utils/createAdminUser.js';

console.log('🚀 Creating admin user...');

await createAdminUser();

console.log('✅ Admin user setup complete!');

process.exit(0);