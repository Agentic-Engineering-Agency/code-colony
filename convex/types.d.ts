// Convex actions run in V8 isolates that expose a Node-like `process.env`.
// Declared here for typecheck without pulling all of @types/node into the
// Convex tsconfig.
declare const process: { env: Record<string, string | undefined> };
