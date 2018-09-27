'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { relativeDate } from '../../lib/helpers.js';
import moment from 'moment';

const NEVER_EXPIRES = '0001-01-01T00:00:00Z';

class UserRow extends React.Component {
  render() {
    var expiryClass = '';
    var expirySeconds = moment(this.props.user.expiry).utc().diff(moment().utc()) / 1000;

    if (expirySeconds < (60 * 60 * 24)) {
      expiryClass = 'expiring';
    }

    return (
      <tr>
        <td onClick={this.props.onClick}>{this.props.user.email}</td>
        <td>{ this.props.user.email.split('@')[1] }</td>
        <td className={expiryClass}>
          { this.props.user.expiry == NEVER_EXPIRES ?
            ''
            :
            <div>
              { relativeDate(this.props.user.expiry) }
              &nbsp;
              <i className='fa fa-times clickable'
                   title='Remove expiration'
                   onClick={this.props.removeExpiration} />
            </div>
          }
        </td>
        <td>
          <small>
          {
            expirySeconds < 0 ? 'EXPIRED' : 'ACTIVE'
          }
          </small>
        </td>
        <td>
          <i className='fa fa-trash clickable'
               title='Delete User'
               onClick={this.props.deleteUser} />
        </td>
      </tr>
    );
  }
}

UserRow.propTypes = {
  onClick: PropTypes.func,
  removeExpiration: PropTypes.func,
  deleteUser: PropTypes.func,
  user: PropTypes.object
};

export default UserRow;
