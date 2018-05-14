'use strict';

import FlashMessages from '../flash_messages/index.js';
import React from 'react';
import {connect} from 'react-redux';
import { flashClearAll } from '../../actions/flashMessageActions';
import * as userActions from '../../actions/userActions';
import { bindActionCreators } from 'redux';
import Auth0 from '../../lib/auth0';

class AdminLogin extends React.Component {
  componentDidMount() {
    const auth0 = new Auth0();
    auth0.login();
  }

  componentWillUnmount() {
    this.props.dispatch(flashClearAll());
  }

  render() {
    return (
      <div>
        <div className='login_form--mask'></div>

        <div className='login_form--container login_form--admin col-4'>
          <div className='login_form--flash-container'>
            <FlashMessages />
          </div>

          <img className='loader' src='/images/loader_oval_light.svg' />
          <p>Redirecting you to our authentication provider.</p>
          <p>If nothing happens please let us know in #support.</p>
        </div>
      </div>
    );
  }
}

AdminLogin.propTypes = {
  dispatch: React.PropTypes.func,
  flashMessages: React.PropTypes.object,
  actions: React.PropTypes.object
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(AdminLogin);
