export class HelpDialog {
  public static show(): void {
    const helpContent = `
    <div class="p-6 max-w-md">
      <h3 class="text-xl font-semibold mb-5 text-neutral-50 flex items-center gap-2">
        <span class="text-brand-400">⌨</span> Navigation & Controls
      </h3>

      <div class="space-y-4 text-sm text-neutral-300">
        <div class="group">
          <strong class="text-brand-400 font-medium">Mouse Wheel:</strong><br>
          <span class="text-neutral-400">Zoom in/out (always available)</span>
        </div>

        <div class="group">
          <strong class="text-brand-400 font-medium">Middle Mouse + Drag:</strong><br>
          <span class="text-neutral-400">Pan canvas (always available, even with tools active)</span>
        </div>

        <div class="group">
          <strong class="text-brand-400 font-medium">Left Click + Drag:</strong><br>
          <span class="text-neutral-400">Pan canvas (only when no tool is selected)</span>
        </div>

        <div class="group">
          <strong class="text-brand-400 font-medium">Touch Gestures:</strong><br>
          <span class="text-neutral-400">• Single finger: Pan<br>
          • Two fingers: Pinch to zoom</span>
        </div>

        <div class="group">
          <strong class="text-brand-400 font-medium">Mac Trackpad:</strong><br>
          <span class="text-neutral-400">• Two finger scroll: Pan canvas (when no tool active)<br>
          • Two finger click + drag: Pan canvas (when no tool active)<br>
          • Pinch gesture: Zoom in/out<br>
          • Single finger click + drag: Pan (when no tool active)<br>
          • Context menu disabled for smooth gestures</span>
        </div>

        <div class="group">
          <strong class="text-brand-400 font-medium">Tool Restrictions:</strong><br>
          <span class="text-neutral-400">• Trackpad/left-click panning disabled when tools are active<br>
          • Trackpad scroll for panning disabled when tools are active<br>
          • Trackpad pinch and mouse wheel always work for zoom<br>
          • For best trackpad experience with tools: deselect tool temporarily</span>
        </div>

        <div class="group">
          <strong class="text-brand-400 font-medium">Keyboard Shortcuts:</strong><br>
          <span class="text-neutral-400">• <kbd class="px-1.5 py-0.5 bg-neutral-700 rounded text-xs font-mono">E</kbd> Edit mode<br>
          • <kbd class="px-1.5 py-0.5 bg-neutral-700 rounded text-xs font-mono">B</kbd> Background mode<br>
          • <kbd class="px-1.5 py-0.5 bg-neutral-700 rounded text-xs font-mono">Delete</kbd> Remove selected items<br>
          • <kbd class="px-1.5 py-0.5 bg-neutral-700 rounded text-xs font-mono">Ctrl+D</kbd> Duplicate selected shapes<br>
          • <kbd class="px-1.5 py-0.5 bg-neutral-700 rounded text-xs font-mono">Ctrl+S</kbd> Save design</span>
        </div>
      </div>

      <button id="help-close-btn" class="mt-6 w-full px-4 py-2.5 bg-gradient-to-b from-brand-500 to-brand-600 text-neutral-900 font-medium rounded-lg hover:from-brand-400 hover:to-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 focus:ring-offset-neutral-800 transition-all duration-150 shadow-lg shadow-brand-500/20">
        Close
      </button>
    </div>`;

    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.id = 'help-modal-overlay';
    overlay.className =
      'fixed inset-0 bg-neutral-950/70 backdrop-blur-sm flex items-center justify-center z-50';
    overlay.innerHTML = `
      <div class="bg-gradient-to-b from-neutral-800 to-neutral-850 rounded-xl shadow-2xl max-w-lg w-full mx-4 border border-neutral-700/50 animate-in fade-in zoom-in-95 duration-200">
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
