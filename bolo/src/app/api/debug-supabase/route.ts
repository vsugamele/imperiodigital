import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  const result: any = {
    timestamp: new Date().toISOString(),
    hasEnv: !!(url && key),
  };
  
  if (url && key) {
    result.config = {
      url: url.substring(0, 40) + '...',
      keyPrefix: key.substring(0, 15) + '...',
    };
    
    try {
      const supabase = createClient(url, key);
      const { data, error } = await supabase.auth.getSession();
      
      result.session = data.session ? {
        hasSession: true,
        userId: data.session.user?.id,
        email: data.session.user?.email,
      } : { hasSession: false };
      
      if (error) result.error = error.message;
      
      // Also check if tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .like('table_name', 'bolo_%');
      
      result.tables = tables;
      
    } catch (e: any) {
      result.exception = e.message;
    }
  }
  
  // Log to file for debugging
  try {
    fs.appendFileSync('C:\\Users\\vsuga\\clawd\\bolo\\debug-supabase.log', JSON.stringify(result, null, 2) + '\n---\n');
  } catch (e) {}
  
  return new Response(JSON.stringify(result, null, 2), {
    headers: { 'Content-Type': 'application/json' }
  });
}
