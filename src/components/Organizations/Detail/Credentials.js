import { connect } from 'react-redux';
import {
  organizationCredentialsLoad,
  organizationCredentialsSet,
  organizationCredentialsSetConfirmed,
} from 'actions/organizationActions';
import PropTypes from 'prop-types';
import React from 'react';
import CredentialsForm from './CredentialsForm';
import CredentialsDisplay from './CredentialsDisplay';

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
          credentials={this.props.credentials}
          formData={this.state.formData}
          onSubmit={this.handleFormSubmit}
          organizationName={this.props.organizationName}
          provider={this.props.app.info.general.provider}
        />
      );
    }

    return (
      <CredentialsDisplay
        credentials={this.props.credentials}
        onShowForm={this.handleShowForm}
        organizationName={this.props.organizationName}
        provider={this.props.app.info.general.provider}
      />
    );
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
