import CachingColorHash from 'utils/cachingColorHash';

describe('cachingColorHash', () => {
  it('always returns the same colors for the same input', () => {
    const tries = 10;
    const colorHash = new CachingColorHash();
    const colors: Record<string, string> = {};

    colors.dog = colorHash.calculateColor('dog');
    for (let i = 0; i < tries; i++) {
      expect(colorHash.calculateColor('dog')).toBe(colors.dog);
    }

    colors.cat = colorHash.calculateColor('cat');
    for (let i = 0; i < tries; i++) {
      expect(colorHash.calculateColor('cat')).toBe(colors.cat);
    }
  });
});
