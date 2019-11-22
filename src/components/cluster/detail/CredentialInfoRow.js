import { FlexRowWithTwoBlocksOnEdges } from 'styles';
import AWSAccountID from 'UI/aws_account_id';
import PropTypes from 'prop-types';
import React from 'react';
// import styled from '@emotion/styled';

function CredentialInfoRow({ cluster, credentials, provider }) {
  const { credential_id } = cluster;

  const credentialInfoRows = [];

  if (
    cluster &&
    credential_id &&
    credential_id != '' &&
    credentials.items.length === 1
  ) {
    // check if we have the right credential info
    if (credentials.items[0].id !== credential_id) {
      credentialInfoRows.push(
        <div key='providerCredentialsInvalid'>
          <div>Provider credentials</div>
          <div className='value'>
            Error: cluster credentials do not match organization credentials.
            Please contact support for details.
          </div>
        </div>
      );
    } else {
      if (provider === 'aws') {
        credentialInfoRows.push(
          <div key='awsAccountID'>
            <div>AWS account</div>
            <div className='value code'>
              <AWSAccountID
                roleARN={credentials.items[0].aws.roles.awsoperator}
              />
            </div>
          </div>
        );
      } else if (provider === 'azure') {
        credentialInfoRows.push(
          <div key='azureSubscriptionID'>
            <div>Azure subscription</div>
            <div className='value code'>
              {credentials.items[0].azure.credential.subscription_id}
            </div>
          </div>
        );
        credentialInfoRows.push(
          <div key='azureTenantID'>
            <div>Azure tenant</div>
            <div className='value code'>
              {credentials.items[0].azure.credential.tenant_id}
            </div>
          </div>
        );
      }
    }
  }

  if (credentialInfoRows.length !== 0) {
    return (
      <FlexRowWithTwoBlocksOnEdges>
        {credentialInfoRows}
      </FlexRowWithTwoBlocksOnEdges>
    );
  } else {
    return null;
  }
}

CredentialInfoRow.propTypes = {
  cluster: PropTypes.object,
};

export default CredentialInfoRow;
