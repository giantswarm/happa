'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { organizationCredentialsLoad, organizationCredentialsSet } from '../../actions/organizationActions';

import AWSAccountID from '../shared/aws_account_id';
import Button from '../button';
import ControlLabel  from 'react-bootstrap/lib/ControlLabel';
import FormControl  from 'react-bootstrap/lib/FormControl';
import FormGroup  from 'react-bootstrap/lib/FormGroup';


class Credentials extends React.Component {
  state = {
    formVisible: false,
    formData: null,
  };

  componentDidMount() {
    this.props.dispatch(organizationCredentialsLoad(this.props.organizationName));
  }

  handleShowFormClick = () => {
    this.setState({
      formVisible: true,
    });
  }

  handleFormSubmit = (data) => {
    console.log('handleFormSubmit', data);

    this.props.dispatch(organizationCredentialsSet(this.props.app.info.general.provider, this.props.organizationName, data))
      .then(() => {
        this.setState({formVisible: false});
      })
      .catch((error) => {
        console.log(error);

        // persist submitted form data to pre-fill the form again
        this.setState({formData: data});
      });
  }

  render() {
    if (this.state.formVisible) {
      return <CredentialsForm app={this.props.app} organizationName={this.props.organizationName} credentials={this.props.credentials} onSubmit={this.handleFormSubmit} formData={this.state.formData}/>;
    } else {
      return <CredentialsDisplay app={this.props.app} organizationName={this.props.organizationName} credentials={this.props.credentials} onShowFormClick={this.handleShowFormClick} />;
    }
  }
}

Credentials.propTypes = {
  actions: PropTypes.object,
  app: PropTypes.object,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  organizationName: PropTypes.string,
};

function mapStateToProps(state) {
  return {
    credentials: state.entities.credentials,
    app: state.app,
  };
}

module.exports = connect(mapStateToProps)(Credentials);


class CredentialsDisplay extends React.Component {
  render() {
    var provider = this.props.app.info.general.provider;

    if (this.props.credentials.isFetching) {
      return (
        <span>
          <img className='loader' src='/images/loader_oval_light.svg' width='20px' height='20px' /> <span>Loading credentials</span>
        </span>
      );
    } else {
      if (this.props.credentials.items.length === 0) {

        let button = <Button onClick={this.props.onShowFormClick} bsStyle='default' className='small'>Set Credentials</Button>;

        if (provider === 'azure') {
          return (
            <div>
              <p>No specific provider credentials set. Clusters of this organization will be created in the default tenant cluster subscription configured for this installation.</p>
              {button}
            </div>
          );
        }
        return (
          <div>
            <p>No credentials set. Clusters of this organization will be created in the default tenant cluster account of this installation.</p>
            {button}
          </div>
        );

      } else {
        /**
         * Credentials display. This is built to support only one item, as the
         * API currently won't allow for more than that.
         */

        var providerWarning;
        if (typeof this.props.credentials.items[0][provider] === 'undefined') {
          providerWarning = <p>Credentials details not matching expectations for provider {provider}</p>;
        }

        // AWS credential
        if (typeof this.props.credentials.items[0].aws !== 'undefined') {
          return (
            <div>
              {providerWarning}
              <table className='table resource-details' id={'credential-' + this.props.credentials.items[0].id}>
                <tbody>
                  <tr key='account_id'>
                    <td>AWS account ID</td>
                    <td className='value code'><AWSAccountID roleARN={this.props.credentials.items[0].aws.roles.awsoperator}/></td>
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
            </div>
          );
        
        // Azure credential
        } else if (typeof this.props.credentials.items[0].azure !== 'undefined') {
          return (
            <div>
              {providerWarning}
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
            </div>
          );
        }
      }
    }
  }
}

CredentialsDisplay.propTypes = {
  dispatch: PropTypes.func,
  organizationName: PropTypes.string,
  actions: PropTypes.object,
  credentials: PropTypes.object,
  app: PropTypes.object,
  onShowFormClick: PropTypes.func,
};

class CredentialsForm extends React.Component {
  state = {
    isValid: false,
    form: {
      azureSubscriptionID: '',
      azureTenantID: '',
      azureClientID: '',
      azureClientSecret: '',
      azureClientSecretAgain: '',
      awsAdminRoleARN: '',
      awsOperatorRoleARN: '',
    }
  };

  validateForm = () => {
    if (this.props.app.info.general.provider === 'azure') {
      if (this.state.form.azureSubscriptionID != '' && this.state.form.azureTenantID != ''
        && this.state.form.azureClientID != '' && this.state.form.azureClientSecret != '' 
        && this.state.form.azureClientSecret === this.state.form.azureClientSecretAgain) {
          this.setState({isValid: true});
      } else {
        this.setState({isValid: false});
      }
    } else {
      if (this.state.form.awsAdminRoleARN != '' && this.state.form.awsOperatorRoleARN != '') {
          this.setState({isValid: true});
      } else {
        this.setState({isValid: false});
      }
    }
  }

  handleChange = (e) => {
    let fieldName = e.target.name;
    let fleldVal = e.target.value;
    this.setState({
      form: {...this.state.form, [fieldName]: fleldVal}
    }, () => {
      this.validateForm();
    });
  }

  handleSubmit = (e) => {
    e.preventDefault();
    this.props.onSubmit(this.state.form);
  }

  render () {
    if (this.props.app.info.general.provider === 'azure') {
      return <form>
        <p>Here you can set credentials for the organization <code>{this.props.organizationName}</code> , to be used by
        all new clusters created for this organization. Find more information on how to prepare an Azure subscription for running 
        tenant cluster in our <a href='https://docs.giantswarm.io/guides/prepare-azure-subscription-for-tenant-clusters/'
        target='_blank' rel='noopener noreferrer'>documentation</a>.</p>
        <p><i className='fa fa-info-circle' /> It is currently not possible to modify or delete these credentials once set.</p>
        
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

        <Button onClick={this.handleSubmit} bsStyle='primary' disabled={!this.state.isValid}>Set Credentials</Button>
      </form>;
    } else if (this.props.app.info.general.provider === 'aws') {
      return <form>
        <p>Here you can set credentials for the organization <code>{this.props.organizationName}</code> , to be used by 
        all new clusters created for this organization. Find more information on how to prepare an AWS for running 
        tenant cluster in our <a href='https://docs.giantswarm.io/guides/prepare-aws-account-for-tenant-clusters/'
        target='_blank' rel='noopener noreferrer'>documentation</a>.</p>

        <p><i className='fa fa-info-circle' /> It is currently not possible to modify or delete these credentials once set.</p>
        
        <FormGroup controlId='awsAdminRoleARN'>
          <ControlLabel>AWS admin role ARN</ControlLabel>
          <FormControl
            name='awsAdminRoleARN'
            type='text'
            value={this.state.awsAdminRoleARN}
            onChange={this.handleChange}
          />
          <FormControl.Feedback />
        </FormGroup>

        <FormGroup controlId='awsOperatorRoleARN'>
          <ControlLabel>AWS operator role ARN</ControlLabel>
          <FormControl
            name='awsOperatorRoleARN'
            type='text'
            value={this.state.awsOperatorRoleARN}
            onChange={this.handleChange}
          />
          <FormControl.Feedback />
        </FormGroup>

        <Button onClick={this.handleSubmit} bsStyle='primary' disabled={!this.state.isValid}>Set Credentials</Button>
      </form>;
    }
  }
}

CredentialsForm.propTypes = {
  actions: PropTypes.object,
  app: PropTypes.object,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  formData: PropTypes.object,
  onSubmit: PropTypes.func,
  organizationName: PropTypes.string,
};
