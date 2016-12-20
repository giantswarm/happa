'use strict';

import FlashMessages from '../flash_messages/index.js';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import { Link } from 'react-router';
import Button from '../button';
import {connect} from 'react-redux';
import { flashAdd, flashClearAll } from '../../actions/flashMessageActions';
import * as userActions from '../../actions/userActions';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';

class Login extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      email: '',
      password: ''
    };
  }

  componentWillUnmount() {
    this.props.dispatch(flashClearAll());
  }

  onAuthenticateFailed = (message) => {
    this.props.dispatch(flashAdd({
      message: message,
      class: 'danger'
    }));
  }

  updateEmail = (event) => {
    // Clear flash messages if there are any.
    if (this.props.flashMessages.size > 0) {
      this.props.dispatch(flashClearAll());
    }

    this.setState({
      email: event.target.value
    });
  }

  updatePassword = (event) => {
    // Clear flash messages if there are any.
    if (this.props.flashMessages.size > 0) {
      this.props.dispatch(flashClearAll());
    }

    this.setState({
      password: event.target.value
    });
  }

  logIn = (e) => {
    e.preventDefault();

    this.props.dispatch(flashClearAll());

    if ( ! this.state.email) {
      this.props.dispatch(flashAdd({
        message: 'Please provide the email address that you used for registration.',
        class: 'danger'
      }));
    } else if ( ! this.state.password) {
      this.props.dispatch(flashAdd({
        message: 'Please enter your password.',
        class: 'danger'
      }));
    }

    if (this.state.email && this.state.password) {
      this.setState({
        authenticating: true
      });

      this.props.actions.login(this.state.email, this.state.password)
      .then(() => {
        this.props.dispatch(flashAdd({
          message: 'Welcome!',
          class: 'success',
          ttl: 3000
        }));

        browserHistory.push('/');

        return null;
      })
      .catch((error) => {
        this.setState({
          authenticating: false
        });

        if (error.status === 400) {
          this.props.dispatch(flashAdd({
            message: <span><b>Could not log in.</b><br/> Credentials appear to be incorrect.</span>,
            class: 'danger'
          }));
        } else {
          this.props.dispatch(flashAdd({
            message: 'Could not log in. Something went wrong. Please try again later or contact support: support@giantswarm.io',
            class: 'danger'
          }));
        }


      });
    }
  }

  //TODO: turn progressbutton into a component
  render() {
    return (
      <div>
        <div className='login_form--mask'></div>

        <ReactCSSTransitionGroup transitionName={`login_form--transition`} transitionAppear={true} transitionAppearTimeout={200} transitionEnterTimeout={200} transitionLeaveTimeout={200}>
          <div className='login_form--container col-4'>
            <div className='login_form--flash-container'>
              <FlashMessages />
            </div>

            <h1>Log in to Giant&nbsp;Swarm</h1>
            <form onSubmit={this.logIn}>
              <div className='textfield'>
                <label>Email</label>
                <input value={this.state.email}
                       type='text'
                       id='email'
                       ref='email'
                       onChange={this.updateEmail} autoFocus />
              </div>

              <div className='textfield'>
                <label>Password</label>
                <input value={this.state.password}
                       type='password'
                       id='password'
                       ref='password'
                       onChange={this.updatePassword} />
              </div>

              <Button type='submit' bsStyle='primary' loading={this.state.authenticating} onClick={this.logIn}>Log in</Button>
              <Link to='/forgot_password'>Forgot your password?</Link>
            </form>

            <div className='login_form--legal'>
            By logging in you acknowledge that we track your activities in order to analyze your product usage and improve your experience. See our <a href='https://giantswarm.io/privacypolicy/'>Privacy Policy</a>.
            <br/>
            <br/>
            Trouble logging in? Please contact us via <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a>
            </div>
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

Login.propTypes = {
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

module.exports = connect(mapStateToProps, mapDispatchToProps)(Login);