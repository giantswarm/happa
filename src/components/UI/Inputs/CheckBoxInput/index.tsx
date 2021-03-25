import {
  CheckBox as Input,
  CheckBoxProps,
  FormField,
  FormFieldProps,
} from 'grommet';
import PropTypes from 'prop-types';
import * as React from 'react';
import styled from 'styled-components';

const StyledFormField = styled(FormField)`
  & input {
    margin-top: 0;
  }

  & label:not(& > label) {
    margin-bottom: 0;
  }
`;

interface ICheckBoxInputProps
  extends React.ComponentPropsWithoutRef<typeof Input> {
  /**
   * The description text displayed on the side of the check box.
   */
  label?: CheckBoxProps['label'];
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
  /**
   * The description text displayed above the input.
   */
  fieldLabel?: FormFieldProps['label'];
}

const CheckBoxInput = React.forwardRef<HTMLInputElement, ICheckBoxInputProps>(
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
      fieldLabel,
      ...props
    },
    ref
  ) => {
    const patchedContentProps = Object.assign(
      {},
      {
        border: false,
        pad: {
          horizontal: 'none',
          vertical: 'xsmall',
        },
        background: 'none',
      },
      contentProps
    );

    return (
      <StyledFormField
        htmlFor={id}
        contentProps={patchedContentProps}
        disabled={disabled}
        required={required}
        name={name}
        error={error}
        info={info}
        help={help}
        margin={margin}
        pad={pad}
        label={fieldLabel}
        {...formFieldProps}
      >
        <Input
          {...props}
          id={id}
          ref={ref}
          disabled={disabled}
          required={required}
          name={name}
          label={label}
        />
      </StyledFormField>
    );
  }
);

CheckBoxInput.propTypes = {
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
  fieldLabel: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};

export default CheckBoxInput;
