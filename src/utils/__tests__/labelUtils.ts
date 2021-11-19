import { generateRandomString } from 'test/mockHttpCalls';
import { validateLabelKey, validateLabelValue } from 'utils/labelUtils';

describe('labelUtils', () => {
  describe('validateLabelValue', () => {
    it('checks for empty values', () => {
      const result = validateLabelValue('');
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe('Value cannot be empty.');
    });

    it('accepts strings with maximum length of 63 characters', () => {
      // eslint-disable-next-line no-magic-numbers
      let input = generateRandomString(64);
      let result = validateLabelValue(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe('Value must not be longer than 63.');

      // eslint-disable-next-line no-magic-numbers
      input = generateRandomString(63);
      result = validateLabelValue(input);
      expect(result.isValid).toBeTruthy();
      expect(result.validationError).toBe('');
    });

    it('checks if strings respect a certain format', () => {
      const errorMessage = `Value must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character.`;

      let input = '$uperInput';
      let result = validateLabelValue(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = '_dogs';
      result = validateLabelValue(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = '.dogs';
      result = validateLabelValue(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = '-dogs';
      result = validateLabelValue(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = 'dogs_';
      result = validateLabelValue(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = 'dogs.';
      result = validateLabelValue(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = 'dogs-';
      result = validateLabelValue(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = 'super-code';
      result = validateLabelValue(input);
      expect(result.isValid).toBeTruthy();
      expect(result.validationError).toBe('');

      input = '1320s-code-1.2.3';
      result = validateLabelValue(input);
      expect(result.isValid).toBeTruthy();
      expect(result.validationError).toBe('');

      input = 'frog_code---231';
      result = validateLabelValue(input);
      expect(result.isValid).toBeTruthy();
      expect(result.validationError).toBe('');
    });
  });

  describe('validateLabelKey', () => {
    it('checks for empty values', () => {
      const result = validateLabelKey('');
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe('Key cannot be empty');
    });

    it(`doesn't allow values to contain the 'giantswarm.io' substring`, () => {
      let result = validateLabelKey('gIaNtSwArM.iO');
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(`Key cannot contain 'giantswarm.io'`);

      result = validateLabelKey('something.giantswarm.io/cool');
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(`Key cannot contain 'giantswarm.io'`);
    });

    it(`doesn't allow the value to be the CAPI cluster name label`, () => {
      let result = validateLabelKey('cluster.x-k8s.io/cluster-name');
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(
        `Key cannot be 'cluster.x-k8s.io/cluster-name'`
      );

      result = validateLabelKey('CLUSTER.x-k8s.io/cluster-name');
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(
        `Key cannot be 'cluster.x-k8s.io/cluster-name'`
      );
    });

    it('checks if strings respect a certain format', () => {
      const errorMessage = `Key name part must consist of alphanumeric characters, '-', '_' or '.', and must start and end with an alphanumeric character.`;

      let input = '$uperInput';
      let result = validateLabelKey(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = '_dogs';
      result = validateLabelKey(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = '.dogs';
      result = validateLabelKey(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = '-dogs';
      result = validateLabelKey(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = 'dogs_';
      result = validateLabelKey(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = 'dogs.';
      result = validateLabelKey(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = 'dogs-';
      result = validateLabelKey(input);
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      input = 'super-code';
      result = validateLabelKey(input);
      expect(result.isValid).toBeTruthy();
      expect(result.validationError).toBe('');

      input = '1320s-code-1.2.3';
      result = validateLabelKey(input);
      expect(result.isValid).toBeTruthy();
      expect(result.validationError).toBe('');

      input = 'frog_code---231';
      result = validateLabelKey(input);
      expect(result.isValid).toBeTruthy();
      expect(result.validationError).toBe('');
    });

    it('does not allow empty prefixes', () => {
      const result = validateLabelKey('/great-thing');
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe('Key prefix cannot be empty.');
    });

    it('validates if the key contains a valid subdomain', () => {
      const errorMessage =
        'Key prefix must be a nonempty DNS subdomain not longer than 253 characters.';

      let result = validateLabelKey('dogs.frog$cats.com/great-thing');
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      result = validateLabelKey(
        // eslint-disable-next-line no-magic-numbers
        `dogs.frog$cats.com/great-thing${generateRandomString(300)}`
      );
      expect(result.isValid).toBeFalsy();
      expect(result.validationError).toBe(errorMessage);

      result = validateLabelKey('dogs.frogs-site.com/great-thing');
      expect(result.isValid).toBeTruthy();
      expect(result.validationError).toBe('');
    });
  });
});
