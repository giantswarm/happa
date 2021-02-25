// TODO(axbarsan): Replace with `FileInput` once it's released.
import { FormField, FormFieldProps, TextInput as Input } from 'grommet';
import PropTypes from 'prop-types';
import React, { useEffect, useRef } from 'react';

interface IFileInputProps
  extends Omit<React.ComponentPropsWithRef<typeof Input>, 'type' | 'value'> {
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
  value?: FileList | null;
}

const FileInput = React.forwardRef<HTMLInputElement, IFileInputProps>(
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
      children,
      value,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
      if (inputRef.current) {
        inputRef.current.files = value!;
      }
    }, [value]);

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
          type='file'
          id={id}
          disabled={disabled}
          required={required}
          name={name}
          {...props}
          ref={(element) => {
            inputRef.current = element;

            // TODO(axbarsan): Extract into utility.
            if (typeof ref === 'function') {
              ref(element);
            } else if (ref) {
              ref.current = element;
            }
          }}
        />
        {children}
      </FormField>
    );
  }
);

FileInput.propTypes = {
  id: PropTypes.string,
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  contentProps: PropTypes.object,
  formFieldProps: PropTypes.object,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  info: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  help: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  name: PropTypes.string,
  margin: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pad: PropTypes.bool,
  children: PropTypes.node,
  value: PropTypes.object as PropTypes.Requireable<FileList>,
};

FileInput.defaultProps = {
  size: 'medium',
  value: null,
};

export default FileInput;
