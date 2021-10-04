import { Box, Drop, Text, Tip } from 'grommet';
import React, { useRef } from 'react';
import styled from 'styled-components';

interface ITooltipProps {
  content: string;
  placement?: 'top' | 'bottom';
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
  children,
}) => {
  const marginPosition = placement === 'top' ? 'bottom' : 'top';
  const targetRef = useRef<HTMLElement>();

  return (
    <Tip
      plain
      dropProps={{
        target: targetRef.current,
        align: placement === 'top' ? { bottom: 'top' } : { top: 'bottom' },
      }}
      content={
        <>
          <Drop
            plain
            target={targetRef.current}
            align={placement === 'top' ? { bottom: 'top' } : { top: 'bottom' }}
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
            <Text size='xsmall' color='text-strong'>
              {content}
            </Text>
          </Box>
        </>
      }
    >
      {React.cloneElement(children as React.ReactElement, {
        ref: targetRef,
        'aria-describedby': 'tooltip',
      })}
    </Tip>
  );
};

export default Tooltip;

Tooltip.defaultProps = {
  placement: 'top',
};
