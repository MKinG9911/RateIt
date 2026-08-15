/**
 * RateIt — Idempotent Development Seed
 *
 * Seeds Parent Categories, Subcategories, and their Rating Criteria.
 * Safe to run multiple times (upserts by unique keys).
 */

import { PrismaClient } from '../generated/client/index.js';

const prisma = new PrismaClient();

interface SubcategorySeed {
  name: string;
  slug: string;
  description: string;
  criteria: { name: string; description: string; displayOrder: number }[];
}

interface ParentCategorySeed {
  name: string;
  slug: string;
  description: string;
  subcategories: SubcategorySeed[];
}

const categoryHierarchy: ParentCategorySeed[] = [
  {
    name: 'Education',
    slug: 'education',
    description: 'Universities, colleges, schools, and academic institutions.',
    subcategories: [
      {
        name: 'Universities',
        slug: 'universities',
        description: 'Rate and review public and private universities on academic quality, faculty, campus, and placement.',
        criteria: [
          { name: 'Academic Quality', description: 'Curriculum depth, research opportunities, and standards', displayOrder: 1 },
          { name: 'Faculty & Teaching', description: 'Professor expertise, accessibility, and instruction', displayOrder: 2 },
          { name: 'Campus & Facilities', description: 'Libraries, labs, housing, and campus infrastructure', displayOrder: 3 },
          { name: 'Career & Placement', description: 'Internship and job placement support', displayOrder: 4 },
        ],
      },
      {
        name: 'Colleges',
        slug: 'colleges',
        description: 'Rate and review degree-granting colleges and institutes.',
        criteria: [
          { name: 'Teaching Quality', description: 'Faculty excellence and teaching methods', displayOrder: 1 },
          { name: 'Campus Life', description: 'Student activities, clubs, and culture', displayOrder: 2 },
          { name: 'Infrastructure', description: 'Classrooms, labs, and sports facilities', displayOrder: 3 },
          { name: 'Value for Money', description: 'Tuition fairness and overall return on education', displayOrder: 4 },
        ],
      },
      {
        name: 'Schools',
        slug: 'schools',
        description: 'Rate and review primary, secondary, and high schools.',
        criteria: [
          { name: 'Academic Standards', description: 'Curriculum rigor and learning outcomes', displayOrder: 1 },
          { name: 'Teacher Care & Safety', description: 'Student safety, mentorship, and environment', displayOrder: 2 },
          { name: 'Extracurriculars', description: 'Sports, arts, and student development programs', displayOrder: 3 },
          { name: 'Facilities & Cleanliness', description: 'School infrastructure and hygiene', displayOrder: 4 },
        ],
      },
    ],
  },
  {
    name: 'Technology',
    slug: 'technology',
    description: 'Consumer electronics, appliances, and PC components.',
    subcategories: [
      {
        name: 'Smartphones',
        slug: 'smartphones',
        description: 'Rate and review smartphones on performance, camera, battery, and display.',
        criteria: [
          { name: 'Performance', description: 'Speed, responsiveness, and power', displayOrder: 1 },
          { name: 'Camera', description: 'Photo and video quality', displayOrder: 2 },
          { name: 'Battery', description: 'Battery life and charging speed', displayOrder: 3 },
          { name: 'Display', description: 'Screen quality, brightness, and color accuracy', displayOrder: 4 },
          { name: 'Value for Money', description: 'Overall worth relative to price', displayOrder: 5 },
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
          { name: 'Value for Money', description: 'Overall worth relative to price', displayOrder: 4 },
        ],
      },
      {
        name: 'Refrigerators',
        slug: 'refrigerators',
        description: 'Rate and review refrigerators on cooling, efficiency, and build quality.',
        criteria: [
          { name: 'Cooling Performance', description: 'Cooling speed and temperature consistency', displayOrder: 1 },
          { name: 'Energy Efficiency', description: 'Power consumption and efficiency rating', displayOrder: 2 },
          { name: 'Build Quality', description: 'Materials and construction durability', displayOrder: 3 },
          { name: 'Storage Capacity', description: 'Internal space and organization', displayOrder: 4 },
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
          { name: 'Thermal Performance', description: 'Heat management and cooling', displayOrder: 3 },
          { name: 'Value for Money', description: 'Overall worth relative to price', displayOrder: 4 },
        ],
      },
    ],
  },
  {
    name: 'Entertainment',
    slug: 'entertainment',
    description: 'Movies, cinema, and media content.',
    subcategories: [
      {
        name: 'Movies',
        slug: 'movies',
        description: 'Rate and review movies across story, acting, visuals, and sound.',
        criteria: [
          { name: 'Story', description: 'Plot quality, originality, and pacing', displayOrder: 1 },
          { name: 'Acting', description: 'Performance quality of the cast', displayOrder: 2 },
          { name: 'Visuals', description: 'Cinematography, effects, and visual style', displayOrder: 3 },
          { name: 'Sound', description: 'Music, sound effects, and audio design', displayOrder: 4 },
        ],
      },
    ],
  },
  {
    name: 'Hospitality',
    slug: 'hospitality',
    description: 'Hotels, resorts, and vacation stays.',
    subcategories: [
      {
        name: 'Hotels',
        slug: 'hotels',
        description: 'Rate and review hotels on cleanliness, location, service, and value.',
        criteria: [
          { name: 'Cleanliness', description: 'Room and facility cleanliness', displayOrder: 1 },
          { name: 'Location', description: 'Convenience and surroundings', displayOrder: 2 },
          { name: 'Service', description: 'Staff friendliness and responsiveness', displayOrder: 3 },
          { name: 'Value for Money', description: 'Overall worth relative to price', displayOrder: 4 },
        ],
      },
    ],
  },
  {
    name: 'Dining',
    slug: 'dining',
    description: 'Restaurants, cafes, and eateries.',
    subcategories: [
      {
        name: 'Restaurants',
        slug: 'restaurants',
        description: 'Rate and review restaurants on food quality, service, hygiene, and ambience.',
        criteria: [
          { name: 'Food Quality', description: 'Taste, freshness, and presentation', displayOrder: 1 },
          { name: 'Service', description: 'Staff attentiveness and speed', displayOrder: 2 },
          { name: 'Hygiene', description: 'Cleanliness of the establishment', displayOrder: 3 },
          { name: 'Ambience', description: 'Atmosphere, decor, and overall vibe', displayOrder: 4 },
          { name: 'Value for Money', description: 'Overall worth relative to price', displayOrder: 5 },
        ],
      },
    ],
  },
  {
    name: 'Retail & Shopping',
    slug: 'retail',
    description: 'Retail stores, supermarkets, and specialty shops.',
    subcategories: [
      {
        name: 'Shops',
        slug: 'shops',
        description: 'Rate and review shops on product quality, pricing, and service.',
        criteria: [
          { name: 'Product Quality', description: 'Quality of goods offered', displayOrder: 1 },
          { name: 'Price Fairness', description: 'Reasonable pricing', displayOrder: 2 },
          { name: 'Customer Service', description: 'Helpfulness and support', displayOrder: 3 },
          { name: 'Reliability', description: 'Consistency and trustworthiness', displayOrder: 4 },
        ],
      },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding RateIt hierarchical categories & rating criteria...\n');

  for (const parentSeed of categoryHierarchy) {
    const parentCategory = await prisma.category.upsert({
      where: { slug: parentSeed.slug },
      update: {
        name: parentSeed.name,
        description: parentSeed.description,
        parentId: null,
      },
      create: {
        name: parentSeed.name,
        slug: parentSeed.slug,
        description: parentSeed.description,
        parentId: null,
        isActive: true,
      },
    });

    console.log(`  📂 Parent Category: ${parentCategory.name}`);

    for (const subSeed of parentSeed.subcategories) {
      const subcategory = await prisma.category.upsert({
        where: { slug: subSeed.slug },
        update: {
          name: subSeed.name,
          description: subSeed.description,
          parentId: parentCategory.id,
        },
        create: {
          name: subSeed.name,
          slug: subSeed.slug,
          description: subSeed.description,
          parentId: parentCategory.id,
          isActive: true,
        },
      });

      console.log(`     └─ 📁 Subcategory: ${subcategory.name}`);

      for (const criterion of subSeed.criteria) {
        await prisma.ratingCriterion.upsert({
          where: {
            categoryId_name: {
              categoryId: subcategory.id,
              name: criterion.name,
            },
          },
          update: {
            description: criterion.description,
            displayOrder: criterion.displayOrder,
          },
          create: {
            categoryId: subcategory.id,
            name: criterion.name,
            description: criterion.description,
            displayOrder: criterion.displayOrder,
            isActive: true,
          },
        });
      }
      console.log(`        └─ ${subSeed.criteria.length} criteria seeded`);
    }
  }

  console.log('\n✨ Category hierarchy and criteria seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
