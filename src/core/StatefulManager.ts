import { BaseManager } from './BaseManager.js';

/**
 * Base class for managers that have discrete states
 */
export abstract class StatefulManager<TState> extends BaseManager {
  protected _currentState: TState;
  private _stateChangeCallbacks = new Set<(state: TState, previousState: TState) => void>();

  constructor(initialState: TState) {
    super();
    this._currentState = initialState;
  }

  /**
   * Get the current state
   */
  public getCurrentState(): TState {
    return this._currentState;
  }

  /**
   * Check if the manager is in a specific state
   */
  public isInState(state: TState): boolean {
    return this._currentState === state;
  }

  /**
   * Add a state change callback
   */
  public onStateChange(callback: (state: TState, previousState: TState) => void): void {
    this._stateChangeCallbacks.add(callback);
  }

  /**
   * Remove a state change callback
   */
  public removeStateChangeCallback(callback: (state: TState, previousState: TState) => void): void {
    this._stateChangeCallbacks.delete(callback);
  }

  /**
   * Transition to a new state
   */
  protected setState(newState: TState): void {
    if (newState === this._currentState) {
      return; // No change
    }

    const previousState = this._currentState;

    // Call pre-state change hook
    if (this.canTransitionTo(newState, previousState)) {
      this.onStateExit(previousState);
      this._currentState = newState;
      this.onStateEnter(newState, previousState);

      // Notify callbacks
      this._stateChangeCallbacks.forEach((callback) => {
        try {
          callback(newState, previousState);
        } catch (error) {
          console.error('Error in state change callback:', error);
        }
      });

      // Dispatch custom event
      this.dispatchCustomEvent('stateChanged', {
        newState,
        previousState,
        manager: this.constructor.name,
      });
    }
  }

  /**
   * Check if transition to a new state is allowed
   */
  protected canTransitionTo(_newState: TState, _currentState: TState): boolean {
    return true; // Default implementation allows all transitions
  }

  /**
   * Called when entering a new state
   */
  protected onStateEnter(_state: TState, _previousState: TState): void {
    // Default implementation - can be overridden
  }

  /**
   * Called when exiting a state
   */
  protected onStateExit(_state: TState): void {
    // Default implementation - can be overridden
  }

  /**
   * Reset to initial state
   */
  public abstract resetToInitialState(): void;

  /**
   * Cleanup state change callbacks
   */
  protected onCleanup(): void {
    this._stateChangeCallbacks.clear();
  }
}
