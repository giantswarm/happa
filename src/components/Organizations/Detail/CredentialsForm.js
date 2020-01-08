import PropTypes from 'prop-types';
import React from 'react';
import Button from 'UI/Button';
import { Providers } from 'shared/constants';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';

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
  handleChange = e => {
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
  handleSubmit = e => {
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
            to prepare an Azure subscription for running tenant cluster in our{' '}
            <a
              href='https://docs.giantswarm.io/guides/prepare-azure-subscription-for-tenant-clusters/'
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

          <FormGroup controlId='azureSubscriptionID'>
            <ControlLabel>Azure Subscription ID</ControlLabel>
            <FormControl
              name='azureSubscriptionID'
              onChange={this.handleChange}
              type='text'
              value={this.state.azureSubscriptionID}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='azureTenantID'>
            <ControlLabel>Azure Tenant ID</ControlLabel>
            <FormControl
              name='azureTenantID'
              onChange={this.handleChange}
              type='text'
              value={this.state.azureTenantID}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='azureClientID'>
            <ControlLabel>Azure Client ID</ControlLabel>
            <FormControl
              name='azureClientID'
              onChange={this.handleChange}
              type='text'
              value={this.state.azureClientID}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='azureClientSecret'>
            <ControlLabel>Azure Client Secret</ControlLabel>
            <FormControl
              name='azureClientSecret'
              onChange={this.handleChange}
              type='password'
              value={this.state.azureClientSecret}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='azureClientSecretAgain'>
            <ControlLabel>Azure Client Secret (again)</ControlLabel>
            <FormControl
              name='azureClientSecretAgain'
              onChange={this.handleChange}
              type='password'
              value={this.state.azureClientSecretAgain}
            />
            <FormControl.Feedback />
          </FormGroup>

          <Button
            bsStyle='primary'
            disabled={!this.state.isValid}
            onClick={this.handleSubmit}
          >
            Set Credentials
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
            to prepare an AWS for running tenant cluster in our{' '}
            <a
              href='https://docs.giantswarm.io/guides/prepare-aws-account-for-tenant-clusters/'
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

          <FormGroup controlId='awsAdminRoleARN'>
            <ControlLabel>AWS admin role ARN (GiantSwarmAdmin)</ControlLabel>
            <FormControl
              name='awsAdminRoleARN'
              onChange={this.handleChange}
              type='text'
              value={
                this.state.awsAdminRoleARN ? this.state.awsAdminRoleARN : ''
              }
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='awsOperatorRoleARN'>
            <ControlLabel>
              AWS operator role ARN (GiantSwarmAWSOperator)
            </ControlLabel>
            <FormControl
              name='awsOperatorRoleARN'
              onChange={this.handleChange}
              type='text'
              value={
                this.state.awsOperatorRoleARN
                  ? this.state.awsOperatorRoleARN
                  : ''
              }
            />
            <FormControl.Feedback />
          </FormGroup>

          <Button
            bsStyle='primary'
            disabled={!this.state.isValid}
            onClick={this.handleSubmit}
          >
            Set Credentials
          </Button>
        </form>
      );
    }

    return null;
  }
}

CredentialsForm.propTypes = {
  actions: PropTypes.object,
  provider: PropTypes.string,
  credentials: PropTypes.object,
  formData: PropTypes.object,
  onSubmit: PropTypes.func,
  organizationName: PropTypes.string,
};

export default CredentialsForm;
