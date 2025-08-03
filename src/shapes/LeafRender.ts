import type { Point } from '../core/types.js';

export function drawLeafPath(
  ctx: CanvasRenderingContext2D,
  focus1: Point,
  focus2: Point,
  radius: number,
  center1: Point,
  center2: Point,
  color: string,
  scale: number,
  isSelected: boolean,
) {
  const startAngle1 = Math.atan2(focus2.y - center1.y, focus2.x - center1.x);
  const endAngle1 = Math.atan2(focus1.y - center1.y, focus1.x - center1.x);
  const startAngle2 = Math.atan2(focus1.y - center2.y, focus1.x - center2.x);
  const endAngle2 = Math.atan2(focus2.y - center2.y, focus2.x - center2.x);

  ctx.strokeStyle = isSelected ? '#ff0000' : color;
  ctx.lineWidth = 1 / scale;

  ctx.beginPath();
  ctx.arc(center1.x, center1.y, radius, endAngle1, startAngle1, false);
  ctx.arc(center2.x, center2.y, radius, endAngle2, startAngle2, false);
  ctx.stroke();
}
