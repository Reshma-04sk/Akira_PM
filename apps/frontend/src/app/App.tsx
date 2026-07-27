import { RouterProvider } from "react-router-dom";
import { Providers } from "./providers";
import { router } from "./router";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";

export default function App() {
  return (
    <ErrorBoundary>
      <Providers>
        <RouterProvider router={router} />
      </Providers>
    </ErrorBoundary>
  );
}
