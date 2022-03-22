import {
  DateInput as Input,
  FormField,
  FormFieldProps,
  MaskedInputType,
  ThemeContext,
  ThemeType,
} from 'grommet';
import * as React from 'react';
import { css, DefaultTheme } from 'styled-components';

interface IMaskedInputProps {
  theme: DefaultTheme;
  focus?: boolean;
}

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
        padding: 16px;
      `,
    },
  },
  dateInput: {
    icon: {
      size: 'small',
    },
  },
  maskedInput: {
    // @ts-expect-error
    extend: css`
      background: ${({ theme }) => theme.global.colors['input-background']};
      border-bottom-left-radius: ${(props: IMaskedInputProps) =>
        props.focus && 0};
      border-bottom-right-radius: ${(props: IMaskedInputProps) =>
        props.focus && 0};
    `,
  },
};

interface IBaseProps
  extends Omit<
    React.ComponentPropsWithoutRef<typeof Input>,
    'inputProps' | 'size' | 'onBlur'
  > {
  value: string | string[];
}

interface IDateInputProps
  extends IBaseProps,
    Omit<MaskedInputType, keyof IBaseProps> {
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
   * How big should the input and its contents be.
   */
  size?: MaskedInputType['size'];
}

const DateInput = React.forwardRef<HTMLInputElement, IDateInputProps>(
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
      onChange,
      buttonProps,
      calendarProps,
      defaultValue,
      dropProps,
      format,
      inline,
      ...props
    },
    ref
  ) => {
    return (
      <ThemeContext.Extend value={customTheme}>
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
            ref={ref}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            buttonProps={buttonProps}
            calendarProps={{
              animate: true,
              firstDayOfWeek: 1,
              daysOfWeek: true,
              ...calendarProps,
            }}
            defaultValue={defaultValue}
            format={format}
            inline={inline}
            inputProps={{
              ...props,
              disabled: disabled,
              required: required,
            }}
            dropProps={{
              align: { top: 'bottom' },
              ...dropProps,
            }}
          />
        </FormField>
      </ThemeContext.Extend>
    );
  }
);

DateInput.defaultProps = {
  size: 'medium',
};

export default DateInput;
