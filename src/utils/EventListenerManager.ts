/**
 * Event listener management utility
 * Provides a centralized pattern for managing event listeners and avoiding memory leaks
 */

type EventListenerFunction = (event: Event) => void;

interface ListenerRegistration {
  element: EventTarget;
  event: string;
  listener: EventListenerFunction;
  options?: AddEventListenerOptions | boolean;
}

/**
 * Centralized event listener management
 * Automatically tracks registered listeners and provides cleanup methods
 */
export class EventListenerManager {
  private listeners: Set<ListenerRegistration> = new Set();
  private isDestroyed = false;

  /**
   * Add an event listener and track it for cleanup
   */
  addEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean,
  ): void;
  addEventListener<K extends keyof WindowEventMap>(
    element: Window,
    event: K,
    listener: (this: Window, ev: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean,
  ): void;
  addEventListener(
    element: EventTarget,
    event: string,
    listener: EventListenerFunction,
    options?: AddEventListenerOptions | boolean,
  ): void {
    if (this.isDestroyed) {
      console.warn('Attempted to add event listener to destroyed EventListenerManager');
      return;
    }

    const registration: ListenerRegistration = {
      element,
      event,
      listener,
      options,
    };

    this.listeners.add(registration);
    element.addEventListener(event, listener, options);
  }

  /**
   * Remove a specific event listener
   */
  removeEventListener<K extends keyof HTMLElementEventMap>(
    element: HTMLElement,
    event: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean,
  ): void;
  removeEventListener<K extends keyof WindowEventMap>(
    element: Window,
    event: K,
    listener: (this: Window, ev: WindowEventMap[K]) => void,
    options?: AddEventListenerOptions | boolean,
  ): void;
  removeEventListener(
    element: EventTarget,
    event: string,
    listener: EventListenerFunction,
    options?: AddEventListenerOptions | boolean,
  ): void {
    // Find and remove the registration
    for (const registration of this.listeners) {
      if (
        registration.element === element &&
        registration.event === event &&
        registration.listener === listener
      ) {
        this.listeners.delete(registration);
        element.removeEventListener(event, listener, options);
        break;
      }
    }
  }

  /**
   * Remove all event listeners for a specific element
   */
  removeAllListenersForElement(element: EventTarget): void {
    const toRemove = Array.from(this.listeners).filter((reg) => reg.element === element);

    for (const registration of toRemove) {
      this.listeners.delete(registration);
      registration.element.removeEventListener(
        registration.event,
        registration.listener,
        registration.options,
      );
    }
  }

  /**
   * Remove all event listeners of a specific type
   */
  removeAllListenersOfType(event: string): void {
    const toRemove = Array.from(this.listeners).filter((reg) => reg.event === event);

    for (const registration of toRemove) {
      this.listeners.delete(registration);
      registration.element.removeEventListener(
        registration.event,
        registration.listener,
        registration.options,
      );
    }
  }

  /**
   * Remove all tracked event listeners
   */
  removeAllListeners(): void {
    for (const registration of this.listeners) {
      registration.element.removeEventListener(
        registration.event,
        registration.listener,
        registration.options,
      );
    }
    this.listeners.clear();
  }

  /**
   * Destroy the manager and remove all listeners
   * After calling this, the manager cannot be used again
   */
  destroy(): void {
    this.removeAllListeners();
    this.isDestroyed = true;
  }

  /**
   * Get the number of currently registered listeners
   */
  getListenerCount(): number {
    return this.listeners.size;
  }

  /**
   * Check if any listeners are registered for a specific element
   */
  hasListenersForElement(element: EventTarget): boolean {
    for (const registration of this.listeners) {
      if (registration.element === element) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get all registered event types
   */
  getRegisteredEvents(): string[] {
    const events = new Set<string>();
    for (const registration of this.listeners) {
      events.add(registration.event);
    }
    return Array.from(events);
  }
}

/**
 * Simple observer pattern implementation for render updates
 */
export interface RenderObserver {
  onRenderRequested(): void;
}

/**
 * Observable pattern for coordinating render updates
 */
export class RenderUpdateNotifier {
  private observers: Set<RenderObserver> = new Set();
  private isDestroyed = false;

  /**
   * Add an observer for render updates
   */
  addObserver(observer: RenderObserver): void {
    if (this.isDestroyed) {
      console.warn('Attempted to add observer to destroyed RenderUpdateNotifier');
      return;
    }
    this.observers.add(observer);
  }

  /**
   * Remove an observer
   */
  removeObserver(observer: RenderObserver): void {
    this.observers.delete(observer);
  }

  /**
   * Notify all observers that a render is requested
   */
  notifyRenderRequested(): void {
    if (this.isDestroyed) return;

    for (const observer of this.observers) {
      try {
        observer.onRenderRequested();
      } catch (error) {
        console.error('Error in render observer:', error);
      }
    }
  }

  /**
   * Remove all observers
   */
  clearObservers(): void {
    this.observers.clear();
  }

  /**
   * Destroy the notifier and clear all observers
   */
  destroy(): void {
    this.clearObservers();
    this.isDestroyed = true;
  }

  /**
   * Get the number of registered observers
   */
  getObserverCount(): number {
    return this.observers.size;
  }
}

/**
 * Debounced event handler utility
 */
export class DebouncedEventHandler {
  private timeoutId: number | null = null;

  constructor(
    private handler: () => void,
    private delay: number = 16, // ~60fps default
  ) {}

  /**
   * Trigger the debounced handler
   */
  trigger(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
    }

    this.timeoutId = window.setTimeout(() => {
      this.timeoutId = null;
      this.handler();
    }, this.delay);
  }

  /**
   * Cancel any pending execution
   */
  cancel(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
  }

  /**
   * Execute immediately and cancel any pending execution
   */
  flush(): void {
    this.cancel();
    this.handler();
  }
}
