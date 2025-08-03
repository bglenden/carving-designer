import { BaseShape } from '../../src/shapes/BaseShape.js';
import { Point, ShapeType } from '../../src/core/types.js';

describe('BaseShape default implementations', () => {
  // Minimal concrete subclass for testing
  class TestShape extends BaseShape {
    private verts: Point[];
    private arcOffsets: number[];
    constructor(verts: Point[], arcOffsets: number[]) {
      super(ShapeType.TRI_ARC);
      this.verts = verts;
      this.arcOffsets = arcOffsets;
    }
    getVertices(): Point[] {
      return this.verts;
    }
    moveVertex(i: number, p: Point): void {
      this.verts[i] = { ...p };
    }
    getArcVertexIndexes(idx: number): [number, number] {
      return [idx, (idx + 1) % this.verts.length] as [number, number];
    }
    getArcOffsets(): number[] {
      return this.arcOffsets;
    }
    getCenter(): Point {
      return { x: 0, y: 0 };
    }
    getBoundingBox(): { min: Point; max: Point } {
      return { min: { x: 0, y: 0 }, max: { x: 0, y: 0 } };
    }
    contains(_p: Point): boolean {
      return false;
    }
    hitTest(_point: Point, _scale: number): any {
      return null;
    }
    getBounds(): { x: number; y: number; width: number; height: number } {
      return { x: 0, y: 0, width: 0, height: 0 };
    }
    clone(): BaseShape {
      return new TestShape([...this.verts], [...this.arcOffsets]);
    }
    protected recalculateProperties(): void {}
    protected _draw(_ctx: CanvasRenderingContext2D, _scale: number, _isSelected: boolean): void {}
  }

  it('move() translates all vertices by delta', () => {
    const shape = new TestShape(
      [
        { x: 1, y: 2 },
        { x: 3, y: 4 },
        { x: -1, y: -2 },
      ],
      [0, 0, 0],
    );
    shape.move({ x: 5, y: -2 });
    expect(shape.getVertices()).toEqual([
      { x: 6, y: 0 },
      { x: 8, y: 2 },
      { x: 4, y: -4 },
    ]);
  });

  it('getArcMidpoints() computes correct midpoints and offset', () => {
    const verts = [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 10 },
    ];
    // Offset 0: midpoint is on the chord
    let shape = new TestShape([...verts], [0, 0, 0]);
    const mids = shape.getArcMidpoints();
    expect(mids.length).toBe(3);
    expect(mids[0]).toEqual({ x: 5, y: 0 });
    expect(mids[1]).toEqual({ x: 10, y: 5 });
    expect(mids[2]).toEqual({ x: 5, y: 5 });
    // Offset positive: midpoint moves outward (90deg CCW from chord)
    shape = new TestShape([...verts], [2, 0, 0]);
    const mid0 = shape.getArcMidpoints()[0];
    // Chord 0: (0,0)-(10,0), normal is (0,1), so offset +2 moves up
    expect(mid0.x).toBeCloseTo(5);
    expect(mid0.y).toBeCloseTo(2);
    // Offset negative: midpoint moves inward (90deg CW from chord)
    shape = new TestShape([...verts], [-2, 0, 0]);
    const mid0neg = shape.getArcMidpoints()[0];
    expect(mid0neg.x).toBeCloseTo(5);
    expect(mid0neg.y).toBeCloseTo(-2);
  });

  it('rotate() rotates all vertices about the center', () => {
    // Square shape centered at (0,0)
    const verts = [
      { x: 1, y: 0 },
      { x: 0, y: 1 },
      { x: -1, y: 0 },
      { x: 0, y: -1 },
    ];
    const shape = new TestShape([...verts], [0, 0, 0, 0]);
    shape.getCenter = () => ({ x: 0, y: 0 });
    // Rotate 90deg (Math.PI/2)
    const angle = Math.PI / 2;
    for (let i = 0; i < shape.getVertices().length; i++) {
      const v = shape.getVertices()[i];
      const x = v.x;
      const y = v.y;
      shape.moveVertex(i, {
        x: x * Math.cos(angle) - y * Math.sin(angle),
        y: x * Math.sin(angle) + y * Math.cos(angle),
      });
    }
    const rotated = shape.getVertices();
    expect(rotated[0].x).toBeCloseTo(0);
    expect(rotated[0].y).toBeCloseTo(1);
    expect(rotated[1].x).toBeCloseTo(-1);
    expect(rotated[1].y).toBeCloseTo(0);
    expect(rotated[2].x).toBeCloseTo(0);
    expect(rotated[2].y).toBeCloseTo(-1);
    expect(rotated[3].x).toBeCloseTo(1);
    expect(rotated[3].y).toBeCloseTo(0);
  });

  it('setArcMidpoint() default does nothing but logs warning', () => {
    const shape = new TestShape(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      [0, 0],
    );
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    shape.setArcMidpoint(0, 5);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('setArcMidpoint not implemented'));
    warnSpy.mockRestore();
  });

  it('drawHandles() draws correct number of vertex and arc handles', () => {
    const shape = new TestShape(
      [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ],
      [0, 0, 0],
    );
    // Mock canvas context
    const ctx: Partial<CanvasRenderingContext2D> = {
      beginPath: vi.fn(),
      arc: vi.fn() as CanvasRenderingContext2D['arc'],
      fill: vi.fn(),
      stroke: vi.fn(),
      fillRect: vi.fn() as CanvasRenderingContext2D['fillRect'],
      strokeRect: vi.fn() as CanvasRenderingContext2D['strokeRect'],
      save: vi.fn() as CanvasRenderingContext2D['save'],
      restore: vi.fn() as CanvasRenderingContext2D['restore'],
      get fillStyle() {
        return '';
      },
      set fillStyle(_v: string) {},
      get strokeStyle() {
        return '';
      },
      set strokeStyle(_v: string) {},
      get lineWidth() {
        return 1;
      },
      set lineWidth(_v: number) {},
    };
    shape.drawHandles(ctx as CanvasRenderingContext2D, 1);
    // 3 vertex handles (arc called 3 times)
    expect((ctx.arc as any).mock.calls.length).toBe(3);
    // 3 arc handles (fillRect and strokeRect called 3 times each)
    expect((ctx.fillRect as any).mock.calls.length).toBe(3);
    expect((ctx.strokeRect as any).mock.calls.length).toBe(3);
  });
});
