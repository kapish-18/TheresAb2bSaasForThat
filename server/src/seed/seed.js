require('dotenv').config();
const connectDB = require('../config/db');
const Problem = require('../models/Problem');
const seedData = require('./seedData.json');

async function seed() {
  await connectDB();
  console.log(`Clearing existing problems...`);
  await Problem.deleteMany({});
  console.log(`Inserting ${seedData.length} problems...`);
  await Problem.insertMany(seedData);
  console.log('Seed complete.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
