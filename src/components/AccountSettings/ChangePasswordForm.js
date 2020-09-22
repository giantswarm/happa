import FlashMessage from 'FlashMessages/FlashMessage';
import GiantSwarm from 'giantswarm';
import { Base64 } from 'js-base64';
import {
  PasswordStatusMessage,
  validatePassword,
} from 'lib/passwordValidation';
import PropTypes from 'prop-types';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';
import Button from 'UI/Button';
import Section from 'UI/Section';

import PasswordField from '../SignUp/PasswordField';

class ChangePassword extends React.Component {
  state = {
    formValid: false,
  };

  currentPasswordValid = () => {
    return this.current_password.value();
  };

  newPasswordValid = () => {
    const password = this.new_password.value();

    const validationResult = validatePassword(password);

    let validationMessage = '';
    if (validationResult.statusMessage === PasswordStatusMessage.TooShort) {
      validationMessage = 'Your new password is too short';
    } else if (
      validationResult.statusMessage === PasswordStatusMessage.JustNumbers
    ) {
      validationMessage = 'Please pick a new password that is not just numbers';
    } else if (
      validationResult.statusMessage === PasswordStatusMessage.JustLetters
    ) {
      validationMessage =
        'Please pick a new password that is not just upper case / lower case letters';
    }

    this.setState({
      newPasswordValidationMessage: validationMessage,
    });

    return validationResult.valid;
  };

  newPasswordConfirmationValid = () => {
    const password = this.new_password.value();
    const passwordConfirmation = this.new_password_confirmation.value();

    if (password !== passwordConfirmation && password && passwordConfirmation) {
      this.setState({
        newPassworConfirmationValidationMessage:
          'Password confirmation does not match',
      });
    } else {
      this.setState({
        newPassworConfirmationValidationMessage: '',
      });
    }

    return (
      this.new_password.value() &&
      this.new_password.value() === this.new_password_confirmation.value()
    );
  };

  // eslint-disable-next-line class-methods-use-this
  passwordEditingStarted() {
    // NOOP
  }

  validate = () => {
    if (this.current_password.value()) {
      this.setState({
        buttonVisible: true,
        error: false,
      });
    } else {
      this.setState({
        buttonVisible: false,
        error: false,
      });
    }

    if (
      this.currentPasswordValid() &&
      this.newPasswordValid() &&
      this.newPasswordConfirmationValid()
    ) {
      this.setState({
        formValid: true,
        success: false,
        error: false,
      });
    } else {
      this.setState({
        formValid: false,
        success: false,
        error: false,
      });
    }
  };

  submit = (e) => {
    e.preventDefault();

    this.setState({
      submitting: true,
      error: false,
    });

    const usersApi = new GiantSwarm.UsersApi();

    usersApi
      .modifyPassword(this.props.user.email, {
        current_password_base64: Base64.encode(this.current_password.value()),
        new_password_base64: Base64.encode(this.new_password.value()),
      })
      .then(() => {
        this.setState({
          success: true,
          submitting: false,
          error: false,
          buttonVisible: false,
        });
      })
      .then(() => {
        return this.props.actions.giantswarmLogin(
          this.props.user.email,
          this.new_password.value()
        );
      })
      .catch((error) => {
        let errorMessage = null;
        if (
          error.body &&
          error.body.status_code &&
          // eslint-disable-next-line no-magic-numbers
          error.body.status_code === 10010
        ) {
          errorMessage = (
            <span>Your current password doesn&apos;t seem to be right.</span>
          );
        } else {
          errorMessage = (
            <span>
              Something went wrong while trying to set your password. Perhaps
              our servers are down. Could you try again later, or contact
              support otherwise: &nbsp;
              <a href='mailto:support@giantswarm.io'>support@giantswarm.io</a>
            </span>
          );
        }

        this.setState({
          error: true,
          submitting: false,
          buttonVisible: false,
          errorMessage: errorMessage,
        });
      });
  };

  render() {
    const { user, actions, ...rest } = this.props;

    return (
      <Section title='Password' {...rest}>
        <>
          <p>Use this form to change your password.</p>

          <form className='change_password_form' onSubmit={this.submit}>
            <div className='textfield small'>
              <PasswordField
                name='current_password'
                label='Current Password'
                onChange={this.validate}
                onStartTyping={this.passwordEditingStarted}
                ref={(p) => {
                  this.current_password = p;
                }}
              />
            </div>

            <div className='textfield small'>
              <PasswordField
                name='new_password'
                label='New Password'
                onChange={this.validate}
                onStartTyping={this.passwordEditingStarted}
                ref={(p) => {
                  this.new_password = p;
                }}
                validationError={this.state.newPasswordValidationMessage}
              />
            </div>

            <div className='textfield small'>
              <PasswordField
                name='new_password_confirmation'
                label='New Password (once more)'
                onChange={this.validate}
                onStartTyping={this.passwordEditingStarted}
                ref={(p) => {
                  this.new_password_confirmation = p;
                }}
                validationError={
                  this.state.newPassworConfirmationValidationMessage
                }
              />
            </div>

            <div className='button-area'>
              <SlideTransition in={this.state.buttonVisible}>
                <Button
                  bsStyle='primary'
                  disabled={!this.state.formValid}
                  loading={this.state.submitting}
                  type='submit'
                >
                  Set New Password
                </Button>
              </SlideTransition>

              <SlideTransition in={this.state.success}>
                <div className='form-success'>
                  <i className='fa fa-done' />
                  Password set succesfully
                </div>
              </SlideTransition>

              <SlideTransition in={this.state.error}>
                <FlashMessage type='danger'>
                  {this.state.errorMessage}
                </FlashMessage>
              </SlideTransition>
            </div>
          </form>
        </>
      </Section>
    );
  }
}

ChangePassword.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
};

export default ChangePassword;
