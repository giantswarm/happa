import { push } from 'connected-react-router';
import { Box } from 'grommet';
import { spinner } from 'images';
import ErrorReporter from 'lib/errors/ErrorReporter';
import {
  clearQueues,
  FlashMessage,
  messageTTL,
  messageType,
} from 'lib/flashMessage';
import { validatePassword } from 'lib/passwordValidation';
import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { bindActionCreators } from 'redux';
import { MainRoutes } from 'shared/constants/routes';
import ShadowMask from 'shared/ShadowMask';
import * as mainActions from 'stores/main/actions';
import styled from 'styled-components';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Controls/Button';
import TextInput from 'UI/Inputs/TextInput';

import { parseErrorMessages } from '../Auth/parseErrorMessages';
import StatusMessage from '../SignUp/StatusMessage';

const TokenValidatingBox = styled.div`
  text-align: center;
  padding: 30px;
  border: 1px solid #4e5962;
  border-radius: 5px;
  margin-top: 20px;
  background-color: #4e5962;
`;

class SetPassword extends React.Component {
  state = {
    email: '',
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
    const savedUser = localStorage.getItem('user');

    if (!savedUser) return;

    const savedEmail = JSON.parse(savedUser).email;

    this.setState({ email: savedEmail }, () => {
      // If we have the email already from localstorage, verify the token immediately.
      this.verifyToken();
    });
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
      .catch((error) => {
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

        ErrorReporter.getInstance().notify(error);
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

        this.props.dispatch(push(MainRoutes.Home));

        return null;
      })
      .catch((error) => {
        const [heading, message] = parseErrorMessages(error);

        new FlashMessage(heading, messageType.ERROR, messageTTL.LONG, message);

        ErrorReporter.getInstance().notify(error);
      });
  }

  submit = (event) => {
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

  setEmail = (event) => {
    event.preventDefault();
    clearQueues();
    this.setState(
      (prevState) => ({
        email: prevState.emailField,
      }),
      () => {
        this.verifyToken();
      }
    );
  };

  updateEmail = (event) => {
    clearQueues();

    this.setState({
      emailField: event.target.value,
    });
  };

  passwordEditingStarted = (password) => {
    this.setState({
      passwordField: {
        valid: false,
        value: password,
      },
    });
  };

  passwordEditingCompleted = (password) => {
    const validationResult = validatePassword(password);

    this.setState({
      statusMessage: validationResult.statusMessage,

      passwordField: {
        valid: validationResult.valid,
        value: password,
      },
    });
  };

  passwordConfirmationEditingCompleted = (confirmation) => {
    this.setState((prevState) => {
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

          <TextInput
            autoFocus={true}
            id='password'
            label='New password'
            onChange={(e) => this.passwordEditingCompleted(e.target.value)}
            type='password'
          />

          <TextInput
            id='confirm-password'
            label='Password, once again'
            onChange={(e) =>
              this.passwordConfirmationEditingCompleted(e.target.value)
            }
            margin={{ bottom: 'medium' }}
            type='password'
          />

          <Box direction='row' gap='small' align='center'>
            <Button
              onClick={this.submit}
              primary={true}
              disabled={this.state.submitting || !this.formIsValid()}
              loading={this.state.submitting}
            >
              {this.state.submitting ? 'Submitting ...' : 'Submit'}
            </Button>

            <Link to={MainRoutes.Login}>Back to login form</Link>
          </Box>
        </form>
      );
    }
    if (this.state.verifyingToken) {
      return (
        <TokenValidatingBox>
          <img className='loader' src={spinner} />
          <br />
          <br />
          Validating your token...
        </TokenValidatingBox>
      );
    }

    return (
      <>
        <TokenValidatingBox>Something went wrong.</TokenValidatingBox>
        <br />
        <Link to={MainRoutes.ForgotPassword}>Request a new token</Link>
      </>
    );
  };

  setEmailForm = () => {
    return (
      <form onSubmit={this.setEmail}>
        <p>
          Before we can check your recovery token, please type in your email
          again for verification purposes.
        </p>
        <TextInput
          autoFocus={true}
          label='Email'
          id='email'
          onChange={this.updateEmail}
          type='email'
          value={this.state.emailField}
        />

        <Box direction='row' gap='small' align='center'>
          <Button
            primary={true}
            disabled={this.state.submitting}
            onClick={this.setEmail}
            loading={this.state.submitting}
          >
            {this.state.submitting ? 'Submitting ...' : 'Submit'}
          </Button>
          <Link to={MainRoutes.Login}>Back to login form</Link>
        </Box>
        <br />
        <br />
        <Link to={MainRoutes.ForgotPassword}>Request a new token</Link>
      </form>
    );
  };

  render() {
    return (
      <>
        <ShadowMask />

        <SlideTransition in={true} appear={true} direction='down'>
          <div className='login_form--container'>
            <h1>Set your new password</h1>
            {this.state.email ? this.setPasswordForm() : this.setEmailForm()}
          </div>
        </SlideTransition>
      </>
    );
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(mainActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(null, mapDispatchToProps)(SetPassword);
