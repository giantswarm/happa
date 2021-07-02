import { generateUID } from 'MAPI/utils';

describe('mapi::utils', () => {
  describe('generateUID', () => {
    it('generates unique IDs', () => {
      const tries = 250;

      const values = new Set<string>();
      for (let i = 0; i < tries; i++) {
        const id = generateUID(5);

        expect(values.has(id)).toBeFalsy();

        values.add(id);
      }
    });
  });
});
