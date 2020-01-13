import { validatePassword } from 'lib/passwordValidation';

const statusMessages = {
  TooShort: 'password_too_short',
  JustNumbers: 'password_not_just_numbers',
  JustLetters: 'password_not_just_letters',
  Ok: 'password_ok',
};

const getValidationResult = (isValid, statusMessage) => {
  return {
    valid: isValid,
    statusMessage,
  };
};

describe('passwordValidation', () => {
  it('is invalid on a password that is too short', () => {
    const validateResult = validatePassword('aaa');
    const expectedResult = getValidationResult(false, statusMessages.TooShort);

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is invalid on a password that is just numbers', () => {
    const validateResult = validatePassword('12356123112312');
    const expectedResult = getValidationResult(
      false,
      statusMessages.JustNumbers
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is invalid on a password that is just letters', () => {
    let validateResult = validatePassword('abdasqiejnfoaoa');
    let expectedResult = getValidationResult(false, statusMessages.JustLetters);

    expect(validateResult).toStrictEqual(expectedResult);

    validateResult = validatePassword('ABAKAOQOJAS');
    expectedResult = getValidationResult(false, statusMessages.JustLetters);

    expect(validateResult).toStrictEqual(expectedResult);
  });

  it('is valid on a password that is both letters and numbers', () => {
    const validateResult = validatePassword('abdasqiejnf2231oaoa');
    const expectedResult = getValidationResult(
      true,
      statusMessages.Ok
    );

    expect(validateResult).toStrictEqual(expectedResult);
  });
});
