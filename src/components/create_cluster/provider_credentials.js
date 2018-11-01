'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { organizationCredentialsLoad } from '../../actions/organizationActions';

class ProviderCredentials extends React.Component {
  componentDidMount() {
    this.props.dispatch(organizationCredentialsLoad(this.props.organizationName));
  }

  awsAccountIDFromARN(arn) {
    // get account ID from ARN like 'arn:aws:iam::<YOUR_ACCOUNT_ID>:role/GiantSwarmAdmin'
    var parts = arn.split(':');
    return parts[4];
  }

  render() {
    console.log('props', this.props);

    var showInfo = false;
    var details = <span>Provider credentials for {this.props.organizationName} {this.props.provider}</span>;

    if (!this.props.credentials.isFetching && this.props.credentials.items.length > 0) {
      if (this.props.provider === 'aws') {
        showInfo = true;
        details = <p>This cluster will be created in AWS account <code>{this.awsAccountIDFromARN(this.props.credentials.items[0].aws.roles.awsoperator)}</code>, as set for this organization.</p>;
      } else if (this.props.provider === 'azure') {
        showInfo = true;
        details = <p>This cluster will be created in Azure subscription <code>{this.props.credentials.items[0].azure.credential.subscription_id}</code> and tenant <code>{this.props.credentials.items[0].azure.credential.tenant_id}</code>, as set for this organization.</p>;
      }
    }

    if (showInfo) {
      return (
        <div className='row section'>
          <div className='col-3'>
            <h3 className='table-label'>Provider Credentials</h3>
          </div>
          <div className='col-9'>
            {details}
          </div>
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
