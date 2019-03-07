'use strict';

import { connect } from 'react-redux';
import { organizationCredentialsLoad } from '../../../actions/organizationActions';
import AWSAccountID from '../../shared/aws_account_id';
import PropTypes from 'prop-types';
import React from 'react';

class ProviderCredentials extends React.Component {
  componentDidMount() {
    this.props.dispatch(
      organizationCredentialsLoad(this.props.organizationName)
    );
  }

  render() {
    var showInfo = false;
    var details = (
      <span>
        Provider credentials for {this.props.organizationName}{' '}
        {this.props.provider}
      </span>
    );

    if (
      !this.props.credentials.isFetching &&
      this.props.credentials.items.length > 0
    ) {
      if (this.props.provider === 'aws') {
        showInfo = true;
        details = (
          <p>
            This cluster will be created in AWS account{' '}
            <AWSAccountID
              roleARN={this.props.credentials.items[0].aws.roles.awsoperator}
            />
            , as set for this organization.
          </p>
        );
      } else if (this.props.provider === 'azure') {
        showInfo = true;
        details = (
          <p>
            This cluster will be created in Azure subscription{' '}
            <code>
              {this.props.credentials.items[0].azure.credential.subscription_id}
            </code>{' '}
            and tenant{' '}
            <code>
              {this.props.credentials.items[0].azure.credential.tenant_id}
            </code>
            , as set for this organization.
          </p>
        );
      }
    }

    if (showInfo) {
      return (
        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Provider Credentials</h3>
          </div>
          <div className='col-9'>{details}</div>
        </div>
      );
    } else {
      return <div />;
    }
  }
}

ProviderCredentials.propTypes = {
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  organizationName: PropTypes.string,
  actions: PropTypes.object,
  credentials: PropTypes.object,
  app: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    credentials: state.entities.credentials,
    app: state.app,
  };
}

export default connect(mapStateToProps)(ProviderCredentials);
