import { Box, ButtonProps, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';

interface IAddClusterLabelButtonProps extends Omit<ButtonProps, 'color'> {
  onClick?: () => void;
}

const StyledBox = styled(Box)`
  :hover {
    background-color: ${({ theme }) => theme.colors.darkBlueDarker3};
    > * {
      color: ${({ theme }) => theme.colors.white4};
    }
  }
`;

const AddClusterLabelButton: React.FC<IAddClusterLabelButtonProps> = ({
  onClick,
  ...props
}) => {
  return (
    <StyledBox
      height='30px'
      direction='row'
      align='center'
      justify='between'
      pad={{ right: '15px', left: 'xsmall', vertical: 'xxsmall' }}
      round='large'
      background='label-background'
      focusIndicator={false}
      role='button'
      aria-label='Add label'
      onClick={onClick}
      {...props}
    >
      <Text
        margin={{ right: 'xxsmall' }}
        size='21px'
        color='label-background-bright'
      >
        <i
          className='fa fa-add-circle'
          role='presentation'
          aria-hidden='true'
        />
      </Text>
      <Text size='14px' alignSelf='center' color='label-background-bright'>
        Add
      </Text>
    </StyledBox>
  );
};

AddClusterLabelButton.defaultProps = {
  onClick: () => {},
};

export default AddClusterLabelButton;
