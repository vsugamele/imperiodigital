import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">BOLO 🇧🇻</h1>
      <p className="text-muted-foreground mb-8">
        Automação de Conteúdo com IA
      </p>
      <div className="flex gap-4">
        <Link 
          href="/login"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
        >
          Login
        </Link>
        <Link 
          href="/register"
          className="px-4 py-2 border border-input bg-background rounded-md"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}
