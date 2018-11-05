'use strict';

import React from 'react';
import PropTypes from 'prop-types';
import AWSAccountID from '../shared/aws_account_id';
import Button from '../button';
import { connect } from 'react-redux';
import { organizationCredentialsLoad } from '../../actions/organizationActions';
import ControlLabel  from 'react-bootstrap/lib/ControlLabel';
import FormControl  from 'react-bootstrap/lib/FormControl';
import FormGroup  from 'react-bootstrap/lib/FormGroup';

class Credentials extends React.Component {
  state = {
    formVisible: false,
  };

  componentDidMount() {
    this.props.dispatch(organizationCredentialsLoad(this.props.organizationName));
  }

  handleShowFormClick = () => {
    this.setState({
      formVisible: true,
    });
  }

  handleFormSubmit = () => {
    console.log('handleFormSubmit');
  }

  render() {
    if (this.state.formVisible) {
      return <CredentialsForm app={this.props.app} organizationName={this.props.organizationName} credentials={this.props.credentials} onSubmit={this.handleFormSubmit}/>;
    } else {
      return <CredentialsDisplay app={this.props.app} organizationName={this.props.organizationName} credentials={this.props.credentials} onShowFormClick={this.handleShowFormClick} />;
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
    azureSubscriptionID: '',
    azureTenantID: '',
    azureClientID: '',
    azureClientSecret: '',
    azureClientSecretAgain: '',
  };

  validateForm = () => {
    console.log(this.state);
    if (this.state.azureSubscriptionID != '' && this.state.azureTenantID != ''
      && this.state.azureClientID != '' && this.state.azureClientSecret != '' 
      && this.state.azureClientSecret === this.state.azureClientSecretAgain) {
        this.setState({isValid: true});
      } else {
        this.setState({isValid: false});
      }
  }

  handleChangeAzureSubscriptionID = (e) => {
    this.setState({azureSubscriptionID: e.target.value});
    this.validateForm();
  }
  handleChangeAzureTenantID = (e) => {
    this.setState({azureTenantID: e.target.value});
    this.validateForm();
  }
  handleChangeAzureClientID = (e) => {
    this.setState({azureClientID: e.target.value});
    this.validateForm();
  }
  handleChangeAzureClientSecret = (e) => {
    this.setState({azureClientSecret: e.target.value});
    this.validateForm();
  }
  handleChangeAzureClientSecretAgain = (e) => {
    this.setState({azureClientSecretAgain: e.target.value});
    this.validateForm();
  }

  handleSubmit = (e) => {
    console.log('form submission', e);
    // TODO: call this.props.onSubmit();
    e.preventDefault();
  }

  render () {
    return <form>
      <FormGroup controlId='azureSubscriptionID'>
        <ControlLabel>Azure Subscription ID</ControlLabel>
        <FormControl
          type='text'
          value={this.state.azureSubscriptionID}
          onChange={this.handleChangeAzureSubscriptionID}
        />
        <FormControl.Feedback />
      </FormGroup>

      <FormGroup controlId='azureTenantID'>
        <ControlLabel>Azure Tenant ID</ControlLabel>
        <FormControl
          type='text'
          value={this.state.azureTenantID}
          onChange={this.handleChangeAzureTenantID}
        />
        <FormControl.Feedback />
      </FormGroup>

      <FormGroup controlId='azureClientID'>
        <ControlLabel>Azure Client ID</ControlLabel>
        <FormControl
          type='text'
          value={this.state.azureClientID}
          onChange={this.handleChangeAzureClientID}
        />
        <FormControl.Feedback />
      </FormGroup>

      <FormGroup controlId='azureClientSecret'>
        <ControlLabel>Azure Client Secret</ControlLabel>
        <FormControl
          type='password'
          value={this.state.azureClientSecret}
          onChange={this.handleChangeAzureClientSecret}
        />
        <FormControl.Feedback />
      </FormGroup>

      <FormGroup controlId='azureClientSecretAgain'>
        <ControlLabel>Azure Client Secret (again)</ControlLabel>
        <FormControl
          type='password'
          value={this.state.azureClientSecretAgain}
          onChange={this.handleChangeAzureClientSecretAgain}
        />
        <FormControl.Feedback />
      </FormGroup>

      <Button onClick={this.handleSubmit} bsStyle='default' disabled={!this.state.isValid}>Set Credentials</Button>
    </form>;
  }
}

CredentialsForm.propTypes = {
  actions: PropTypes.object,
  app: PropTypes.object,
  credentials: PropTypes.object,
  dispatch: PropTypes.func,
  onSubmit: PropTypes.func,
  organizationName: PropTypes.string,
};
