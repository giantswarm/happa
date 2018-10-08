'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { organizationCredentialsLoad } from '../../actions/organizationActions';

class Credentials extends React.Component {
  componentDidMount() {
    this.props.dispatch(organizationCredentialsLoad(this.props.organizationName));
  }

  render() {
    var provider = this.props.app.info.general.provider;

    if (this.props.credentials.isFetching) {
      return (
        <span>
          <img className='loader' src='/images/loader_oval_light.svg' width='20px' height='20px' />
          <span>Loading credentials</span>
        </span>
      );
    } else {
      if (this.props.credentials.items.length === 0) {
        // TODO: show button for setting credentials
        if (provider === 'azure') {
          return <p>No credentials set. Clusters of this organization will be created in the default tenant cluster subscription configured for this installation.</p>;
        }
        return <p>No credentials set. Clusters of this organization will be created in the default tenant cluster account of this installation.</p>;

      } else {
        /**
         * Credentials display. This is built to support only one item, as the
         * API currently won't allow for more than that.
         */

        if (typeof this.props.credentials.items[0][provider] === 'undefined') {
          return <p>Credentials details not matching expectations for provider {provider}</p>;
        }

        if (provider === 'aws') {
          // get account ID from ARN like 'arn:aws:iam::<YOUR_ACCOUNT_ID>:role/GiantSwarmAdmin'
          var parts = this.props.credentials.items[0].aws.roles.awsoperator.split(':');
          var accountID = parts[4];
          return (
            <table className='table resource-details'>
              <tbody>
                <tr key='account_id'>
                  <td>AWS account ID</td>
                  <td className='value'>{ accountID }</td>
                </tr>
                <tr key='awsoperator_role'>
                  <td>AWSOperator role ARN</td>
                  <td className='value code'>{ this.props.credentials.items[0].aws.roles.awsoperator }</td>
                </tr>
                <tr key='admin_role'>
                  <td>Admin role ARN</td>
                  <td className='value code'>{ this.props.credentials.items[0].aws.roles.admin }</td>
                </tr>
              </tbody>
            </table>
          );
        } else if (provider === 'azure') {
          return (
            <table className='table resource-details'>
              <tbody>
                <tr key='account_id'>
                  <td>Azure subscription ID</td>
                  <td className='value'>{ this.props.credentials.items[0].azure.credential.subscription_id }</td>
                </tr>
                <tr key='awsoperator_role'>
                  <td>Azure tenant ID</td>
                  <td className='value code'>{ this.props.credentials.items[0].azure.credential.tenant_id }</td>
                </tr>
                <tr key='admin_role'>
                  <td>Service principal client ID</td>
                  <td className='value code'>{ this.props.credentials.items[0].azure.credential.client_id }</td>
                </tr>
              </tbody>
            </table>
          );
        }
      }
    }
  }
}

Credentials.propTypes = {
  dispatch: PropTypes.func,
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

module.exports = connect(mapStateToProps)(Credentials);
