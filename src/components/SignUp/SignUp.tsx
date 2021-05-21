import { push } from 'connected-react-router';
import ErrorReporter from 'lib/errors/ErrorReporter';
import { FlashMessage, messageTTL, messageType } from 'lib/flashMessage';
import Passage from 'lib/passageClient';
import { validatePassword } from 'lib/passwordValidation';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { bindActionCreators } from 'redux';
import { Dispatch } from 'redux';
import { MainRoutes } from 'shared/constants/routes';
import * as mainActions from 'stores/main/actions';
import Button from 'UI/Controls/Button';
import CheckBoxInput from 'UI/Inputs/CheckBoxInput';
import TextInput from 'UI/Inputs/TextInput';

import StatusMessage from './StatusMessage';
import TermsOfService from './TermsOfService';

const passage = new Passage({ endpoint: window.config.passageEndpoint });

interface MatchParams {
  token: string;
}

interface ISignUpProps extends RouteComponentProps<MatchParams> {
  actions: typeof mainActions;
  dispatch: Dispatch;
}

interface FieldValue {
  value: string | boolean;
  valid: boolean;
}

interface ISignUpState {
  statusMessage: string;
  checkInviteStatus: string;
  email: string | undefined;
  passwordField: FieldValue;
  passwordConfirmationField: FieldValue;
  termsOfServiceField: FieldValue;
  formValid: boolean | undefined;
  submitting: boolean;
  buttonText: string[];
  formSteps: string[];
  currentStep: number;
  advancable: boolean;
}

export class SignUp extends React.Component<ISignUpProps, ISignUpState> {
  public static propTypes = {};
  private password: HTMLInputElement | null = null;
  private passwordConfirmation: HTMLInputElement | null = null;

  isComponentMounted = false;

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
    this.isComponentMounted = true;
    const token = this.props.match.params.token;
    const statusMessageChangeTimeout = 800;

    passage
      .checkInvite({ token })
      .then((data) => {
        this.setState({
          email: data.email,
          statusMessage: 'verify_completed',
          // eslint-disable-next-line react/no-unused-state
          checkInviteStatus: 'completed',
        });

        setTimeout(() => {
          if (this.isComponentMounted) {
            this.setState({
              statusMessage: 'enter_password',
            });

            this.advanceForm();
          }
        }, statusMessageChangeTimeout);
      })
      .catch((error) => {
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

        ErrorReporter.getInstance().notify(error);
      });
  }

  componentDidUpdate(prevProps: ISignUpProps) {
    if (prevProps.match.params.token !== this.props.match.params.token) {
      this.resetForm();
      this.componentDidMount();
    }
  }

  componentWillUnmount() {
    this.isComponentMounted = false;
  }

  advanceForm() {
    let nextStep = 0;

    this.setState(
      (prevState) => {
        nextStep = prevState.currentStep + 1;

        return {
          currentStep: nextStep,
        };
      },
      () => {
        if (nextStep === 1) {
          this.password?.focus();
        } else if (nextStep === 2) {
          this.passwordConfirmation?.focus();
          // eslint-disable-next-line no-magic-numbers
        } else if (nextStep === 3) {
          this.setState({
            statusMessage: 'tos_intro',
          });

          this.passwordConfirmation?.blur();
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
      this.props.dispatch(push(MainRoutes.Home));
    }, transitionDelay);
  }

  handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
        .then((data) => {
          this.setState({
            statusMessage: 'create_account_completed',
          });

          return this.props.actions.giantswarmLogin(
            data.email,
            this.state.passwordField.value
          );
        })
        .then(() => {
          this.accountCreated();
        })
        .catch((err) => {
          this.setState({
            statusMessage: 'create_account_failed',
            submitting: false,
          });

          ErrorReporter.getInstance().notify(err);
        });
    } else {
      this.advanceForm();
    }
  };

  tosChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;

    this.setState(
      (prevState) => {
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

  passwordEditingCompleted = (password: string) => {
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

  passwordConfirmationEditingCompleted = (passwordConfirmation: string) => {
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
    this.setState((prevState) => {
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
      <div className='signup--container'>
        <h1>Create Your Giant Swarm Account</h1>

        <form
          className={`step-${this.state.currentStep}`}
          onSubmit={this.handleSubmit}
        >
          <div id='passwordGroup'>
            <p className='subtitle'>
              This is your personal Giant Swarm account for the email address{' '}
              {this.state.email}!
            </p>

            <TextInput
              label='Set a password'
              type='password'
              id='password'
              onChange={(e) => this.passwordEditingCompleted(e.target.value)}
              ref={(p) => {
                this.password = p;
              }}
              margin={{ bottom: 'large' }}
            />
          </div>

          <div id='passwordConfirmationGroup'>
            <TextInput
              label='Password, once again'
              type='password'
              id='confirm-password'
              onChange={(e) =>
                this.passwordConfirmationEditingCompleted(e.target.value)
              }
              ref={(f) => {
                this.passwordConfirmation = f;
              }}
              margin={{ bottom: 'large' }}
            />
          </div>

          <div id='TOSGroup'>
            <TermsOfService />

            <CheckBoxInput
              id='tosAccept'
              onChange={this.tosChanged}
              label='I accept the terms of service'
            />
          </div>

          <StatusMessage status={this.state.statusMessage} />
          {this.state.buttonText[this.state.currentStep] !== '' ? (
            <Button
              bsStyle='primary'
              disabled={!this.state.advancable || this.state.submitting}
              loading={this.state.submitting}
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

function mapDispatchToProps(dispatch: Dispatch) {
  return {
    actions: bindActionCreators(mainActions, dispatch),
    dispatch: dispatch,
  };
}

export default connect(null, mapDispatchToProps)(SignUp);
