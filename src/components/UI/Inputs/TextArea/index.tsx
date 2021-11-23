import { FormField, FormFieldProps, TextArea as Input } from 'grommet';
import * as React from 'react';

interface ITextAreaProps extends React.ComponentPropsWithoutRef<typeof Input> {
  /**
   * The description text displayed above the input.
   */
  label?: FormFieldProps['label'];
  /**
   * Props to be passed to the text input wrapper.
   */
  contentProps?: FormFieldProps['contentProps'];
  /**
   * Props to be passed to the form field.
   */
  formFieldProps?: FormFieldProps & { className?: string };
  /**
   * Whether the input is required or not.
   */
  required?: Exclude<FormFieldProps['required'], { indicator: boolean }>;
  /**
   * An error to be displayed below the input.
   */
  error?: FormFieldProps['error'];
  /**
   * A description to be displayed below the input.
   */
  info?: FormFieldProps['info'];
  /**
   * A help text to be displayed between the label
   * and the input.
   */
  help?: FormFieldProps['help'];
  /**
   * The margin between the form field and other elements.
   */
  margin?: FormFieldProps['margin'];
  /**
   * Whether the input should have some extra padding or not.
   */
  pad?: FormFieldProps['pad'];
}

const TextArea = React.forwardRef<HTMLTextAreaElement, ITextAreaProps>(
  (
    {
      id,
      label,
      contentProps,
      formFieldProps,
      disabled,
      required,
      error,
      info,
      help,
      name,
      margin,
      pad,
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
        margin={margin}
        pad={pad}
        {...formFieldProps}
      >
        <Input
          {...props}
          id={id}
          ref={ref}
          disabled={disabled}
          required={required}
          name={name}
        />
      </FormField>
    );
  }
);

TextArea.defaultProps = {
  size: 'medium',
  rows: 5,
  resize: 'vertical',
};

export default TextArea;
