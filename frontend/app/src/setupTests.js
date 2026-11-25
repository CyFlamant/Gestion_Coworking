// Runs before every test file: adds the DOM matchers (toBeInTheDocument…) and empties the page after each test.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);
