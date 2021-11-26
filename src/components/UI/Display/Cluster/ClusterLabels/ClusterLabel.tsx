import { Anchor, Box, Keyboard, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import { Tooltip, TooltipContainer } from 'UI/Display/Tooltip';

const StyledAnchor = styled(Anchor)`
  :focus {
    outline: 0;
  }

  :focus:not(:focus-visible) {
    box-shadow: none;
  }

  i:focus {
    outline: 0;
  }
`;

const StyledBox = styled(Box)`
  :hover {
    border-color: ${({ theme }) => theme.colors.darkBlueDarker3};

    .cluster-label__label {
      background-color: ${({ theme }) => theme.colors.darkBlueDarker3};
      color: ${({ theme }) => theme.colors.white4};
    }

    .cluster-label__key,
    .cluster-label__delete {
      background-color: ${({ theme }) => theme.colors.white4};
      color: ${({ theme }) => theme.colors.darkBlueLighter3};
    }
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

const StyledTooltip = styled(Tooltip)`
  z-index: 1069 !important;
`;

interface IClusterLabelProps {
  label: React.ReactNode | string;
  value: React.ReactNode | string;
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
      height='32px'
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
          content={<StyledTooltip>Click to edit label</StyledTooltip>}
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
              background='text-weak'
            >
              {typeof value === 'string' ? <Text>{value}</Text> : value}
            </StyledValueBox>
          </Box>
        </TooltipContainer>
      </Keyboard>
      {onRemove && (
        <Box
          className='cluster-label__delete'
          height='100%'
          justify='center'
          background='text-weak'
          pad={{ horizontal: 'small', top: 'xsmall' }}
          round={{ size: 'large', corner: 'right' }}
        >
          {removeButton ? (
            // eslint-disable-next-line react/jsx-no-useless-fragment
            <>{removeButton}</>
          ) : (
            <StyledAnchor
              size='large'
              color='background-light'
              onClick={onRemove}
              tabIndex={0}
            >
              <i className='fa fa-close' role='presentation' title='Delete' />
            </StyledAnchor>
          )}
        </Box>
      )}
    </StyledBox>
  );
};

ClusterLabel.defaultProps = {
  onClick: () => {},
  onRemove: () => {},
};

export default ClusterLabel;
