import { Anchor, Box, Keyboard, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const StyledAnchor = styled(Anchor)`
  color: ${({ theme }) => theme.colors.darkBlueLighter4};

  :focus {
    outline: 0;
  }

  :focus:not(:focus-visible) {
    box-shadow: none;
  }

  i:focus {
    outline: 0;
  }

  :hover {
    color: ${({ theme }) => theme.colors.darkBlueDarker2};
  }
`;

const StyledLabelBox = styled(Box)`
  > * {
    color: ${({ theme }) => theme.colors.white5};
  }
`;

const StyledValueBox = styled(Box)`
  > * {
    color: ${({ theme }) => theme.colors.darkBlueDarker2};
  }
`;

const StyledDeleteBox = styled(Box)``;

const StyledBox = styled(Box)`
  :hover {
    border-color: ${({ theme }) => theme.colors.darkBlueDarker3};

    ${StyledLabelBox} {
      background-color: ${({ theme }) => theme.colors.darkBlueDarker3};
      color: ${({ theme }) => theme.colors.white4};
    }

    ${StyledValueBox},
    ${StyledDeleteBox} {
      background-color: ${({ theme }) => theme.colors.white4};
      color: ${({ theme }) => theme.colors.darkBlueLighter3};
    }
  }
`;

const StyledTooltip = styled(Tooltip)`
  z-index: 1069 !important;
`;

interface IClusterLabelProps {
  label: React.ReactNode;
  value: React.ReactNode;
  removeButton?: React.ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
}

const ClusterLabel: React.FC<IClusterLabelProps> = ({
  label,
  value,
  removeButton,
  onRemove,
  onClick,
  ...props
}) => {
  return (
    <StyledBox
      height='30px'
      width='fit-content'
      direction='row'
      align='stretch'
      border={{ color: 'label-background', size: 'xsmall' }}
      round='large'
      onClick={onClick}
      focusIndicator={false}
      tabIndex={0}
      aria-label={`Label ${label} with value ${value}`}
      role='button'
      {...props}
    >
      <Keyboard onSpace={onClick} onEnter={onClick}>
        <TooltipContainer
          content={
            <StyledTooltip margin={{ left: '19px', bottom: '1px' }}>
              Click to edit label
            </StyledTooltip>
          }
        >
          <Box direction='row'>
            <StyledLabelBox
              className='cluster-label__label'
              justify='start'
              pad={{ right: '15px', left: 'medium', vertical: 'xxsmall' }}
              round={{ size: 'large', corner: 'left' }}
              background='label-background'
            >
              {typeof label === 'string' ? <Text>{label}</Text> : label}
            </StyledLabelBox>
            <StyledValueBox
              className='cluster-label__key'
              justify='start'
              pad={{ left: '15px', vertical: 'xxsmall' }}
              background='label-background-bright'
            >
              {typeof value === 'string' ? <Text>{value}</Text> : value}
            </StyledValueBox>
          </Box>
        </TooltipContainer>
      </Keyboard>
      {onRemove && (
        <StyledDeleteBox
          height='100%'
          justify='center'
          background='label-background-bright'
          pad={{ horizontal: 'small', top: 'xsmall' }}
          round={{ size: 'large', corner: 'right' }}
        >
          {removeButton ? (
            removeButton
          ) : (
            <StyledAnchor
              size='large'
              margin={{ bottom: 'xsmall' }}
              color='background-light'
              onClick={onRemove}
              tabIndex={0}
            >
              <i className='fa fa-close' role='presentation' title='Delete' />
            </StyledAnchor>
          )}
        </StyledDeleteBox>
      )}
    </StyledBox>
  );
};

ClusterLabel.defaultProps = {
  onClick: () => {},
  onRemove: () => {},
};

export default ClusterLabel;
