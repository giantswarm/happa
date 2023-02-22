import {
  FormField,
  FormFieldProps,
  TextArea as Input,
  ThemeContext,
  ThemeType,
} from 'grommet';
import * as React from 'react';
import styled, { css, useTheme } from 'styled-components';

const MAX_ROWS = 10;

const withAutoResizeHeight = css`
  white-space: nowrap;
`;

const customTheme: ThemeType = {
  textArea: {
    extend: css`
      border: none;
      :focus {
        box-shadow: none;
      }
    `,
  },
};

const StyledInput = styled(Input)<{
  autoResizeHeight?: boolean;
}>`
  scrollbar-width: none;
  ::-webkit-scrollbar {
    display: none;
  }

  ${({ autoResizeHeight }) => (autoResizeHeight ? withAutoResizeHeight : '')}
`;

function getNumberOfRows(value: string | undefined): number {
  return value ? (value.match(/\r\n|\r|\n/g) || []).length + 1 : 1;
}

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
  /**
   * Whether the input should auto-resize in height
   */
  autoResizeHeight?: boolean;
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
      value,
      rows,
      autoResizeHeight,
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
          <StyledInput
            {...props}
            id={id}
            ref={ref}
            disabled={disabled}
            required={required}
            name={name}
            focusIndicator={false}
            autoResizeHeight={autoResizeHeight}
            value={value}
            rows={Math.min(
              autoResizeHeight ? getNumberOfRows(value) : rows!,
              MAX_ROWS
            )}
          />
        </FormField>
      </ThemeContext.Extend>
    );
  }
);

TextArea.defaultProps = {
  size: 'medium',
  rows: 5,
  resize: 'vertical',
  autoResizeHeight: false,
};

export default TextArea;
