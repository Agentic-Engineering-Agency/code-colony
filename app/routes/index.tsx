import { createFileRoute } from "@tanstack/react-router";

import { CodeColonyApp } from "../../src/components/CodeColonyApp";

export const Route = createFileRoute("/")({
  component: HomeRoute,
});

function HomeRoute() {
  return <CodeColonyApp />;
}
