import React, { useMemo } from 'react';
import FlashMessage from 'UI/Display/FlashMessage';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import MultiSelect from 'UI/Inputs/MultiSelect';
import TextInput from 'UI/Inputs/TextInput';

import { getInitialState } from '.';

const InviteUserForm = ({
  inviteForm,
  organizations,
  handleEmailChange,
  handleOrganizationChange,
  handleSendEmailChange,
  ...props
}) => {
  const memoizedOptions = useMemo(() => {
    return Object.values(organizations.items).map(
      (organization) => organization.id
    );
  }, [organizations.items]);

  const onRemoveOrganization = (orgID) => {
    const selectedOptions = inviteForm.organizations.filter(
      (selectedOrgID) => selectedOrgID !== orgID
    );
    handleOrganizationChange(selectedOptions);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} {...props}>
      <p>
        Creating an invitation is the way to get new people onto this
        installation.
      </p>
      <p>Invitations are valid for 48 hours.</p>

      <TextInput
        label='Email'
        id='email'
        type='email'
        autoFocus={true}
        onChange={handleEmailChange}
        value={inviteForm.email}
      />

      <MultiSelect
        id='organizations'
        label='Organizations'
        selected={inviteForm.organizations}
        options={memoizedOptions}
        placeholder='Please select an organization'
        onRemoveValue={onRemoveOrganization}
        onChange={(e) => {
          handleOrganizationChange(e.value);
        }}
        maxVisibleValues={3}
      />

      <CheckBoxInput
        id='sendEmail'
        checked={inviteForm.sendEmail}
        onChange={handleSendEmailChange}
        label='Send the invitee an e-mail with the accept invitation link'
        fieldLabel='Send email'
      />

      <FlashMessage type='danger'>{inviteForm.error}</FlashMessage>
    </form>
  );
};

InviteUserForm.defaultProps = {
  inviteForm: getInitialState([]),
  organizations: [],
  // eslint-disable-next-line no-empty-function
  handleEmailChange: () => {},
  // eslint-disable-next-line no-empty-function
  handleOrganizationChange: () => {},
  // eslint-disable-next-line no-empty-function
  handleSendEmailChange: () => {},
};

export default InviteUserForm;
