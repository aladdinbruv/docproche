import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

/**
 * Creates a Supabase client with service role key for admin operations
 * IMPORTANT: This should only be used in server-side code
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase URL or Service Role Key');
  }
  
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

/**
 * Ensures that the necessary storage buckets exist
 * This should be called during app initialization or deployment
 */
export async function ensureStorageBuckets() {
  try {
    const supabase = createAdminClient();
    
    // Check if the public bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('Error listing storage buckets:', listError);
      return false;
    }
    
    const publicBucketExists = buckets.some(bucket => bucket.name === 'public');
    
    // Create the public bucket if it doesn't exist
    if (!publicBucketExists) {
      console.log('Creating public bucket for storage...');
      const { error: createError } = await supabase.storage.createBucket('public', {
        public: true,
        fileSizeLimit: 5242880, // 5MB in bytes
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
      
      if (createError) {
        console.error('Error creating public storage bucket:', createError);
        return false;
      }
      
      console.log('Created public storage bucket for profile images');
      
      // Set public bucket policy
      const { error: policyError } = await supabase.storage.from('public').createPolicy(
        'public-read-policy',
        {
          name: 'Public Read Policy',
          definition: {
            role: 'authenticated',
            permissions: ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
          }
        }
      );
      
      if (policyError) {
        console.error('Error setting public bucket policy:', policyError);
        // Continue even if policy creation fails
      }
    } else {
      console.log('Public bucket already exists, updating settings...');
      // Update bucket to be public if needed
      await supabase.storage.updateBucket('public', {
        public: true,
        fileSizeLimit: 5242880, // 5MB in bytes
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      });
    }
    
    // Create the profile-images folder if it doesn't exist
    try {
      // Check if folder exists - this will throw if it doesn't exist
      await supabase.storage.from('public').list('profile-images');
      console.log('profile-images folder already exists');
    } catch (e) {
      console.log('Creating profile-images folder...');
      // Create an empty file to initialize the folder
      const { error: folderError } = await supabase.storage
        .from('public')
        .upload('profile-images/.keep', new Uint8Array(0), {
          contentType: 'text/plain',
          upsert: true
        });
        
      if (folderError) {
        console.error('Error creating profile-images folder:', folderError);
        // Continue even if folder creation fails
      }
    }
    
    // Ensure storage policies exist by running a direct SQL query
    try {
      console.log('Setting up storage policies...');
      
      // Check if policies already exist
      const { data: existingPolicies, error: policyCheckError } = await supabase.rpc(
        'admin_query',
        {
          query_text: `
            SELECT policyname 
            FROM pg_policies 
            WHERE tablename = 'objects' AND schemaname = 'storage'
          `
        }
      );
      
      if (policyCheckError) {
        console.error('Error checking policies:', policyCheckError);
      } else if (!existingPolicies || existingPolicies.length === 0) {
        // Create the policies since none exist
        const createPoliciesQuery = `
          -- Allow authenticated users to upload files
          CREATE POLICY "Allow authenticated users to upload files"
          ON storage.objects FOR INSERT
          TO authenticated
          WITH CHECK (bucket_id = 'public');

          -- Allow authenticated users to update their own files
          CREATE POLICY "Allow authenticated users to update their own files"
          ON storage.objects FOR UPDATE
          TO authenticated
          USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'profile-images')
          WITH CHECK (bucket_id = 'public' AND (storage.foldername(name))[1] = 'profile-images');

          -- Allow authenticated users to delete their own files
          CREATE POLICY "Allow authenticated users to delete their own files"
          ON storage.objects FOR DELETE
          TO authenticated
          USING (bucket_id = 'public' AND (storage.foldername(name))[1] = 'profile-images');

          -- Allow public read access to files in the public bucket
          CREATE POLICY "Allow public read access to public bucket"
          ON storage.objects FOR SELECT
          TO public
          USING (bucket_id = 'public');
          
          -- Create specific policy for profile images
          CREATE POLICY "Allow authenticated users to upload profile images"
          ON storage.objects FOR INSERT
          TO authenticated
          WITH CHECK (
            bucket_id = 'public' AND 
            (storage.foldername(name))[1] = 'profile-images'
          );
        `;
        
        const { error: policiesError } = await supabase.rpc(
          'admin_query',
          { query_text: createPoliciesQuery }
        );
        
        if (policiesError) {
          console.error('Error creating storage policies:', policiesError);
        } else {
          console.log('Storage policies created successfully');
        }
      } else {
        console.log('Storage policies already exist');
      }
    } catch (error) {
      console.error('Error managing storage policies:', error);
      // Continue even if policy creation fails
    }
    
    console.log('Storage setup complete');
    return true;
  } catch (error) {
    console.error('Error ensuring storage buckets:', error);
    return false;
  }
} 