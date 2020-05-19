import { Reducer, useReducer } from 'react';
import { IValidation, IValidationFunction } from 'utils/labelUtils';

interface IReducerState extends IValidation {
  internalValue: string;
}

interface ISetInternalValue {
  (newInternalValue: string): void;
}

interface IUseValidatingInternalValue {
  (initialValue: string, validationFunction: IValidationFunction): [
    IReducerState,
    ISetInternalValue
  ];
}

// this hook can be used for mutation and validation of a string with a given
// validation function. Example usage in src/components/UI/EditableValueLabel.tsx

const useValidatingInternalValue: IUseValidatingInternalValue = (
  initialValue,
  validationFunction
) => {
  const initialReducerValue = {
    internalValue: initialValue,
    ...validationFunction(initialValue),
  };

  const reducer: Reducer<IReducerState, string> = (_, newInternalValue) => {
    return {
      internalValue: newInternalValue,
      ...validationFunction(newInternalValue),
    };
  };

  const [
    { internalValue, isValid, validationError },
    setInternalValue,
  ] = useReducer<Reducer<IReducerState, string>>(reducer, initialReducerValue);

  return [{ internalValue, isValid, validationError }, setInternalValue];
};

export default useValidatingInternalValue;
