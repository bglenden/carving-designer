import { vi, describe, beforeEach, it, expect, afterEach } from 'vitest';
import { FileMenuManager } from '../../src/ui/toolbar/FileMenuManager.js';
import { CallbackManager } from '../../src/ui/toolbar/CallbackManager.js';

describe('FileMenuManager', () => {
  let fileMenuManager: FileMenuManager;
  let callbackManager: CallbackManager;
  let primaryToolbar: HTMLElement;
  let mockLoadCallback: ReturnType<typeof vi.fn>;
  let mockSaveCallback: ReturnType<typeof vi.fn>;
  let mockSaveAsCallback: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = '<div id="primary-toolbar"></div>';
    primaryToolbar = document.getElementById('primary-toolbar') as HTMLElement;

    // Create callback manager and set up callbacks
    callbackManager = new CallbackManager();
    mockLoadCallback = vi.fn();
    mockSaveCallback = vi.fn();
    mockSaveAsCallback = vi.fn();

    callbackManager.setLoadDesignCallback(mockLoadCallback);
    callbackManager.setSaveDesignCallback(mockSaveCallback);
    callbackManager.setSaveAsDesignCallback(mockSaveAsCallback);

    // Create file menu manager
    fileMenuManager = new FileMenuManager(primaryToolbar, callbackManager);
  });

  afterEach(() => {
    document.body.innerHTML = '';
    vi.clearAllMocks();
  });

  describe('File Menu Creation', () => {
    it('should create file menu with correct structure', () => {
      fileMenuManager.createFileMenu();

      const fileMenu = document.getElementById('file-menu');
      expect(fileMenu).toBeTruthy();
      expect(fileMenu?.style.display).toBe('none'); // Initially hidden
      expect(fileMenu?.parentElement).toBe(primaryToolbar);
    });

    it('should create Load, Save, and Save As buttons', () => {
      fileMenuManager.createFileMenu();

      const loadBtn = document.getElementById('load-btn');
      const saveBtn = document.getElementById('save-btn');
      const saveAsBtn = document.getElementById('save-as-btn');

      expect(loadBtn).toBeTruthy();
      expect(saveBtn).toBeTruthy();
      expect(saveAsBtn).toBeTruthy();

      // Check button tooltips (since labels are now hidden, tooltips contain the text)
      expect(loadBtn?.title).toContain('Load design from file');
      expect(saveBtn?.title).toContain('Save current design');
      expect(saveAsBtn?.title).toContain('Save design with new name');
    });

    it('should have correct button classes and structure', () => {
      fileMenuManager.createFileMenu();

      const buttons = document.querySelectorAll('#file-menu button');
      expect(buttons).toHaveLength(3);

      buttons.forEach(button => {
        expect(button.className).toContain('btn-design-system');
        expect(button.className).toContain('interactive');
        expect(button.className).toContain('text-neutral-100');
        expect(button.className).toContain('hover:bg-toolbar-hover');
      });
    });
  });

  describe('File Menu Behavior', () => {
    beforeEach(() => {
      fileMenuManager.createFileMenu();
    });

    it('should toggle file menu visibility', () => {
      const fileMenu = document.getElementById('file-menu') as HTMLElement;
      
      // Initially hidden
      expect(fileMenu.style.display).toBe('none');
      
      // Toggle to show
      fileMenuManager.toggleFileMenu();
      expect(fileMenu.style.display).toBe('block');
      
      // Toggle to hide
      fileMenuManager.toggleFileMenu();
      expect(fileMenu.style.display).toBe('none');
    });

    it('should close file menu when closeFileMenu is called', () => {
      const fileMenu = document.getElementById('file-menu') as HTMLElement;
      
      // Show menu first
      fileMenuManager.toggleFileMenu();
      expect(fileMenu.style.display).toBe('block');
      
      // Close menu
      fileMenuManager.closeFileMenu();
      expect(fileMenu.style.display).toBe('none');
    });

    it('should return the file menu element', () => {
      const fileMenu = fileMenuManager.getFileMenu();
      expect(fileMenu).toBe(document.getElementById('file-menu'));
    });
  });

  describe('Button Click Functionality', () => {
    beforeEach(() => {
      fileMenuManager.createFileMenu();
      fileMenuManager.toggleFileMenu(); // Show menu for testing
    });

    it('should call Load callback when Load button is clicked', () => {
      const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
      
      loadBtn.click();
      
      expect(mockLoadCallback).toHaveBeenCalledOnce();
    });

    it('should call Save callback when Save button is clicked', () => {
      const saveBtn = document.getElementById('save-btn') as HTMLButtonElement;
      
      saveBtn.click();
      
      expect(mockSaveCallback).toHaveBeenCalledOnce();
    });

    it('should call Save As callback when Save As button is clicked', () => {
      const saveAsBtn = document.getElementById('save-as-btn') as HTMLButtonElement;
      
      saveAsBtn.click();
      
      expect(mockSaveAsCallback).toHaveBeenCalledOnce();
    });

    it('should close menu after clicking any button', () => {
      const fileMenu = document.getElementById('file-menu') as HTMLElement;
      const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
      
      // Menu should be visible
      expect(fileMenu.style.display).toBe('block');
      
      // Click button
      loadBtn.click();
      
      // Menu should be hidden
      expect(fileMenu.style.display).toBe('none');
    });

    it('should handle missing callbacks gracefully', () => {
      // Clear existing menu first
      document.getElementById('file-menu')?.remove();
      
      // Create a new file menu manager with empty callback manager
      const emptyCallbackManager = new CallbackManager();
      const newFileMenuManager = new FileMenuManager(primaryToolbar, emptyCallbackManager);
      newFileMenuManager.createFileMenu();
      
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
      expect(loadBtn).toBeTruthy();
      
      loadBtn.click();
      
      expect(consoleSpy).toHaveBeenCalledWith('No callback set for Load');
      consoleSpy.mockRestore();
    });

    it('should handle callback errors gracefully', () => {
      // Set up a callback that throws an error
      const errorCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      callbackManager.setLoadDesignCallback(errorCallback);
      
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
      
      // Should not throw error
      expect(() => loadBtn.click()).not.toThrow();
      
      expect(errorCallback).toHaveBeenCalledOnce();
      expect(consoleSpy).toHaveBeenCalledWith('Error calling Load callback:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });
  });

  describe('Dynamic Callback Access', () => {
    beforeEach(() => {
      fileMenuManager.createFileMenu();
    });

    it('should access callbacks dynamically when clicked', () => {
      // Clear existing menu first
      document.getElementById('file-menu')?.remove();
      
      // Initially no callback set
      const emptyCallbackManager = new CallbackManager();
      const newFileMenuManager = new FileMenuManager(primaryToolbar, emptyCallbackManager);
      newFileMenuManager.createFileMenu();
      
      const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
      expect(loadBtn).toBeTruthy();
      
      // First click - no callback
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      loadBtn.click();
      expect(consoleSpy).toHaveBeenCalledWith('No callback set for Load');
      
      // Set callback after menu creation
      const newLoadCallback = vi.fn();
      emptyCallbackManager.setLoadDesignCallback(newLoadCallback);
      
      // Second click - should call new callback
      loadBtn.click();
      expect(newLoadCallback).toHaveBeenCalledOnce();
      
      consoleSpy.mockRestore();
    });

    it('should handle callback changes after menu creation', () => {
      const loadBtn = document.getElementById('load-btn') as HTMLButtonElement;
      
      // First callback
      loadBtn.click();
      expect(mockLoadCallback).toHaveBeenCalledOnce();
      
      // Change callback
      const newLoadCallback = vi.fn();
      callbackManager.setLoadDesignCallback(newLoadCallback);
      
      // Second click should use new callback
      loadBtn.click();
      expect(newLoadCallback).toHaveBeenCalledOnce();
      expect(mockLoadCallback).toHaveBeenCalledOnce(); // Should not be called again
    });
  });

  describe('UI Update Integration', () => {
    beforeEach(() => {
      fileMenuManager.createFileMenu();
    });

    it('should support setting UI update callback', () => {
      const mockUpdateUI = vi.fn();
      
      fileMenuManager.setUpdateFileMenuUI(mockUpdateUI);
      
      // Toggle menu to trigger UI update
      fileMenuManager.toggleFileMenu();
      expect(mockUpdateUI).toHaveBeenCalledWith(true);
      
      fileMenuManager.toggleFileMenu();
      expect(mockUpdateUI).toHaveBeenCalledWith(false);
    });

    it('should handle missing UI update callback gracefully', () => {
      // Should not throw error when no UI update callback is set
      expect(() => {
        fileMenuManager.toggleFileMenu();
        fileMenuManager.closeFileMenu();
      }).not.toThrow();
    });
  });
});