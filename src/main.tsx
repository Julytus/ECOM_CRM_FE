import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { scan } from "react-scan";
import "./index.css";

// Import the generated route tree
import { queryClient } from "@/lib/tanstack/query-client";
import { routeTree } from "./routeTree.gen";

scan({
  enabled: false
});

// Create a new router instance
const router = createRouter({
  routeTree,
  scrollRestoration: true, // enables built-in scroll restoration
  scrollToTopSelectors: ["main"], // your main scrollable container
  getScrollRestorationKey: (location) => location.pathname, // optional
  scrollRestorationBehavior: "instant" // optional, can be 'smooth', 'instant', 'auto'
});

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

// Render the app
const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </StrictMode>
  );
}
