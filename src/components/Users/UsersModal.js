import BootstrapModal from 'react-bootstrap/lib/Modal';
import Button from 'UI/Button';
import PropTypes from 'prop-types';
import React from 'react';

const UsersModal = ({
  show,
  onClose,
  onConfirm,
  isLoading,
  children,
  title,
  confirmText,
  confirmDisabled,
  confirmHidden,
  cancelText,
  ...props
}) => {
  return (
    <BootstrapModal
      className='create-key-pair-modal'
      onHide={onClose}
      show={show}
      {...props}
    >
      <BootstrapModal.Header closeButton>
        <BootstrapModal.Title>{title}</BootstrapModal.Title>
      </BootstrapModal.Header>

      <BootstrapModal.Body>{children}</BootstrapModal.Body>
      <BootstrapModal.Footer>
        {!confirmHidden && (
          <Button
            bsStyle='danger'
            loading={isLoading}
            onClick={onConfirm}
            type='submit'
            disabled={confirmDisabled}
          >
            {confirmText}
          </Button>
        )}

        {!isLoading && (
          <Button bsStyle='link' onClick={onClose}>
            {cancelText}
          </Button>
        )}
      </BootstrapModal.Footer>
    </BootstrapModal>
  );
};

UsersModal.defaultProps = {
  show: false,
  title: '',
  onClose: () => {},
  onConfirm: () => {},
  isLoading: false,
  confirmText: 'Confirm',
  confirmDisabled: false,
  confirmHidden: false,
  cancelText: 'Cancel',
};

export const UsersModalPropTypes = {
  show: PropTypes.bool,
  title: PropTypes.string,
  onClose: PropTypes.func,
  onConfirm: PropTypes.func,
  isLoading: PropTypes.bool,
  children: PropTypes.node,
  confirmText: PropTypes.string,
  confirmDisabled: PropTypes.bool,
  confirmHidden: PropTypes.bool,
  cancelText: PropTypes.string,
};

UsersModal.propTypes = UsersModalPropTypes;

export default UsersModal;
