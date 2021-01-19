import PropTypes from 'prop-types';
import React from 'react';
import BsButton from 'react-bootstrap/lib/Button';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';

// Button
//
// <Button
//   type='button|submit|reset'
//   bsStyle='primary|success|danger|info|warning|link'
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

const Button = (props) => {
  const {
    loadingPosition,
    loading,
    disabled,
    bsStyle,
    bsSize,
    onClick,
    type,
    children,
    loadingTimeout,
    ...rest
  } = props;

  return (
    <div className='progress_button--container'>
      {loadingPosition === 'left' ? (
        <LoadingIndicator
          loading={loading}
          loadingPosition={loadingPosition}
          timeout={loadingTimeout}
        />
      ) : undefined}

      <BsButton
        bsSize={bsSize}
        bsStyle={bsStyle}
        disabled={disabled || loading}
        onClick={onClick}
        type={type}
        role='button'
        {...rest}
      >
        {children}
      </BsButton>

      {loadingPosition === 'right' ? (
        <LoadingIndicator
          loading={loading}
          loadingPosition={loadingPosition}
          timeout={loadingTimeout}
        />
      ) : undefined}
    </div>
  );
};

Button.propTypes = {
  type: PropTypes.string,
  bsStyle: PropTypes.string,
  bsSize: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  loadingPosition: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  loadingTimeout: PropTypes.number,
};

Button.defaultProps = {
  loadingPosition: 'right',
};

export default Button;
