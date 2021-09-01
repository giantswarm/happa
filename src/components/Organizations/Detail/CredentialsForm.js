import {
  cloudProviderAccountSetupAwsURL,
  cloudProviderAccountSetupAzureURL,
} from 'lib/docs';
import React from 'react';
import { Providers } from 'shared/constants';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';

/**
 * CredentialsForm is a sub-component of Credentials.
 *
 * As the name indicates, it provides a form to enter credential details.
 * CredentialsForm does not dispatch any redux actions and it does not
 * interact with the application state -- this is done by the parent Credentials.
 */
class CredentialsForm extends React.Component {
  state = {
    isValid: false,
    azureSubscriptionID: '',
    azureTenantID: '',
    azureClientID: '',
    azureClientSecret: '',
    azureClientSecretAgain: '',
    awsAdminRoleARN: '',
    awsOperatorRoleARN: '',
  };

  constructor(props) {
    super(props);

    // pre-fill form from props in case data is available
    if (typeof props.formData === 'object') {
      // eslint-disable-next-line react/state-in-constructor
      this.state = props.formData;
    }
  }

  /**
   * validate checks whether the form is submittable with the current
   * input field values. If yes, this.state.isValid is set to true.
   */
  validate = () => {
    if (this.props.provider === Providers.AZURE) {
      if (
        this.state.azureSubscriptionID &&
        this.state.azureTenantID &&
        this.state.azureClientID &&
        this.state.azureClientSecret &&
        this.state.azureSubscriptionID !== '' &&
        this.state.azureTenantID !== '' &&
        this.state.azureClientID !== '' &&
        this.state.azureClientSecret !== '' &&
        this.state.azureClientSecret === this.state.azureClientSecretAgain
      ) {
        this.setState({ isValid: true });
      } else {
        this.setState({ isValid: false });
      }
    } else {
      if (
        this.state.awsAdminRoleARN &&
        this.state.awsOperatorRoleARN &&
        this.state.awsAdminRoleARN !== '' &&
        this.state.awsOperatorRoleARN !== ''
      ) {
        this.setState({ isValid: true });
      } else {
        this.setState({ isValid: false });
      }
    }
  };

  /**
   * handleChange copies the current input field value into this.state[fieldname].
   */
  handleChange = (e) => {
    const fieldName = e.target.name;
    const fleldVal = e.target.value;
    this.setState({ [fieldName]: fleldVal }, () => {
      // setState is asynchronous. this is a callback called after setState has been executed.
      this.validate();
    });
  };

  /**
   * Passes the current form data on to the parent component
   */
  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state);
  };

  render() {
    if (this.props.provider === Providers.AZURE) {
      return (
        <form>
          <p>
            Here you can set credentials for the organization{' '}
            <code>{this.props.organizationName}</code> , to be used by all new
            clusters created for this organization. Find more information on how
            to prepare an Azure subscription for running workload cluster in our{' '}
            <a
              href={cloudProviderAccountSetupAzureURL}
              rel='noopener noreferrer'
              target='_blank'
            >
              documentation
            </a>
            .
          </p>
          <p>
            <i className='fa fa-info' /> It is currently not possible to modify
            or delete these credentials once set.
          </p>

          <TextInput
            label='Azure Subscription ID'
            id='azureSubscriptionID'
            name='azureSubscriptionID'
            onChange={this.handleChange}
            value={this.state.azureSubscriptionID}
          />

          <TextInput
            label='Azure Tenant ID'
            id='azureTenantID'
            name='azureTenantID'
            onChange={this.handleChange}
            value={this.state.azureTenantID}
          />
          <TextInput
            label='Azure Client ID'
            id='azureClientID'
            name='azureClientID'
            onChange={this.handleChange}
            value={this.state.azureClientID}
          />
          <TextInput
            label='Azure Client Secret'
            id='azureClientSecret'
            name='azureClientSecret'
            onChange={this.handleChange}
            type='password'
            value={this.state.azureClientSecret}
          />
          <TextInput
            label='Azure Client Secret (again)'
            id='azureClientSecretAgain'
            name='azureClientSecretAgain'
            onChange={this.handleChange}
            type='password'
            value={this.state.azureClientSecretAgain}
            margin={{ bottom: 'medium' }}
          />
          <Button
            primary={true}
            disabled={!this.state.isValid}
            onClick={this.handleSubmit}
          >
            Set credentials
          </Button>
        </form>
      );
    } else if (this.props.provider === Providers.AWS) {
      return (
        <form>
          <p>
            Here you can set credentials for the organization{' '}
            <code>{this.props.organizationName}</code> , to be used by all new
            clusters created for this organization. Find more information on how
            to prepare an AWS account for running workload cluster in our{' '}
            <a
              href={cloudProviderAccountSetupAwsURL}
              rel='noopener noreferrer'
              target='_blank'
            >
              documentation
            </a>
            .
          </p>

          <p>
            <i className='fa fa-info' /> It is currently not possible to modify
            or delete these credentials once set.
          </p>
          <TextInput
            label='AWS admin role ARN (GiantSwarmAdmin)'
            name='awsAdminRoleARN'
            id='awsAdminRoleARN'
            onChange={this.handleChange}
            value={this.state.awsAdminRoleARN ? this.state.awsAdminRoleARN : ''}
          />
          <TextInput
            label='AWS operator role ARN (GiantSwarmAWSOperator)'
            name='awsOperatorRoleARN'
            id='awsOperatorRoleARN'
            onChange={this.handleChange}
            value={
              this.state.awsOperatorRoleARN ? this.state.awsOperatorRoleARN : ''
            }
            margin={{ bottom: 'medium' }}
          />
          <Button
            primary={true}
            disabled={!this.state.isValid}
            onClick={this.handleSubmit}
          >
            Set credentials
          </Button>
        </form>
      );
    }

    return null;
  }
}

export default CredentialsForm;
