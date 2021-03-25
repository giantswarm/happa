import {
  OrganizationNameStatusMessage,
  validateOrganizationName,
} from 'lib/organizationValidation';

const getValidationResult = (
  isValid: boolean,
  statusMessage: OrganizationNameStatusMessage
) => {
  return {
    valid: isValid,
    statusMessage,
  };
};

describe('organizationValidation', () => {
  it('is invalid on a organization name that is too short', () => {
    const validateResult = validateOrganizationName('aaa');
    const expectedResult = getValidationResult(
      false,
      OrganizationNameStatusMessage.TooShort
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is invalid on a organization that doesnt start with a letter or number', () => {
    const validateResult = validateOrganizationName('-helloworld');
    const expectedResult = getValidationResult(
      false,
      OrganizationNameStatusMessage.StartAndEndWithAlphaNumeric
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is invalid on a organization that doesnt end with a letter or number', () => {
    const validateResult = validateOrganizationName('helloworld-');
    const expectedResult = getValidationResult(
      false,
      OrganizationNameStatusMessage.StartAndEndWithAlphaNumeric
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is invalid on a organization that includes special characters', () => {
    const validateResult = validateOrganizationName('hello$world');
    const expectedResult = getValidationResult(
      false,
      OrganizationNameStatusMessage.CharacterSet
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is invalid on a organization that is too long', () => {
    const validateResult = validateOrganizationName(
      'hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world-hello-world'
    );
    const expectedResult = getValidationResult(
      false,
      OrganizationNameStatusMessage.TooLong
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is valid on a reasonable org name', () => {
    const validateResult = validateOrganizationName('my-lovely-org');
    const expectedResult = getValidationResult(
      true,
      OrganizationNameStatusMessage.Ok
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });
});
