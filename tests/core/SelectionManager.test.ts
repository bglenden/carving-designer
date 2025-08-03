import { vi, describe, it, expect, beforeEach } from 'vitest';
vi.unmock('../../src/core/SelectionManager.js');
import { SelectionManager } from '../../src/core/SelectionManager.js';
import { BaseShape } from '../../src/shapes/BaseShape.js';

// Mock BaseShape for testing purposes
const mockShape1 = { id: 'shape1' } as BaseShape;
const mockShape2 = { id: 'shape2' } as BaseShape;

describe('SelectionManager', () => {
  let selectionManager: SelectionManager;
  let dispatchEventSpy: any;

  beforeEach(() => {
    selectionManager = new SelectionManager();
    dispatchEventSpy = vi.spyOn(document, 'dispatchEvent');
  });

  it('should be empty initially', () => {
    expect(selectionManager.selection.size).toBe(0);
  });

  describe('add', () => {
    it('should add a shape to the selection', () => {
      selectionManager.add(mockShape1);
      expect(selectionManager.has(mockShape1)).toBe(true);
      expect(selectionManager.selection.size).toBe(1);
    });

    it('should dispatch a selectionChanged event', () => {
      selectionManager.add(mockShape1);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('selectionChanged');
      expect(event.detail.selectedShapes.has(mockShape1)).toBe(true);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      selectionManager.add(mockShape1);
      selectionManager.add(mockShape2);
      dispatchEventSpy.mockClear(); // Clear spy after setup
    });

    it('should remove a shape from the selection', () => {
      selectionManager.remove(mockShape1);
      expect(selectionManager.has(mockShape1)).toBe(false);
      expect(selectionManager.selection.size).toBe(1);
    });

    it('should dispatch a selectionChanged event', () => {
      selectionManager.remove(mockShape1);
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('selectionChanged');
      expect(event.detail.selectedShapes.has(mockShape1)).toBe(false);
    });
  });

  describe('has', () => {
    it('should return true if a shape is selected', () => {
      selectionManager.add(mockShape1);
      expect(selectionManager.has(mockShape1)).toBe(true);
    });

    it('should return false if a shape is not selected', () => {
      expect(selectionManager.has(mockShape1)).toBe(false);
    });
  });

  describe('clear', () => {
    beforeEach(() => {
      selectionManager.add(mockShape1);
      selectionManager.add(mockShape2);
      dispatchEventSpy.mockClear();
    });

    it('should remove all shapes from the selection', () => {
      selectionManager.clear();
      expect(selectionManager.selection.size).toBe(0);
      expect(selectionManager.has(mockShape1)).toBe(false);
      expect(selectionManager.has(mockShape2)).toBe(false);
    });

    it('should dispatch a selectionChanged event', () => {
      selectionManager.clear();
      expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
      const event = dispatchEventSpy.mock.calls[0][0];
      expect(event.type).toBe('selectionChanged');
      expect(event.detail.selectedShapes.size).toBe(0);
    });
  });

  describe('selection getter', () => {
    it('should return the set of selected shapes', () => {
      selectionManager.add(mockShape1);
      selectionManager.add(mockShape2);
      const selection = selectionManager.selection;
      expect(selection.size).toBe(2);
      expect(selection.has(mockShape1)).toBe(true);
      expect(selection.has(mockShape2)).toBe(true);
    });
  });
});
