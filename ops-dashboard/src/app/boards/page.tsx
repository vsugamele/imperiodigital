export const dynamic = "force-dynamic";

type Board = { id: string; title: string; created_at?: string };

async function getBoards() {
  const res = await fetch("http://localhost:3000/api/boards", { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to fetch /api/boards: ${res.status}`);
  return (await res.json()) as { boards: Board[] };
}

export default async function BoardsPage() {
  const data = await getBoards();
  const boards = data.boards || [];

  return (
    <main style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 12 }}>Boards</h1>
      <p style={{ opacity: 0.8, marginBottom: 20 }}>Selecione um board para abrir no dashboard.</p>

      <div style={{ display: "grid", gap: 12 }}>
        {boards.map((b) => (
          <a
            key={b.id}
            href={`/dashboard?board=${encodeURIComponent(b.id)}`}
            style={{
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 12,
              padding: 14,
              background: "rgba(255,255,255,0.03)",
              textDecoration: "none",
              color: "inherit",
            }}
          >
            <div style={{ fontWeight: 700 }}>{b.title}</div>
            <div style={{ opacity: 0.7, fontSize: 12 }}>{b.id}</div>
          </a>
        ))}
        {!boards.length ? <div style={{ opacity: 0.7 }}>Nenhum board encontrado.</div> : null}
      </div>
    </main>
  );
}
