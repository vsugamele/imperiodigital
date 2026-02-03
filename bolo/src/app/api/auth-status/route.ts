import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const result: any = {
    timestamp: new Date().toISOString(),
  };

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  result.user = user ? { id: user.id, email: user.email } : null;
  result.userError = userError?.message;

  // Check if bolo_profiles exists and has this user
  if (user) {
    const { data: profile, error: profileError } = await supabase
      .from('bolo_profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    result.profile = profile;
    result.profileError = profileError?.message;

    // If no profile, create one
    if (!profile && !profileError) {
      const { data: newProfile, error: createError } = await supabase
        .from('bolo_profiles')
        .insert({
          id: user.id,
          email: user.email,
          company_name: user.user_metadata?.company_name || 'Minha Empresa',
          credits: 100,
          plan: 'starter'
        })
        .select()
        .single();
      
      result.createdProfile = newProfile;
      result.createError = createError?.message;
    }
  }

  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
