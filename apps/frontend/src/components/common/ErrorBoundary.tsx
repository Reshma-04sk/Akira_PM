import { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RotateCcw } from "lucide-react";

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
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground px-4">
          <div className="text-center max-w-md p-6 border border-border rounded-lg bg-card/50">
            <AlertOctagon className="h-12 w-12 text-destructive mx-auto" />
            <h2 className="mt-4 text-2xl font-bold tracking-tight">Something went wrong</h2>
            <p className="mt-2 text-sm text-muted-foreground break-words">
              {this.state.error?.message || "An unexpected rendering error occurred."}
            </p>
            <button
              onClick={this.handleReset}
              className="mt-6 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
