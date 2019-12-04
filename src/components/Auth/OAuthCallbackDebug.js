import * as userActions from 'actions/userActions';
import { bindActionCreators } from 'redux';
import { clearQueues } from 'lib/flashMessage';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import QueryString from 'query-string';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';

class OauthCallback extends React.Component {
  componentWillUnmount() {
    clearQueues();
  }

  render() {
    var parsedHash = QueryString.parse(this.props.location.hash);

    return (
      <div>
        <div className='login_form--mask' />

        <SlideTransition in={true} appear={true} direction='down'>
          <div className='login_form--container col-4'>
            <h1>OAuth Callback</h1>
            <p>
              This is where we process and store the token and move on to what
              the user actually wanted to see.
            </p>
            <br />
            <b>Full hash query string:</b>
            <pre>{this.props.location.hash}</pre>

            <b>Access Token:</b>
            <pre>{parsedHash.access_token}</pre>

            <b>ID Token:</b>
            <pre>{parsedHash.id_token}</pre>

            <b>Scope:</b>
            <pre>{parsedHash.scope}</pre>

            <b>Expires In:</b>
            <pre>{parsedHash.expires_in}</pre>

            <b>State:</b>
            <pre>{parsedHash.state}</pre>
          </div>
        </SlideTransition>
      </div>
    );
  }
}

OauthCallback.propTypes = {
  actions: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  flashMessages: PropTypes.object,
  params: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    user: state.app.loggedInUser,
    flashMessages: state.flashMessages,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch,
  };
}

module.exports = connect(
  mapStateToProps,
  mapDispatchToProps
)(OauthCallback);
