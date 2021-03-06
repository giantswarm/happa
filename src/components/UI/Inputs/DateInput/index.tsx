import {
  DateInput as Input,
  FormField,
  FormFieldProps,
  MaskedInputType,
  ThemeContext,
  ThemeType,
} from 'grommet';
import PropTypes from 'prop-types';
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
  extends Omit<React.ComponentPropsWithoutRef<typeof Input>, 'inputProps'> {}

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

const DateInput = React.forwardRef<HTMLElement, IDateInputProps>(
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
            // @ts-expect-error
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
              ...props,
            }}
          />
        </FormField>
      </ThemeContext.Extend>
    );
  }
);

DateInput.propTypes = {
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
  onChange: PropTypes.func,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string.isRequired),
  ]),
  buttonProps: PropTypes.object,
  calendarProps: PropTypes.object,
  defaultValue: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string.isRequired),
  ]),
  dropProps: PropTypes.object,
  format: PropTypes.string,
  inline: PropTypes.bool,
};

DateInput.defaultProps = {
  size: 'medium',
};

export default DateInput;
