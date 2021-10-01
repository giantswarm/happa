import { Box, Text, Tip } from 'grommet';
import React from 'react';
import styled from 'styled-components';

interface ITooltipProps {
  content: string;
  placement?: 'top' | 'bottom';
}

const StyledBox = styled(Box)<{ placement: 'top' | 'bottom' }>`
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

  return (
    <Tip
      plain
      dropProps={{
        align: placement === 'top' ? { bottom: 'top' } : { top: 'bottom' },
      }}
      content={
        <StyledBox
          role='tooltip'
          id='tooltip'
          placement={placement ?? 'top'}
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
        </StyledBox>
      }
    >
      {children}
    </Tip>
  );
};

export default Tooltip;

Tooltip.defaultProps = {
  placement: 'top',
};
