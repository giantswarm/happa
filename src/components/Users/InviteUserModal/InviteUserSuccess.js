import URIBlock from 'Cluster/ClusterDetail/URIBlock';
import PropTypes from 'prop-types';
import React from 'react';

import { getInitialState } from '.';

const InviteUserSuccess = ({ inviteForm, invitationResult }) => {
  /* prettier-ignore */
  let sendEmailContent = 'You\'ve chosen not to send them an email. Send them the link below to accept the invitation';

  if (inviteForm.sendEmail) {
    sendEmailContent = `An email has been sent to ${inviteForm.email} with further instructions.`;
  }

  return (
    <>
      <p>Invitation has been created succesfully!</p>
      <p>{sendEmailContent}</p>
      <label>Invitation Accept Link:</label>
      <URIBlock>{invitationResult.invitation_accept_link}</URIBlock>
    </>
  );
};

InviteUserSuccess.defaultProps = {
  inviteForm: getInitialState([]),
  invitationResult: {},
};

InviteUserSuccess.propTypes = {
  inviteForm: PropTypes.shape({
    email: PropTypes.string,
    organizations: PropTypes.arrayOf(PropTypes.string),
    sendEmail: PropTypes.bool,
    isValid: PropTypes.bool,
    error: PropTypes.string,
  }),
  invitationResult: PropTypes.object,
};

export default InviteUserSuccess;
