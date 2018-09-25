'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { relativeDate } from '../../lib/helpers.js';
import moment from 'moment';

const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

class InvitationRow extends React.Component {
  render() {
    var expiryClass = '';
    var expirySeconds = moment(this.props.invitation.expiry).utc().diff(moment().utc()) / 1000;

    if (expirySeconds < (60 * 60 * 24)) {
      expiryClass = 'expiring';
    }

    return (
      <tr>
        <td>
          {this.props.invitation.email}<br/>
        </td>
        <td>{ this.props.invitation.email.split('@')[1] }</td>
        <td className={expiryClass}>
          { this.props.invitation.expiry == NEVER_EXPIRES ?
            ''
            :
            <div>
              Invitation expires { relativeDate(this.props.invitation.expiry) }
            </div>
          }
        </td>
        <td>
          <small>PENDING</small>
          <small>Invited by {this.props.invitation.invited_by}</small>
        </td>
        <td>

        </td>
      </tr>
    );
  }
}

InvitationRow.propTypes = {
  invitation: PropTypes.object
};

export default InvitationRow;
