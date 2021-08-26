import {
  FormField,
  FormFieldProps,
  TextInput as Input,
  ThemeContext,
  ThemeType,
} from 'grommet';
import * as React from 'react';
import { css, useTheme } from 'styled-components';

const customTheme: ThemeType = {
  global: {
    drop: {
      background: 'input-background',
      shadowSize: 'none',
      border: {
        radius: '0px 0px 4px 4px',
      },
      zIndex: '9999',
      // @ts-expect-error
      extend: css`
        border: 1px solid ${({ theme }) => theme.global.colors.border.dark};
        font-size: ${({ theme }) => theme.text.small.size};
        font-weight: 400;
      `,
    },
  },
};

interface ITextInputProps extends React.ComponentPropsWithoutRef<typeof Input> {
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
}

const TextInput = React.forwardRef<HTMLInputElement, ITextInputProps>(
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
      ...props
    },
    ref
  ) => {
    const theme = useTheme();
    const patchedContentProps = Object.assign({}, contentProps);
    if (!disabled) {
      patchedContentProps.background = theme.formField.background.color;
    }

    return (
      <ThemeContext.Extend value={customTheme}>
        <FormField
          htmlFor={id}
          label={label}
          contentProps={patchedContentProps}
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
          {children}
        </FormField>
      </ThemeContext.Extend>
    );
  }
);

TextInput.defaultProps = {
  size: 'medium',
  dropHeight: 'small',
};

export default TextInput;
