import { HitRegion } from '../core/types.js';
import { HandleRenderer } from '../rendering/HandleRenderer.js';

export class BaseShapeRendering {
  /**
   * Draws interactive handles for the shape's vertices.
   * @param ctx The rendering context.
   * @param scale The current canvas scale.
   */
  public static drawHandles(shape: any, ctx: CanvasRenderingContext2D, scale: number): void {
    // Draw vertex handles (circles)
    const vertices = shape.getVertices();
    const handles = vertices.map((vertex: any, index: number) => ({
      position: { x: vertex.x, y: vertex.y },
      isActive:
        shape.activeHit?.region === HitRegion.VERTEX &&
        shape.activeHit.details?.vertexIndex === index,
      isHovered: false, // Could be enhanced to track hover state
    }));

    HandleRenderer.drawHandlesWithStates(ctx, handles, {
      scale,
      customRadius: handles.some((h: any) => h.isActive) ? 24 / scale : undefined,
    });

    // Draw arc handles (squares) - TODO: Could be refactored to use HandleRenderer with square shapes
    const arcMidpoints = shape.getArcMidpoints();
    const handleSize = (18 / scale) * 2; // Use base handle size
    const activeHandleSize = (24 / scale) * 2;

    arcMidpoints.forEach((midpoint: any, index: number) => {
      const isActive =
        shape.activeHit?.region === HitRegion.ARC && shape.activeHit.details?.arcIndex === index;
      const size = isActive ? activeHandleSize : handleSize;

      ctx.fillStyle = isActive ? 'rgba(0, 150, 200, 0.9)' : 'rgba(0, 200, 255, 0.5)';
      ctx.strokeStyle = 'rgba(0, 0, 0, 1)';
      ctx.lineWidth = 1 / scale;
      ctx.fillRect(midpoint.x - size / 2, midpoint.y - size / 2, size, size);
      ctx.strokeRect(midpoint.x - size / 2, midpoint.y - size / 2, size, size);
    });
  }
}
