import { beforeEach, vi } from 'vitest';

// Mock fetch globally
(globalThis as any).fetch = vi.fn();


// Setup any global test configuration here
beforeEach(() => {
  vi.clearAllMocks();
});