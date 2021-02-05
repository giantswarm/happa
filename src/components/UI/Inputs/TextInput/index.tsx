import { FormField, FormFieldProps, TextInput as Input } from 'grommet';
import * as React from 'react';

interface ITextInputProps extends React.ComponentPropsWithoutRef<typeof Input> {
  label?: FormFieldProps['label'];
  contentProps?: FormFieldProps['contentProps'];
  required?: FormFieldProps['required'];
  error?: FormFieldProps['error'];
  info?: FormFieldProps['info'];
  help?: FormFieldProps['help'];
}

const TextInput = React.forwardRef<HTMLInputElement, ITextInputProps>(
  (
    {
      id,
      label,
      contentProps,
      disabled,
      required,
      error,
      info,
      help,
      name,
      ...props
    },
    ref
  ) => {
    return (
      <FormField
        htmlFor={id}
        label={label}
        contentProps={contentProps}
        disabled={disabled}
        required={required}
        name={name}
        error={error}
        info={info}
        help={help}
      >
        <Input
          {...props}
          id={id}
          ref={ref as React.Ref<HTMLInputElement> & string}
          disabled={disabled}
          required={required}
          name={name}
        />
      </FormField>
    );
  }
);

TextInput.propTypes = {};

export default TextInput;
