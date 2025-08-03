import { BaseShape } from '../../shapes/BaseShape.js';
import { Point } from '../../core/types.js';

export class MirrorModal {
  public show(
    selectedShapes: ReadonlySet<BaseShape>,
    addShapesToSelection: (shapes: BaseShape[]) => void,
  ): void {
    if (selectedShapes.size === 0) {
      console.log('No shapes selected for mirroring');
      return;
    }

    const modalContent = `
    <div class="p-6 max-w-sm">
      <h3 class="text-lg font-bold mb-4 text-gray-100">Mirror Selected Shapes</h3>
      
      <p class="text-sm text-gray-300 mb-4">Choose axis to mirror across:</p>
      
      <div class="space-y-3">
        <button id="mirror-horizontal-btn" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          X-Axis (Y=0) ↕️ Flip Vertically
        </button>
        
        <button id="mirror-vertical-btn" class="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          Y-Axis (X=0) ↔️ Flip Horizontally
        </button>
        
        <button id="mirror-cancel-btn" class="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500">
          Cancel
        </button>
      </div>
    </div>`;

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'mirror-modal-overlay';
    overlay.className =
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-sm w-full mx-4">
        ${modalContent}
      </div>`;

    // Add to DOM
    document.body.appendChild(overlay);

    // Add event listeners
    const horizontalBtn = overlay.querySelector('#mirror-horizontal-btn');
    const verticalBtn = overlay.querySelector('#mirror-vertical-btn');
    const cancelBtn = overlay.querySelector('#mirror-cancel-btn');

    const closeModal = () => {
      overlay.remove();
    };

    horizontalBtn?.addEventListener('click', () => {
      this.executeMirror('horizontal', selectedShapes, addShapesToSelection);
      closeModal();
    });

    verticalBtn?.addEventListener('click', () => {
      this.executeMirror('vertical', selectedShapes, addShapesToSelection);
      closeModal();
    });

    cancelBtn?.addEventListener('click', closeModal);

    // Click outside to close
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
      }
    });

    // ESC key to close
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  private executeMirror(
    axis: 'horizontal' | 'vertical',
    selectedShapes: ReadonlySet<BaseShape>,
    addShapesToSelection: (shapes: BaseShape[]) => void,
  ): void {
    // Mirror across the global canvas axes: X-axis (Y=0) or Y-axis (X=0)
    const axisCenter: Point = { x: 0, y: 0 };

    // Clone and mirror the selected shapes across the global axis
    const mirroredShapes: BaseShape[] = [];

    selectedShapes.forEach((shape) => {
      const clonedShape = shape.clone() as BaseShape;
      clonedShape.mirror(axis, axisCenter);
      mirroredShapes.push(clonedShape);
    });

    // Add mirrored shapes to selection (this will also add them to the canvas)
    addShapesToSelection(mirroredShapes);

    // Trigger autosave after mirror operation
    document.dispatchEvent(new CustomEvent('shapesModified'));
  }
}
