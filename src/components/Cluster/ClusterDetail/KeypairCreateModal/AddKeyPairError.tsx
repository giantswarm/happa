import FlashMessage from 'FlashMessages/FlashMessage';
import PropTypes from 'prop-types';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';

interface IAddKeyPairErrorProps extends React.ComponentProps<'div'> {
  children?: string;
}

const AddKeyPairError: React.FC<IAddKeyPairErrorProps> = ({
  children,
  ...rest
}) => {
  return (
    <SlideTransition direction='down' in={children !== ''}>
      <FlashMessage dismissible={false} class='danger' {...(rest as never)}>
        <i className='fa fa-warning' /> {children}
      </FlashMessage>
    </SlideTransition>
  );
};

AddKeyPairError.propTypes = {
  children: PropTypes.string,
};

AddKeyPairError.defaultProps = {
  children: '',
};

export default AddKeyPairError;
