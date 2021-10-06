import { Box, Heading, Layer, Text } from 'grommet';
import React from 'react';
import styled from 'styled-components';
import Button from 'UI/Controls/Button';

const CloseButton = styled(Button)`
  padding: 0 8px;

  :hover {
    text-decoration: none;
  }
`;

const CloseButtonText = styled(Text)`
  line-height: normal;
`;

interface IModalProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Layer>, 'title'> {
  title: React.ReactNode;
  onClose: () => void;
  visible?: boolean;
  footer?: React.ReactNode;
  contentProps?: React.ComponentPropsWithoutRef<typeof Box>;
}

const Modal = React.forwardRef<HTMLDivElement, IModalProps>(
  (
    { onClose, visible, title, footer, children, contentProps, ...props },
    ref
  ) => {
    if (!visible) return null;

    return (
      <Layer
        position='center'
        onClickOutside={onClose}
        onEsc={onClose}
        responsive={false}
        background='none'
        {...props}
        modal={true}
        ref={ref}
      >
        <Box
          width={{ width: '700px', max: '90%' }}
          margin='auto'
          background='background'
          round='small'
          {...contentProps}
        >
          <Box
            as='header'
            pad='medium'
            justify='between'
            align='center'
            direction='row'
          >
            <Heading level={1} margin='none'>
              {title}
            </Heading>
            <CloseButton onClick={onClose} aria-label='Close' link={true}>
              <CloseButtonText size='xxlarge'>&times;</CloseButtonText>
            </CloseButton>
          </Box>

          <Box pad={{ horizontal: 'medium', vertical: 'small' }}>
            {children}
          </Box>

          <Box as='footer' pad='medium' align='end'>
            {footer ? footer : <Button onClick={onClose}>Close</Button>}
          </Box>
        </Box>
      </Layer>
    );
  }
);

export default Modal;
