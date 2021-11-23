import {
  CheckBox as Input,
  CheckBoxProps,
  FormField,
  FormFieldProps,
  Keyboard,
} from 'grommet';
import React, { useRef } from 'react';
import styled from 'styled-components';
import { setMultipleRefs } from 'utils/componentUtils';

const StyledFormField = styled(FormField)`
  & input {
    margin-top: 0;
  }

  & label:not(& > label) {
    margin-bottom: 0;
  }
`;

interface ICheckBoxInputProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Input>, 'pad'> {
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
    const inputRef = useRef<HTMLInputElement | null>(null);

    const handleSelectKeyDown = (e: React.KeyboardEvent<HTMLElement>) => {
      e.preventDefault();

      if (!inputRef.current) return;
      inputRef.current.click();
    };

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
      <Keyboard onSpace={handleSelectKeyDown} onEnter={handleSelectKeyDown}>
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
          tabIndex={0}
          {...formFieldProps}
        >
          <Input
            {...props}
            id={id}
            ref={setMultipleRefs(inputRef, ref)}
            disabled={disabled}
            required={required}
            name={name}
            label={label}
            tabIndex={-1}
          />
        </StyledFormField>
      </Keyboard>
    );
  }
);

export default CheckBoxInput;
