interface IValidation {
  isValid: boolean;
  validationError: string;
}

interface IValidationFunction {
  (valueOrKey: string): IValidation;
}
