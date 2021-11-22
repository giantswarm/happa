import {
  PasswordStatusMessage,
  validatePassword,
} from 'utils/passwordValidation';

const getValidationResult = (
  isValid: boolean,
  statusMessage: PasswordStatusMessage
) => {
  return {
    valid: isValid,
    statusMessage,
  };
};

describe('passwordValidation', () => {
  it('is invalid on a password that is too short', () => {
    const validateResult = validatePassword('aaa');
    const expectedResult = getValidationResult(
      false,
      PasswordStatusMessage.TooShort
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is invalid on a password that is just numbers', () => {
    const validateResult = validatePassword('12356123112312');
    const expectedResult = getValidationResult(
      false,
      PasswordStatusMessage.JustNumbers
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is invalid on a password that is just letters', () => {
    let validateResult = validatePassword('abdasqiejnfoaoa');
    let expectedResult = getValidationResult(
      false,
      PasswordStatusMessage.JustLetters
    );

    expect(validateResult).toStrictEqual(expectedResult);

    validateResult = validatePassword('ABAKAOQOJAS');
    expectedResult = getValidationResult(
      false,
      PasswordStatusMessage.JustLetters
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is valid on a password that is both letters and numbers', () => {
    const validateResult = validatePassword('abdasqiejnf2231oaoa');
    const expectedResult = getValidationResult(true, PasswordStatusMessage.Ok);

    expect(validateResult).toStrictEqual(expectedResult);
  });
});
