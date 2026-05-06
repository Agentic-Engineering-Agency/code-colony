import { CodeColonyApp } from "@/components/CodeColonyApp";
import { AuthGate } from "@/auth/AuthGate";

export default function Home() {
  return <AuthGate><CodeColonyApp /></AuthGate>;
}
