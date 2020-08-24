const maxLength = 63;
const validateStartEnd = /^[a-z0-9](.*[a-z0-9])?$/;
const validateCharacters = /^[-.a-z0-9]*$/;

interface IAppValidationResult {
  valid: boolean;
  message: string;
}

export function validateAppName(version: string): IAppValidationResult {
  switch (true) {
    case version.length < 1:
      return {
        valid: false,
        message: 'must not be empty',
      };

    case version.length > maxLength:
      return {
        valid: false,
        message: 'must not be longer than 63 characters',
      };

    case !validateStartEnd.test(version):
      return {
        valid: false,
        message: 'must start and end with lower case alphanumeric characters',
      };

    case !validateCharacters.test(version):
      return {
        valid: false,
        message: `must consist of lower case alphanumeric characters, '-' or '.'`,
      };

    default:
      return {
        valid: true,
        message: '',
      };
  }
}
