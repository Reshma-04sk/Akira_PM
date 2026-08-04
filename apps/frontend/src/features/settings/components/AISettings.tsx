import React, { useState } from "react";
import { useAI } from "@/context/AIContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/data-display";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField, FormLabel } from "@/components/ui/form";
import { 
  Sparkles, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Send, 
  Terminal, 
  Clock, 
  Coins 
} from "lucide-react";
import { cn } from "@/lib/utils";

export const AISettings: React.FC = () => {
  const {
    activeProvider,
    config,
    health,
    isLoading,
    isTesting,
    testResult,
    testError,
    refreshHealth,
    testProvider,
    resetTestResult,
  } = useAI();

  const [testPrompt, setTestPrompt] = useState("Explain the concept of Sprint velocity and its benefits in 2 sentences.");
  const [selectedTestProvider, setSelectedTestProvider] = useState<string>("");

  const handleTestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPrompt.trim()) return;
    await testProvider(testPrompt, selectedTestProvider || undefined);
  };

  const getHealthBadge = (status?: string) => {
    switch (status) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <CheckCircle2 className="h-3 w-3" /> Active & Healthy
          </span>
        );
      case "unhealthy":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500">
            <XCircle className="h-3 w-3" /> Service Unhealthy
          </span>
        );
      case "unconfigured":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-zinc-500/10 border border-zinc-500/20 text-zinc-400">
            <AlertCircle className="h-3 w-3" /> Unconfigured
          </span>
        );
    }
  };

  const getProviderTitle = (key: string) => {
    switch (key) {
      case "openai":
        return "OpenAI (GPT)";
      case "gemini":
        return "Google Gemini";
      case "anthropic":
        return "Anthropic Claude";
      default:
        return key.toUpperCase();
    }
  };

  return (
    <div className="space-y-6">
      {/* Provider Connectivity Status */}
      <Card className="border-border/80 bg-card/45 backdrop-blur">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-sm font-bold tracking-wide flex items-center gap-2">
              <Cpu className="h-4 w-4 text-primary" /> Provider Status & Connectivity
            </CardTitle>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              Verify API credentials and check endpoint connectivity.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshHealth}
            disabled={isLoading}
            className="h-7 text-[10px] px-2.5 gap-1 font-bold border-border/60 hover:bg-accent/40"
          >
            <RefreshCw className={cn("h-3 w-3", isLoading && "animate-spin")} />
            Check Health
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Active Provider Indicator Banner */}
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active System Provider</span>
                <span className="text-xs font-extrabold text-foreground leading-none">
                  {getProviderTitle(activeProvider)}
                </span>
              </div>
            </div>
            <span className="text-[10px] font-bold bg-primary/15 text-primary border border-primary/25 px-2 py-0.5 rounded">
              Default Route
            </span>
          </div>

          {/* Providers Grid */}
          <div className="grid gap-3 sm:grid-cols-3">
            {(["gemini", "openai", "anthropic"] as const).map((prov) => {
              const configuredKey = `${prov}_configured` as keyof typeof config;
              const isConfigured = config ? !!config[configuredKey] : false;
              const healthStatus = health ? health[prov] : "unconfigured";

              return (
                <div
                  key={prov}
                  className="p-3.5 rounded-xl border border-border/50 bg-card/10 flex flex-col justify-between h-28 hover:bg-card/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <span className="text-xs font-extrabold text-foreground">{getProviderTitle(prov)}</span>
                    <span className={cn(
                      "h-1.5 w-1.5 rounded-full",
                      healthStatus === "healthy" && "bg-emerald-500 shadow-sm shadow-emerald-500",
                      healthStatus === "unhealthy" && "bg-rose-500 shadow-sm shadow-rose-500",
                      healthStatus === "unconfigured" && "bg-zinc-600"
                    )} />
                  </div>

                  <div className="flex flex-col gap-2 mt-auto">
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-medium">
                      <span>API Keys Configuration:</span>
                      <span className={cn("font-bold", isConfigured ? "text-foreground" : "text-muted-foreground/60")}>
                        {isConfigured ? "Setup Valid" : "Unset"}
                      </span>
                    </div>
                    <div>{getHealthBadge(healthStatus)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Connectivity Test Playground */}
      <Card className="border-border/80 bg-card/45 backdrop-blur">
        <CardHeader>
          <CardTitle className="text-sm font-bold tracking-wide flex items-center gap-2">
            <Terminal className="h-4 w-4 text-primary" /> LLM Generation Playground
          </CardTitle>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Test key config logic by running live prompt completions.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleTestSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3 items-end">
              <FormField className="sm:col-span-2">
                <FormLabel>Test Inference Prompt</FormLabel>
                <Input
                  value={testPrompt}
                  onChange={(e) => setTestPrompt(e.target.value)}
                  placeholder="Enter a test prompt..."
                  className="h-9 text-xs"
                  required
                />
              </FormField>

              <FormField>
                <FormLabel>Provider Override (Optional)</FormLabel>
                <select
                  value={selectedTestProvider}
                  onChange={(e) => setSelectedTestProvider(e.target.value)}
                  className="h-9 w-full rounded-md border border-input bg-background/50 px-3 py-1 text-xs shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="">Default ({getProviderTitle(activeProvider)})</option>
                  <option value="gemini">Google Gemini</option>
                  <option value="openai">OpenAI (GPT)</option>
                  <option value="anthropic">Anthropic Claude</option>
                </select>
              </FormField>
            </div>

            <div className="flex items-center justify-between pt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={resetTestResult}
                disabled={isTesting || (!testResult && !testError)}
                className="h-8 text-[10px] text-muted-foreground hover:text-foreground font-bold"
              >
                Clear Screen
              </Button>

              <Button
                type="submit"
                size="sm"
                disabled={isTesting || !testPrompt.trim()}
                className="h-8 text-xs font-bold gap-1.5 px-4"
              >
                <Send className={cn("h-3.5 w-3.5", isTesting && "animate-pulse")} />
                {isTesting ? "Executing Inference..." : "Run Test Completion"}
              </Button>
            </div>
          </form>

          {/* Test Outcomes / Errors */}
          {(testResult || testError || isTesting) && (
            <div className="mt-6 space-y-3.5 border-t border-border/40 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-primary" /> Live Console Output
                </span>
                
                {testResult && (
                  <div className="flex gap-3">
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-accent/30 border border-border/40 px-2 py-0.5 rounded">
                      <Clock className="h-2.5 w-2.5 text-primary" /> {testResult.latency.toFixed(2)}s Latency
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-accent/30 border border-border/40 px-2 py-0.5 rounded">
                      <Coins className="h-2.5 w-2.5 text-primary" /> ~{testResult.estimated_tokens} Tokens
                    </span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-muted-foreground bg-accent/30 border border-border/40 px-2 py-0.5 rounded uppercase">
                      Provider: {testResult.provider}
                    </span>
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-border/60 bg-black/40 p-4 font-mono text-[11px] leading-relaxed min-h-[80px] select-text">
                {isTesting && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-primary font-bold animate-pulse">
                      <span>&gt; Connecting to provider endpoint...</span>
                    </div>
                    <div className="h-2 w-2/3 bg-muted/40 animate-pulse rounded" />
                    <div className="h-2 w-1/2 bg-muted/40 animate-pulse rounded" />
                  </div>
                )}

                {testError && (
                  <div className="text-rose-500 font-semibold">
                    <span className="font-bold">&gt; Error during test run:</span>
                    <p className="mt-1 font-mono text-[10px] text-rose-400 bg-rose-950/20 border border-rose-500/10 p-2 rounded-lg">
                      {testError}
                    </p>
                  </div>
                )}

                {testResult && (
                  <div className="text-zinc-200 whitespace-pre-wrap">
                    <span className="text-primary font-bold select-none">&gt; Inference Successful. Received:</span>
                    <p className="mt-2 text-xs leading-relaxed text-zinc-100 font-sans">
                      {testResult.text}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
