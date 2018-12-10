'use strict';

import React from 'react';
import Passage from '../../lib/passage_client';
import PasswordField from './password_field';
import StatusMessage from './status_message';
import TermsOfService from './terms_of_service';
import * as userActions from '../../actions/userActions';
import { flashAdd } from '../../actions/flashMessageActions';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { validatePassword } from '../../lib/password_validation';
import { push } from 'connected-react-router';
import Button from '../button';

// TODO: Figure out a way to make the test suite know about our standard
// 'window.config' object. Or change the way these config params are passed
// in. Or change the way these components get at these supporting libraries.
window.config = window.config || { passageEndpoint: 'http://localhost:5000' };
// EndTODO
var passage = new Passage({ endpoint: window.config.passageEndpoint });

export class SignUp extends React.Component {
  state = {
    statusMessage: 'verify_started',
    checkInviteStatus: 'started',
    email: undefined,
    passwordField: { value: '', valid: false },
    passwordConfirmationField: { value: '', valid: false },
    termsOfServiceField: { value: false, valid: false },
    formValid: undefined,
    submitting: false,
    buttonText: ['', 'Next', 'Next', 'Create your account now'],
    formSteps: ['', 'passwordGroup', 'passwordConfirmationGroup', 'TOSGroup'],
    currentStep: 0,
    advancable: false,
  };

  resetForm() {
    this.setState({
      statusMessage: 'verify_started',
      checkInviteStatus: 'started',
      email: undefined,
      passwordField: { value: '', valid: false },
      passwordConfirmationField: { value: '', valid: false },
      termsOfServiceField: { value: false, valid: false },
      formValid: undefined,
      submitting: false,
      buttonText: ['', 'Next', 'Next', 'Create your account now'],
      formSteps: ['', 'passwordGroup', 'passwordConfirmationGroup', 'TOSGroup'],
      currentStep: 0,
      advancable: false,
    });
  }

  componentDidMount() {
    var token = this.props.match.params.token;

    passage
      .checkInvite({ token })
      .then(data => {
        this.setState({
          email: data.email,
          statusMessage: 'verify_completed',
          checkInviteStatus: 'completed',
        });

        setTimeout(
          function() {
            this.setState({
              statusMessage: 'enter_password',
            });

            this.advanceForm();
          }.bind(this),
          800
        );
      })
      .catch(error => {
        this.setState({
          checkInviteStatus: 'failed',
        });

        var statusMessage = 'verify_failed';

        if (error.message === 'InvalidToken') {
          statusMessage = 'invalid_token';
        }

        this.setState({
          statusMessage: statusMessage,
        });
      });
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.token != this.props.match.params.token) {
      this.resetForm();
      this.componentDidMount();
    }
  }

  advanceForm() {
    var nextStep = this.state.currentStep + 1;

    this.setState(
      {
        currentStep: nextStep,
      },
      () => {
        if (nextStep === 1) {
          this.password.focus();
        } else if (nextStep === 2) {
          this.passwordConfirmation.focus();
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
    // Delay a bit so the user sees the DONE message
    // and then transition to the getting started guide
    //
    this.props.dispatch(
      flashAdd({
        message: 'Account created! Welcome to Giant Swarm.',
        class: 'success',
      })
    );

    setTimeout(() => {
      this.props.dispatch(push('/'));
    }, 1000);
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
          var userData = {
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
    var checked = e.target.checked;

    var statusMessage = this.state.statusMessage;

    this.setState({
      formValid: false,
      advancable: false,
      termsOfServiceField: {
        valid: false,
        value: checked,
      },
    });

    var termsOfServiceFieldValid = false;
    var termsOfServiceFieldValue = false;

    if (checked) {
      termsOfServiceFieldValid = true;
      termsOfServiceFieldValue = true;
      statusMessage = 'tos_ok';
    } else {
      termsOfServiceFieldValid = false;
      termsOfServiceFieldValue = false;
      statusMessage = 'tos_not_accepted';
    }

    this.setState(
      {
        termsOfServiceField: {
          valid: termsOfServiceFieldValid,
          value: termsOfServiceFieldValue,
        },
        statusMessage: statusMessage,
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
    var validationResult = validatePassword(password);

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
    var statusMessage = this.state.statusMessage;
    var valid = this.state.passwordConfirmationField.valid;

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
    var advancable = false;
    var formValid = false;
    var statusMessage = this.state.statusMessage;

    if (this.state.currentStep === 1 && this.state.passwordField.valid) {
      advancable = true;
    } else if (
      this.state.currentStep === 2 &&
      this.state.passwordField.valid &&
      this.state.passwordConfirmationField.valid
    ) {
      advancable = true;
    } else if (
      this.state.currentStep === 3 &&
      this.state.passwordField.valid &&
      this.state.passwordConfirmationField.valid &&
      this.state.termsOfServiceField.valid
    ) {
      advancable = true;
    } else {
      advancable = false;
    }

    if (
      this.state.passwordField.valid &&
      this.state.passwordConfirmationField.valid &&
      this.state.termsOfServiceField.valid
    ) {
      formValid = true;
      statusMessage = 'all_good';
    } else {
      formValid = false;
    }

    this.setState({
      advancable: advancable,
      formValid: formValid,
      statusMessage: statusMessage,
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
          ref={f => {
            this.signupForm = f;
          }}
          onSubmit={this.handleSubmit}
          className={'step-' + this.state.currentStep}
        >
          <div id='passwordGroup'>
            <p className='subtitle'>
              This is your personal Giant Swarm account for the email address{' '}
              {this.state.email}!
            </p>

            <PasswordField
              ref={p => {
                this.password = p;
              }}
              label='Set a password'
              onStartTyping={this.passwordEditingStarted}
              onChange={this.passwordEditingCompleted}
            />
          </div>

          <div id='passwordConfirmationGroup'>
            <PasswordField
              ref={f => {
                this.passwordConfirmation = f;
              }}
              label='Password, once again'
              onStartTyping={this.passwordConfirmationEditingStarted}
              onChange={this.passwordConfirmationEditingCompleted}
            />
          </div>

          <div id='TOSGroup'>
            <TermsOfService />

            <div className='checkbox'>
              <label htmlFor='tosAccept'>
                <input
                  type='checkbox'
                  ref={i => {
                    this.tosAccept = i;
                  }}
                  id='tosAccept'
                  onChange={this.tosChanged}
                />
                I accept the terms of service
              </label>
            </div>
          </div>

          <StatusMessage status={this.state.statusMessage} />
          {this.state.buttonText[this.state.currentStep] != '' ? (
            <Button
              type='submit'
              bsStyle='primary'
              bsSize='large'
              disabled={!this.state.advancable || this.state.submitting}
              loading={this.state.submitting}
              onClick={this.logIn}
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

export default connect(
  null,
  mapDispatchToProps
)(SignUp);
