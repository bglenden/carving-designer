import { vi, beforeAll, afterAll } from 'vitest';

// Silence noisy console output during test runs while preserving error and warn.
beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'info').mockImplementation(() => {});
});

afterAll(() => {
  // Restore if available (Vitest wraps spies with mockRestore)
  (console.log as any).mockRestore?.();
  (console.info as any).mockRestore?.();
});
