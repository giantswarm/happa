import { clearQueues } from 'lib/flashMessage';
import PropTypes from 'prop-types';
import QueryString from 'query-string';
import React from 'react';
import { connect } from 'react-redux';
import { getLoggedInUser } from 'stores/main/selectors';
import SlideTransition from 'styles/transitions/SlideTransition';

class OauthCallback extends React.Component {
  // eslint-disable-next-line class-methods-use-this
  componentWillUnmount() {
    clearQueues();
  }

  render() {
    const parsedHash = QueryString.parse(this.props.location.hash);

    return (
      <>
        <div className='login_form--mask' />

        <SlideTransition in={true} appear={true} direction='down'>
          <div className='login_form--container'>
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
      </>
    );
  }
}

OauthCallback.propTypes = {
  location: PropTypes.object,
};

function mapStateToProps(state) {
  return {
    user: getLoggedInUser(state),
  };
}

module.exports = connect(mapStateToProps)(OauthCallback);
