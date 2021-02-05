import { FormField, FormFieldProps, TextInput as Input } from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';

interface ITextInputProps extends React.ComponentPropsWithoutRef<typeof Input> {
  /**
   * The description text displayed above the input.
   */
  label?: FormFieldProps['label'];
  /**
   * Props to be passed to the form field wrapper.
   */
  contentProps?: FormFieldProps['contentProps'];
  /**
   * Whether the input is required or not.
   */
  required?: FormFieldProps['required'];
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

TextInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  contentProps: PropTypes.object,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  info: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  help: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  name: PropTypes.string,
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pad: PropTypes.bool,
};

export default TextInput;
