import useCopyToClipboard from 'lib/effects/useCopyToClipboard';
import PropTypes from 'prop-types';
import React, { useEffect } from 'react';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Tooltip from 'react-bootstrap/lib/Tooltip';

import { getInitialState } from '.';

const InviteUserSuccess = ({ inviteForm, invitationResult }) => {
  const [hasContentInClipboard, setClipboardContent] = useCopyToClipboard();

  /* prettier-ignore */
  let sendEmailContent = 'You\'ve chosen not to send them an email. Send them the link below to accept the invitation';

  if (inviteForm.sendEmail) {
    sendEmailContent = `An email has been sent to ${inviteForm.email} with further instructions.`;
  }

  // eslint-disable-next-line react/no-multi-comp
  const getOverlayTooltip = () => (
    <Tooltip id='tooltip'>Copy to clipboard.</Tooltip>
  );

  useEffect(() => {
    const resetClipboardTimeout = 1000;

    setTimeout(() => {
      setClipboardContent(null);
    }, resetClipboardTimeout);
  }, [hasContentInClipboard, setClipboardContent]);

  return (
    <>
      <p>Invitation has been created succesfully!</p>
      <p>{sendEmailContent}</p>
      <label>Invitation Accept Link:</label>
      <br />
      <code>{invitationResult.invitation_accept_link}</code>
      &nbsp;
      {hasContentInClipboard ? (
        <i aria-hidden='true' className='fa fa-done' />
      ) : (
        <OverlayTrigger overlay={getOverlayTooltip()} placement='top'>
          <i
            aria-hidden='true'
            className='copy-link fa fa-content-copy'
            onClick={() =>
              setClipboardContent(invitationResult.invitation_accept_link)
            }
          />
        </OverlayTrigger>
      )}
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
