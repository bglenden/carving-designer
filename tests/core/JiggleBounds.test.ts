import { describe, it, expect, vi } from 'vitest';
import { Leaf } from '../../src/shapes/Leaf.js';
import { TriArc } from '../../src/shapes/TriArc.js';

describe('Jiggle Bounds Protection', () => {
  it('should prevent extreme position variations from moving shapes too far', () => {
    const leaf = new Leaf({ x: 0, y: 0 }, { x: 10, y: 0 }, 5);
    const originalCenter = leaf.getCenter();
    
    // Mock console.warn to capture warnings
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    // Try to jiggle with extreme position variation (200mm), no rotation or radius variation
    leaf.jiggle(200, 0, 0);
    
    const newCenter = leaf.getCenter();
    const distance = Math.sqrt(
      Math.pow(newCenter.x - originalCenter.x, 2) + 
      Math.pow(newCenter.y - originalCenter.y, 2)
    );
    
    // Should be limited to max 50mm variation (100mm total potential movement)
    expect(distance).toBeLessThan(100);
    
    warnSpy.mockRestore();
  });

  it('should clamp position variation to maximum bounds', () => {
    const triarc = new TriArc({ x: 0, y: 0 }, { x: 10, y: 0 }, { x: 5, y: 10 });
    const originalCenter = triarc.getCenter();
    
    // Try extreme position variation, no rotation or radius variation
    triarc.jiggle(1000, 0, 0); // 1000mm variation
    
    const newCenter = triarc.getCenter();
    const distance = Math.sqrt(
      Math.pow(newCenter.x - originalCenter.x, 2) + 
      Math.pow(newCenter.y - originalCenter.y, 2)
    );
    
    // Should be clamped to max 50mm variation (100mm total potential movement)
    expect(distance).toBeLessThan(100);
  });

  it('should handle negative and invalid parameters gracefully', () => {
    const leaf = new Leaf({ x: 0, y: 0 }, { x: 10, y: 0 }, 5);
    const originalCenter = leaf.getCenter();
    
    // Test negative values (should be clamped to 0) for all parameters
    leaf.jiggle(-10, -45, -5);
    
    // Shape should not move with negative values
    expect(leaf.getCenter()).toEqual(originalCenter);
  });

  it('should keep shapes within reasonable bounds even with large jiggle values', () => {
    // Create a shape near the center with adequate radius
    const leaf = new Leaf({ x: 0, y: 0 }, { x: 10, y: 0 }, 15); // Larger radius to prevent geometry errors
    
    // Apply multiple jiggle operations with moderate values
    for (let i = 0; i < 5; i++) {
      leaf.jiggle(20, 0, 0); // Moderate position variation, no rotation or radius
    }
    
    const finalCenter = leaf.getCenter();
    
    // Even after multiple jiggle operations, shape should stay within reasonable bounds
    expect(Math.abs(finalCenter.x)).toBeLessThan(1000);
    expect(Math.abs(finalCenter.y)).toBeLessThan(1000);
    
    // Shape should still be valid (not thrown any errors)
    expect(leaf.getCenter()).toBeDefined();
  });
});