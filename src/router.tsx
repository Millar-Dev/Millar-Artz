import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { langRewrite } from "./lib/i18n";

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    // Jump, don't glide: the stylesheet asks for smooth scrolling, which made
    // the router's restore animate for hundreds of milliseconds after the new
    // page had rendered — long enough to land on top of a reset and leave the
    // visitor halfway down a page they had just opened.
    scrollRestorationBehavior: "instant",
    defaultPreloadStaleTime: 0,
    // /sw/... serves the Kiswahili version of the same routes.
    rewrite: langRewrite(),
  });

  return router;
};
