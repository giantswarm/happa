import { Box, Drop, Text } from 'grommet';
import React, { useMemo } from 'react';
import styled from 'styled-components';

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

const StyledDrop = styled(Drop)`
  z-index: 1070; /* Keeping the z-index the same as Bootstrap tooltips */
`;

interface ITooltipProps {
  target?: React.RefObject<HTMLElement>;
  maxWidth?: string;
  background?: string;
  placement?: Position;
  id?: string;
}

const Tooltip: React.FC<React.PropsWithChildren<ITooltipProps>> = ({
  placement,
  target,
  id,
  maxWidth,
  background,
  children,
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

  const Tooltipmessage =
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

  return (
    <>
      <StyledDrop
        plain
        target={target?.current ?? undefined}
        align={alignment}
        trapFocus={false}
        stretch='align'
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
      </StyledDrop>
      <StyledDrop
        plain
        target={target?.current ?? undefined}
        align={alignment}
        trapFocus={false}
        stretch={false}
      >
        <Box
          role='tooltip'
          id={id}
          width={{ width: 'fit-message', max: maxWidth }}
          margin={{ [marginPosition]: 'small' }}
          pad={{ vertical: 'xxsmall', horizontal: 'small' }}
          round='xxsmall'
          align='center'
          justify='center'
          alignSelf='center'
          background={background}
          animation={{ type: 'fadeIn', duration: 300, delay: 50 }}
        >
          {Tooltipmessage}
        </Box>
      </StyledDrop>
    </>
  );
};

Tooltip.defaultProps = {
  placement: 'top',
  id: 'tooltip',
  maxWidth: '350px',
  background: 'tooltip-background',
};

export default Tooltip;
