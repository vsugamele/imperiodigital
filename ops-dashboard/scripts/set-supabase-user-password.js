/* eslint-disable @typescript-eslint/no-require-imports */
/*
  Set a Supabase Auth user's password using the Service Role key.

  Usage:
    node -r dotenv/config scripts/set-supabase-user-password.js --email you@example.com --password "newPass"

  Requires in .env.local (already copied from dashboard/.env.local):
    NEXT_PUBLIC_SUPABASE_URL
    SUPABASE_SERVICE_ROLE_KEY
*/

const { createClient } = require("@supabase/supabase-js");

function arg(name) {
  const i = process.argv.indexOf(name);
  return i === -1 ? null : process.argv[i + 1];
}

async function main() {
  const email = arg("--email");
  const password = arg("--password");

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in env");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in env");
  }
  if (!email) throw new Error("Missing --email");
  if (!password) throw new Error("Missing --password");

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data: list, error: listErr } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });
  if (listErr) throw listErr;

  const user = list.users.find((u) => (u.email || "").toLowerCase() === email.toLowerCase());
  if (!user) {
    throw new Error(`User not found for email: ${email}`);
  }

  const { data, error } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    password,
  });
  if (error) throw error;

  console.log(`OK: password updated for ${email} (id=${data.user.id})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
