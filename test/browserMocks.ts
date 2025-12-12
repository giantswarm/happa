import fetch from 'isomorphic-fetch';
import { TextEncoder, TextDecoder } from 'util';

// Polyfill TextEncoder and TextDecoder for Jest/jsdom environment
// Required by @paralleldrive/cuid2 (used by formidable 3.5.3+)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextEncoder = TextEncoder as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
global.TextDecoder = TextDecoder as any;

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};

  public get length() {
    return Object.keys(this.store).length;
  }

  public getItem(key: string) {
    return this.store[key] || null;
  }

  public setItem(key: string, value: string) {
    this.store[key] = value;
  }

  public removeItem(key: string) {
    delete this.store[key];
  }

  public key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }

  public clear() {
    this.store = {};
  }

  public replaceWith(newStore: Record<string, string>) {
    this.store = newStore;
  }
}

Object.defineProperty(window, 'localStorage', {
  value: new LocalStorageMock(),
});

// Adjust the console logging behaviour during test runs.
/* eslint-disable no-console */
Object.defineProperty(window, 'console', {
  value: {
    log: console.log,
    error: console.error,
    warn: jest.fn(), // warnings are surpressed.
    info: console.info,
    debug: console.debug,
  },
});
/* eslint-enable no-console */

Object.defineProperty(window, 'fetch', {
  value: fetch,
});

export {};
