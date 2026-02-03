/**
 * OpenClaw Supabase Admin Client
 * Com Service Role Key, pode fazer operações administrativas
 */

const { createClient } = require('@supabase/supabase-js');

// Configuração do guia
const SUPABASE_URL = 'https://sxiqbhcnkzrrenzgncss.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4aXFiaGNua3pycmVuemduY3NzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0Njc0NDcwNCwiZXhwIjoyMDYyMzIwNzA0fQ.DirUAOIZrzSjOEmrcEm9MDm9dCqx1nc0RfXEhT_HJMs';

// Cliente admin (ignora RLS)
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Cliente público (com RLS)
const supabasePublic = createClient(SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '', {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  }
});

module.exports = { 
  supabaseAdmin, 
  supabasePublic,
  SUPABASE_URL 
};

/**
 * Executa query SQL diretamente (requer função RPC no banco)
 */
async function executeSQL(sql) {
  const { data, error } = await supabaseAdmin.rpc('exec_sql', { sql_query: sql });
  if (error) throw error;
  return data;
}

/**
 * Cria tabela (se não existir)
 */
async function createTable(name, columns) {
  let sql = `CREATE TABLE IF NOT EXISTS ${name} (\n`;
  const cols = [];
  for (const [col, type] of Object.entries(columns)) {
    cols.push(`  ${col} ${type}`);
  }
  sql += cols.join(',\n') + '\n)';
  return executeSQL(sql);
}

/**
 * Lista todas as tabelas
 */
async function listTables() {
  const { data, error } = await supabaseAdmin
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  if (error) throw error;
  return data;
}

/**
 * Verifica se tabela existe
 */
async function tableExists(name) {
  const tables = await listTables();
  return tables.some(t => t.table_name === name);
}

module.exports = { 
  supabaseAdmin, 
  supabasePublic,
  SUPABASE_URL,
  executeSQL,
  createTable,
  listTables,
  tableExists
};
