import { redirect } from "next/navigation";

export default function Home() {
  // middleware will redirect appropriately based on session
  redirect("/dashboard");
}
