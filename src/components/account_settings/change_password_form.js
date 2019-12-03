import { Base64 } from 'js-base64';
import { validatePassword } from 'lib/password_validation';
import Button from 'UI/button';
import GiantSwarm from 'giantswarm';
import PasswordField from '../signup/password_field';
import PropTypes from 'prop-types';
import React from 'react';
import SlideTransition from 'styles/transitions/SlideTransition';

class ChangePassword extends React.Component {
  state = {
    formValid: false,
  };

  currentPasswordValid = () => {
    return this.current_password.value();
  };

  newPasswordValid = () => {
    var password = this.new_password.value();

    var validationResult = validatePassword(password);

    if (validationResult.statusMessage === 'password_too_short') {
      validationResult.statusMessage = 'Your new password is too short';
    } else if (validationResult.statusMessage === 'password_not_just_numbers') {
      validationResult.statusMessage =
        'Please pick a new password that is not just numbers';
    } else if (validationResult.statusMessage === 'password_not_just_letters') {
      validationResult.statusMessage =
        'Please pick a new password that is not just upper case / lower case letters';
    } else if (validationResult.statusMessage === 'password_ok') {
      validationResult.statusMessage = '';
    }

    this.setState({
      newPasswordValidationMessage: validationResult.statusMessage,
    });

    return validationResult.valid;
  };

  newPasswordConfirmationValid = () => {
    var password = this.new_password.value();
    var passwordConfirmation = this.new_password_confirmation.value();

    if (
      password !== passwordConfirmation &&
      (password && passwordConfirmation)
    ) {
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

  submit = e => {
    e.preventDefault();

    this.setState({
      submitting: true,
      error: false,
    });

    var usersApi = new GiantSwarm.UsersApi();

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
      .catch(error => {
        var errorMessage;

        if (
          error.body &&
          error.body.status_code &&
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
    return (
      <div className='row section'>
        <div className='col-3'>
          <h3 className='table-label'>Password</h3>
        </div>
        <div className='col-9'>
          <p>Use this form to change your password.</p>

          <form className='change_password_form' onSubmit={this.submit}>
            <div className='textfield small'>
              <PasswordField
                id='current_password'
                label='Current Password'
                onChange={this.validate}
                onStartTyping={this.passwordEditingStarted}
                ref={p => {
                  this.current_password = p;
                }}
              />
            </div>

            <div className='textfield small'>
              <PasswordField
                id='new_password'
                label='New Password'
                onChange={this.validate}
                onStartTyping={this.passwordEditingStarted}
                ref={p => {
                  this.new_password = p;
                }}
                validationError={this.state.newPasswordValidationMessage}
              />
            </div>

            <div className='textfield small'>
              <PasswordField
                id='new_password_confirmation'
                label='New Password (once more)'
                onChange={this.validate}
                onStartTyping={this.passwordEditingStarted}
                ref={p => {
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
                  variant='primary'
                  disabled={!this.state.formValid}
                  loading={this.state.submitting}
                  loadingMessage='Saving...'
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
                <div className='flash-messages--flash-message flash-messages--danger'>
                  {this.state.errorMessage}
                </div>
              </SlideTransition>
            </div>
          </form>
        </div>
      </div>
    );
  }
}

ChangePassword.propTypes = {
  user: PropTypes.object,
  actions: PropTypes.object,
};

export default ChangePassword;
