"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

type ActionResult =
  | { ok: true; warning?: string }
  | { ok: false; error: string };

export async function createBoard(formData: FormData): Promise<ActionResult> {
  const title = String(formData.get("title") || "").trim();
  if (!title) return { ok: false, error: "Título é obrigatório" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Serviço de autenticação indisponível" };
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return { ok: false, error: "Não autenticado" };

  const { data, error } = await supabase
    .from("boards")
    .insert({ owner_id: user.id, title })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  // Create default columns
  const cols = [
    { title: "Backlog", position: 0 },
    { title: "Doing", position: 1 },
    { title: "Done", position: 2 },
  ];

  const { error: colErr } = await supabase.from("columns").insert(
    cols.map((c) => ({
      board_id: data.id,
      owner_id: user.id,
      title: c.title,
      position: c.position,
    }))
  );

  if (colErr) return { ok: true, warning: colErr.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function createCard(formData: FormData): Promise<ActionResult> {
  const boardId = String(formData.get("board_id") || "").trim();
  const columnId = String(formData.get("column_id") || "").trim();
  const title = String(formData.get("title") || "").trim();

  if (!boardId || !columnId) return { ok: false, error: "Board/Column inválidos" };
  if (!title) return { ok: false, error: "Título é obrigatório" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Serviço de autenticação indisponível" };
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return { ok: false, error: "Não autenticado" };

  const labelsRaw = String(formData.get("labels") || "").trim();
  const labels = labelsRaw
    ? labelsRaw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
    : [];

  // Put on top by default
  const { error } = await supabase.from("cards").insert({
    board_id: boardId,
    column_id: columnId,
    owner_id: user.id,
    title,
    position: 0,
    labels,
  });

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function moveCard(formData: FormData): Promise<ActionResult> {
  const cardId = String(formData.get("card_id") || "").trim();
  const toColumnId = String(formData.get("to_column_id") || "").trim();

  if (!cardId || !toColumnId) return { ok: false, error: "Dados inválidos" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Serviço de autenticação indisponível" };
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return { ok: false, error: "Não autenticado" };

  const { error } = await supabase
    .from("cards")
    .update({ column_id: toColumnId, position: 0 })
    .eq("id", cardId);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteCard(formData: FormData): Promise<ActionResult> {
  const cardId = String(formData.get("card_id") || "").trim();
  if (!cardId) return { ok: false, error: "Card inválido" };

  const supabase = await createClient();
  if (!supabase) return { ok: false, error: "Serviço de autenticação indisponível" };
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return { ok: false, error: "Não autenticado" };

  const { error } = await supabase.from("cards").delete().eq("id", cardId);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true };
}
