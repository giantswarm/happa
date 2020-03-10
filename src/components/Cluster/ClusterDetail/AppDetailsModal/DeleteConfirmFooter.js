import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';

const DeleteConfirmFooter = props => {
  return (
    <>
      <Button bsStyle='danger' onClick={props.onConfirm}>
        <i className='fa fa-delete' />
        {props.cta}
      </Button>
      <Button bsStyle='link' onClick={props.onCancel}>
        Cancel
      </Button>
    </>
  );
};

DeleteConfirmFooter.propTypes = {
  cta: PropTypes.string,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
};

export default DeleteConfirmFooter;
