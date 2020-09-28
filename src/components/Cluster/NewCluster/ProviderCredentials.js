import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Providers } from 'shared/constants';
import { organizationCredentialsLoad } from 'stores/organization/actions';
import AWSAccountID from 'UI/AWSAccountID';
import ClusterCreationLabelSpan from 'UI/ClusterCreation/ClusterCreationLabelSpan';
import Section from 'UI/ClusterCreation/Section';

class ProviderCredentials extends React.Component {
  componentDidMount() {
    this.props.dispatch(
      organizationCredentialsLoad(this.props.organizationName)
    );
  }

  render() {
    let showInfo = false;
    let details = (
      <span>
        Provider credentials for {this.props.organizationName}{' '}
        {this.props.provider}
      </span>
    );

    if (
      !this.props.credentials.isFetching &&
      this.props.credentials.items.length > 0
    ) {
      if (this.props.provider === Providers.AWS) {
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
      } else if (this.props.provider === Providers.AZURE) {
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
        <Section style={{ marginTop: '25px' }}>
          <ClusterCreationLabelSpan>
            Provider Credentials
          </ClusterCreationLabelSpan>
          {details}
        </Section>
      );
    }

    return <div />;
  }
}

ProviderCredentials.propTypes = {
  dispatch: PropTypes.func,
  provider: PropTypes.string,
  organizationName: PropTypes.string,
  credentials: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    credentials: state.entities.organizations.credentials,
  };
}

export default connect(mapStateToProps)(ProviderCredentials);
