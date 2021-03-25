import {
  /* eslint-disable @typescript-eslint/no-unused-vars */
  CheckBoxProps,
  FormFieldProps,
  RadioButtonProps,
  SelectProps,
  TextInputProps,
  /* eslint-enable @typescript-eslint/no-unused-vars */
} from 'grommet';
import React from 'react';

declare module 'grommet' {
  interface TextInputProps {
    ref?: React.Ref<HTMLInputElement>;
  }

  interface SelectProps {
    ref?: React.Ref<HTMLSelectElement>;
  }

  interface RadioButtonProps {
    ref?: React.Ref<HTMLInputElement>;
  }

  interface CheckBoxProps {
    ref?: React.Ref<HTMLInputElement>;
  }

  interface FormFieldProps {
    ref?: React.Ref<HTMLDivElement>;
  }
}
