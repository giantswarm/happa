import React from 'react';

import UsersModal from './UsersModal';

const UnexpireUserModal = ({ forUser, isLoading, ...props }) => {
  const confirmButtonText = isLoading
    ? 'Removing expiration'
    : 'Remove expiration';
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

export default UnexpireUserModal;
