'use strict';

import * as forgotPasswordActions from '../../actions/forgotPasswordActions';
import { bindActionCreators } from 'redux';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from '../../lib/flash_message';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { push } from 'connected-react-router';
import { validatePassword } from '../../lib/password_validation';
import PasswordField from '../signup/password_field';
import PropTypes from 'prop-types';
import React from 'react';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import StatusMessage from '../signup/status_message';

class SetPassword extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      password: '',
      passwordConfirmation: '',
      email: localStorage.getItem('user.email') || '',
      emailField: '',

      submitting: false,

      passwordField: {
        valid: false,
        value: '',
      },

      passwordConfirmationField: {
        valid: false,
        value: '',
      },

      formIsValid: false,

      verifyingToken: false,
      tokenValid: false,
      statusMessage: 'enter_password',
    };
  }

  componentDidMount() {
    // If we have the email already from localstorage, verify the token immediately.
    if (this.state.email) {
      this.verifyToken();
    }
  }

  verifyToken() {
    this.setState({
      verifyingToken: true,
    });

    this.props.actions
      .verifyPasswordRecoveryToken(
        this.state.email,
        this.props.match.params.token
      )
      .then(() => {
        this.setState({
          verifyingToken: false,
          tokenValid: true,
        });
      })
      .catch(error => {
        switch (error.name) {
          case 'TypeError':
            new FlashMessage(
              'Please provide a (valid) email address',
              messageType.ERROR,
              messageTTL.MEDIUM
            );
            break;
          case 'Error':
            new FlashMessage(
              'The reset token appears to be invalid.',
              messageType.ERROR,
              messageTTL.MEDIUM
            );
            break;
        }

        this.setState({
          verifyingToken: false,
          tokenValid: false,
        });
      });
  }

  submit = event => {
    event.preventDefault();

    this.setState({
      submitting: true,
    });

    this.props.actions
      .setNewPassword(
        this.state.email,
        this.props.match.params.token,
        this.state.passwordField.value
      )
      .then(() => {
        this.setState({
          submitting: false,
        });

        clearQueues();
        this.props.dispatch(push('/'));

        new FlashMessage(
          'Password set successfully. Now please log in using the new password.',
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );
      });
  };

  setEmail = event => {
    event.preventDefault();
    clearQueues();
    this.setState(
      {
        email: this.state.emailField,
      },
      () => {
        this.verifyToken();
      }
    );
  };

  updateEmail = event => {
    clearQueues();

    this.setState({
      emailField: event.target.value,
    });
  };

  passwordEditingStarted = password => {
    this.setState({
      passwordField: {
        valid: false,
        value: password,
      },
    });
  };

  passwordEditingCompleted = password => {
    var validationResult = validatePassword(password);

    this.setState({
      statusMessage: validationResult.statusMessage,

      passwordField: {
        valid: validationResult.valid,
        value: password,
      },
    });
  };

  passwordConfirmationEditingStarted = confirmation => {
    var valid = false;
    var statusMessage = this.state.statusMessage;

    if (this.state.passwordField.valid) {
      if (this.state.passwordField.value === confirmation) {
        statusMessage = 'password_confirmation_ok';
        valid = true;
      }
    }

    this.setState({
      statusMessage: statusMessage,

      passwordConfirmationField: {
        valid: valid,
        value: confirmation,
      },
    });
  };

  passwordConfirmationEditingCompleted = confirmation => {
    var valid = false;
    var statusMessage = this.state.statusMessage;

    if (this.state.passwordField.valid) {
      if (this.state.passwordField.value === confirmation) {
        statusMessage = 'password_confirmation_ok';
        valid = true;
      } else {
        statusMessage = 'password_confirmation_mismatch';
      }
    }

    this.setState({
      statusMessage: statusMessage,

      passwordConfirmationField: {
        valid: valid,
        value: confirmation,
      },
    });
  };

  formIsValid = () => {
    return (
      this.state.passwordField.valid &&
      this.state.passwordConfirmationField.valid
    );
  };

  setPasswordForm = () => {
    if (this.state.tokenValid) {
      return (
        <form onSubmit={this.submit}>
          <StatusMessage status={this.state.statusMessage} />

          <div className='textfield'>
            <PasswordField
              ref={p => {
                this.password = p;
              }}
              label='New password'
              onStartTyping={this.passwordEditingStarted}
              onChange={this.passwordEditingCompleted}
              autofocus
            />
          </div>

          <div className='textfield'>
            <PasswordField
              ref={p => {
                this.passwordConfirmation = p;
              }}
              label='Password, once again'
              onStartTyping={this.passwordConfirmationEditingStarted}
              onChange={this.passwordConfirmationEditingCompleted}
            />
          </div>
          <div className='progress_button--container'>
            <button
              type='submit'
              className='btn primary'
              disabled={this.state.submitting || !this.formIsValid()}
              onClick={this.submit}
            >
              {this.state.submitting ? 'Submitting ...' : 'Submit'}
            </button>
            <ReactCSSTransitionGroup
              transitionName='slide-right'
              transitionEnterTimeout={200}
              transitionLeaveTimeout={200}
            >
              {this.state.submitting ? (
                <img className='loader' src='/images/loader_oval_light.svg' />
              ) : null}
            </ReactCSSTransitionGroup>
          </div>
          <Link to='/login'>Back to login form</Link>
        </form>
      );
    } else {
      if (this.state.verifyingToken) {
        return (
          <div className='forgot-password--token-validating'>
            <img className='loader' src='/images/loader_oval_light.svg' />
            <br />
            Validating your token...
          </div>
        );
      } else {
        return (
          <div>
            <div className='forgot-password--token-validating'>
              Something went wrong.
            </div>
            <br />
            <Link to='/forgot_password'>Request a new token</Link>
          </div>
        );
      }
    }
  };

  setEmailForm = () => {
    return (
      <form onSubmit={this.setEmail}>
        <p>
          Before we can check your recovery token, please type in your email
          again for verification purposes.
        </p>
        <div className='textfield'>
          <label>Email</label>
          <input
            value={this.state.emailField}
            type='email'
            id='email'
            ref={i => {
              this.email = i;
            }}
            onChange={this.updateEmail}
            autoFocus
          />
        </div>

        <div className='progress_button--container'>
          <button
            type='submit'
            className='btn primary'
            disabled={this.state.submitting}
            onClick={this.setEmail}
          >
            {this.state.submitting ? 'Submitting ...' : 'Submit'}
          </button>
          <ReactCSSTransitionGroup
            transitionName='slide-right'
            transitionEnterTimeout={200}
            transitionLeaveTimeout={200}
          >
            {this.state.submitting ? (
              <img className='loader' src='/images/loader_oval_light.svg' />
            ) : null}
          </ReactCSSTransitionGroup>
        </div>
        <Link to='/login'>Back to login form</Link>
        <br />
        <br />
        <Link to='/forgot_password'>Request a new token</Link>
      </form>
    );
  };

  render() {
    return (
      <div>
        <div className='login_form--mask' />

        <ReactCSSTransitionGroup
          transitionName={`login_form--transition`}
          transitionAppear={true}
          transitionAppearTimeout={200}
          transitionEnterTimeout={200}
          transitionLeaveTimeout={200}
        >
          <div className='login_form--container col-4'>
            <h1>Set your new password</h1>
            {this.state.email ? this.setPasswordForm() : this.setEmailForm()}
          </div>
        </ReactCSSTransitionGroup>
      </div>
    );
  }
}

SetPassword.propTypes = {
  actions: PropTypes.object,
  match: PropTypes.object,
  dispatch: PropTypes.func,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(forgotPasswordActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(
  null,
  mapDispatchToProps
)(SetPassword);
