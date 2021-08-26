import URIBlock from 'Cluster/ClusterDetail/URIBlock';
import React from 'react';
import styled from 'styled-components';

import { getInitialState } from '.';

const StyledURIBlock = styled(URIBlock)`
  code {
    background-color: ${({ theme }) => theme.colors.darkBlueDarker2};
    margin-right: 0;
  }
`;

const InviteUserSuccess = ({ inviteForm, invitationResult }) => {
  /* prettier-ignore */
  let sendEmailContent = 'You\'ve chosen not to send them an email. Send them the link below to accept the invitation';

  if (inviteForm.sendEmail) {
    sendEmailContent = `An email has been sent to ${inviteForm.email} with further instructions.`;
  }

  return (
    <>
      <p>Invitation has been created successfully!</p>
      <p>{sendEmailContent}</p>
      <label>Invitation Accept Link:</label>
      <StyledURIBlock>{invitationResult.invitation_accept_link}</StyledURIBlock>
    </>
  );
};

InviteUserSuccess.defaultProps = {
  inviteForm: getInitialState([]),
  invitationResult: {},
};

export default InviteUserSuccess;
