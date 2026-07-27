type AuthEvent = "login" | "logout" | "session-expired";
type Callback = (data?: any) => void;

class AuthEventBus {
  private listeners: Map<AuthEvent, Set<Callback>> = new Map();

  on(event: AuthEvent, callback: Callback): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  off(event: AuthEvent, callback: Callback): void {
    this.listeners.get(event)?.delete(callback);
  }

  emit(event: AuthEvent, data?: any): void {
    this.listeners.get(event)?.forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event bus callback for event "${event}":`, error);
      }
    });
  }
}

export const authEventBus = new AuthEventBus();
