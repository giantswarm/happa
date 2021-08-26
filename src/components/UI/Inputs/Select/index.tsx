import {
  FormField,
  FormFieldProps,
  Select as Input,
  ThemeContext,
  ThemeType,
} from 'grommet';
import * as React from 'react';
import { css } from 'styled-components';

import SearchInput from './SearchInput';

const customTheme: ThemeType = {
  global: {
    drop: {
      background: 'none',
      shadowSize: 'none',
      border: {
        radius: '0',
      },
      zIndex: '9999',
    },
  },
  select: {
    background: 'none',
    icons: {
      color: { dark: 'text', light: 'text' },
    },
    // @ts-expect-error
    searchInput: SearchInput,
    container: {
      // @ts-expect-error
      extend: css`
        background: ${({ theme }) => theme.global.colors['input-background']};
        border-bottom-left-radius: 4px;
        border-bottom-right-radius: 4px;
        border: 1px solid ${({ theme }) => theme.global.colors.border.dark};
      `,
    },
    control: {
      // @ts-expect-error
      extend: css`
        background: ${({ theme }) => theme.global.colors['input-background']};
        border-radius: 4px;
      `,
      open: css`
        border-bottom-left-radius: 0;
        border-bottom-right-radius: 0;
      `,
    },
    step: 5,
  },
  textInput: {
    // @ts-expect-error
    extend: css`
      font-size: ${({ theme }) => theme.global.font.size};
      line-height: ${({ theme }) => theme.global.font.height};
    `,
  },
};

interface ISelectProps extends React.ComponentPropsWithoutRef<typeof Input> {
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
  label?: FormFieldProps['label'];
}

const Select = React.forwardRef<HTMLButtonElement, ISelectProps>(
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
      <ThemeContext.Extend value={customTheme}>
        <FormField
          htmlFor={id}
          contentProps={contentProps}
          disabled={disabled === true}
          required={required}
          name={name}
          error={error}
          info={info}
          help={help}
          margin={margin}
          pad={pad}
          label={label}
          {...formFieldProps}
        >
          <Input
            dropAlign={{ top: 'bottom' }}
            {...props}
            id={id}
            ref={ref}
            disabled={disabled}
            name={name}
          />
        </FormField>
      </ThemeContext.Extend>
    );
  }
);

Select.defaultProps = {
  dropHeight: 'small',
  replace: true,
};

export default Select;
