import { SteelComponent } from "@steel-dev/convex";
import { components } from "./_generated/api";

/**
 * Steel cloud browser sessions. Configure with:
 *   npx convex env set STEEL_API_KEY <key>
 *
 * TODO(AGE-63): wire ownerId to the authenticated tenant / user.
 */
export const steel = process.env.STEEL_API_KEY
  ? new SteelComponent(components.steel, {
      STEEL_API_KEY: process.env.STEEL_API_KEY,
    })
  : null;
