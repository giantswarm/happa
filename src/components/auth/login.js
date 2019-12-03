import * as userActions from 'actions/userActions';
import { bindActionCreators } from 'redux';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flash_message';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { parseErrorMessages } from './_parse_error_messages';
import { push } from 'connected-react-router';
import Button from 'UI/button';
import PropTypes from 'prop-types';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';

class Login extends React.Component {
  state = {
    email: '',
    password: '',
  };

  onAuthenticateFailed = message => {
    new FlashMessage(message, messageType.ERROR, messageTTL.LONG);
  };

  updateEmail = event => {
    // Clear flash messages if there are any.
    clearQueues();

    this.setState({
      email: event.target.value,
    });
  };

  updatePassword = event => {
    // Clear flash messages if there are any.
    clearQueues();

    this.setState({
      password: event.target.value,
    });
  };

  logIn = e => {
    e.preventDefault();

    clearQueues();

    if (!this.state.email) {
      new FlashMessage(
        'Please provide the email address that you used for registration.',
        messageType.ERROR,
        messageTTL.LONG
      );
    } else if (!this.state.password) {
      new FlashMessage(
        'Please enter your password.',
        messageType.ERROR,
        messageTTL.LONG
      );
    }

    if (this.state.email && this.state.password) {
      this.setState({
        authenticating: true,
      });

      this.props.actions
        .giantswarmLogin(this.state.email, this.state.password)
        .then(() => {
          this.props.dispatch(push('/'));

          return null;
        })
        .catch(error => {
          this.setState({
            authenticating: false,
          });

          var [heading, message] = parseErrorMessages(error);

          new FlashMessage(
            heading,
            messageType.ERROR,
            messageTTL.LONG,
            message
          );
        });
    }
  };

  //TODO: turn progressbutton into a component
  render() {
    return (
      <div>
        <div className='login_form--mask' />

        <SlideTransition appear={true} in={true} direction='down'>
          <div className='login_form--container col-4'>
            <h1>Log in to Giant&nbsp;Swarm</h1>
            <form onSubmit={this.logIn}>
              <div className='textfield'>
                <label htmlFor='email'>Email</label>
                <input
                  autoComplete='username'
                  autoFocus
                  id='email'
                  onChange={this.updateEmail}
                  ref={i => {
                    this.email = i;
                  }}
                  type='text'
                  value={this.state.email}
                />
              </div>

              <div className='textfield'>
                <label htmlFor='password'>Password</label>
                <input
                  autoComplete='current-password'
                  id='password'
                  onChange={this.updatePassword}
                  ref={i => {
                    this.password = i;
                  }}
                  type='password'
                  value={this.state.password}
                />
              </div>

              <Button
                variant='primary'
                loading={this.state.authenticating}
                onClick={this.logIn}
                type='submit'
              >
                Log in
              </Button>
              <Link to='/forgot_password'>Forgot your password?</Link>
            </form>

            <div className='login_form--legal'>
              By logging in you acknowledge that we track your activities in
              order to analyze your product usage and improve your experience.
              See our{' '}
              <a href='https://giantswarm.io/privacypolicy/'>Privacy Policy</a>.
              <br />
              <br />
              Trouble logging in? Please contact us via{' '}
              <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a>
            </div>
          </div>
        </SlideTransition>
      </div>
    );
  }
}

Login.propTypes = {
  dispatch: PropTypes.func,
  flashMessages: PropTypes.object,
  actions: PropTypes.object,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login);
