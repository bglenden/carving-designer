export class HelpDialog {
  public static show(): void {
    const helpContent = `
    <div class="p-6 max-w-md">
      <h3 class="text-lg font-bold mb-4 text-gray-100">Navigation & Controls</h3>
      
      <div class="space-y-3 text-sm text-gray-300">
        <div>
          <strong class="text-white">Mouse Wheel:</strong><br>
          Zoom in/out (always available)
        </div>
        
        <div>
          <strong class="text-white">Middle Mouse + Drag:</strong><br>
          Pan canvas (always available, even with tools active)
        </div>
        
        <div>
          <strong class="text-white">Left Click + Drag:</strong><br>
          Pan canvas (only when no tool is selected)
        </div>
        
        <div>
          <strong class="text-white">Touch Gestures:</strong><br>
          • Single finger: Pan<br>
          • Two fingers: Pinch to zoom
        </div>
        
        <div>
          <strong class="text-white">Mac Trackpad:</strong><br>
          • Two finger scroll: Pan canvas (when no tool active)<br>
          • Two finger click + drag: Pan canvas (when no tool active)<br>
          • Pinch gesture: Zoom in/out<br>
          • Single finger click + drag: Pan (when no tool active)<br>
          • Context menu disabled for smooth gestures
        </div>
        
        <div>
          <strong class="text-white">Tool Restrictions:</strong><br>
          • Trackpad/left-click panning disabled when tools are active<br>
          • Trackpad scroll for panning disabled when tools are active<br>
          • Trackpad pinch and mouse wheel always work for zoom<br>
          • For best trackpad experience with tools: deselect tool temporarily
        </div>
        
        <div>
          <strong class="text-white">Keyboard Shortcuts:</strong><br>
          • E: Edit mode<br>
          • B: Background mode<br>
          • Delete/Backspace: Remove selected items<br>
          • Ctrl+D: Duplicate selected shapes<br>
          • Ctrl+S: Save design
        </div>
      </div>
      
      <button id="help-close-btn" class="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
        Close
      </button>
    </div>`;

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'help-modal-overlay';
    overlay.className =
      'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    overlay.innerHTML = `
      <div class="bg-gray-800 rounded-lg shadow-xl max-w-lg w-full mx-4">
        ${helpContent}
      </div>`;

    // Add to DOM
    document.body.appendChild(overlay);

    // Add event listeners
    const closeBtn = overlay.querySelector('#help-close-btn');
    const closeModal = () => {
      overlay.remove();
    };

    closeBtn?.addEventListener('click', closeModal);
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
}
