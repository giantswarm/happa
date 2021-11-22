import React, { useEffect, useState } from 'react';
import usePrevious from 'utils/hooks/usePrevious';

import UsersModal from '../UsersModal';
import InviteUserForm from './InviteUserForm';
import InviteUserSuccess from './InviteUserSuccess';

export function getInitialState(initiallySelectedOrganizations) {
  return {
    email: '',
    organizations: initiallySelectedOrganizations,
    sendEmail: true,
    isValid: false,
    error: '',
  };
}

function validateForm(inviteForm) {
  const newInviteForm = Object.assign({}, inviteForm, {
    isValid: true,
    error: '',
  });

  /**
   * Don't allow adding non @giantswarm.io emails to the giantswarm org
   * since we know there is a serverside validation against that as well.
   */
  if (
    newInviteForm.organizations.includes('giantswarm') &&
    !isGiantSwarmEmail(newInviteForm.email)
  ) {
    newInviteForm.isValid = false;
    newInviteForm.error =
      'Only @giantswarm.io domains may be invited to the giantswarm organization.';
  }

  return newInviteForm;
}

function isGiantSwarmEmail(email) {
  if (email && typeof email === 'string') {
    const domain = email.split('@')[1];

    return domain === 'giantswarm.io';
  }

  return false;
}

const InviteUserModal = ({
  initiallySelectedOrganizations,
  isLoading,
  show,
  onConfirm,
  organizations,
  invitationResult,
  ...props
}) => {
  const [inviteForm, setInviteForm] = useState(
    getInitialState(initiallySelectedOrganizations)
  );
  const prevShow = usePrevious(show);

  const isInvited = Object.keys(invitationResult).length > 0;
  const confirmButtonText = isLoading ? 'Inviting user' : 'Invite user';
  const cancelText = isInvited ? 'Close' : 'Cancel';

  let modalTitle = 'Invite a New User';

  if (isInvited) {
    modalTitle = `${inviteForm.email} has been Invited`;
  }

  const handleOrganizationChange = (orgIDs) => {
    let invitationForm = Object.assign({}, inviteForm);

    invitationForm.organizations = orgIDs;
    invitationForm = validateForm(invitationForm);

    setInviteForm(invitationForm);
  };

  const handleEmailChange = (e) => {
    let invitationForm = Object.assign({}, inviteForm);

    invitationForm.email = e.target.value;
    invitationForm = validateForm(invitationForm);

    setInviteForm(invitationForm);
  };

  const handleSendEmailChange = (e) => {
    const invitationForm = Object.assign({}, inviteForm, {
      sendEmail: e.target.checked,
    });

    setInviteForm(invitationForm);
  };

  const confirmInviteForm = () => onConfirm(inviteForm);

  useEffect(() => {
    if (show !== prevShow && show === true) {
      setInviteForm(getInitialState(initiallySelectedOrganizations));
    }
  }, [show, initiallySelectedOrganizations, prevShow]);

  return (
    <UsersModal
      show={show}
      isLoading={isLoading}
      title={modalTitle}
      confirmText={confirmButtonText}
      onConfirm={confirmInviteForm}
      confirmDisabled={!inviteForm.isValid}
      confirmHidden={isInvited}
      cancelText={cancelText}
      {...props}
    >
      {isInvited ? (
        <InviteUserSuccess
          inviteForm={inviteForm}
          invitationResult={invitationResult}
        />
      ) : (
        <InviteUserForm
          inviteForm={inviteForm}
          organizations={organizations}
          handleEmailChange={handleEmailChange}
          handleOrganizationChange={handleOrganizationChange}
          handleSendEmailChange={handleSendEmailChange}
        />
      )}
    </UsersModal>
  );
};

InviteUserModal.defaultProps = {
  initiallySelectedOrganizations: [],
  organizations: [],
  invitationResult: {},
};

export default InviteUserModal;
