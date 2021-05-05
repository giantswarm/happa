import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Controls/Button';

interface IDeleteConfirmFooterProps {
  cta?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

const DeleteConfirmFooter: React.FC<IDeleteConfirmFooterProps> = ({
  cta,
  onConfirm,
  onCancel,
}) => {
  return (
    <>
      <Button bsStyle='danger' onClick={onConfirm}>
        <i
          className='fa fa-delete'
          role='presentation'
          aria-hidden='true'
          aria-label={cta}
        />
        {cta}
      </Button>
      <Button bsStyle='link' onClick={onCancel}>
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
