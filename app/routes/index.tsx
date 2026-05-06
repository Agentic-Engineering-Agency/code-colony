import { createFileRoute } from "@tanstack/react-router";

import { CodeColonyApp } from "../../src/components/CodeColonyApp";
import { AuthGate } from "../../src/auth/AuthGate";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  return <AuthGate><CodeColonyApp /></AuthGate>;
}
