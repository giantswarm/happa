import { Box, Button as Control, ThemeContext, ThemeType } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';

const StyledBox = styled(Box)`
  display: inline-block;
`;

const StyledLoadingIndicator = styled(LoadingIndicator)`
  img {
    width: 22px;
    height: 22px;
    position: relative;
    margin: 0;
    vertical-align: middle;
    margin-left: 10px;
  }
`;

const StyledControl = styled(Control)<{ unauthorized?: boolean }>`
  :hover {
    cursor: ${({ unauthorized }) => (unauthorized ? 'not-allowed' : 'pointer')};
  }
`;

enum ButtonStyle {
  Primary,
  Secondary,
  Danger,
  Link,
  Warning,
}

function makeCustomTheme(style: ButtonStyle): ThemeType {
  const theme: ThemeType = {
    button: {
      hover: {},
      active: {},
    },
  };

  switch (style) {
    case ButtonStyle.Danger:
      theme.button!.secondary = {
        background: 'status-danger',
        border: {
          width: '0',
        },
        color: 'text',
      };

      theme.button!.hover!.secondary = {
        background: {
          color: '#c44e4b',
          opacity: 1,
        },
        border: {
          width: '0',
        },
      };

      theme.button!.active!.secondary = {
        background: {
          color: 'status-danger',
        },
        border: {
          width: '0',
        },
      };

      break;

    case ButtonStyle.Warning:
      theme.button!.secondary = {
        background: '#d4982f',
        border: {
          width: '0',
        },
        color: 'text',
      };

      theme.button!.hover!.secondary = {
        background: {
          color: '#ffaa15',
          opacity: 1,
        },
        border: {
          width: '0',
        },
      };

      theme.button!.active!.secondary = {
        background: {
          color: '#d4982f',
        },
        border: {
          width: '0',
        },
      };

      break;
  }

  return theme;
}

interface IButtonProps extends React.ComponentPropsWithoutRef<typeof Control> {
  loading?: boolean;
  loadingTimeout?: number;
  disabled?: boolean;
  unauthorized?: boolean;
  href?: string;
  target?: '_self' | '_blank' | '_parent' | '_top' | string;
  rel?: string;
  warning?: boolean;
  danger?: boolean;
  link?: boolean;
  wrapperProps?: React.ComponentPropsWithoutRef<typeof StyledBox>;
  ref?: React.Ref<HTMLButtonElement | HTMLAnchorElement>;
}

const Button = React.forwardRef<
  HTMLButtonElement | HTMLAnchorElement,
  IButtonProps
>(
  (
    {
      loading,
      disabled,
      unauthorized,
      primary,
      secondary,
      warning,
      danger,
      link,
      children,
      loadingTimeout,
      wrapperProps,
      ...props
    },
    ref
  ) => {
    let buttonStyle = ButtonStyle.Link;
    switch (true) {
      case primary:
        buttonStyle = ButtonStyle.Primary;
        break;
      case link:
        buttonStyle = ButtonStyle.Link;
        break;
      case warning:
        buttonStyle = ButtonStyle.Warning;
        break;
      case danger:
        buttonStyle = ButtonStyle.Danger;
        break;
      case secondary:
        buttonStyle = ButtonStyle.Secondary;
        break;
    }

    return (
      <ThemeContext.Extend value={makeCustomTheme(buttonStyle)}>
        <StyledBox
          width={{
            min: 'auto',
          }}
          {...wrapperProps}
        >
          <StyledControl
            primary={buttonStyle === ButtonStyle.Primary}
            secondary={
              buttonStyle !== ButtonStyle.Primary &&
              buttonStyle !== ButtonStyle.Link
            }
            label={children}
            disabled={disabled || loading || unauthorized}
            unauthorized={unauthorized}
            {...props}
            ref={ref as never}
          />
          <StyledLoadingIndicator
            loading={loading}
            loadingPosition='right'
            timeout={loadingTimeout}
          />
        </StyledBox>
      </ThemeContext.Extend>
    );
  }
);

Button.defaultProps = {
  secondary: true,
  gap: 'xsmall',
};

export default Button;
