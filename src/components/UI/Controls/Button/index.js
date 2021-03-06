import PropTypes from 'prop-types';
import React from 'react';
import BsButton from 'react-bootstrap/lib/Button';
import styled from 'styled-components';
import LoadingIndicator from 'UI/Display/Loading/LoadingIndicator';

// Button
//
// <Button
//   type='button|submit|reset'
//   bsSize='sm'|undefined
//   bsStyle='primary|danger|default|link'
//   loading=true|false
//   loadingPosition='left'|undefined
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

const Wrapper = styled.div`
  .btn {
    border: 0px;
    border-radius: 3px;
    color: #fff;
    padding: 6px 12px;
    font-weight: 400;
    outline: none;
    cursor: pointer;
    transition: background-color 0.1s cubic-bezier(0, -0.41, 0.19, 1.44);
  }
  .btn.small {
    font-size: 14px;
    padding: 8px 18px;
  }

  .btn-secondary {
    background-color: #52728a;
    border: 1px #52728a solid;
  }

  .btn-primary {
    background-color: #2d9a2c;
    border: 1px #2d9a2c solid;
  }

  .btn-link {
    color: #ccc;
  }

  .btn-link:hover {
    color: #fff;
  }

  .btn:hover,
  .btn:active,
  .btn:active:focus,
  .btn:focus {
    background-color: #5c7f9a;
    color: #fff;
  }

  .btn-primary.disabled.focus,
  .btn-primary.disabled:focus,
  .btn-primary.disabled:hover,
  .btn-primary[disabled].focus,
  .btn-primary[disabled]:focus,
  .btn-primary[disabled]:hover,
  fieldset[disabled] .btn-primary.focus,
  fieldset[disabled] .btn-primary:focus,
  fieldset[disabled] .btn-primary:hover {
    background-color: #404040;
  }

  .btn-primary:hover,
  .btn-primary:active:focus,
  .btn-primary:focus,
  .btn-primary:active:hover {
    background-color: #278626;
    border-color: #278626;
  }

  .btn-danger {
    background-color: #d9534f;
    border: 1px #d9534f solid;
  }

  .btn-danger:hover,
  .btn-danger:active:hover {
    background-color: #d43f3a;
    border: 1px #d43f3a solid;
  }

  .btn:disabled,
  .btn:disabled:hover,
  .btn:disabled:active:hover {
    background-color: #aaa;
    border-color: #aaa;
  }

  .btn-default {
    background-color: transparent;
    color: #ccc;
    border: 1px solid #d7d7d7;
  }

  .btn-default:focus,
  .btn-default:active,
  .btn-default:hover,
  .btn-default:active:focus,
  .btn-default:hover:focus,
  .btn-default:hover:active {
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid #fff;
  }

  .btn {
    i.fa {
      padding-right: 0.3em;
    }
  }

  .btn.btn-sm {
    height: 24px;
    padding: 0px 8px !important;
    margin-left: 5px;
  }
`;

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
    <Wrapper className='button-wrapper'>
      {loadingPosition === 'left' ? (
        <LoadingIndicator
          loading={loading}
          loadingPosition={loadingPosition}
          timeout={loadingTimeout}
        />
      ) : undefined}

      <BsButton
        bsSize={bsSize}
        bsStyle={bsStyle || 'default'}
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
    </Wrapper>
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
