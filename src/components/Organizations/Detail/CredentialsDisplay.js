import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';
import { spinner } from 'images';
import { Providers } from 'shared/constants';
import AWSAccountID from 'UI/AWSAccountID';

const CredentialsDisplay = props => {
  if (props.credentials.isFetching) {
    return (
      <span>
        <img className='loader' height='20px' src={spinner} width='20px' />{' '}
        <span>Loading credentials</span>
      </span>
    );
  }
  if (props.credentials.items.length === 0) {
    const button = (
      <Button bsStyle='default' className='small' onClick={props.onShowForm}>
        Set Credentials
      </Button>
    );

    if (props.provider === Providers.AZURE) {
      return (
        <div>
          <p>
            No specific provider credentials set. Clusters of this organization
            will be created in the default tenant cluster subscription
            configured for this installation.
          </p>
          {button}
        </div>
      );
    }

    return (
      <div>
        <p>
          No credentials set. Clusters of this organization will be created in
          the default tenant cluster account of this installation.
        </p>
        {button}
      </div>
    );
  }
  /**
   * Credentials display. This is built to support only one item, as the
   * API currently won't allow for more than that.
   */

  let providerWarning = null;
  if (typeof props.credentials.items[0][props.provider] === 'undefined') {
    providerWarning = (
      <p>
        Credentials details not matching expectations for provider{' '}
        {props.provider}
      </p>
    );
  }

  // AWS credential
  if (typeof props.credentials.items[0].aws !== 'undefined') {
    return (
      <div>
        {providerWarning}
        <table
          className='table resource-details'
          id={`credential-${props.credentials.items[0].id}`}
        >
          <tbody>
            <tr key='account_id'>
              <td>AWS account ID</td>
              <td className='value code'>
                <AWSAccountID
                  roleARN={props.credentials.items[0].aws.roles.awsoperator}
                />
              </td>
            </tr>
            <tr key='admin_role'>
              <td>Admin role ARN</td>
              <td className='value code'>
                {props.credentials.items[0].aws.roles.admin}
              </td>
            </tr>
            <tr key='awsoperator_role'>
              <td>AWS Operator role ARN</td>
              <td className='value code'>
                {props.credentials.items[0].aws.roles.awsoperator}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );

    // Azure credential
  } else if (typeof props.credentials.items[0].azure !== 'undefined') {
    return (
      <div>
        {providerWarning}
        <table className='table resource-details'>
          <tbody>
            <tr key='account_id'>
              <td>Azure subscription ID</td>
              <td className='value code'>
                {props.credentials.items[0].azure.credential.subscription_id}
              </td>
            </tr>
            <tr key='awsoperator_role'>
              <td>Azure tenant ID</td>
              <td className='value code'>
                {props.credentials.items[0].azure.credential.tenant_id}
              </td>
            </tr>
            <tr key='admin_role'>
              <td>Service principal client ID</td>
              <td className='value code'>
                {props.credentials.items[0].azure.credential.client_id}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return null;
};

CredentialsDisplay.propTypes = {
  organizationName: PropTypes.string,
  credentials: PropTypes.object,
  provider: PropTypes.string,
  onShowForm: PropTypes.func,
};

export default CredentialsDisplay;
