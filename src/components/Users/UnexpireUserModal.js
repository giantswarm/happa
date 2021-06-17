import PropTypes from 'prop-types';
import React from 'react';

import UsersModal from './UsersModal';

const UnexpireUserModal = ({ forUser, isLoading, ...props }) => {
  const confirmButtonText = isLoading
    ? 'Removing Expiration'
    : 'Remove Expiration';
  const modalTitle = `Remove Expiration Date from ${forUser}`;

  return (
    <UsersModal
      isLoading={isLoading}
      title={modalTitle}
      confirmText={confirmButtonText}
      {...props}
    >
      <p>Are you sure you want to remove the expiration date from {forUser}?</p>
      <p>This account will never expire.</p>
      <p>If the account was expired, the user will be able to log in again.</p>
    </UsersModal>
  );
};

UnexpireUserModal.defaultProps = {
  forUser: '',
};

UnexpireUserModal.propTypes = {
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
  forUser: PropTypes.string,
};

export default UnexpireUserModal;
