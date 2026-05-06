import { getAuthBaseURL } from "./authEnv";

/**
 * Convex auth providers configured for the better-auth component. The
 * `betterAuth` plugin in `convex/auth.ts` wires the JWKS that Convex uses
 * to validate tokens minted by Better Auth.
 */
const config = {
  providers: [
    {
      domain: getAuthBaseURL(),
      applicationID: "convex",
    },
  ],
};

export default config;
