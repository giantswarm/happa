import { Box } from 'grommet';
import React from 'react';
import Button from 'UI/Controls/Button';
import Modal from 'UI/Layout/Modal';

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
    <Modal
      className='create-key-pair-modal'
      onClose={onClose}
      visible={show}
      title={title}
      footer={
        <Box gap='small' direction='row' justify='end'>
          {!confirmHidden && (
            <Button
              danger={true}
              loading={isLoading}
              onClick={onConfirm}
              type='submit'
              disabled={confirmDisabled}
            >
              {confirmText}
            </Button>
          )}

          {!isLoading && (
            <Button link={true} onClick={onClose}>
              {cancelText}
            </Button>
          )}
        </Box>
      }
      {...props}
    >
      {children}
    </Modal>
  );
};

UsersModal.defaultProps = {
  show: false,
  title: '',
  // eslint-disable-next-line no-empty-function
  onClose: () => {},
  // eslint-disable-next-line no-empty-function
  onConfirm: () => {},
  isLoading: false,
  confirmText: 'Confirm',
  confirmDisabled: false,
  confirmHidden: false,
  cancelText: 'Cancel',
};

export default UsersModal;
