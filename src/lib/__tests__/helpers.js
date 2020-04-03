import { truncate } from 'lib/helpers';

describe('truncate', () => {
  it('leaves string untouched if it is too short to be replaced', () => {
    const initial = 'someString';
    // eslint-disable-next-line no-magic-numbers
    const result = truncate(initial, '...', 15, 5);

    expect(result).toBe(initial);
  });

  it('accepts zero values', () => {
    const initial = 'someString';
    const result = truncate(initial, '...', 0, 0);

    expect(result).toBe(initial);
  });

  it('truncates string', () => {
    const initial = 'someReallyLongStringThatIWouldLikeToTruncate';
    // eslint-disable-next-line no-magic-numbers
    const result = truncate(initial, '...', 10, 8);

    expect(result).toBe('someReally...Truncate');
  });

  it('accepts different replacers', () => {
    const initial = 'someReallyLongStringThatIWouldLikeToTruncate';
    // eslint-disable-next-line no-magic-numbers
    const result = truncate(initial, 'NotReallyHelpful', 10, 8);

    expect(result).toBe('someReallyNotReallyHelpfulTruncate');
  });
});
