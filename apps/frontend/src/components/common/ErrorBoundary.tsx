import React, { Component, ErrorInfo, ReactNode } from "react";
import { useRouteError, useNavigate, isRouteErrorResponse } from "react-router-dom";
import { AlertTriangle, RefreshCw, Home, WifiOff, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";

// 1. React Render Error Boundary (Class Component)
interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught render error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      const message = this.state.error?.message || "An unexpected error occurred.";
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-foreground p-6 select-none font-sans">
          <div className="w-full max-w-md p-8 rounded-2xl border border-[#d4af37]/15 glass-modal text-center space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
            <div className="h-16 w-16 mx-auto rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37]">
              <AlertTriangle className="h-7 w-7" />
            </div>
            <div className="space-y-2">
              <h1 className="text-lg font-extrabold tracking-tight text-gold-gradient uppercase">
                Render Failure
              </h1>
              <p className="text-xs text-muted-foreground/80 leading-relaxed">
                A critical rendering exception was encountered.
              </p>
            </div>
            <div className="p-3 bg-[#050505] border border-white/5 rounded-xl text-left max-h-24 overflow-y-auto">
              <span className="text-[9px] font-mono text-rose-400 leading-normal block select-text">
                {message}
              </span>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
                className="h-9 gap-1.5 px-4 font-bold border-white/10 text-white cursor-pointer"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Reload Page
              </Button>
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = "/dashboard";
                }}
                className="h-9 gap-1.5 px-4 font-bold cursor-pointer text-black"
              >
                <Home className="h-3.5 w-3.5" />
                Home Node
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// 2. React Router Route Error Boundary (Functional Component)
export const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  let title = "System Exception";
  let message = "An unexpected runtime error has occurred in the routing layer.";
  let status = 500;
  let Icon = AlertTriangle;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    if (status === 404) {
      title = "404 - Node Not Found";
      message = "The requested path could not be resolved in the workspace directory.";
    } else if (status === 401 || status === 403) {
      title = "Unauthorized Access";
      message = "You do not possess the required authentication credentials for this node.";
      Icon = ShieldAlert;
    } else if (status >= 500) {
      title = "500 - Server Error";
      message = "The backend database or server infrastructure reported an unhandled fault.";
    }
  } else if (error instanceof Error) {
    message = error.message;
  }

  if (!navigator.onLine) {
    title = "Connection Lost";
    message = "Your local workspace client is currently offline. Please check your network cables.";
    Icon = WifiOff;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-black text-foreground p-6 select-none font-sans">
      <div className="w-full max-w-md p-8 rounded-2xl border border-[#d4af37]/15 glass-modal text-center space-y-6 shadow-[0_15px_40px_rgba(0,0,0,0.9)]">
        <div className="h-16 w-16 mx-auto rounded-full bg-[#d4af37]/10 border border-[#d4af37]/25 flex items-center justify-center text-[#d4af37]">
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h1 className="text-lg font-extrabold tracking-tight text-gold-gradient uppercase">
            {title}
          </h1>
          <p className="text-xs text-muted-foreground/80 leading-relaxed">
            {message}
          </p>
        </div>
        {status !== 404 && (
          <div className="p-3 bg-[#050505] border border-white/5 rounded-xl text-left max-h-24 overflow-y-auto">
            <span className="text-[9px] font-mono text-rose-400 leading-normal block select-text">
              Status Code: {status}
              <br />
              {error instanceof Error ? error.stack : JSON.stringify(error)}
            </span>
          </div>
        )}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
            className="h-9 gap-1.5 px-4 font-bold border-white/10 text-white cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reload Page
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => navigate("/dashboard")}
            className="h-9 gap-1.5 px-4 font-bold cursor-pointer text-black"
          >
            <Home className="h-3.5 w-3.5" />
            Command Center
          </Button>
        </div>
      </div>
    </div>
  );
};
