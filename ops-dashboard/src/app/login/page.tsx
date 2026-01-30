import LoginForm from "./ui";

export default function LoginPage() {
  return (
    <main style={{ maxWidth: 420, margin: "64px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>
        Ops Dashboard — Login
      </h1>
      <LoginForm />
    </main>
  );
}
