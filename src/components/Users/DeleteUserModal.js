import PropTypes from 'prop-types';
import React from 'react';

import UsersModal, { UsersModalPropTypes } from './UsersModal';

const DeleteUserModal = ({ forUser, isLoading, ...props }) => {
  const confirmButtonText = isLoading ? 'Deleting User' : 'Delete User';
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

DeleteUserModal.propTypes = {
  ...UsersModalPropTypes,
  forUser: PropTypes.string,
};

export default DeleteUserModal;
