import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from "./auth-constants";

const REMEMBER_ME_KEY = "forgepm-remember-me";

export const authStorage = {
  getStorage(): Storage {
    const rememberMe = localStorage.getItem(REMEMBER_ME_KEY) === "true";
    return rememberMe ? localStorage : sessionStorage;
  },

  setRememberMe(rememberMe: boolean): void {
    localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
  },

  getAccessToken(): string | null {
    return this.getStorage().getItem(ACCESS_TOKEN_KEY) || 
           localStorage.getItem(ACCESS_TOKEN_KEY) || 
           sessionStorage.getItem(ACCESS_TOKEN_KEY);
  },

  setAccessToken(token: string): void {
    this.getStorage().setItem(ACCESS_TOKEN_KEY, token);
  },

  removeAccessToken(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    return this.getStorage().getItem(REFRESH_TOKEN_KEY) ||
           localStorage.getItem(REFRESH_TOKEN_KEY) ||
           sessionStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken(token: string): void {
    this.getStorage().setItem(REFRESH_TOKEN_KEY, token);
  },

  removeRefreshToken(): void {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  clearTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    sessionStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(REMEMBER_ME_KEY);
  },
};
