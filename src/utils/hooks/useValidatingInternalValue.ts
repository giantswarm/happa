import { Reducer, useReducer } from 'react';

interface IReducerState extends IValidation {
  internalValue: string;
}

/**
 * This hook can be used for mutation and validation of
 * a string with a given validation function.
 * @example Usage in {src/components/UI/EditableValueLabel.tsx}.
 * @param initialValue
 * @param validationFunction
 */
function useValidatingInternalValue(
  initialValue: string,
  validationFunction: IValidationFunction
): [
  reducerState: IReducerState,
  setInternalValue: (newInternalValue: string) => void
] {
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

  const [{ internalValue, isValid, validationError }, setInternalValue] =
    useReducer<Reducer<IReducerState, string>>(reducer, initialReducerValue);

  return [{ internalValue, isValid, validationError }, setInternalValue];
}

export default useValidatingInternalValue;
