import * as forgotPasswordActions from 'actions/forgotPasswordActions';
import { giantswarmLogin } from 'actions/userActions';
import { push } from 'connected-react-router';
import { spinner } from 'images';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flashMessage';
import { validatePassword } from 'lib/passwordValidation';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import SlideTransition from 'styles/transitions/SlideTransition';

import { parseErrorMessages } from '../Auth/parseErrorMessages';
import PasswordField from '../SignUp/PasswordField';
import StatusMessage from '../SignUp/StatusMessage';

class SetPassword extends React.Component {
  state = {
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

    verifyingToken: false,
    tokenValid: false,
    statusMessage: 'enter_password',
  };

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

  loginUser() {
    this.props.actions
      .giantswarmLogin(this.state.email, this.state.passwordField.value)
      .then(() => {
        new FlashMessage(
          'Password set successfully. Welcome back!',
          messageType.SUCCESS,
          messageTTL.MEDIUM
        );

        this.props.dispatch(push('/'));

        return null;
      })
      .catch(error => {
        const [heading, message] = parseErrorMessages(error);

        new FlashMessage(heading, messageType.ERROR, messageTTL.LONG, message);
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

        this.loginUser();
      });
  };

  setEmail = event => {
    event.preventDefault();
    clearQueues();
    this.setState(
      prevState => ({
        email: prevState.emailField,
      }),
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
    const validationResult = validatePassword(password);

    this.setState({
      statusMessage: validationResult.statusMessage,

      passwordField: {
        valid: validationResult.valid,
        value: password,
      },
    });
  };

  passwordConfirmationEditingStarted = confirmation => {
    this.setState(prevState => {
      let valid = false;
      let statusMessage = prevState.statusMessage;

      if (prevState.passwordField.valid) {
        if (prevState.passwordField.value === confirmation) {
          statusMessage = 'password_confirmation_ok';
          valid = true;
        }
      }

      return {
        statusMessage: statusMessage,

        passwordConfirmationField: {
          valid: valid,
          value: confirmation,
        },
      };
    });
  };

  passwordConfirmationEditingCompleted = confirmation => {
    this.setState(prevState => {
      let valid = false;
      let statusMessage = prevState.statusMessage;

      if (prevState.passwordField.valid) {
        if (prevState.passwordField.value === confirmation) {
          statusMessage = 'password_confirmation_ok';
          valid = true;
        } else {
          statusMessage = 'password_confirmation_mismatch';
        }
      }

      return {
        statusMessage: statusMessage,

        passwordConfirmationField: {
          valid: valid,
          value: confirmation,
        },
      };
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
              autofocus
              label='New password'
              onChange={this.passwordEditingCompleted}
              onStartTyping={this.passwordEditingStarted}
              ref={p => {
                this.password = p;
              }}
            />
          </div>

          <div className='textfield'>
            <PasswordField
              label='Password, once again'
              onChange={this.passwordConfirmationEditingCompleted}
              onStartTyping={this.passwordConfirmationEditingStarted}
              ref={p => {
                this.passwordConfirmation = p;
              }}
            />
          </div>
          <div className='progress_button--container'>
            <button
              className='btn primary'
              disabled={this.state.submitting || !this.formIsValid()}
              onClick={this.submit}
              type='submit'
            >
              {this.state.submitting ? 'Submitting ...' : 'Submit'}
            </button>
            <SlideTransition in={this.state.submitting}>
              <img className='loader' src={spinner} />
            </SlideTransition>
          </div>
          <Link to='/login'>Back to login form</Link>
        </form>
      );
    }
    if (this.state.verifyingToken) {
      return (
        <div className='forgot-password--token-validating'>
          <img className='loader' src={spinner} />
          <br />
          Validating your token...
        </div>
      );
    }

    return (
      <div>
        <div className='forgot-password--token-validating'>
          Something went wrong.
        </div>
        <br />
        <Link to='/forgot_password'>Request a new token</Link>
      </div>
    );
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
            autoFocus
            id='email'
            onChange={this.updateEmail}
            ref={i => {
              this.email = i;
            }}
            type='email'
            value={this.state.emailField}
          />
        </div>

        <div className='progress_button--container'>
          <button
            className='btn primary'
            disabled={this.state.submitting}
            onClick={this.setEmail}
            type='submit'
          >
            {this.state.submitting ? 'Submitting ...' : 'Submit'}
          </button>
          <SlideTransition in={this.state.submitting}>
            <img className='loader' src={spinner} />
          </SlideTransition>
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

        <SlideTransition in={true} appear={true} direction='down'>
          <div className='login_form--container col-4'>
            <h1>Set your new password</h1>
            {this.state.email ? this.setPasswordForm() : this.setEmailForm()}
          </div>
        </SlideTransition>
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
    actions: bindActionCreators(
      { ...forgotPasswordActions, giantswarmLogin },
      dispatch
    ),
    dispatch: dispatch,
  };
}

export default connect(null, mapDispatchToProps)(SetPassword);
