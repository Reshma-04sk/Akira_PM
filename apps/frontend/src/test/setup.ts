import "@testing-library/jest-dom";

class StorageMock implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }
}

if (!globalThis.localStorage || typeof globalThis.localStorage.clear !== "function") {
  const localMock = new StorageMock();
  Object.defineProperty(globalThis, "localStorage", {
    value: localMock,
    writable: true,
  });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "localStorage", {
      value: localMock,
      writable: true,
    });
  }
}

if (!globalThis.sessionStorage || typeof globalThis.sessionStorage.clear !== "function") {
  const sessionMock = new StorageMock();
  Object.defineProperty(globalThis, "sessionStorage", {
    value: sessionMock,
    writable: true,
  });
  if (typeof window !== "undefined") {
    Object.defineProperty(window, "sessionStorage", {
      value: sessionMock,
      writable: true,
    });
  }
}

