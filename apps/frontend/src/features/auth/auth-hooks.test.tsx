import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useAuth } from "./auth-hooks";
import { AuthProvider } from "./auth-provider";
import { authService } from "./auth-service";

// Mock the auth service to prevent real API calls
vi.mock("./auth-service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}));

describe("useAuth & AuthProvider", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should throw error when useAuth is used outside AuthProvider", () => {
    // Suppress console.error call by RTL/React for expected boundary throws
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    expect(() => renderHook(() => useAuth())).toThrow(
      "useAuth must be used within an AuthProvider"
    );

    consoleSpy.mockRestore();
  });

  it("should resolve context when within AuthProvider", () => {
    vi.mocked(authService.getCurrentUser).mockResolvedValue(null);

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <AuthProvider>{children}</AuthProvider>
    );

    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current).toBeDefined();
    expect(result.current.login).toBeTypeOf("function");
    expect(result.current.logout).toBeTypeOf("function");
  });
});
