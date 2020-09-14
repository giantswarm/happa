import { dedent, humanFileSize, truncate } from 'lib/helpers';

describe('helpers', () => {
  describe('dedent', () => {
    it('formats code in a user-friendly way', () => {
      const input = `somecommand execute \\
      go-home \\
      cool    `;
      const result = dedent(input);

      expect(result).toEqual(`somecommand execute \\
go-home \\
cool`);
    });
  });

  describe('humanFileSize', () => {
    it('formats various numbers of bytes in their correct user-friendly representations, using the SI notation', () => {
      /* eslint-disable no-magic-numbers */

      const attempts = [
        {
          size: 0,
          result: { unit: 'B', value: '0.0' },
        },
        {
          size: 500,
          result: { unit: 'B', value: '500.0' },
        },
        {
          size: 10 ** 3,
          result: { unit: 'kB', value: '1.0' },
        },
        {
          size: 42.3 * 10 ** 3,
          result: { unit: 'kB', value: '42.3' },
        },
        {
          size: 10 ** 6,
          result: { unit: 'MB', value: '1.0' },
        },
        {
          size: 503.9 * 10 ** 6,
          result: { unit: 'MB', value: '503.9' },
        },
        {
          size: 10 ** 9,
          result: { unit: 'GB', value: '1.0' },
        },
        {
          size: 213.33 * 10 ** 9,
          result: { unit: 'GB', value: '213.3' },
        },
        {
          size: 10 ** 12,
          result: { unit: 'TB', value: '1.0' },
        },
        {
          size: 983.912 * 10 ** 12,
          result: { unit: 'TB', value: '983.9' },
        },
        {
          size: 10 ** 15,
          result: { unit: 'PB', value: '1.0' },
        },
        {
          size: 150.01239 * 10 ** 15,
          result: { unit: 'PB', value: '150.0' },
        },
        {
          size: 10 ** 18,
          result: { unit: 'EB', value: '1.0' },
        },
        {
          size: 13.9 * 10 ** 18,
          result: { unit: 'EB', value: '13.9' },
        },
        {
          size: 10 ** 21,
          result: { unit: 'ZB', value: '1.0' },
        },
        {
          size: 33 * 10 ** 21,
          result: { unit: 'ZB', value: '33.0' },
        },
        {
          size: 10 ** 24,
          result: { unit: 'YB', value: '1.0' },
        },
        {
          size: 341.3 * 10 ** 24,
          result: { unit: 'YB', value: '341.3' },
        },
      ];

      for (const attempt of attempts) {
        expect(humanFileSize(attempt.size)).toStrictEqual(attempt.result);
      }

      /* eslint-enable no-magic-numbers */
    });

    it('formats various numbers of bytes in their correct user-friendly representations, using a non-SI notation', () => {
      /* eslint-disable no-magic-numbers */

      const attempts = [
        {
          size: 0,
          result: { unit: 'B', value: '0.0' },
        },
        {
          size: 500,
          result: { unit: 'B', value: '500.0' },
        },
        {
          size: 1024,
          result: { unit: 'KiB', value: '1.0' },
        },
        {
          size: 42.3 * 1024,
          result: { unit: 'KiB', value: '42.3' },
        },
        {
          size: 1024 ** 2,
          result: { unit: 'MiB', value: '1.0' },
        },
        {
          size: 503.9 * 1024 ** 2,
          result: { unit: 'MiB', value: '503.9' },
        },
        {
          size: 1024 ** 3,
          result: { unit: 'GiB', value: '1.0' },
        },
        {
          size: 213.33 * 1024 ** 3,
          result: { unit: 'GiB', value: '213.3' },
        },
        {
          size: 1024 ** 4,
          result: { unit: 'TiB', value: '1.0' },
        },
        {
          size: 983.912 * 1024 ** 4,
          result: { unit: 'TiB', value: '983.9' },
        },
        {
          size: 1024 ** 5,
          result: { unit: 'PiB', value: '1.0' },
        },
        {
          size: 150.01239 * 1024 ** 5,
          result: { unit: 'PiB', value: '150.0' },
        },
        {
          size: 1024 ** 6,
          result: { unit: 'EiB', value: '1.0' },
        },
        {
          size: 13.9 * 1024 ** 6,
          result: { unit: 'EiB', value: '13.9' },
        },
        {
          size: 1024 ** 7,
          result: { unit: 'ZiB', value: '1.0' },
        },
        {
          size: 33 * 1024 ** 7,
          result: { unit: 'ZiB', value: '33.0' },
        },
        {
          size: 1024 ** 8,
          result: { unit: 'YiB', value: '1.0' },
        },
        {
          size: 341.3 * 1024 ** 8,
          result: { unit: 'YiB', value: '341.3' },
        },
      ];

      for (const attempt of attempts) {
        expect(humanFileSize(attempt.size, false)).toStrictEqual(
          attempt.result
        );
      }

      /* eslint-enable no-magic-numbers */
    });

    it('rounds resulting units to the number of decimals that is requested', () => {
      /* eslint-disable no-magic-numbers */

      const bytes = 35.192301 * 10 ** 16;
      let result = humanFileSize<boolean>(bytes, true, 3);
      expect(result).toStrictEqual({ unit: 'PB', value: '351.923' });

      result = humanFileSize(bytes, false, 3);
      expect(result).toStrictEqual({ unit: 'PiB', value: '312.570' });

      /* eslint-enable no-magic-numbers */
    });
  });

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
});
