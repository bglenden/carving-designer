import { BaseShape } from '../../shapes/BaseShape.js';

export class JiggleModal {
  private overlay: HTMLElement | null = null;

  public show(
    selectedShapes: ReadonlySet<BaseShape>,
    executeJiggle: (
      shapes: ReadonlySet<BaseShape>,
      position: number,
      rotation: number,
      radius: number,
    ) => void,
    getSelectedShapes: () => ReadonlySet<BaseShape>,
  ): void {
    if (selectedShapes.size === 0) {
      console.log('No shapes selected for jiggle');
      return;
    }

    const modalContent = `
    <div class="p-6 max-w-sm select-none">
      <div id="jiggle-modal-header" class="flex justify-between items-center mb-4 cursor-move">
        <h3 class="text-lg font-semibold text-neutral-50 flex items-center gap-2">
          <span class="text-brand-400">✨</span> Jiggle Selected Shapes
        </h3>
        <button id="jiggle-close-btn" class="text-neutral-500 hover:text-neutral-200 text-xl leading-none transition-colors">&times;</button>
      </div>

      <p class="text-sm text-neutral-400 mb-5">Add random variation to make shapes look less machine-generated:</p>

      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-neutral-300 mb-1.5">Position Variation (±mm)</label>
          <input id="position-variation" type="number" value="1.0" step="0.1" min="0" max="10"
                 class="w-full px-3 py-2.5 bg-neutral-900/50 text-neutral-100 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-300 mb-1.5">Rotation Variation (±degrees)</label>
          <input id="rotation-variation" type="number" value="5.0" step="0.5" min="0" max="45"
                 class="w-full px-3 py-2.5 bg-neutral-900/50 text-neutral-100 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all">
        </div>

        <div>
          <label class="block text-sm font-medium text-neutral-300 mb-1.5">Radius Variation (±% of current radius)</label>
          <input id="radius-variation" type="number" value="5.0" step="1.0" min="0" max="50"
                 class="w-full px-3 py-2.5 bg-neutral-900/50 text-neutral-100 rounded-lg border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-all">
        </div>

        <div class="space-y-3 pt-3">
          <button id="jiggle-apply-btn" class="w-full px-4 py-2.5 bg-gradient-to-b from-brand-500 to-brand-600 text-neutral-900 font-medium rounded-lg hover:from-brand-400 hover:to-brand-500 active:from-brand-600 active:to-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition-all duration-150 shadow-lg shadow-brand-500/20">
            Apply Jiggle
          </button>

          <button id="jiggle-close-bottom-btn" class="w-full px-4 py-2.5 bg-neutral-700/50 text-neutral-300 font-medium rounded-lg border border-neutral-600 hover:bg-neutral-700 hover:text-neutral-100 active:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-neutral-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition-all duration-150">
            Close
          </button>
        </div>
      </div>
    </div>`;

    // Create modal that can be positioned anywhere, not centered
    this.overlay = document.createElement('div');
    this.overlay.id = 'jiggle-modal-overlay';
    this.overlay.className = 'fixed inset-0 z-50 pointer-events-none';

    const modal = document.createElement('div');
    modal.id = 'jiggle-modal';
    modal.className =
      'absolute bg-gradient-to-b from-neutral-800 to-neutral-850 rounded-xl shadow-2xl max-w-sm pointer-events-auto border border-neutral-700/50';
    modal.style.left = '80px';
    modal.style.top = '80px';
    modal.innerHTML = modalContent;

    this.overlay.appendChild(modal);

    // Add to DOM
    document.body.appendChild(this.overlay);

    // Setup event handlers
    this.setupEventHandlers(modal, executeJiggle, getSelectedShapes);
  }

  private setupEventHandlers(
    modal: HTMLElement,
    executeJiggle: (
      shapes: ReadonlySet<BaseShape>,
      position: number,
      rotation: number,
      radius: number,
    ) => void,
    getSelectedShapes: () => ReadonlySet<BaseShape>,
  ): void {
    const applyBtn = modal.querySelector('#jiggle-apply-btn');
    const closeBtn = modal.querySelector('#jiggle-close-btn');
    const closeBottomBtn = modal.querySelector('#jiggle-close-bottom-btn');
    const positionInput = modal.querySelector('#position-variation') as HTMLInputElement;
    const rotationInput = modal.querySelector('#rotation-variation') as HTMLInputElement;
    const radiusInput = modal.querySelector('#radius-variation') as HTMLInputElement;
    const header = modal.querySelector('#jiggle-modal-header') as HTMLElement;

    const closeModal = () => {
      if (this.overlay) {
        this.overlay.remove();
        this.overlay = null;
      }
      document.removeEventListener('keydown', handleKeyDown);
    };

    // Make modal draggable
    this.setupDragHandling(modal, header);

    // Apply jiggle immediately when button is pressed (mousedown)
    const handleJiggleApply = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();

      const currentShapes = getSelectedShapes();

      if (currentShapes && currentShapes.size > 0) {
        // Parse and validate values
        let positionVariation = parseFloat(positionInput.value);
        let rotationVariation = parseFloat(rotationInput.value);
        let radiusVariation = parseFloat(radiusInput.value);

        // Handle invalid input with user-friendly defaults
        if (isNaN(positionVariation) || positionVariation < 0) {
          positionVariation = 1.0;
          positionInput.value = '1.0';
        }
        if (isNaN(rotationVariation) || rotationVariation < 0) {
          rotationVariation = 5.0;
          rotationInput.value = '5.0';
        }
        if (isNaN(radiusVariation) || radiusVariation < 0) {
          radiusVariation = 5.0;
          radiusInput.value = '5.0';
        }

        // Warn user about extreme values that might cause issues
        if (positionVariation > 20) {
          const proceed = confirm(
            `Position variation of ${positionVariation}mm is quite large and might move shapes far from their original location. Continue?`,
          );
          if (!proceed) return;
        }

        if (rotationVariation > 90) {
          const proceed = confirm(
            `Rotation variation of ${rotationVariation}° is quite large and might significantly change shape orientation. Continue?`,
          );
          if (!proceed) return;
        }

        if (radiusVariation > 75) {
          const proceed = confirm(
            `Radius variation of ${radiusVariation}% is quite large and might dramatically change curve shape. Continue?`,
          );
          if (!proceed) return;
        }

        executeJiggle(currentShapes, positionVariation, rotationVariation, radiusVariation);
      }
    };

    // Use mousedown for instant response when button is pressed
    applyBtn?.addEventListener('mousedown', handleJiggleApply, true);

    closeBtn?.addEventListener(
      'click',
      (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      },
      true,
    );

    closeBottomBtn?.addEventListener(
      'click',
      (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        closeModal();
      },
      true,
    );

    // Handle keyboard events to prevent them from affecting the main application
    const handleKeyDown = (e: KeyboardEvent) => {
      // Always handle ESC to close modal
      if (e.key === 'Escape') {
        closeModal();
        return;
      }

      // Check if focus is on an input field within this modal
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement && activeElement.tagName === 'INPUT' && modal.contains(activeElement);

      if (isInputFocused) {
        // Prevent keyboard events from bubbling up to main app when typing in inputs
        // This prevents Delete/Backspace from deleting selected shapes
        e.stopPropagation();
      }
    };

    // Add keyboard event listener to prevent interference with main app
    document.addEventListener('keydown', handleKeyDown);
  }

  private setupDragHandling(modal: HTMLElement, header: HTMLElement): void {
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    const startDrag = (e: MouseEvent) => {
      // Only start drag if clicking directly on the header text, not on buttons or inputs
      const target = e.target as Element;
      if (
        target.closest('button') ||
        target.closest('input') ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'INPUT'
      ) {
        return;
      }

      isDragging = true;
      const rect = modal.getBoundingClientRect();
      dragOffsetX = e.clientX - rect.left;
      dragOffsetY = e.clientY - rect.top;
      header.style.cursor = 'grabbing';
      e.preventDefault();
      e.stopPropagation();
    };

    const drag = (e: MouseEvent) => {
      if (!isDragging) return;

      const newX = e.clientX - dragOffsetX;
      const newY = e.clientY - dragOffsetY;

      // Keep modal within viewport bounds
      const maxX = window.innerWidth - modal.offsetWidth;
      const maxY = window.innerHeight - modal.offsetHeight;

      modal.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
      modal.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
    };

    const endDrag = (e: MouseEvent) => {
      if (isDragging) {
        isDragging = false;
        header.style.cursor = 'move';
        e.stopPropagation();
      }
    };

    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Cleanup drag event listeners when modal is destroyed
    const originalRemove = this.overlay?.remove.bind(this.overlay);
    if (this.overlay && originalRemove) {
      this.overlay.remove = () => {
        document.removeEventListener('mousemove', drag);
        document.removeEventListener('mouseup', endDrag);
        originalRemove();
      };
    }
  }

  public close(): void {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
