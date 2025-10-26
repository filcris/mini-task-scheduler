// src/test/setup.ts
import { afterEach, vi, expect } from 'vitest';
import { cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';

// adiciona todos os matchers do jest-dom (toBeInTheDocument, toHaveTextContent, etc.)
expect.extend(matchers);

afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.restoreAllMocks();
});


