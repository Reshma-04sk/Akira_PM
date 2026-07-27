import { describe, it, expect, vi, beforeEach } from "vitest";
import { api } from "./axios";
import { authStorage } from "@/features/auth/auth-storage";

vi.mock("@/features/auth/auth-storage", () => ({
  authStorage: {
    getAccessToken: vi.fn(),
    getRefreshToken: vi.fn(),
    setAccessToken: vi.fn(),
    setRefreshToken: vi.fn(),
    clearTokens: vi.fn(),
  },
}));

describe("axios client request interceptor", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("should append authorization header if access token exists", async () => {
    vi.mocked(authStorage.getAccessToken).mockReturnValue("mocked-jwt-token");

    // Retrieve request interceptor handler
    const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = {
      headers: {},
    };

    const result = await requestHandler(config);

    expect(result.headers.Authorization).toBe("Bearer mocked-jwt-token");
  });

  it("should not append authorization header if token is missing", async () => {
    vi.mocked(authStorage.getAccessToken).mockReturnValue(null);

    const requestHandler = (api.interceptors.request as any).handlers[0].fulfilled;
    const config = {
      headers: {},
    };

    const result = await requestHandler(config);

    expect(result.headers.Authorization).toBeUndefined();
  });
});
