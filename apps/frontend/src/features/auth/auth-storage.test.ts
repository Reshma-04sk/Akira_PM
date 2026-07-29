// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { authStorage } from "./auth-storage";
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./auth-constants";

describe("authStorage", () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it("should set and get remember me state", () => {
    authStorage.setRememberMe(true);
    expect(localStorage.getItem("forgepm-remember-me")).toBe("true");

    authStorage.setRememberMe(false);
    expect(localStorage.getItem("forgepm-remember-me")).toBe("false");
  });

  it("should write to localStorage if rememberMe is true", () => {
    authStorage.setRememberMe(true);
    authStorage.setAccessToken("test-token");
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("test-token");
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });

  it("should write to sessionStorage if rememberMe is false", () => {
    authStorage.setRememberMe(false);
    authStorage.setAccessToken("test-token");
    expect(sessionStorage.getItem(ACCESS_TOKEN_KEY)).toBe("test-token");
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
  });

  it("should resolve token from fallback if not present in primary storage", () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "fallback-token");
    expect(authStorage.getAccessToken()).toBe("fallback-token");
  });

  it("should clear all tokens and remember me flag", () => {
    localStorage.setItem(ACCESS_TOKEN_KEY, "access");
    sessionStorage.setItem(REFRESH_TOKEN_KEY, "refresh");
    authStorage.setRememberMe(true);

    authStorage.clearTokens();

    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBeNull();
    expect(sessionStorage.getItem(REFRESH_TOKEN_KEY)).toBeNull();
    expect(localStorage.getItem("forgepm-remember-me")).toBeNull();
  });
});
