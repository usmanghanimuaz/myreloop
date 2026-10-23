import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it.each([
    "/",
    "/finder",
    "/exchange",
    "/needs",
    "/actions",
    "/impact",
    "/about",
    "/stories", "/account", "/admin",
    "/blog",
    "/blog/reuse-before-disposal",
    "/blog/household-waste-prevention",
    "/blog/batteries-electronics-safe-disposal",
    "/how-it-works",
    "/about-us",
    "/mission",
    "/contact",
    "/report",
    "/faq",
    "/terms",
    "/privacy",
    "/cookies",
    "/community-guidelines",
    "/safety",
    "/disclaimer",
  ])("matches the existing %s page instead of falling back to not found", (path) => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes(path);

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
    expect(matches.at(-1)?.pathname).toBe(path);
  });

  it("unknown paths fall back to the root not-found page", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/no-such-page");
    expect(matches.at(-1)?.routeId).toBe(rootRouteId);
  });
});
