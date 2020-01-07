import React, { useMemo } from 'react';
import MultiSelect from '@khanacademy/react-multi-select';
import PropTypes from 'prop-types';
import { getInitialState } from '.';
import { sortBy } from 'underscore';

const InviteUserForm = ({
  inviteForm,
  organizations,
  handleEmailChange,
  handleOrganizationChange,
  handleSendEmailChange,
  ...props
}) => {
  const memoizedOptions = useMemo(() => {
    return sortBy(organizations.items, 'id').map(organization => ({
      label: organization.id,
      value: organization.id,
    }));
  }, [organizations.items]);

  return (
    <form onSubmit={e => e.preventDefault()} {...props}>
      <p>
        Creating an invitation is the way to get new people onto this
        installation.
      </p>
      <p>Invitations are valid for 48 hours.</p>

      <div className='textfield'>
        <label>Email:</label>
        <input
          autoFocus
          onChange={handleEmailChange}
          type='text'
          value={inviteForm.email}
        />
      </div>

      <div className='textfield'>
        <label>Organizations:</label>
        <MultiSelect
          options={memoizedOptions}
          selected={inviteForm.organizations}
          onSelectedChanged={handleOrganizationChange}
        />
      </div>

      <div className='textfield'>
        <label>Send Email:</label>
        <div className='checkbox'>
          <label htmlFor='sendEmail'>
            <input
              checked={inviteForm.sendEmail}
              id='sendEmail'
              onChange={handleSendEmailChange}
              type='checkbox'
            />
            Send the invitee an e-mail with the accept invitation link.
          </label>
        </div>
      </div>

      {inviteForm.error && (
        <div className='flash-messages--flash-message flash-messages--danger'>
          {inviteForm.error}
        </div>
      )}
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
