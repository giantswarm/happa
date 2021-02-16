import MultiSelect from '@khanacademy/react-multi-select';
import PropTypes from 'prop-types';
import React, { useMemo } from 'react';
import FlashMessage from 'UI/Display/FlashMessage';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import TextInput from 'UI/Inputs/TextInput';
import { sortBy } from 'underscore';

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
    return sortBy(organizations.items, 'id').map((organization) => ({
      label: organization.id,
      value: organization.id,
    }));
  }, [organizations.items]);

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

      <div className='textfield'>
        <label htmlFor='organizations'>Organizations:</label>
        <MultiSelect
          id='organizations'
          options={memoizedOptions}
          selected={inviteForm.organizations}
          onSelectedChanged={handleOrganizationChange}
        />
      </div>

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

InviteUserForm.propTypes = {
  inviteForm: PropTypes.shape({
    email: PropTypes.string,
    organizations: PropTypes.arrayOf(PropTypes.string),
    sendEmail: PropTypes.bool,
    isValid: PropTypes.bool,
    error: PropTypes.string,
  }),
  organizations: PropTypes.object,
  handleEmailChange: PropTypes.func,
  handleOrganizationChange: PropTypes.func,
  handleSendEmailChange: PropTypes.func,
};

export default InviteUserForm;
