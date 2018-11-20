'use strict';
import React from 'react';
import PropTypes from 'prop-types';

class AWSAccountID extends React.Component {
  render() {
    // get account ID from ARN like 'arn:aws:iam::<YOUR_ACCOUNT_ID>:role/GiantSwarmAdmin'
    let parts = this.props.roleARN.split(':');
    let accountID = parts[4];

    return (
      <span className="AWSAccountID">
        {accountID}{' '}
        <a
          href={'https://' + accountID + '.signin.aws.amazon.com/console'}
          target="_blank"
          rel="noopener noreferrer"
        >
          <i className="fa fa-external-link" />
        </a>
      </span>
    );
  }
}

AWSAccountID.propTypes = {
  roleARN: PropTypes.string,
};

export default AWSAccountID;
