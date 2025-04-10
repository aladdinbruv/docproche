import SupabaseChecker from '@/components/SupabaseChecker';

export const metadata = {
  title: 'Supabase Connection Test | DocToProche',
  description: 'Test the connection to Supabase',
};

export default function SupabaseTestPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8 text-center">Supabase Connection Test</h1>
      <SupabaseChecker />
    </div>
  );
} 