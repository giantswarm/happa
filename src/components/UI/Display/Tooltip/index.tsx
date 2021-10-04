import { Box, Drop, Text } from 'grommet';
import React, { useRef, useState } from 'react';
import styled from 'styled-components';

interface ITooltipProps {
  content: string | React.ReactNode;
  placement?: 'top' | 'bottom';
  target?: React.MutableRefObject<HTMLElement | undefined>;
}

const TooltipCaret = styled(Box)<{ placement: 'top' | 'bottom' }>`
  ::after {
    content: '';
    position: absolute;
    left: 50%;
    width: 0px;
    border: 5px solid transparent;
    display: block;

    ${({ placement, theme }) => {
      const toolTipBorder = `5px solid ${theme.global.colors['tooltip-background']}`;

      if (placement === 'bottom') {
        return `
          top: 0;
          border-top: 0;
          border-bottom: ${toolTipBorder};
          transform: translate(-50%, 100%);
        `;
      }

      return `
        bottom: 0;
        border-top: ${toolTipBorder};
        border-bottom: 0;
        transform: translate(-50%, -100%);
      `;
    }};
  }
`;

const Tooltip: React.FC<React.PropsWithChildren<ITooltipProps>> = ({
  content,
  placement,
  target,
  children,
}) => {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const targetRef = useRef<HTMLElement>();

  const tooltipTarget = target ?? targetRef;

  const marginPosition = placement === 'top' ? 'bottom' : 'top';

  const handleMouseOver = (e: React.MouseEvent) => {
    e.stopPropagation();
    setTooltipVisible(true);
  };

  const TooltipContent =
    typeof content === 'string' ? (
      <Text size='xsmall' color='text-strong'>
        {content}
      </Text>
    ) : (
      content
    );

  return (
    <>
      {tooltipVisible && (
        <>
          <Drop
            plain
            target={tooltipTarget.current}
            align={placement === 'top' ? { bottom: 'top' } : { top: 'bottom' }}
            trapFocus={false}
            stretch='align'
          >
            <TooltipCaret
              role='presentation'
              aria-hidden='true'
              placement={placement ?? 'top'}
              width='xxsmall'
              margin={{ [marginPosition]: 'small' }}
              animation={{ type: 'fadeIn', duration: 300 }}
            />
          </Drop>
          <Drop
            plain
            target={tooltipTarget.current}
            align={placement === 'top' ? { bottom: 'top' } : { top: 'bottom' }}
            trapFocus={false}
          >
            <Box
              role='tooltip'
              id='tooltip'
              margin={{ [marginPosition]: 'small' }}
              pad={{ vertical: 'xxsmall', horizontal: 'small' }}
              round='xxsmall'
              align='center'
              justify='center'
              background='tooltip-background'
              animation={{ type: 'fadeIn', duration: 300 }}
            >
              {TooltipContent}
            </Box>
          </Drop>
        </>
      )}
      {React.cloneElement(children as React.ReactElement, {
        ref: tooltipTarget,
        'aria-describedby': tooltipVisible ? 'tooltip' : undefined,
        onMouseOver: handleMouseOver,
        onMouseLeave: () => setTooltipVisible(false),
        onFocus: () => setTooltipVisible(true),
        onBlur: () => setTooltipVisible(false),
      })}
    </>
  );
};

export default Tooltip;

Tooltip.defaultProps = {
  placement: 'top',
};
