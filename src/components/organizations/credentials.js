'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import {
  organizationCredentialsLoad,
  organizationCredentialsSet,
  organizationCredentialsSetConfirmed,
} from '../../actions/organizationActions';

import AWSAccountID from '../shared/aws_account_id';
import Button from '../shared/button';
import ControlLabel from 'react-bootstrap/lib/ControlLabel';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';

class Credentials extends React.Component {
  state = {
    formData: {},
  };

  componentDidMount() {
    this.props.dispatch(
      organizationCredentialsLoad(this.props.organizationName)
    );
  }

  // handles the click to reveal the form
  handleShowForm = () => {
    this.props.dispatch(organizationCredentialsSet());
  };

  /**
   * handleFormSubmit handles a credential form submission.
   * We pass on the
   */
  handleFormSubmit = data => {
    // keep the data to have the form filled once again,
    // in case the user needs to correct an error
    this.setState({ formData: data });
    this.props.dispatch(
      organizationCredentialsSetConfirmed(
        this.props.app.info.general.provider,
        this.props.organizationName,
        data
      )
    );
  };

  render() {
    if (this.props.organizations.showCredentialsForm) {
      return (
        <CredentialsForm
          provider={this.props.app.info.general.provider}
          organizationName={this.props.organizationName}
          credentials={this.props.credentials}
          onSubmit={this.handleFormSubmit}
          formData={this.state.formData}
        />
      );
    } else {
      return (
        <CredentialsDisplay
          provider={this.props.app.info.general.provider}
          organizationName={this.props.organizationName}
          credentials={this.props.credentials}
          onShowForm={this.handleShowForm}
        />
      );
    }
  }
}

Credentials.propTypes = {
  actions: PropTypes.object,
  app: PropTypes.object,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  organizationName: PropTypes.string,
  showCredentialsForm: PropTypes.bool,
  organizations: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    app: state.app,
    credentials: state.entities.credentials,
    showCredentialsForm: state.showCredentialsForm,
    organizations: state.entities.organizations,
  };
}

export default connect(mapStateToProps)(Credentials);

class CredentialsDisplay extends React.Component {
  render() {
    if (this.props.credentials.isFetching) {
      return (
        <span>
          <img
            className='loader'
            src='/images/loader_oval_light.svg'
            width='20px'
            height='20px'
          />{' '}
          <span>Loading credentials</span>
        </span>
      );
    } else {
      if (this.props.credentials.items.length === 0) {
        let button = (
          <Button
            onClick={this.props.onShowForm}
            bsStyle='default'
            className='small'
          >
            Set Credentials
          </Button>
        );

        if (this.props.provider === 'azure') {
          return (
            <div>
              <p>
                No specific provider credentials set. Clusters of this
                organization will be created in the default tenant cluster
                subscription configured for this installation.
              </p>
              {button}
            </div>
          );
        }
        return (
          <div>
            <p>
              No credentials set. Clusters of this organization will be created
              in the default tenant cluster account of this installation.
            </p>
            {button}
          </div>
        );
      } else {
        /**
         * Credentials display. This is built to support only one item, as the
         * API currently won't allow for more than that.
         */

        var providerWarning;
        if (
          typeof this.props.credentials.items[0][this.props.provider] ===
          'undefined'
        ) {
          providerWarning = (
            <p>
              Credentials details not matching expectations for provider{' '}
              {this.props.provider}
            </p>
          );
        }

        // AWS credential
        if (typeof this.props.credentials.items[0].aws !== 'undefined') {
          return (
            <div>
              {providerWarning}
              <table
                className='table resource-details'
                id={'credential-' + this.props.credentials.items[0].id}
              >
                <tbody>
                  <tr key='account_id'>
                    <td>AWS account ID</td>
                    <td className='value code'>
                      <AWSAccountID
                        roleARN={
                          this.props.credentials.items[0].aws.roles.awsoperator
                        }
                      />
                    </td>
                  </tr>
                  <tr key='admin_role'>
                    <td>Admin role ARN</td>
                    <td className='value code'>
                      {this.props.credentials.items[0].aws.roles.admin}
                    </td>
                  </tr>
                  <tr key='awsoperator_role'>
                    <td>AWS Operator role ARN</td>
                    <td className='value code'>
                      {this.props.credentials.items[0].aws.roles.awsoperator}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );

          // Azure credential
        } else if (
          typeof this.props.credentials.items[0].azure !== 'undefined'
        ) {
          return (
            <div>
              {providerWarning}
              <table className='table resource-details'>
                <tbody>
                  <tr key='account_id'>
                    <td>Azure subscription ID</td>
                    <td className='value code'>
                      {
                        this.props.credentials.items[0].azure.credential
                          .subscription_id
                      }
                    </td>
                  </tr>
                  <tr key='awsoperator_role'>
                    <td>Azure tenant ID</td>
                    <td className='value code'>
                      {
                        this.props.credentials.items[0].azure.credential
                          .tenant_id
                      }
                    </td>
                  </tr>
                  <tr key='admin_role'>
                    <td>Service principal client ID</td>
                    <td className='value code'>
                      {
                        this.props.credentials.items[0].azure.credential
                          .client_id
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          );
        }
      }
    }
  }
}

CredentialsDisplay.propTypes = {
  organizationName: PropTypes.string,
  credentials: PropTypes.object,
  provider: PropTypes.string,
  onShowForm: PropTypes.func,
};

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
      this.state = props.formData;
    }
  }

  /**
   * validate checks whether the form is submittable with the current
   * input field values. If yes, this.state.isValid is set to true.
   */
  validate = () => {
    if (this.props.provider === 'azure') {
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
    let fieldName = e.target.name;
    let fleldVal = e.target.value;
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
    if (this.props.provider === 'azure') {
      return (
        <form>
          <p>
            Here you can set credentials for the organization{' '}
            <code>{this.props.organizationName}</code> , to be used by all new
            clusters created for this organization. Find more information on how
            to prepare an Azure subscription for running tenant cluster in our{' '}
            <a
              href='https://docs.giantswarm.io/guides/prepare-azure-subscription-for-tenant-clusters/'
              target='_blank'
              rel='noopener noreferrer'
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
              type='text'
              value={this.state.azureSubscriptionID}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='azureTenantID'>
            <ControlLabel>Azure Tenant ID</ControlLabel>
            <FormControl
              name='azureTenantID'
              type='text'
              value={this.state.azureTenantID}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='azureClientID'>
            <ControlLabel>Azure Client ID</ControlLabel>
            <FormControl
              name='azureClientID'
              type='text'
              value={this.state.azureClientID}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='azureClientSecret'>
            <ControlLabel>Azure Client Secret</ControlLabel>
            <FormControl
              name='azureClientSecret'
              type='password'
              value={this.state.azureClientSecret}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='azureClientSecretAgain'>
            <ControlLabel>Azure Client Secret (again)</ControlLabel>
            <FormControl
              name='azureClientSecretAgain'
              type='password'
              value={this.state.azureClientSecretAgain}
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
          </FormGroup>

          <Button
            onClick={this.handleSubmit}
            bsStyle='primary'
            disabled={!this.state.isValid}
          >
            Set Credentials
          </Button>
        </form>
      );
    } else if (this.props.provider === 'aws') {
      return (
        <form>
          <p>
            Here you can set credentials for the organization{' '}
            <code>{this.props.organizationName}</code> , to be used by all new
            clusters created for this organization. Find more information on how
            to prepare an AWS for running tenant cluster in our{' '}
            <a
              href='https://docs.giantswarm.io/guides/prepare-aws-account-for-tenant-clusters/'
              target='_blank'
              rel='noopener noreferrer'
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
            <ControlLabel>AWS admin role ARN</ControlLabel>
            <FormControl
              name='awsAdminRoleARN'
              type='text'
              value={
                this.state.awsAdminRoleARN ? this.state.awsAdminRoleARN : ''
              }
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
          </FormGroup>

          <FormGroup controlId='awsOperatorRoleARN'>
            <ControlLabel>AWS operator role ARN</ControlLabel>
            <FormControl
              name='awsOperatorRoleARN'
              type='text'
              value={
                this.state.awsOperatorRoleARN
                  ? this.state.awsOperatorRoleARN
                  : ''
              }
              onChange={this.handleChange}
            />
            <FormControl.Feedback />
          </FormGroup>

          <Button
            onClick={this.handleSubmit}
            bsStyle='primary'
            disabled={!this.state.isValid}
          >
            Set Credentials
          </Button>
        </form>
      );
    }
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
