import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Providers } from 'shared/constants';
import {
  organizationCredentialsDiscard,
  organizationCredentialsSet,
  organizationCredentialsSetConfirmed,
} from 'stores/organization/actions';

import CredentialsDisplay from './CredentialsDisplay';
import CredentialsForm from './CredentialsForm';

class Credentials extends React.Component {
  state = {
    formData: {},
  };

  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    this.props.dispatch(organizationCredentialsDiscard());
  }

  // handles the click to reveal the form
  handleShowForm = () => {
    this.props.dispatch(organizationCredentialsSet());
  };

  /**
   * handleFormSubmit handles a credential form submission.
   * We pass on the
   */
  handleFormSubmit = (data) => {
    // keep the data to have the form filled once again,
    // in case the user needs to correct an error
    this.setState({ formData: data });
    this.props.dispatch(
      organizationCredentialsSetConfirmed(
        this.props.provider,
        this.props.organizationName,
        data
      )
    );
  };

  render() {
    if (this.props.showCredentialsForm) {
      return (
        <CredentialsForm
          formData={this.state.formData}
          onSubmit={this.handleFormSubmit}
          organizationName={this.props.organizationName}
          provider={this.props.provider}
        />
      );
    }

    return (
      <CredentialsDisplay
        credentials={this.props.credentials}
        loading={this.props.loadingCredentials}
        onShowForm={this.handleShowForm}
        organizationName={this.props.organizationName}
        provider={this.props.provider}
        isAdmin={this.props.isAdmin}
      />
    );
  }
}

Credentials.propTypes = {
  provider: PropTypes.oneOf(Object.values(Providers)),
  credentials: PropTypes.array,
  dispatch: PropTypes.func,
  organizationName: PropTypes.string,
  showCredentialsForm: PropTypes.bool,
  loadingCredentials: PropTypes.bool,
  isAdmin: PropTypes.bool,
};

export default connect()(Credentials);
