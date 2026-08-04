import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { aiApi, AIConfigData, AIHealthData, AITestResponseData } from "@/services/api/ai.api";
import { toast } from "@/components/ui/feedback";

export interface AIContextType {
  activeProvider: string;
  config: AIConfigData | null;
  health: AIHealthData | null;
  isLoading: boolean;
  isTesting: boolean;
  testResult: AITestResponseData | null;
  testError: string | null;
  refreshHealth: () => Promise<void>;
  refreshConfig: () => Promise<void>;
  testProvider: (prompt: string, provider?: string) => Promise<AITestResponseData | null>;
  resetTestResult: () => void;
}

const AIContext = createContext<AIContextType | undefined>(undefined);

export const AIProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProvider, setActiveProvider] = useState<string>("gemini");
  const [config, setConfig] = useState<AIConfigData | null>(null);
  const [health, setHealth] = useState<AIHealthData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  const [isTesting, setIsTesting] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<AITestResponseData | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const refreshConfig = useCallback(async () => {
    try {
      const response = await aiApi.getConfig();
      if (response.status === 200 && response.data) {
        setConfig(response.data);
        setActiveProvider(response.data.active_provider);
      }
    } catch (err: any) {
      console.error("Failed to load AI config", err);
    }
  }, []);

  const refreshHealth = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await aiApi.getHealth();
      if (response.status === 200 && response.data) {
        setHealth(response.data);
      }
    } catch (err: any) {
      console.error("Failed to fetch AI health status", err);
      toast.error("Health Check Failed", "Could not check connectivity with AI providers.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const testProvider = useCallback(async (prompt: string, provider?: string) => {
    setIsTesting(true);
    setTestError(null);
    setTestResult(null);
    try {
      const response = await aiApi.testGenerate({ prompt, provider });
      if (response.status === 200 && response.data) {
        setTestResult(response.data);
        toast.success(
          "Generation Successful",
          `Response received from ${response.data.provider} in ${response.data.latency.toFixed(2)}s`
        );
        return response.data;
      } else {
        throw new Error("Failed to generate response");
      }
    } catch (err: any) {
      const errMsg = err.message || "An error occurred during testing.";
      setTestError(errMsg);
      toast.error("Generation Failed", errMsg);
      return null;
    } finally {
      setIsTesting(false);
    }
  }, []);

  const resetTestResult = useCallback(() => {
    setTestResult(null);
    setTestError(null);
  }, []);

  // Initial loading trigger
  useEffect(() => {
    const init = async () => {
      await refreshConfig();
      await refreshHealth();
    };
    init();
  }, [refreshConfig, refreshHealth]);

  return (
    <AIContext.Provider
      value={{
        activeProvider,
        config,
        health,
        isLoading,
        isTesting,
        testResult,
        testError,
        refreshHealth,
        refreshConfig,
        testProvider,
        resetTestResult,
      }}
    >
      {children}
    </AIContext.Provider>
  );
};

export const useAI = () => {
  const context = useContext(AIContext);
  if (context === undefined) {
    throw new Error("useAI must be used within an AIProvider");
  }
  return context;
};
