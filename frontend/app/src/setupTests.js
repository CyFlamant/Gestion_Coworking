// Runs before every test file: adds the DOM matchers (toBeInTheDocument…) and empties the page after each test.
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom has no <dialog> methods yet: minimal stand-ins so components that open dialogs can be tested.
HTMLDialogElement.prototype.showModal = function showModal() {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close = function close() {
  this.removeAttribute('open');
};
