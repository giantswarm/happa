import { validateAppName } from 'AppCatalog/AppDetail/InstallAppModalUtils';
import { generateRandomString } from 'testUtils/mockHttpCalls';

describe('InstallAppModalUtils', () => {
  describe('validateAppName', () => {
    it('checks that the app name is within the right length requirements', () => {
      // eslint-disable-next-line no-magic-numbers
      let appName = generateRandomString(500);
      let result = validateAppName(appName);
      expect(result.valid).toBeFalsy();
      expect(result.message).toBe('must not be longer than 253 characters');

      // eslint-disable-next-line no-magic-numbers
      appName = generateRandomString(50);
      result = validateAppName(appName);
      expect(result.valid).toBeTruthy();
      expect(result.message).toBe('');
    });

    it('checks that the app name starts and ends with lowercase alphanumeric characters', () => {
      const errorMessage =
        'must start and end with lower case alphanumeric characters';

      let appName = 'Goodapp';
      let result = validateAppName(appName);
      expect(result.valid).toBeFalsy();
      expect(result.message).toBe(errorMessage);

      appName = 'goodapP';
      result = validateAppName(appName);
      expect(result.valid).toBeFalsy();
      expect(result.message).toBe(errorMessage);

      appName = '.goodapp';
      result = validateAppName(appName);
      expect(result.valid).toBeFalsy();
      expect(result.message).toBe(errorMessage);

      appName = 'goodapp.';
      result = validateAppName(appName);
      expect(result.valid).toBeFalsy();
      expect(result.message).toBe(errorMessage);

      appName = 'goodapp';
      result = validateAppName(appName);
      expect(result.valid).toBeTruthy();
      expect(result.message).toBe('');

      appName = '91goodapp30';
      result = validateAppName(appName);
      expect(result.valid).toBeTruthy();
      expect(result.message).toBe('');
    });

    it(`checks that the app name consists of lowercase alphanumeric characters, '-' or '.'`, () => {
      const errorMessage = `must consist of lower case alphanumeric characters, '-' or '.'`;

      let appName = 'awe$ome-app';
      let result = validateAppName(appName);
      expect(result.valid).toBeFalsy();
      expect(result.message).toBe(errorMessage);

      appName = 'cool app bro';
      result = validateAppName(appName);
      expect(result.valid).toBeFalsy();
      expect(result.message).toBe(errorMessage);

      appName = 'cool-app-bro';
      result = validateAppName(appName);
      expect(result.valid).toBeTruthy();
      expect(result.message).toBe('');
    });
  });
});
