import { PrismaClient } from '../generated/client/index.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🔒 Configuring Storage RLS policies for bucket `listing-images`...');

  // Enable public read on listing-images bucket
  try {
    await prisma.$executeRawUnsafe(`
      DO $$
      BEGIN
        -- Ensure bucket exists in storage.buckets
        INSERT INTO storage.buckets (id, name, public)
        VALUES ('listing-images', 'listing-images', true)
        ON CONFLICT (id) DO UPDATE SET public = true;

        -- 1. Allow public select (view/read images)
        DROP POLICY IF EXISTS "Public listing images read" ON storage.objects;
        CREATE POLICY "Public listing images read"
        ON storage.objects FOR SELECT
        TO public
        USING (bucket_id = 'listing-images');

        -- 2. Allow authenticated users to insert/upload images
        DROP POLICY IF EXISTS "Authenticated users listing images upload" ON storage.objects;
        CREATE POLICY "Authenticated users listing images upload"
        ON storage.objects FOR INSERT
        TO authenticated
        WITH CHECK (bucket_id = 'listing-images');

        -- 3. Allow anon users to insert (in case auth is anon or client-side upload)
        DROP POLICY IF EXISTS "Anon listing images upload" ON storage.objects;
        CREATE POLICY "Anon listing images upload"
        ON storage.objects FOR INSERT
        TO anon
        WITH CHECK (bucket_id = 'listing-images');

        -- 4. Allow authenticated users to update their objects
        DROP POLICY IF EXISTS "Authenticated users listing images update" ON storage.objects;
        CREATE POLICY "Authenticated users listing images update"
        ON storage.objects FOR UPDATE
        TO authenticated
        USING (bucket_id = 'listing-images');

        -- 5. Allow authenticated users to delete objects
        DROP POLICY IF EXISTS "Authenticated users listing images delete" ON storage.objects;
        CREATE POLICY "Authenticated users listing images delete"
        ON storage.objects FOR DELETE
        TO authenticated
        USING (bucket_id = 'listing-images');

      END $$;
    `);

    console.log('✅ Successfully applied Storage RLS policies for `listing-images` bucket!');
  } catch (error) {
    console.error('❌ Error executing RLS policy script:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
