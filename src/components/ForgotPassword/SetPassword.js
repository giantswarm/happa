import * as forgotPasswordActions from 'actions/forgotPasswordActions';
import { bindActionCreators } from 'redux';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flashMessage';
import { connect } from 'react-redux';
import { giantswarmLogin } from 'actions/userActions';
import { Link } from 'react-router-dom';
import { parseErrorMessages } from '../Auth/parseErrorMessages';
import { push } from 'connected-react-router';
import { spinner } from 'images';
import { validatePassword } from 'lib/passwordValidation';
import PasswordField from '../SignUp/PasswordField';
import PropTypes from 'prop-types';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';
import StatusMessage from '../SignUp/StatusMessage';

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
        var [heading, message] = parseErrorMessages(error);

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
    } else {
      if (this.state.verifyingToken) {
        return (
          <div className='forgot-password--token-validating'>
            <img className='loader' src={spinner} />
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

export default connect(
  null,
  mapDispatchToProps
)(SetPassword);
