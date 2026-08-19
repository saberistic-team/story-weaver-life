import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

export const getRouter = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 10,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      dehydrate: {
        shouldDehydrateQuery: (query) => {
          const key = query.queryKey[0];
          // Dehydrate content and config queries for SSR; skip realtime/user-specific data.
          return (
            typeof key === "string" &&
            ["landing", "discover", "chapter", "series", "book", "config"].includes(key)
          );
        },
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 1000 * 60 * 2,
  });

  return router;
};
