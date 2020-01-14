import * as userActions from 'actions/userActions';
import { push } from 'connected-react-router';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import Passage from 'lib/passageClient';
import { validatePassword } from 'lib/passwordValidation';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Button from 'UI/Button';

import PasswordField from './PasswordField';
import StatusMessage from './StatusMessage';
import TermsOfService from './TermsOfService';

// TODO: Figure out a way to make the test suite know about our standard
// 'window.config' object. Or change the way these config params are passed
// in. Or change the way these components get at these supporting libraries.
window.config = window.config || { passageEndpoint: 'http://localhost:5000' };
// EndTODO
const passage = new Passage({ endpoint: window.config.passageEndpoint });

export class SignUp extends React.Component {
  state = {
    statusMessage: 'verify_started',
    // eslint-disable-next-line react/no-unused-state
    checkInviteStatus: 'started',
    email: undefined,
    passwordField: { value: '', valid: false },
    passwordConfirmationField: { value: '', valid: false },
    termsOfServiceField: { value: false, valid: false },
    formValid: undefined,
    submitting: false,
    buttonText: ['', 'Next', 'Next', 'Create your account now'],
    // eslint-disable-next-line react/no-unused-state
    formSteps: ['', 'passwordGroup', 'passwordConfirmationGroup', 'TOSGroup'],
    currentStep: 0,
    advancable: false,
  };

  resetForm() {
    this.setState({
      statusMessage: 'verify_started',
      // eslint-disable-next-line react/no-unused-state
      checkInviteStatus: 'started',
      email: undefined,
      passwordField: { value: '', valid: false },
      passwordConfirmationField: { value: '', valid: false },
      termsOfServiceField: { value: false, valid: false },
      formValid: undefined,
      submitting: false,
      buttonText: ['', 'Next', 'Next', 'Create your account now'],
      // eslint-disable-next-line react/no-unused-state
      formSteps: ['', 'passwordGroup', 'passwordConfirmationGroup', 'TOSGroup'],
      currentStep: 0,
      advancable: false,
    });
  }

  componentDidMount() {
    const token = this.props.match.params.token;
    const statusMessageChangeTimeout = 800;

    passage
      .checkInvite({ token })
      .then(data => {
        this.setState({
          email: data.email,
          statusMessage: 'verify_completed',
          // eslint-disable-next-line react/no-unused-state
          checkInviteStatus: 'completed',
        });

        setTimeout(() => {
          this.setState({
            statusMessage: 'enter_password',
          });

          this.advanceForm();
        }, statusMessageChangeTimeout);
      })
      .catch(error => {
        this.setState({
          // eslint-disable-next-line react/no-unused-state
          checkInviteStatus: 'failed',
        });

        let statusMessage = 'verify_failed';

        if (error.message === 'InvalidToken') {
          statusMessage = 'invalid_token';
        }

        this.setState({
          statusMessage: statusMessage,
        });
      });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.token !== this.props.match.params.token) {
      this.resetForm();
      this.componentDidMount();
    }
  }

  advanceForm() {
    let nextStep = 0;

    this.setState(
      prevState => {
        nextStep = prevState.currentStep + 1;

        return {
          currentStep: nextStep,
        };
      },
      () => {
        if (nextStep === 1) {
          this.password.focus();
        } else if (nextStep === 2) {
          this.passwordConfirmation.focus();
          // eslint-disable-next-line no-magic-numbers
        } else if (nextStep === 3) {
          this.setState({
            statusMessage: 'tos_intro',
          });

          this.passwordConfirmation.blur();
        }
      }
    );
  }

  accountCreated() {
    const transitionDelay = 1000;

    // Delay a bit so the user sees the DONE message
    // and then transition to the getting started guide
    new FlashMessage(
      'Account created. Welcome to Giant Swarm!',
      messageType.SUCCESS,
      messageTTL.MEDIUM
    );

    setTimeout(() => {
      this.props.dispatch(push('/'));
    }, transitionDelay);
  }

  handleSubmit = e => {
    e.preventDefault();

    if (this.state.formValid) {
      this.setState({
        statusMessage: 'create_account_starting',
        submitting: true,
      });

      passage
        .createAccount({
          inviteToken: this.props.match.params.token,
          password: this.state.passwordField.value,
        })
        .then(data => {
          const userData = {
            username: data.username,
            email: data.email,
            auth: {
              scheme: 'giantswarm',
              token: data.token,
            },
          };

          this.props.actions.loginSuccess(userData);

          this.setState({
            statusMessage: 'create_account_completed',
          });

          this.accountCreated();
        })
        .catch(() => {
          this.setState({
            statusMessage: 'create_account_failed',
            submitting: false,
          });
        });
    } else {
      this.advanceForm();
    }
  };

  tosChanged = e => {
    const checked = e.target.checked;

    this.setState(
      prevState => {
        let statusMessage = prevState.statusMessage;

        let termsOfServiceFieldValid = false;
        let termsOfServiceFieldValue = false;

        if (checked) {
          termsOfServiceFieldValid = true;
          termsOfServiceFieldValue = true;
          statusMessage = 'tos_ok';
        } else {
          termsOfServiceFieldValid = false;
          termsOfServiceFieldValue = false;
          statusMessage = 'tos_not_accepted';
        }

        return {
          formValid: false,
          advancable: false,
          termsOfServiceField: {
            valid: termsOfServiceFieldValid,
            value: termsOfServiceFieldValue,
          },
          statusMessage: statusMessage,
        };
      },
      () => {
        this.validateForm();
      }
    );
  };

  passwordEditingStarted = password => {
    this.setState({
      formValid: false,
      advancable: false,
      passwordField: {
        value: password,
        valid: false,
      },
    });
  };

  passwordEditingCompleted = password => {
    const validationResult = validatePassword(password);

    this.setState({
      statusMessage: validationResult.statusMessage,
      passwordField: {
        value: password,
        valid: validationResult.valid,
      },
    });

    this.validateForm();
  };

  passwordConfirmationEditingStarted = confirmation => {
    this.setState({
      formValid: false,
      advancable: false,
      passwordConfirmationField: {
        valid: false,
        value: confirmation,
      },
    });

    if (this.state.passwordField.valid) {
      if (this.state.passwordField.value === confirmation) {
        this.setState(
          {
            passwordConfirmationField: {
              valid: true,
              value: confirmation,
            },
            statusMessage: 'password_confirmation_ok',
          },
          () => {
            this.validateForm();
          }
        );

        if (this.state.currentStep === 1) {
          // If we're on the first step, the confirmation field isn't even visible
          // yet. So a password manager must have filled in the confirmation for the user
          // Advance automatically as a convenience to the user.
          this.advanceForm();
        }
      }
    }
  };

  passwordConfirmationEditingCompleted = passwordConfirmation => {
    let statusMessage = this.state.statusMessage;
    let valid = this.state.passwordConfirmationField.valid;

    this.setState({
      formValid: false,
      advancable: false,
      passwordConfirmationField: {
        valid: false,
        value: passwordConfirmation,
      },
    });

    if (this.state.passwordField.valid) {
      if (this.state.passwordField.value === passwordConfirmation) {
        statusMessage = 'password_confirmation_ok';
        valid = true;
      } else {
        statusMessage = 'password_confirmation_mismatch';
        valid = false;
      }

      this.setState({
        statusMessage: statusMessage,
        passwordConfirmationField: {
          valid: valid,
          value: passwordConfirmation,
        },
      });

      this.validateForm();
    }
  };

  validateForm() {
    this.setState(prevState => {
      let advancable = false;
      let formValid = false;
      let statusMessage = prevState.statusMessage;

      if (prevState.currentStep === 1 && prevState.passwordField.valid) {
        advancable = true;
      } else if (
        prevState.currentStep === 2 &&
        prevState.passwordField.valid &&
        prevState.passwordConfirmationField.valid
      ) {
        advancable = true;
      } else if (
        // eslint-disable-next-line no-magic-numbers
        prevState.currentStep === 3 &&
        prevState.passwordField.valid &&
        prevState.passwordConfirmationField.valid &&
        prevState.termsOfServiceField.valid
      ) {
        advancable = true;
      } else {
        advancable = false;
      }

      if (
        prevState.passwordField.valid &&
        prevState.passwordConfirmationField.valid &&
        prevState.termsOfServiceField.valid
      ) {
        formValid = true;
        statusMessage = 'all_good';
      } else {
        formValid = false;
      }

      return {
        advancable: advancable,
        formValid: formValid,
        statusMessage: statusMessage,
      };
    });
  }

  render() {
    return (
      <div className='signup--container col-6'>
        <h1
          ref={t => {
            this.title = t;
          }}
        >
          Create Your Giant Swarm Account
        </h1>

        <form
          className={`step-${this.state.currentStep}`}
          onSubmit={this.handleSubmit}
          ref={f => {
            this.signupForm = f;
          }}
        >
          <div id='passwordGroup'>
            <p className='subtitle'>
              This is your personal Giant Swarm account for the email address{' '}
              {this.state.email}!
            </p>

            <PasswordField
              label='Set a password'
              onChange={this.passwordEditingCompleted}
              onStartTyping={this.passwordEditingStarted}
              ref={p => {
                this.password = p;
              }}
            />
          </div>

          <div id='passwordConfirmationGroup'>
            <PasswordField
              label='Password, once again'
              onChange={this.passwordConfirmationEditingCompleted}
              onStartTyping={this.passwordConfirmationEditingStarted}
              ref={f => {
                this.passwordConfirmation = f;
              }}
            />
          </div>

          <div id='TOSGroup'>
            <TermsOfService />

            <div className='checkbox'>
              <label htmlFor='tosAccept'>
                <input
                  id='tosAccept'
                  onChange={this.tosChanged}
                  ref={i => {
                    this.tosAccept = i;
                  }}
                  type='checkbox'
                />
                I accept the terms of service
              </label>
            </div>
          </div>

          <StatusMessage status={this.state.statusMessage} />
          {this.state.buttonText[this.state.currentStep] !== '' ? (
            <Button
              bsSize='large'
              bsStyle='primary'
              disabled={!this.state.advancable || this.state.submitting}
              loading={this.state.submitting}
              onClick={this.logIn}
              type='submit'
            >
              {this.state.buttonText[this.state.currentStep]}
            </Button>
          ) : (
            ''
          )}
        </form>
      </div>
    );
  }
}

SignUp.propTypes = {
  match: PropTypes.object,
  dispatch: PropTypes.func,
  actions: PropTypes.object,
};

function mapDispatchToProps(dispatch) {
  return {
    actions: bindActionCreators(userActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(null, mapDispatchToProps)(SignUp);
