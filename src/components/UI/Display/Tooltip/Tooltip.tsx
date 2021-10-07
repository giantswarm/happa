import { Box, BoxExtendedProps, Drop, DropExtendedProps, Text } from 'grommet';
import React, { useMemo } from 'react';
import styled from 'styled-components';

const Z_INDEX = 1070; /* Keeping the z-index the same as Bootstrap tooltips */

type XPosition = 'left' | 'right';
type YPosition = 'top' | 'bottom';
type Position = XPosition | YPosition;

const TooltipCaret = styled(Box)<{
  placement: Position;
  tooltipColor: string;
}>`
  ::after {
    content: '';
    position: absolute;
    left: 50%;
    width: 0px;
    border: 5px solid transparent;
    display: block;

    ${({ placement, tooltipColor, theme }) => {
      const toolTipBorder = `5px solid ${theme.global.colors[tooltipColor]}`;

      if (placement === 'bottom') {
        return `
          top: 0;
          border-top: 0;
          border-bottom: ${toolTipBorder};
          transform: translate(-50%, 100%);
        `;
      }

      if (placement === 'left') {
        return `
          top: 0;
          border-right: 0;
          border-left: ${toolTipBorder};
        `;
      }

      if (placement === 'right') {
        return `
          top: 0;
          border-left: 0;
          border-right: ${toolTipBorder};
          left: 25%;
        `;
      }

      return `
        bottom: 0;
        border-bottom: 0;
        border-top: ${toolTipBorder};
        transform: translate(-50%, -100%);
      `;
    }};
  }
`;

interface ITooltipProps extends DropExtendedProps {
  background?: BoxExtendedProps['background'];
  width?: BoxExtendedProps['width'];
  placement?: Position;
  id?: string;
}

const Tooltip: React.FC<React.PropsWithChildren<ITooltipProps>> = ({
  placement,
  id,
  width,
  background,
  children,
  ...props
}) => {
  const marginPosition = useMemo(() => {
    switch (placement) {
      case 'bottom':
        return 'top';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      case 'top':
      default:
        return 'bottom';
    }
  }, [placement]);

  const alignment = ((
    placementPosition: Position | undefined
  ): {
    top: YPosition | undefined;
    bottom: YPosition | undefined;
    left: XPosition | undefined;
    right: XPosition | undefined;
  } => {
    return {
      top: placementPosition === 'bottom' ? 'bottom' : undefined,
      bottom: placementPosition === 'top' ? 'top' : undefined,
      left: placementPosition === 'right' ? 'right' : undefined,
      right: placementPosition === 'left' ? 'left' : undefined,
    };
  })(placement);

  const TooltipMessage =
    typeof children === 'string' ? (
      <Text
        size='xsmall'
        color='text-strong'
        textAlign='center'
        wordBreak='break-word'
      >
        {children}
      </Text>
    ) : (
      children
    );

  const patchedWidth = Object.assign(
    {},
    { width: 'fit-content', max: '350px' },
    width
  );

  return (
    <>
      <Drop
        plain
        align={alignment}
        trapFocus={false}
        stretch='align'
        style={{ zIndex: Z_INDEX }}
        {...props}
      >
        <TooltipCaret
          role='presentation'
          aria-hidden='true'
          width='10px'
          height='10px'
          margin={{ [marginPosition]: 'small' }}
          placement={placement as Position}
          background='transparent'
          tooltipColor={background as string}
          animation={{ type: 'fadeIn', duration: 300, delay: 50 }}
        />
      </Drop>
      <Drop
        plain
        align={alignment}
        trapFocus={false}
        stretch={false}
        style={{ zIndex: Z_INDEX }}
        {...props}
      >
        <Box
          role='tooltip'
          id={id}
          width={patchedWidth}
          margin={{ [marginPosition]: 'small' }}
          pad={{ vertical: 'xxsmall', horizontal: 'small' }}
          round='xxsmall'
          align='center'
          justify='center'
          alignSelf='center'
          background={background}
          animation={{ type: 'fadeIn', duration: 300, delay: 50 }}
        >
          {TooltipMessage}
        </Box>
      </Drop>
    </>
  );
};

Tooltip.defaultProps = {
  placement: 'top',
  id: 'tooltip',
  background: 'tooltip-background',
};

export default Tooltip;
