/**
 * RateIt — Idempotent Development Seed
 *
 * Seeds all 9 categories and their rating criteria.
 * Safe to run multiple times (upserts by unique keys).
 *
 * ⚠️  Make sure DATABASE_URL points to your Supabase project!
 *
 * Usage:
 *   pnpm --filter @rateit/database run seed
 *   # or from root:
 *   pnpm db:seed
 */

import { PrismaClient } from '../generated/client/index.js';

const prisma = new PrismaClient();

interface CategorySeed {
  name: string;
  slug: string;
  description: string;
  criteria: { name: string; description: string; displayOrder: number }[];
}

const categories: CategorySeed[] = [
  {
    name: 'Movies',
    slug: 'movies',
    description: 'Rate and review movies across story, acting, visuals, and sound.',
    criteria: [
      { name: 'Story', description: 'Plot quality, originality, and pacing', displayOrder: 1 },
      { name: 'Acting', description: 'Performance quality of the cast', displayOrder: 2 },
      {
        name: 'Visuals',
        description: 'Cinematography, effects, and visual style',
        displayOrder: 3,
      },
      { name: 'Sound', description: 'Music, sound effects, and audio design', displayOrder: 4 },
    ],
  },
  {
    name: 'Hotels',
    slug: 'hotels',
    description: 'Rate and review hotels on cleanliness, location, service, and value.',
    criteria: [
      { name: 'Cleanliness', description: 'Room and facility cleanliness', displayOrder: 1 },
      { name: 'Location', description: 'Convenience and surroundings', displayOrder: 2 },
      { name: 'Service', description: 'Staff friendliness and responsiveness', displayOrder: 3 },
      {
        name: 'Value for Money',
        description: 'Overall worth relative to price',
        displayOrder: 4,
      },
    ],
  },
  {
    name: 'Restaurants',
    slug: 'restaurants',
    description: 'Rate and review restaurants on food quality, service, hygiene, and more.',
    criteria: [
      { name: 'Food Quality', description: 'Taste, freshness, and presentation', displayOrder: 1 },
      { name: 'Service', description: 'Staff attentiveness and speed', displayOrder: 2 },
      { name: 'Hygiene', description: 'Cleanliness of the establishment', displayOrder: 3 },
      {
        name: 'Ambience',
        description: 'Atmosphere, decor, and overall vibe',
        displayOrder: 4,
      },
      {
        name: 'Value for Money',
        description: 'Overall worth relative to price',
        displayOrder: 5,
      },
    ],
  },
  {
    name: 'Shops',
    slug: 'shops',
    description: 'Rate and review shops on product quality, pricing, and service.',
    criteria: [
      { name: 'Product Quality', description: 'Quality of goods offered', displayOrder: 1 },
      { name: 'Price Fairness', description: 'Reasonable pricing', displayOrder: 2 },
      { name: 'Customer Service', description: 'Helpfulness and support', displayOrder: 3 },
      {
        name: 'Reliability',
        description: 'Consistency and trustworthiness',
        displayOrder: 4,
      },
    ],
  },
  {
    name: 'Smartphones',
    slug: 'smartphones',
    description: 'Rate and review smartphones on performance, camera, battery, and more.',
    criteria: [
      { name: 'Performance', description: 'Speed, responsiveness, and power', displayOrder: 1 },
      { name: 'Camera', description: 'Photo and video quality', displayOrder: 2 },
      { name: 'Battery', description: 'Battery life and charging speed', displayOrder: 3 },
      {
        name: 'Display',
        description: 'Screen quality, brightness, and color accuracy',
        displayOrder: 4,
      },
      {
        name: 'Value for Money',
        description: 'Overall worth relative to price',
        displayOrder: 5,
      },
    ],
  },
  {
    name: 'TVs',
    slug: 'tvs',
    description: 'Rate and review televisions on picture, sound, and smart features.',
    criteria: [
      { name: 'Picture Quality', description: 'Resolution, color, and contrast', displayOrder: 1 },
      { name: 'Sound Quality', description: 'Built-in speaker performance', displayOrder: 2 },
      { name: 'Smart Features', description: 'OS, apps, and connectivity', displayOrder: 3 },
      {
        name: 'Value for Money',
        description: 'Overall worth relative to price',
        displayOrder: 4,
      },
    ],
  },
  {
    name: 'Refrigerators',
    slug: 'refrigerators',
    description: 'Rate and review refrigerators on cooling, efficiency, and build quality.',
    criteria: [
      {
        name: 'Cooling Performance',
        description: 'Cooling speed and temperature consistency',
        displayOrder: 1,
      },
      {
        name: 'Energy Efficiency',
        description: 'Power consumption and efficiency rating',
        displayOrder: 2,
      },
      {
        name: 'Build Quality',
        description: 'Materials and construction durability',
        displayOrder: 3,
      },
      {
        name: 'Storage Capacity',
        description: 'Internal space and organization',
        displayOrder: 4,
      },
    ],
  },
  {
    name: 'Headphones',
    slug: 'headphones',
    description: 'Rate and review headphones on sound, comfort, build, and battery.',
    criteria: [
      { name: 'Sound Quality', description: 'Audio fidelity and clarity', displayOrder: 1 },
      { name: 'Comfort', description: 'Fit and wearability over time', displayOrder: 2 },
      { name: 'Build Quality', description: 'Materials and durability', displayOrder: 3 },
      { name: 'Battery Life', description: 'Wireless battery duration', displayOrder: 4 },
    ],
  },
  {
    name: 'PC Parts',
    slug: 'pc-parts',
    description: 'Rate and review PC components on performance, reliability, and thermals.',
    criteria: [
      { name: 'Performance', description: 'Speed and benchmark results', displayOrder: 1 },
      { name: 'Reliability', description: 'Longevity and consistency', displayOrder: 2 },
      {
        name: 'Thermal Performance',
        description: 'Heat management and cooling',
        displayOrder: 3,
      },
      {
        name: 'Value for Money',
        description: 'Overall worth relative to price',
        displayOrder: 4,
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding RateIt database...\n');

  for (const cat of categories) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {
        name: cat.name,
        description: cat.description,
      },
      create: {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        isActive: true,
      },
    });

    console.log(`  ✅ Category: ${category.name}`);

    for (const criterion of cat.criteria) {
      await prisma.ratingCriterion.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: criterion.name,
          },
        },
        update: {
          description: criterion.description,
          displayOrder: criterion.displayOrder,
        },
        create: {
          categoryId: category.id,
          name: criterion.name,
          description: criterion.description,
          displayOrder: criterion.displayOrder,
          isActive: true,
        },
      });
    }
    console.log(`     → ${cat.criteria.length} criteria seeded`);
  }

  console.log('\n✨ Seed completed successfully!');
  console.log('\n📌 To create an admin user:');
  console.log('   1. Register a user through the app (Supabase Auth)');
  console.log("   2. Copy the user's UUID from Supabase Auth dashboard");
  console.log('   3. Run this SQL in Supabase SQL Editor:');
  console.log("      UPDATE users SET role = 'ADMIN' WHERE id = '<YOUR-USER-UUID>';");
  console.log('   Or use Prisma Studio: pnpm db:studio');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
