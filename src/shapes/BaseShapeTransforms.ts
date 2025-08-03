import { Point } from '../core/types.js';

export class BaseShapeTransforms {
  /**
   * Moves the shape by the specified 2D offset (delta), in world coordinates.
   * This is a translation vector to apply to all vertices (world-coordinates-only model).
   * Default implementation moves each vertex by delta using moveVertex().
   * Subclasses can override for custom behavior.
   */
  public static move(shape: any, delta: Point): void {
    const verts = shape.getVertices();
    for (let i = 0; i < verts.length; i++) {
      shape.moveVertex(i, { x: verts[i].x + delta.x, y: verts[i].y + delta.y });
    }
  }

  /**
   * Rotate the shape in-place by `angle` radians. If `center` is omitted the
   * shape is rotated about its geometric center (mid-point of its bounding
   * box). The implementation here mutates **all** concrete-shape geometry via
   * `moveVertex`/`move` so subclasses that store explicit points must override
   * this for efficiency. For backwards compatibility it still rotates the
   * world-coordinates-only model.
   */
  public static rotate(shape: any, angle: number, center?: Point): void {
    // Determine rotation center
    const rotCenter = center ?? shape.getCenter();
    const verts = shape.getVertices();
    const cosAngle = Math.cos(angle);
    const sinAngle = Math.sin(angle);
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      const dx = v.x - rotCenter.x;
      const dy = v.y - rotCenter.y;
      const rotatedX = dx * cosAngle - dy * sinAngle + rotCenter.x;
      const rotatedY = dx * sinAngle + dy * cosAngle + rotCenter.y;
      shape.moveVertex(i, { x: rotatedX, y: rotatedY });
    }
    shape.recalculateProperties();
  }

  /**
   * Mirror the shape across a horizontal or vertical axis through the given center point.
   * @param axis The axis to mirror across: 'horizontal' mirrors across a horizontal line (flips vertically), 'vertical' mirrors across a vertical line (flips horizontally)
   * @param center The center point for the mirror axis
   */
  public static mirror(shape: any, axis: 'horizontal' | 'vertical', center: Point): void {
    const verts = shape.getVertices();
    for (let i = 0; i < verts.length; i++) {
      const v = verts[i];
      let mirroredX = v.x;
      let mirroredY = v.y;

      if (axis === 'horizontal') {
        // Mirror across horizontal line through center (flip vertically)
        mirroredY = center.y - (v.y - center.y);
      } else {
        // Mirror across vertical line through center (flip horizontally)
        mirroredX = center.x - (v.x - center.x);
      }

      shape.moveVertex(i, { x: mirroredX, y: mirroredY });
    }
    shape.recalculateProperties();
  }

  /**
   * Applies random jiggle to the shape for organic appearance.
   * @param positionVariation Random position offset in mm (default ±1mm)
   * @param rotationVariation Random rotation in degrees (default ±5°)
   * @param radiusVariation Random radius variation as percentage (default ±5%)
   */
  public static jiggle(
    shape: any,
    positionVariation = 1.0,
    rotationVariation = 5.0,
    radiusVariation = 5.0,
  ): void {
    // Validate and clamp parameters to prevent shapes from disappearing
    const maxPositionVariation = 50; // Maximum 50mm offset
    const maxRotationVariation = 180; // Maximum 180 degrees
    const maxRadiusVariation = 90; // Maximum 90% radius variation

    const clampedPositionVariation = Math.max(0, Math.min(positionVariation, maxPositionVariation));
    const clampedRotationVariation = Math.max(0, Math.min(rotationVariation, maxRotationVariation));
    const clampedRadiusVariation = Math.max(0, Math.min(radiusVariation, maxRadiusVariation));

    // Get current position for bounds checking
    const currentCenter = shape.getCenter();

    // Apply random position offset only if variation is greater than 0
    if (clampedPositionVariation > 0) {
      const offsetX = (Math.random() - 0.5) * 2 * clampedPositionVariation;
      const offsetY = (Math.random() - 0.5) * 2 * clampedPositionVariation;

      // Calculate new position and ensure it stays within reasonable bounds
      const newCenterX = currentCenter.x + offsetX;
      const newCenterY = currentCenter.y + offsetY;

      // Define reasonable canvas bounds (±1000mm from origin)
      const maxCanvasBound = 1000;

      // Only apply the offset if the new position is within bounds
      if (Math.abs(newCenterX) <= maxCanvasBound && Math.abs(newCenterY) <= maxCanvasBound) {
        BaseShapeTransforms.move(shape, { x: offsetX, y: offsetY });
      } else {
        console.warn(
          'Jiggle position offset would move shape outside canvas bounds, skipping position jiggle',
        );
      }
    }

    // Apply random rotation only if variation is greater than 0
    if (clampedRotationVariation > 0) {
      const rotationRadians =
        (Math.random() - 0.5) * 2 * clampedRotationVariation * (Math.PI / 180);
      BaseShapeTransforms.rotate(shape, rotationRadians);
    }

    // Apply radius variation for shapes that support it (TriArc)
    if (clampedRadiusVariation > 0 && shape.jiggleRadius) {
      shape.jiggleRadius(clampedRadiusVariation);
    }
  }
}
