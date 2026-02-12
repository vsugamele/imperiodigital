import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  if (supabase) {
    await supabase.auth.signOut();
  }

  const origin = (await headers()).get("origin") ?? "http://localhost:3000";
  return NextResponse.redirect(new URL("/login", origin));
}
