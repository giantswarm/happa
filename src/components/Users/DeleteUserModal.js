import React from 'react';

import UsersModal from './UsersModal';

const DeleteUserModal = ({ forUser, isLoading, ...props }) => {
  const confirmButtonText = isLoading ? 'Deleting user' : 'Delete user';
  const modalTitle = `Delete ${forUser}`;

  return (
    <UsersModal
      isLoading={isLoading}
      title={modalTitle}
      confirmText={confirmButtonText}
      {...props}
    >
      <p>Are you sure you want to delete {forUser}?</p>
      <p>There is no undo.</p>
    </UsersModal>
  );
};

DeleteUserModal.defaultProps = {
  forUser: '',
};

export default DeleteUserModal;
