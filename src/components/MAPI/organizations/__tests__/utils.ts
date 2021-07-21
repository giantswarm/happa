import {
  OrganizationNameStatusMessage,
  validateOrganizationName,
} from '../utils';

describe('utils', () => {
  describe('validateOrganizationName', () => {
    it('is invalid on a organization name that is too short', () => {
      const validateResult = validateOrganizationName('aaa');

      expect(validateResult.valid).toBeFalsy();
      expect(validateResult.statusMessage).toEqual(
        OrganizationNameStatusMessage.TooShort
      );
    });

    it('is invalid on a organization that doesnt start with a letter or number', () => {
      const validateResult = validateOrganizationName('-helloworld');

      expect(validateResult.valid).toBeFalsy();
      expect(validateResult.statusMessage).toEqual(
        OrganizationNameStatusMessage.StartAndEndWithAlphaNumeric
      );
    });

    it('is invalid on a organization that doesnt end with a letter or number', () => {
      const validateResult = validateOrganizationName('helloworld-');

      expect(validateResult.valid).toBeFalsy();
      expect(validateResult.statusMessage).toEqual(
        OrganizationNameStatusMessage.StartAndEndWithAlphaNumeric
      );
    });

    it('is invalid on a organization that includes special characters', () => {
      const validateResult = validateOrganizationName('hello$world');

      expect(validateResult.valid).toBeFalsy();
      expect(validateResult.statusMessage).toEqual(
        OrganizationNameStatusMessage.CharacterSet
      );
    });

    it('is invalid on a organization that is too long', () => {
      const validateResult = validateOrganizationName(
        'hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world'
      );

      expect(validateResult.valid).toBeFalsy();
      expect(validateResult.statusMessage).toEqual(
        OrganizationNameStatusMessage.TooLong
      );
    });

    it('is valid on a reasonable org name', () => {
      const validateResult = validateOrganizationName('my-lovely-org');

      expect(validateResult.valid).toBeTruthy();
      expect(validateResult.statusMessage).toEqual(
        OrganizationNameStatusMessage.Ok
      );
    });
  });
});
