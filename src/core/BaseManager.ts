/**
 * Base class for all manager classes providing common functionality
 */
export abstract class BaseManager {
  protected _isEnabled = true;
  protected _isActive = false;
  private _eventListeners = new Map<string, Set<(...args: any[]) => void>>();

  /**
   * Enable the manager
   */
  public enable(): void {
    this._isEnabled = true;
    this.onEnabled();
  }

  /**
   * Disable the manager
   */
  public disable(): void {
    this._isEnabled = false;
    this.onDisabled();
  }

  /**
   * Check if the manager is enabled
   */
  public isEnabled(): boolean {
    return this._isEnabled;
  }

  /**
   * Activate the manager
   */
  public activate(): void {
    if (this._isEnabled) {
      this._isActive = true;
      this.onActivated();
    }
  }

  /**
   * Deactivate the manager
   */
  public deactivate(): void {
    this._isActive = false;
    this.onDeactivated();
  }

  /**
   * Check if the manager is active
   */
  public isActive(): boolean {
    return this._isActive && this._isEnabled;
  }

  /**
   * Add an event listener
   */
  protected addEventListener(eventType: string, listener: (...args: any[]) => void): void {
    if (!this._eventListeners.has(eventType)) {
      this._eventListeners.set(eventType, new Set());
    }
    const listeners = this._eventListeners.get(eventType);
    if (listeners) {
      listeners.add(listener);
    }
  }

  /**
   * Remove an event listener
   */
  protected removeEventListener(eventType: string, listener: (...args: any[]) => void): void {
    const listeners = this._eventListeners.get(eventType);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  /**
   * Emit an event to all listeners
   */
  protected emit(eventType: string, ...args: any[]): void {
    const listeners = this._eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach((listener) => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for ${eventType}:`, error);
        }
      });
    }
  }

  /**
   * Dispatch a DOM custom event
   */
  protected dispatchCustomEvent(eventType: string, detail?: any): void {
    document.dispatchEvent(new CustomEvent(eventType, { detail }));
  }

  /**
   * Initialize the manager - called during construction or setup
   */
  protected abstract onInitialize(): void;

  /**
   * Cleanup the manager - called during destruction
   */
  protected abstract onCleanup(): void;

  /**
   * Called when the manager is enabled
   */
  protected onEnabled(): void {
    // Default implementation - can be overridden
  }

  /**
   * Called when the manager is disabled
   */
  protected onDisabled(): void {
    // Default implementation - can be overridden
  }

  /**
   * Called when the manager is activated
   */
  protected onActivated(): void {
    // Default implementation - can be overridden
  }

  /**
   * Called when the manager is deactivated
   */
  protected onDeactivated(): void {
    // Default implementation - can be overridden
  }

  /**
   * Initialize the manager
   */
  public initialize(): void {
    this.onInitialize();
  }

  /**
   * Cleanup the manager
   */
  public cleanup(): void {
    this._eventListeners.clear();
    this.onCleanup();
  }
}
