
'use client';

import { FirestorePermissionError } from '@/firebase/errors';

// Define the structure of events and their payloads.
type Events = {
  'permission-error': (error: FirestorePermissionError) => void;
  // We can add other global error types here if needed.
};

type EventName = keyof Events;

/**
 * A simple, typed event emitter for handling global application events,
 * specifically for propagating Firestore permission errors to a global listener.
 */
class TypedEventEmitter {
  private listeners: { [K in EventName]?: ((...args: Parameters<Events[K]>) => void)[] } = {};

  /**
   * Subscribes a listener to a specific event.
   * @param event The name of the event to listen for.
   * @param callback The function to execute when the event is emitted.
   */
  on<E extends EventName>(event: E, callback: Events[E]): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback as any);
  }

  /**
   * Unsubscribes a listener from a specific event.
   * @param event The name of the event to unsubscribe from.
   * @param callback The listener function to remove.
   */
  off<E extends EventName>(event: E, callback: Events[E]): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event] = this.listeners[event]!.filter(
      (listener) => listener !== (callback as any)
    );
  }

  /**
   * Emits an event, calling all subscribed listeners with the provided arguments.
   * @param event The name of the event to emit.
   * @param args The arguments to pass to the listeners.
   */
  emit<E extends EventName>(event: E, ...args: Parameters<Events[E]>): void {
    if (!this.listeners[event]) {
      return;
    }
    this.listeners[event]!.forEach((listener) => {
      listener(...args);
    });
  }
}

// Create and export a singleton instance of the event emitter.
// This ensures that all parts of the app use the same event bus.
export const errorEmitter = new TypedEventEmitter();
    