'use strict';

import FlashMessages from '../flash_messages/index.js';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import {connect} from 'react-redux';
import { Link } from 'react-router-dom';
import * as userActions from '../../actions/userActions';
import { bindActionCreators } from 'redux';
import Auth from '../../lib/auth0';
import { push } from 'connected-react-router';
import PropTypes from 'prop-types';

class OauthCallback extends React.Component {
  state = {
    error: null
  }

  constructor(props) {
    super(props);

    const auth = new Auth();

    if (/id_token|error/.test(props.location.hash)) {
      auth.handleAuthentication((err, authResult) => {
        if (err === null) {
          // Login user officially
          props.actions.auth0Login(authResult)
          .then(() => {
            props.dispatch(push('/'));
          })
          .catch((err) => {
            console.error(err);
          });
        } else {
          this.setState({error: err});
        }
      });
    } else {
      this.setState({error: {
        error: 'unauthorized',
        errorDescription: 'Invalid or empty response from the authentication provider.'
      }});
    }
  }

  errorMessage = () => {
    return <div>
      <h1>Something went wrong</h1>
      <p>{this.state.error.errorDescription}</p>
      <Link to='/admin-login'>Try again</Link>
    </div>
    ;
  }

  render() {
    return (
      <div>
        <div className='login_form--mask'></div>

        <ReactCSSTransitionGroup transitionName={`login_form--transition`} transitionAppear={true} transitionAppearTimeout={200} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          <div className='login_form--container col-4 login_form--admin'>
            <div className='login_form--flash-container'>
              <FlashMessages />
            </div>
            {
              this.state.error ? this.errorMessage() : <img className='loader' src='/images/loader_oval_light.svg' />
            }
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

OauthCallback.propTypes = {
  actions: PropTypes.object,
  location: PropTypes.object,
  dispatch: PropTypes.func,
  flashMessages: PropTypes.object,
  params: PropTypes.object
};

function mapStateToProps(state) {
  return {
    user: state.app.loggedInUser,
    flashMessages: state.flashMessages
  };
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch
  };
}

module.exports = connect(mapStateToProps, mapDispatchToProps)(OauthCallback);
