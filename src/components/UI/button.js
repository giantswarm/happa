import BsButton from 'react-bootstrap/Button';
import LoadingIndicator from './loading_indicator';
import PropTypes from 'prop-types';
import React from 'react';

// Button
//
// <Button
//   type='button|submit|reset'
//   variant='primary|success|danger|info|warning|link'
//   loading=true|false
//   disabled=true|false
//   onClick=function>
//
//   Button Text
// </Button>
//
// A basic button. Can go into a 'loading' state, which will disable the button
// and show a spinner next to it.
//
// You can also disable the button by setting the disabled prop to true.
//

const Button = props => {
  const { loadingPosition, loading } = props;

  return (
    <div className='progress_button--container'>
      {loadingPosition === 'left' ? (
        <LoadingIndicator loading={loading} loadingPosition={loadingPosition} />
      ) : (
        undefined
      )}

      <BsButton
        size={props.size}
        variant={props.variant}
        disabled={props.disabled || props.loading}
        onClick={props.onClick}
        type={props.type}
      >
        {props.children}
      </BsButton>

      {loadingPosition === 'right' ? (
        <LoadingIndicator loading={loading} loadingPosition={loadingPosition} />
      ) : (
        undefined
      )}
    </div>
  );
};

Button.propTypes = {
  type: PropTypes.string,
  variant: PropTypes.string,
  size: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
  children: PropTypes.node,
};

Button.defaultProps = {
  loadingPosition: 'right',
};

export default Button;
