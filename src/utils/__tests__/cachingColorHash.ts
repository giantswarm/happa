import CachingColorHash from 'utils/cachingColorHash';

describe('cachingColorHash', () => {
  it('always returns the same colors for the same input', () => {
    const tries = 10;
    const colorHash = new CachingColorHash();
    const colors: Record<string, string> = {};

    let results: string[] = [];

    colors.dog = colorHash.calculateColor('dog');
    for (let i = 0; i < tries; i++) {
      results.push(colorHash.calculateColor('dog'));
    }
    expect(results.some((res) => res !== colors.dog)).toBe(false);

    results = [];

    colors.cat = colorHash.calculateColor('cat');
    for (let i = 0; i < tries; i++) {
      results.push(colorHash.calculateColor('cat'));
    }
    expect(results.some((res) => res !== colors.cat)).toBe(false);
  });
});
