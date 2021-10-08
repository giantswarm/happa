import { Box, Paragraph, Text } from 'grommet';
import { messageType } from 'lib/flashMessage';
import React from 'react';
import { PropertiesOf } from 'shared/types';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

function mapMessageTypeToBackgroundColor(
  type: PropertiesOf<typeof messageType>
) {
  switch (type) {
    case messageType.SUCCESS:
      return '#dff0d8';
    case messageType.ERROR:
      return '#f2dede';
    case messageType.WARNING:
      return '#fcf8e3';
    case messageType.INFO:
      return '#d9edf7';
    default:
      return 'status-unknown';
  }
}

const Content = styled(Box)`
  code {
    background-color: ${({ theme }) => theme.global.colors['text-strong'].dark};
    color: ${({ theme }) => theme.global.colors['text-xxweak'].dark};
  }
`;

const CloseButton = styled(Button)`
  padding: 0 8px;
  color: ${({ theme }) => theme.global.colors['text-xxweak'].dark};
  opacity: 0.4;
  transition: 0.1s ease-out;

  :hover {
    text-decoration: none;
    color: ${({ theme }) => theme.global.colors['text-xxweak'].dark};
    opacity: 0.7;
  }
`;

const CloseButtonText = styled(Text)`
  line-height: normal;
`;

interface IFlashMessagesNotificationProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Box>, 'title'> {
  title: React.ReactNode;
  type: PropertiesOf<typeof messageType>;
  onClose?: () => void;
}

const FlashMessagesNotification: React.FC<IFlashMessagesNotificationProps> = ({
  title,
  type,
  children,
  onClose,
  ...props
}) => {
  const background = mapMessageTypeToBackgroundColor(type);

  return (
    <Box
      background={background}
      round='xsmall'
      role={onClose && 'button'}
      onClick={onClose}
      direction='row'
      width='medium'
      justify='between'
      align='start'
      flex={true}
      {...props}
    >
      <Content pad='medium' width={{ max: '90%' }}>
        <Text color='text-xxweak'>{title}</Text>
        {children && (
          <Box>
            <Paragraph margin='none' color='text-xxweak'>
              {children}
            </Paragraph>
          </Box>
        )}
      </Content>

      {onClose && (
        <Box pad='xxsmall'>
          <CloseButton onClick={onClose} aria-label='Close' link={true}>
            <CloseButtonText size='xlarge' weight='bold'>
              &times;
            </CloseButtonText>
          </CloseButton>
        </Box>
      )}
    </Box>
  );
};

export default FlashMessagesNotification;
